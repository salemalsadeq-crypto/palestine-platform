-- فلسطين بلاتفورم V50
-- ربط الاشتراكات بصلاحيات مقدم الخدمة والشركة

CREATE OR REPLACE FUNCTION public.get_my_active_subscription()
RETURNS TABLE (
  subscription_id uuid,
  plan_id text,
  plan_name text,
  audience text,
  billing_period text,
  starts_at timestamptz,
  ends_at timestamptz,
  days_left integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path=public
AS $$
  SELECT
    s.id,
    s.plan_id,
    p.name,
    p.audience,
    p.billing_period,
    s.starts_at,
    s.ends_at,
    GREATEST(0, CEIL(EXTRACT(EPOCH FROM (s.ends_at-now()))/86400.0)::integer)
  FROM public.subscriptions s
  JOIN public.subscription_plans p ON p.id=s.plan_id
  WHERE s.user_id=auth.uid()
    AND s.status='active'
    AND s.ends_at>now()
  ORDER BY s.ends_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_active_subscription()
TO authenticated;

CREATE OR REPLACE FUNCTION public.has_active_service_subscription(
  p_kind text
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path=public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions s
    JOIN public.subscription_plans p ON p.id=s.plan_id
    WHERE s.user_id=auth.uid()
      AND s.status='active'
      AND s.ends_at>now()
      AND (
        (p_kind='individual' AND p.audience='provider') OR
        (p_kind='company' AND p.audience='company')
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_active_service_subscription(text)
TO authenticated;

CREATE OR REPLACE FUNCTION public.enforce_service_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
DECLARE
  required_audience text;
BEGIN
  IF NEW.provider_kind='company' THEN
    required_audience := 'company';
  ELSE
    required_audience := 'provider';
  END IF;

  -- نفرض الاشتراك فقط عند إنشاء مقدم خدمة نشط
  -- أو عند الانتقال من غير نشط إلى نشط.
  IF NEW.is_active=true
     AND (
       TG_OP='INSERT'
       OR COALESCE(OLD.is_active,false)=false
     )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.subscriptions s
      JOIN public.subscription_plans p ON p.id=s.plan_id
      WHERE s.user_id=NEW.user_id
        AND s.status='active'
        AND s.ends_at>now()
        AND p.audience=required_audience
    ) THEN
      RAISE EXCEPTION
        'يجب وجود اشتراك مقدم خدمة أو اشتراك شركة فعال قبل تفعيل الحساب';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS service_provider_subscription_guard
ON public.service_providers;

CREATE TRIGGER service_provider_subscription_guard
BEFORE INSERT OR UPDATE OF is_active, provider_kind
ON public.service_providers
FOR EACH ROW
EXECUTE FUNCTION public.enforce_service_subscription();

-- تحديث الحالات المنتهية تلقائيًا عند الاستدعاء
UPDATE public.subscriptions
SET status='expired', updated_at=now()
WHERE status='active'
  AND ends_at<=now();
