-- فلسطين بلاتفورم V38 — تطوير رحلة التاكسي
-- شغّل هذا الملف مرة واحدة بعد V37.

ALTER TABLE public.service_providers
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

CREATE INDEX IF NOT EXISTS idx_service_providers_taxi_live
ON public.service_providers(service_type,is_available,is_active,latitude,longitude);

ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS from_lat double precision,
  ADD COLUMN IF NOT EXISTS from_lng double precision,
  ADD COLUMN IF NOT EXISTS to_lat double precision,
  ADD COLUMN IF NOT EXISTS to_lng double precision;

CREATE INDEX IF NOT EXISTS idx_service_requests_provider_status
ON public.service_requests(provider_id,status,created_at DESC);

CREATE TABLE IF NOT EXISTS public.taxi_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL UNIQUE REFERENCES public.service_requests(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.taxi_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "taxi reviews read authenticated" ON public.taxi_reviews;
CREATE POLICY "taxi reviews read authenticated" ON public.taxi_reviews
FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "taxi reviews insert requester" ON public.taxi_reviews;
CREATE POLICY "taxi reviews insert requester" ON public.taxi_reviews
FOR INSERT TO authenticated WITH CHECK (requester_id=auth.uid());
CREATE INDEX IF NOT EXISTS idx_taxi_reviews_provider ON public.taxi_reviews(provider_id,created_at DESC);

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
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_id uuid; v_uid uuid:=auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  IF p_provider_id IS NULL OR p_provider_id=v_uid THEN RAISE EXCEPTION 'مقدم الخدمة غير صالح'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.service_providers WHERE user_id=p_provider_id AND service_type='taxi' AND is_active=true AND is_available=true) THEN
    RAISE EXCEPTION 'السائق لم يعد متاحاً الآن';
  END IF;
  IF coalesce(trim(p_city),'')='' OR coalesce(trim(p_phone),'')='' OR coalesce(trim(p_from_location),'')='' OR coalesce(trim(p_to_location),'')='' THEN
    RAISE EXCEPTION 'بيانات الرحلة غير مكتملة';
  END IF;
  IF p_people_count IS NULL OR p_people_count<1 OR p_people_count>20 THEN RAISE EXCEPTION 'عدد الركاب غير صالح'; END IF;
  INSERT INTO public.service_requests(requester_id,provider_id,type,status,city,phone,from_location,to_location,details,people_count,from_lat,from_lng,to_lat,to_lng)
  VALUES(v_uid,p_provider_id,'taxi','pending',trim(p_city),trim(p_phone),trim(p_from_location),trim(p_to_location),'رحلة تاكسي ذكية',p_people_count,p_from_lat,p_from_lng,p_to_lat,p_to_lng)
  RETURNING id INTO v_id;
  RETURN v_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.create_taxi_request(uuid,text,text,text,text,integer,double precision,double precision,double precision,double precision) TO authenticated;

