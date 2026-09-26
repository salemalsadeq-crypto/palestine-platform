CREATE OR REPLACE FUNCTION public.cancel_my_active_subscription()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_id uuid;
BEGIN
 SELECT id INTO v_id FROM public.subscriptions
 WHERE user_id=auth.uid() AND status='active' AND ends_at>now()
 ORDER BY ends_at DESC LIMIT 1;
 IF v_id IS NULL THEN RAISE EXCEPTION 'لا يوجد اشتراك فعال لإلغائه'; END IF;
 UPDATE public.subscriptions SET status='cancelled',updated_at=now() WHERE id=v_id;
 RETURN true;
END; $$;
GRANT EXECUTE ON FUNCTION public.cancel_my_active_subscription() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_cancel_subscription(p_subscription_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_role text;
BEGIN
 SELECT role INTO v_role FROM public.profiles WHERE id=auth.uid() AND status='active';
 IF v_role NOT IN ('admin','manager') THEN RAISE EXCEPTION 'لا تملك صلاحية إلغاء الاشتراك'; END IF;
 UPDATE public.subscriptions SET status='cancelled',updated_at=now() WHERE id=p_subscription_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'الاشتراك غير موجود'; END IF;
 RETURN true;
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_cancel_subscription(uuid) TO authenticated;

UPDATE public.service_providers sp SET is_available=false,is_active=false,updated_at=now()
WHERE sp.user_id IN (SELECT s.user_id FROM public.subscriptions s WHERE s.status='cancelled');
