-- فلسطين بلاتفورم V36
-- طلب التكسي المباشر + إحداثيات الرحلة + منع الإشعارات المكررة

ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS from_lat double precision;

ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS from_lng double precision;

ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS to_lat double precision;

ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS to_lng double precision;

CREATE INDEX IF NOT EXISTS service_requests_taxi_provider_idx
ON public.service_requests(provider_id, type, status, created_at DESC);

CREATE OR REPLACE FUNCTION public.create_taxi_request(
  p_provider_id uuid,
  p_city text,
  p_phone text,
  p_from_location text,
  p_to_location text,
  p_people_count integer DEFAULT 1,
  p_from_lat double precision DEFAULT NULL,
  p_from_lng double precision DEFAULT NULL,
  p_to_lat double precision DEFAULT NULL,
  p_to_lng double precision DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_request_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول أولاً';
  END IF;

  IF p_provider_id IS NULL OR p_provider_id = v_uid THEN
    RAISE EXCEPTION 'مقدم الخدمة غير صالح';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.service_providers
    WHERE user_id = p_provider_id
      AND service_type = 'taxi'
      AND is_active = true
      AND is_available = true
  ) THEN
    RAISE EXCEPTION 'السائق غير متاح حاليًا';
  END IF;

  IF coalesce(trim(p_city), '') = '' THEN
    RAISE EXCEPTION 'المدينة مطلوبة';
  END IF;

  IF coalesce(trim(p_phone), '') = '' THEN
    RAISE EXCEPTION 'رقم الهاتف مطلوب';
  END IF;

  IF coalesce(trim(p_from_location), '') = '' THEN
    RAISE EXCEPTION 'موقع الانطلاق مطلوب';
  END IF;

  IF coalesce(trim(p_to_location), '') = '' THEN
    RAISE EXCEPTION 'الوجهة مطلوبة';
  END IF;

  IF p_people_count IS NULL OR p_people_count < 1 OR p_people_count > 20 THEN
    RAISE EXCEPTION 'عدد الركاب غير صالح';
  END IF;

  INSERT INTO public.service_requests (
    requester_id, provider_id, type, status, city, phone,
    from_location, to_location, details, people_count,
    from_lat, from_lng, to_lat, to_lng
  )
  VALUES (
    v_uid, p_provider_id, 'taxi', 'pending', trim(p_city), trim(p_phone),
    trim(p_from_location), trim(p_to_location),
    'طلب تاكسي ذكي', p_people_count,
    p_from_lat, p_from_lng, p_to_lat, p_to_lng
  )
  RETURNING id INTO v_request_id;

  -- الإشعار يتم تلقائيًا عبر trigger notify_new_service_request.
  -- لا نضيف إشعارًا ثانيًا هنا حتى لا يتكرر.
  RETURN v_request_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_taxi_request(
  uuid, text, text, text, text, integer,
  double precision, double precision, double precision, double precision
) TO authenticated;

-- قبول الطلب: يسمح فقط للسائق الذي وُجّه إليه الطلب بقبوله.
CREATE OR REPLACE FUNCTION public.accept_service_request(p_request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_type text;
  v_status text;
  v_selected_provider uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول';
  END IF;

  SELECT type, status, provider_id
  INTO v_type, v_status, v_selected_provider
  FROM public.service_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_type IS NULL THEN RAISE EXCEPTION 'الطلب غير موجود'; END IF;
  IF v_status <> 'pending' THEN RAISE EXCEPTION 'الطلب لم يعد متاحًا'; END IF;
  IF v_selected_provider IS NOT NULL AND v_selected_provider <> v_uid THEN
    RAISE EXCEPTION 'هذا الطلب موجه إلى سائق آخر';
  END IF;
  IF EXISTS (SELECT 1 FROM public.service_requests WHERE id=p_request_id AND requester_id=v_uid) THEN
    RAISE EXCEPTION 'لا يمكنك قبول طلبك';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.service_providers
    WHERE user_id=v_uid AND service_type=v_type AND is_active=true
  ) THEN
    RAISE EXCEPTION 'فعّل نفسك كمقدم لهذه الخدمة أولاً';
  END IF;

  UPDATE public.service_requests
  SET provider_id=v_uid, status='accepted', updated_at=now()
  WHERE id=p_request_id AND status='pending';

  IF NOT FOUND THEN RAISE EXCEPTION 'تم قبول الطلب من مقدم آخر'; END IF;

  INSERT INTO public.notifications(user_id,type,title,message,related_service_request_id)
  SELECT requester_id,'service','🚕 تم قبول طلب التكسي','تم قبول طلبك من السائق ويمكنك متابعة الرحلة.',id
  FROM public.service_requests WHERE id=p_request_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_service_request(uuid) TO authenticated;
