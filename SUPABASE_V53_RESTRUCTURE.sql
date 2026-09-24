-- فلسطين بلاتفورم V53
-- إعادة هيكلة الاشتراكات + طلبات الإلغاء + صلاحيات الإدارة
-- شغّل هذا الملف مرة واحدة بعد إصدارات الاشتراكات السابقة.

CREATE TABLE IF NOT EXISTS public.subscription_cancellation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  admin_note text,
  handled_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  handled_at timestamptz
);

CREATE INDEX IF NOT EXISTS subscription_cancel_status_idx
ON public.subscription_cancellation_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS subscription_cancel_user_idx
ON public.subscription_cancellation_requests(user_id, created_at DESC);

ALTER TABLE public.subscription_cancellation_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subscription_cancel_read_own ON public.subscription_cancellation_requests;
CREATE POLICY subscription_cancel_read_own
ON public.subscription_cancellation_requests FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_permission('manage_subscriptions'));

DROP POLICY IF EXISTS subscription_cancel_insert_own ON public.subscription_cancellation_requests;
CREATE POLICY subscription_cancel_insert_own
ON public.subscription_cancellation_requests FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- صلاحية إدارة الاشتراكات: المدير العام فقط افتراضيًا.
INSERT INTO public.platform_permissions(code,label)
VALUES ('manage_subscriptions','إدارة الاشتراكات وطلبات الإلغاء')
ON CONFLICT(code) DO UPDATE SET label=EXCLUDED.label;

INSERT INTO public.platform_role_permissions(role,permission_code)
VALUES ('admin','manage_subscriptions')
ON CONFLICT DO NOTHING;

-- طلب إلغاء: لا يلغي الاشتراك، بل يرسل طلبًا للمدير.
CREATE OR REPLACE FUNCTION public.request_subscription_cancellation(
  p_subscription_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
  v_plan text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  SELECT plan_id INTO v_plan
  FROM public.subscriptions
  WHERE id=p_subscription_id
    AND user_id=v_uid
    AND status='active'
    AND ends_at > now();
  IF v_plan IS NULL THEN RAISE EXCEPTION 'الاشتراك غير موجود أو غير فعال'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.subscription_cancellation_requests
    WHERE subscription_id=p_subscription_id AND status='pending'
  ) THEN
    RAISE EXCEPTION 'يوجد طلب إلغاء قيد المراجعة بالفعل';
  END IF;

  INSERT INTO public.subscription_cancellation_requests(subscription_id,user_id,reason)
  VALUES(p_subscription_id,v_uid,NULLIF(trim(coalesce(p_reason,'')),''))
  RETURNING id INTO v_id;

  INSERT INTO public.notifications(user_id,type,title,message)
  SELECT p.id,'subscription','طلب إلغاء اشتراك جديد 🔔',
         'يوجد طلب إلغاء اشتراك جديد يحتاج إلى المراجعة.'
  FROM public.profiles p
  WHERE p.status='active' AND p.role='admin';

  RETURN v_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.request_subscription_cancellation(uuid,text) TO authenticated;