CREATE OR REPLACE FUNCTION public.accept_taxi_service_request(p_request_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_uid uuid:=auth.uid(); v_id uuid; v_provider uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  SELECT provider_id INTO v_provider FROM public.service_requests WHERE id=p_request_id AND type='taxi' AND status='pending' FOR UPDATE;
  IF v_provider IS NULL OR v_provider<>v_uid THEN RAISE EXCEPTION 'هذا الطلب غير مخصص لك أو لم يعد متاحاً'; END IF;
  UPDATE public.service_requests SET status='accepted',updated_at=now() WHERE id=p_request_id AND status='pending' RETURNING id INTO v_id;
  INSERT INTO public.notifications(user_id,type,title,message,related_service_request_id)
  SELECT requester_id,'service','تم قبول طلب التاكسي 🚕','السائق قبل طلبك ويمكنك متابعة حالة الرحلة.',id
  FROM public.service_requests WHERE id=v_id;
  RETURN v_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.accept_taxi_service_request(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_my_service_request(p_request_id uuid,p_status text,p_note text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_uid uuid:=auth.uid(); v_id uuid; v_requester uuid; v_provider uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  IF p_status NOT IN ('in_progress','completed','cancelled') THEN RAISE EXCEPTION 'الحالة غير صالحة'; END IF;
  SELECT requester_id,provider_id INTO v_requester,v_provider FROM public.service_requests WHERE id=p_request_id;
  IF v_provider IS NULL OR v_provider<>v_uid THEN RAISE EXCEPTION 'غير مصرح لك بتعديل هذا الطلب'; END IF;
  UPDATE public.service_requests SET status=p_status,provider_note=NULLIF(trim(coalesce(p_note,'')),''),updated_at=now() WHERE id=p_request_id AND ((p_status='in_progress' AND status='accepted') OR (p_status='completed' AND status='in_progress') OR (p_status='cancelled' AND status IN ('pending','accepted','in_progress'))) RETURNING id INTO v_id;
  INSERT INTO public.notifications(user_id,type,title,message,related_service_request_id)
  VALUES(v_requester,'service',
    CASE p_status WHEN 'in_progress' THEN 'بدأ تنفيذ طلبك 🚀' WHEN 'completed' THEN 'اكتمل طلبك ✅' ELSE 'تم إلغاء طلبك' END,
    CASE p_status WHEN 'in_progress' THEN 'مقدم الخدمة بدأ تنفيذ طلبك.' WHEN 'completed' THEN 'اكتمل تنفيذ طلبك.' ELSE 'تم تحديث حالة طلبك.' END,v_id);
  RETURN v_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.update_my_service_request(uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.cancel_my_taxi_request(p_request_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_uid uuid:=auth.uid(); v_id uuid; v_provider uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  SELECT provider_id INTO v_provider FROM public.service_requests WHERE id=p_request_id AND requester_id=v_uid AND type='taxi' AND status IN ('pending','accepted');
  IF NOT FOUND THEN RAISE EXCEPTION 'لا يمكن إلغاء هذا الطلب الآن'; END IF;
  UPDATE public.service_requests SET status='cancelled',updated_at=now() WHERE id=p_request_id AND ((p_status='in_progress' AND status='accepted') OR (p_status='completed' AND status='in_progress') OR (p_status='cancelled' AND status IN ('pending','accepted','in_progress'))) RETURNING id INTO v_id;
  IF v_provider IS NOT NULL THEN
    INSERT INTO public.notifications(user_id,type,title,message,related_service_request_id)
    VALUES(v_provider,'service','أُلغي طلب التاكسي','قام العميل بإلغاء الطلب.',v_id);
  END IF;
  RETURN v_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.cancel_my_taxi_request(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_my_provider_location(p_lat double precision,p_lng double precision)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_uid uuid:=auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  IF p_lat IS NULL OR p_lng IS NULL OR p_lat NOT BETWEEN -90 AND 90 OR p_lng NOT BETWEEN -180 AND 180 THEN RAISE EXCEPTION 'إحداثيات غير صالحة'; END IF;
  UPDATE public.service_providers SET latitude=p_lat,longitude=p_lng,updated_at=now() WHERE user_id=v_uid AND service_type IN ('taxi','transport');
  IF NOT FOUND THEN RAISE EXCEPTION 'ملف مقدم الخدمة غير موجود'; END IF;
  RETURN true;
END; $$;
GRANT EXECUTE ON FUNCTION public.update_my_provider_location(double precision,double precision) TO authenticated;

CREATE OR REPLACE FUNCTION public.add_taxi_review(p_request_id uuid,p_rating integer,p_comment text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_uid uuid:=auth.uid(); v_provider uuid; v_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  IF p_rating NOT BETWEEN 1 AND 5 THEN RAISE EXCEPTION 'التقييم يجب أن يكون من 1 إلى 5'; END IF;
  SELECT provider_id INTO v_provider FROM public.service_requests WHERE id=p_request_id AND requester_id=v_uid AND type='taxi' AND status='completed';
  IF v_provider IS NULL THEN RAISE EXCEPTION 'الرحلة غير صالحة للتقييم'; END IF;
  INSERT INTO public.taxi_reviews(request_id,requester_id,provider_id,rating,comment) VALUES(p_request_id,v_uid,v_provider,p_rating,NULLIF(trim(coalesce(p_comment,'')),'')) RETURNING id INTO v_id;
  RETURN v_id;
EXCEPTION WHEN unique_violation THEN RAISE EXCEPTION 'تم تقييم هذه الرحلة مسبقاً';
END; $$;
GRANT EXECUTE ON FUNCTION public.add_taxi_review(uuid,integer,text) TO authenticated;
