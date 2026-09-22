-- فلسطين بلاتفورم V25
-- إصلاح الطلب المباشر لمقدم الخدمة + الإشعار الموجه

CREATE OR REPLACE FUNCTION public.create_direct_service_request(
  p_provider_id uuid,
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
DECLARE
  v_id uuid; v_uid uuid:=auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  IF p_type NOT IN ('taxi','delivery','home','food','transport') THEN RAISE EXCEPTION 'نوع الخدمة غير صالح'; END IF;
  IF p_provider_id IS NULL OR p_provider_id=v_uid THEN RAISE EXCEPTION 'مقدم الخدمة غير صالح'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.service_providers WHERE user_id=p_provider_id AND service_type=p_type AND is_active=true) THEN RAISE EXCEPTION 'مقدم الخدمة غير متاح لهذا النوع'; END IF;
  IF coalesce(trim(p_city),'')='' OR coalesce(trim(p_phone),'')='' OR coalesce(trim(p_from_location),'')='' THEN RAISE EXCEPTION 'المدينة والهاتف والموقع مطلوبة'; END IF;
  IF p_type IN ('taxi','delivery','transport') AND coalesce(trim(p_to_location),'')='' THEN RAISE EXCEPTION 'الوجهة مطلوبة'; END IF;
  IF p_people_count IS NULL OR p_people_count<1 OR p_people_count>20 THEN RAISE EXCEPTION 'عدد الأشخاص غير صالح'; END IF;
  INSERT INTO public.service_requests(requester_id,provider_id,type,city,phone,from_location,to_location,details,budget,people_count,scheduled_at)
  VALUES(v_uid,p_provider_id,p_type,trim(p_city),trim(p_phone),trim(p_from_location),NULLIF(trim(p_to_location),''),NULLIF(trim(p_details),''),p_budget,p_people_count,p_scheduled_at)
  RETURNING id INTO v_id;
  RETURN v_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.create_direct_service_request(uuid,text,text,text,text,text,text,numeric,integer,timestamptz) TO authenticated;

CREATE OR REPLACE FUNCTION public.notify_new_service_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.provider_id IS NOT NULL THEN
    INSERT INTO public.notifications(user_id,type,title,message,related_service_request_id)
    VALUES(NEW.provider_id,'service','طلب خدمة مباشر 🔔','لديك طلب خدمة مباشر جديد.',NEW.id);
  ELSE
    INSERT INTO public.notifications(user_id,type,title,message,related_service_request_id)
    SELECT sp.user_id,'service','طلب خدمة جديد 🔔','يوجد طلب جديد في مدينتك ضمن الخدمة التي تقدمها.',NEW.id
    FROM public.service_providers sp
    WHERE sp.is_active=true AND sp.service_type=NEW.type AND (coalesce(trim(sp.city),'')='' OR lower(trim(sp.city))=lower(trim(NEW.city)))
      AND sp.user_id<>NEW.requester_id;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS service_request_notify_trigger ON public.service_requests;
CREATE TRIGGER service_request_notify_trigger
AFTER INSERT ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.notify_new_service_request();
