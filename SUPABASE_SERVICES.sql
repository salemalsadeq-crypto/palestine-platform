-- فلسطين بلاتفورم - نظام الخدمات المستقلة عن الإعلانات
-- شغّل هذا الملف مرة واحدة بعد تحديثات v19/v20 السابقة.

CREATE TABLE IF NOT EXISTS public.service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type text NOT NULL CHECK (service_type IN ('taxi','delivery','home','food','transport')),
  city text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('taxi','delivery','home','food','transport')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','in_progress','completed','cancelled')),
  city text NOT NULL,
  phone text NOT NULL,
  from_location text NOT NULL,
  to_location text,
  details text,
  budget numeric(12,2),
  people_count integer NOT NULL DEFAULT 1 CHECK (people_count BETWEEN 1 AND 20),
  scheduled_at timestamptz,
  provider_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS related_service_request_id uuid REFERENCES public.service_requests(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS service_requests_requester_idx ON public.service_requests(requester_id,created_at DESC);
CREATE INDEX IF NOT EXISTS service_requests_provider_idx ON public.service_requests(provider_id,created_at DESC);
CREATE INDEX IF NOT EXISTS service_requests_pending_idx ON public.service_requests(type,status,city,created_at DESC);
CREATE INDEX IF NOT EXISTS service_providers_type_city_idx ON public.service_providers(service_type,city,is_active);

ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_providers_read ON public.service_providers;
CREATE POLICY service_providers_read ON public.service_providers FOR SELECT TO authenticated USING (is_active=true OR user_id=auth.uid());
DROP POLICY IF EXISTS service_providers_insert_own ON public.service_providers;
CREATE POLICY service_providers_insert_own ON public.service_providers FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
DROP POLICY IF EXISTS service_providers_update_own ON public.service_providers;
CREATE POLICY service_providers_update_own ON public.service_providers FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

DROP POLICY IF EXISTS service_requests_read_own ON public.service_requests;
CREATE POLICY service_requests_read_own ON public.service_requests FOR SELECT TO authenticated USING (requester_id=auth.uid() OR provider_id=auth.uid() OR EXISTS (SELECT 1 FROM public.service_providers sp WHERE sp.user_id=auth.uid() AND sp.is_active=true AND sp.service_type=service_requests.type));
DROP POLICY IF EXISTS service_requests_insert_own ON public.service_requests;
CREATE POLICY service_requests_insert_own ON public.service_requests FOR INSERT TO authenticated WITH CHECK (requester_id=auth.uid());
DROP POLICY IF EXISTS service_requests_update_own ON public.service_requests;
CREATE POLICY service_requests_update_own ON public.service_requests FOR UPDATE TO authenticated USING (requester_id=auth.uid() OR provider_id=auth.uid()) WITH CHECK (requester_id=auth.uid() OR provider_id=auth.uid());

CREATE OR REPLACE FUNCTION public.set_service_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS service_providers_updated_at ON public.service_providers;
CREATE TRIGGER service_providers_updated_at BEFORE UPDATE ON public.service_providers FOR EACH ROW EXECUTE FUNCTION public.set_service_updated_at();
DROP TRIGGER IF EXISTS service_requests_updated_at ON public.service_requests;
CREATE TRIGGER service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.set_service_updated_at();

CREATE OR REPLACE FUNCTION public.create_service_request(
  p_type text,
  p_city text,
  p_phone text,
  p_from_location text,
  p_to_location text DEFAULT NULL,
  p_details text DEFAULT NULL,
  p_budget numeric DEFAULT NULL,
  p_people_count integer DEFAULT 1,
  p_scheduled_at timestamptz DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_id uuid; v_uid uuid:=auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  IF p_type NOT IN ('taxi','delivery','home','food','transport') THEN RAISE EXCEPTION 'نوع الخدمة غير صالح'; END IF;
  IF coalesce(trim(p_city),'')='' OR coalesce(trim(p_phone),'')='' OR coalesce(trim(p_from_location),'')='' THEN RAISE EXCEPTION 'المدينة والهاتف والموقع مطلوبة'; END IF;
  IF p_type IN ('taxi','delivery','transport') AND coalesce(trim(p_to_location),'')='' THEN RAISE EXCEPTION 'الوجهة مطلوبة'; END IF;
  IF p_people_count IS NULL OR p_people_count<1 OR p_people_count>20 THEN RAISE EXCEPTION 'عدد الأشخاص غير صالح'; END IF;
  INSERT INTO public.service_requests(requester_id,type,city,phone,from_location,to_location,details,budget,people_count,scheduled_at)
  VALUES(v_uid,p_type,trim(p_city),trim(p_phone),trim(p_from_location),NULLIF(trim(p_to_location),''),NULLIF(trim(p_details),''),p_budget,p_people_count,p_scheduled_at)
  RETURNING id INTO v_id;
  RETURN v_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.create_service_request(text,text,text,text,text,text,numeric,integer,timestamptz) TO authenticated;

CREATE OR REPLACE FUNCTION public.accept_service_request(p_request_id uuid) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_uid uuid:=auth.uid(); v_type text; v_status text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  SELECT type,status INTO v_type,v_status FROM public.service_requests WHERE id=p_request_id FOR UPDATE;
  IF v_type IS NULL THEN RAISE EXCEPTION 'الطلب غير موجود'; END IF;
  IF v_status<>'pending' THEN RAISE EXCEPTION 'الطلب لم يعد متاحًا'; END IF;
  IF EXISTS(SELECT 1 FROM public.service_requests WHERE id=p_request_id AND requester_id=v_uid) THEN RAISE EXCEPTION 'لا يمكنك قبول طلبك'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.service_providers WHERE user_id=v_uid AND service_type=v_type AND is_active=true) THEN RAISE EXCEPTION 'فعّل نفسك كمقدم لهذه الخدمة أولًا'; END IF;
  UPDATE public.service_requests SET provider_id=v_uid,status='accepted',updated_at=now() WHERE id=p_request_id AND status='pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'تم قبول الطلب من مقدم آخر'; END IF;
  INSERT INTO public.notifications(user_id,type,title,message,related_service_request_id)
  SELECT requester_id,'service','تم قبول طلب الخدمة ✅','تم قبول طلبك من مقدم خدمة ويمكنك متابعة حالته.',id FROM public.service_requests WHERE id=p_request_id;
  RETURN true;
END; $$;
GRANT EXECUTE ON FUNCTION public.accept_service_request(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_my_service_request(p_request_id uuid,p_status text,p_note text DEFAULT NULL) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_uid uuid:=auth.uid(); v_requester uuid; v_provider uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  IF p_status NOT IN ('in_progress','completed','cancelled') THEN RAISE EXCEPTION 'حالة غير صالحة'; END IF;
  SELECT requester_id,provider_id INTO v_requester,v_provider FROM public.service_requests WHERE id=p_request_id;
  IF v_requester IS NULL THEN RAISE EXCEPTION 'الطلب غير موجود'; END IF;
  IF v_uid<>v_provider AND v_uid<>v_requester THEN RAISE EXCEPTION 'غير مصرح'; END IF;
  UPDATE public.service_requests SET status=p_status,provider_note=CASE WHEN p_note IS NULL THEN provider_note ELSE trim(p_note) END,updated_at=now() WHERE id=p_request_id;
  INSERT INTO public.notifications(user_id,type,title,message,related_service_request_id)
  VALUES(CASE WHEN v_uid=v_provider THEN v_requester ELSE v_provider END,'service','تحديث طلب الخدمة 🔔','تم تحديث حالة طلب الخدمة إلى: '||p_status,p_request_id);
  RETURN true;
END; $$;
GRANT EXECUTE ON FUNCTION public.update_my_service_request(uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.cancel_my_service_request(p_request_id uuid) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  UPDATE public.service_requests SET status='cancelled',updated_at=now() WHERE id=p_request_id AND requester_id=auth.uid() AND status IN ('pending','accepted');
  RETURN FOUND;
END; $$;
GRANT EXECUTE ON FUNCTION public.cancel_my_service_request(uuid) TO authenticated;

-- إشعار مقدمي الخدمة عند وصول طلب جديد
CREATE OR REPLACE FUNCTION public.notify_new_service_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.notifications(user_id,type,title,message,related_service_request_id)
  SELECT sp.user_id,'service','طلب خدمة جديد 🔔','يوجد طلب جديد في مدينتك ضمن الخدمة التي تقدمها.',NEW.id
  FROM public.service_providers sp
  WHERE sp.is_active=true AND sp.service_type=NEW.type AND (coalesce(trim(sp.city),'')='' OR lower(trim(sp.city))=lower(trim(NEW.city)))
    AND sp.user_id<>NEW.requester_id;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS service_request_notify_trigger ON public.service_requests;
CREATE TRIGGER service_request_notify_trigger
AFTER INSERT ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.notify_new_service_request();