-- المدير يوافق على الإلغاء ويوقف مقدم الخدمة المرتبط به.
CREATE OR REPLACE FUNCTION public.admin_handle_subscription_cancellation(
  p_request_id uuid,
  p_action text,
  p_note text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_sub uuid;
  v_user uuid;
  v_plan text;
BEGIN
  IF NOT public.has_permission('manage_subscriptions') THEN
    RAISE EXCEPTION 'غير مصرح: إدارة الاشتراكات للمدير فقط';
  END IF;
  IF p_action NOT IN ('approve','reject') THEN
    RAISE EXCEPTION 'إجراء غير صالح';
  END IF;

  SELECT subscription_id,user_id INTO v_sub,v_user
  FROM public.subscription_cancellation_requests
  WHERE id=p_request_id AND status='pending'
  FOR UPDATE;
  IF v_sub IS NULL THEN RAISE EXCEPTION 'طلب الإلغاء غير موجود أو تمت معالجته'; END IF;

  IF p_action='approve' THEN
    UPDATE public.subscriptions
    SET status='cancelled', updated_at=now()
    WHERE id=v_sub AND user_id=v_user AND status='active';

    UPDATE public.service_providers
    SET is_active=false,is_available=false,updated_at=now()
    WHERE user_id=v_user;
  END IF;

  UPDATE public.subscription_cancellation_requests
  SET status=CASE WHEN p_action='approve' THEN 'approved' ELSE 'rejected' END,
      admin_note=NULLIF(trim(coalesce(p_note,'')),''),
      handled_by=v_uid,
      handled_at=now()
  WHERE id=p_request_id;

  INSERT INTO public.notifications(user_id,type,title,message)
  VALUES(
    v_user,
    'subscription',
    CASE WHEN p_action='approve' THEN 'تمت الموافقة على إلغاء الاشتراك' ELSE 'تم رفض طلب إلغاء الاشتراك' END,
    CASE WHEN p_action='approve'
         THEN 'تم إلغاء اشتراكك بناءً على طلبك. يمكنك التواصل مع الإدارة عند الحاجة.'
         ELSE 'تم رفض طلب إلغاء اشتراكك. يمكنك مراسلة الإدارة للاستفسار.' END
  );

  RETURN true;
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_handle_subscription_cancellation(uuid,text,text) TO authenticated;

-- إلغاء الدالة القديمة التي كانت تلغي الاشتراك مباشرة: لا نستخدمها في الواجهة الجديدة.
-- تبقى موجودة للتوافق الخلفي إن كانت صفحات قديمة تستدعيها، لكن لا تعتمد عليها V53.

-- تحديث تلقائي عند تنفيذ الإدارة: الاشتراكات المنتهية توقف مقدمي الخدمة.
UPDATE public.subscriptions
SET status='expired', updated_at=now()
WHERE status='active' AND ends_at <= now();

UPDATE public.service_providers sp
SET is_active=false,is_available=false,updated_at=now()
WHERE (sp.is_active=true OR sp.is_available=true)
AND NOT EXISTS (
  SELECT 1 FROM public.subscriptions s
  JOIN public.subscription_plans p ON p.id=s.plan_id
  WHERE s.user_id=sp.user_id
    AND s.status='active'
    AND s.ends_at>now()
    AND ((COALESCE(sp.provider_kind,'individual')='company' AND p.audience='company')
      OR (COALESCE(sp.provider_kind,'individual')<>'company' AND p.audience='provider'))
);

-- دوال لوحة المدير: تتجاوز قيود RLS بشكل آمن بعد التحقق من صلاحية المدير.
CREATE OR REPLACE FUNCTION public.admin_list_subscription_cancellations()
RETURNS TABLE(
  id uuid, subscription_id uuid, user_id uuid, full_name text, phone text,
  plan_id text, reason text, status text, created_at timestamptz
)
LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  SELECT r.id,r.subscription_id,r.user_id,p.full_name,p.phone,s.plan_id,r.reason,r.status,r.created_at
  FROM public.subscription_cancellation_requests r
  LEFT JOIN public.profiles p ON p.id=r.user_id
  LEFT JOIN public.subscriptions s ON s.id=r.subscription_id
  WHERE public.has_permission('manage_subscriptions')
  ORDER BY r.created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_subscription_cancellations() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_active_subscriptions()
RETURNS TABLE(
  id uuid, user_id uuid, full_name text, phone text, plan_id text,
  plan_name text, price numeric, audience text, billing_period text,
  starts_at timestamptz, ends_at timestamptz
)
LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  SELECT s.id,s.user_id,pf.full_name,pf.phone,s.plan_id,sp.name,sp.price,sp.audience,sp.billing_period,s.starts_at,s.ends_at
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON sp.id=s.plan_id
  LEFT JOIN public.profiles pf ON pf.id=s.user_id
  WHERE public.has_permission('manage_subscriptions')
    AND s.status='active' AND s.ends_at>now()
  ORDER BY s.ends_at ASC;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_active_subscriptions() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_subscription_orders()
RETURNS TABLE(
  id uuid, user_id uuid, full_name text, phone text, plan_id text,
  plan_name text, price numeric, status text, created_at timestamptz, paid_at timestamptz
)
LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  SELECT o.id,o.user_id,pf.full_name,pf.phone,o.plan_id,sp.name,sp.price,o.status,o.created_at,o.paid_at
  FROM public.subscription_orders o
  LEFT JOIN public.subscription_plans sp ON sp.id=o.plan_id
  LEFT JOIN public.profiles pf ON pf.id=o.user_id
  WHERE public.has_permission('manage_subscriptions')
  ORDER BY o.created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_subscription_orders() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_cancel_active_subscription(p_subscription_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_user uuid; v_count integer;
BEGIN
  IF NOT public.has_permission('manage_subscriptions') THEN
    RAISE EXCEPTION 'غير مصرح: إدارة الاشتراكات للمدير فقط';
  END IF;
  SELECT user_id INTO v_user FROM public.subscriptions WHERE id=p_subscription_id AND status='active';
  IF v_user IS NULL THEN RAISE EXCEPTION 'الاشتراك غير موجود أو غير فعال'; END IF;
  UPDATE public.subscriptions SET status='cancelled',updated_at=now() WHERE id=p_subscription_id AND status='active';
  GET DIAGNOSTICS v_count=ROW_COUNT;
  IF v_count>0 THEN
    UPDATE public.service_providers SET is_active=false,is_available=false,updated_at=now() WHERE user_id=v_user;
    INSERT INTO public.notifications(user_id,type,title,message)
    VALUES(v_user,'subscription','تم إلغاء الاشتراك إداريًا','تم إلغاء اشتراكك من قبل إدارة المنصة. يمكنك مراسلة الإدارة للاستفسار.');
  END IF;
  RETURN v_count>0;
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_cancel_active_subscription(uuid) TO authenticated;
