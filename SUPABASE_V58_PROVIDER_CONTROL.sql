-- فلسطين بلاتفورم V58
-- تحكم آمن بحالة مقدم الخدمة من لوحة مقدم الخدمة

CREATE OR REPLACE FUNCTION public.set_my_provider_availability(
  p_available boolean,
  p_lat double precision DEFAULT NULL,
  p_lng double precision DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_kind text;
  v_service text;
  v_has_subscription boolean := false;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول';
  END IF;

  SELECT provider_kind, service_type
  INTO v_kind, v_service
  FROM public.service_providers
  WHERE user_id=v_uid
  FOR UPDATE;

  IF v_service IS NULL THEN
    RAISE EXCEPTION 'لا يوجد ملف مقدم خدمة لهذا الحساب';
  END IF;

  IF p_available THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.subscriptions s
      JOIN public.subscription_plans pl ON pl.id=s.plan_id
      WHERE s.user_id=v_uid
        AND s.status='active'
        AND s.ends_at>now()
        AND (
          (COALESCE(v_kind,'individual')='company' AND pl.audience='company')
          OR
          (COALESCE(v_kind,'individual')<>'company' AND pl.audience='provider')
        )
    ) INTO v_has_subscription;

    IF NOT v_has_subscription THEN
      RAISE EXCEPTION 'لا يمكن التفعيل دون اشتراك مقدم خدمة فعال';
    END IF;
  END IF;

  UPDATE public.service_providers
  SET
    is_available=p_available,
    is_active=p_available,
    latitude=COALESCE(p_lat, latitude),
    longitude=COALESCE(p_lng, longitude),
    last_latitude=CASE WHEN p_lat IS NOT NULL THEN p_lat ELSE last_latitude END,
    last_longitude=CASE WHEN p_lng IS NOT NULL THEN p_lng ELSE last_longitude END,
    last_location_at=CASE WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL THEN now() ELSE last_location_at END,
    updated_at=now()
  WHERE user_id=v_uid;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.set_my_provider_availability(boolean,double precision,double precision) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_my_provider_availability(boolean,double precision,double precision) TO authenticated;
