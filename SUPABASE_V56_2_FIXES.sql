-- فلسطين بلاتفورم V56.2 - Messaging / Notifications / Category Fixes
-- شغّل هذا الملف بعد V56.1

-- 1) تأكيد وجود RPCs الخاصة بالمحادثات. هذا يعالج schema cache / missing function.
CREATE OR REPLACE FUNCTION public.get_my_conversations(p_limit integer DEFAULT 50,p_offset integer DEFAULT 0)
RETURNS TABLE(id uuid,ad_id uuid,buyer_id uuid,seller_id uuid,created_at timestamptz,last_message text,last_message_at timestamptz,unread_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public
AS $$
 SELECT c.id,c.ad_id,c.buyer_id,c.seller_id,c.created_at,lm.body AS last_message,
 COALESCE(lm.created_at,c.last_message_at,c.created_at) AS last_message_at,
 (SELECT count(*) FROM public.messages m2 WHERE m2.conversation_id=c.id AND m2.sender_id<>auth.uid() AND m2.is_read=false) AS unread_count
 FROM public.conversations c
 LEFT JOIN LATERAL (SELECT m.body,m.created_at FROM public.messages m WHERE m.conversation_id=c.id ORDER BY m.created_at DESC LIMIT 1) lm ON true
 WHERE auth.uid() IS NOT NULL AND (c.buyer_id=auth.uid() OR c.seller_id=auth.uid())
 ORDER BY COALESCE(lm.created_at,c.last_message_at,c.created_at) DESC
 LIMIT GREATEST(1,LEAST(COALESCE(p_limit,50),100)) OFFSET GREATEST(COALESCE(p_offset,0),0);
$$;
GRANT EXECUTE ON FUNCTION public.get_my_conversations(integer,integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_my_conversation_messages(p_conversation_id uuid,p_limit integer DEFAULT 100)
RETURNS TABLE(id uuid,conversation_id uuid,sender_id uuid,body text,is_read boolean,created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public
AS $$
 SELECT m.id,m.conversation_id,m.sender_id,m.body,m.is_read,m.created_at
 FROM public.messages m JOIN public.conversations c ON c.id=m.conversation_id
 WHERE m.conversation_id=p_conversation_id AND auth.uid() IS NOT NULL AND (c.buyer_id=auth.uid() OR c.seller_id=auth.uid())
 ORDER BY m.created_at ASC LIMIT GREATEST(1,LEAST(COALESCE(p_limit,100),200));
$$;
GRANT EXECUTE ON FUNCTION public.get_my_conversation_messages(uuid,integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.mark_conversation_messages_read(p_conversation_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_uid uuid:=auth.uid(); v_count integer;
BEGIN
 IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.conversations WHERE id=p_conversation_id AND (buyer_id=v_uid OR seller_id=v_uid)) THEN RAISE EXCEPTION 'غير مصرح'; END IF;
 UPDATE public.messages SET is_read=true WHERE conversation_id=p_conversation_id AND sender_id<>v_uid AND is_read=false;
 GET DIAGNOSTICS v_count=ROW_COUNT; RETURN v_count;
END; $$;
GRANT EXECUTE ON FUNCTION public.mark_conversation_messages_read(uuid) TO authenticated;

-- 2) إشعارات المستخدم: سياسات القراءة والتعديل والحذف، مع دوال آمنة للتحديث.
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS v56_2_notifications_read ON public.notifications;
CREATE POLICY v56_2_notifications_read ON public.notifications FOR SELECT TO authenticated USING(user_id=auth.uid());
DROP POLICY IF EXISTS v56_2_notifications_update ON public.notifications;
CREATE POLICY v56_2_notifications_update ON public.notifications FOR UPDATE TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
DROP POLICY IF EXISTS v56_2_notifications_delete ON public.notifications;
CREATE POLICY v56_2_notifications_delete ON public.notifications FOR DELETE TO authenticated USING(user_id=auth.uid());

CREATE OR REPLACE FUNCTION public.mark_my_notification_read(p_notification_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n integer;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
 UPDATE public.notifications SET is_read=true WHERE id=p_notification_id AND user_id=auth.uid();
 GET DIAGNOSTICS n=ROW_COUNT; RETURN n>0;
END; $$;
GRANT EXECUTE ON FUNCTION public.mark_my_notification_read(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.mark_all_my_notifications_read()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n integer;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
 UPDATE public.notifications SET is_read=true WHERE user_id=auth.uid() AND is_read=false;
 GET DIAGNOSTICS n=ROW_COUNT; RETURN n;
END; $$;
GRANT EXECUTE ON FUNCTION public.mark_all_my_notifications_read() TO authenticated;

CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON public.notifications(user_id,created_at DESC);

-- 3) Realtime للإشعارات إذا كان جدول الإشعارات ضمن publication.
DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END;
END $$;

-- V56.2 END
