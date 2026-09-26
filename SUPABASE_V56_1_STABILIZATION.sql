-- ============================================================
-- فلسطين بلاتفورم V56.1 - Stabilization / Regression Fixes
-- شغّل هذا الملف بعد V56
-- ============================================================

-- 1) استعادة حماية V55 عند تغيير حالة المستخدم.
-- V56 استبدل الدالة وأزال حماية آخر مدير عام.
CREATE OR REPLACE FUNCTION public.admin_set_user_status(
  target_user_id uuid,
  new_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_actor_role text;
  v_target_role text;
  v_admin_count integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول';
  END IF;

  IF NOT public.has_permission('manage_users') THEN
    RAISE EXCEPTION 'غير مصرح';
  END IF;

  IF new_status NOT IN ('active','suspended') THEN
    RAISE EXCEPTION 'حالة غير صالحة';
  END IF;

  SELECT role INTO v_actor_role
  FROM public.profiles
  WHERE id=v_uid;

  SELECT role INTO v_target_role
  FROM public.profiles
  WHERE id=target_user_id
  FOR UPDATE;

  IF v_target_role IS NULL THEN
    RAISE EXCEPTION 'المستخدم غير موجود';
  END IF;

  IF v_actor_role='manager' AND v_target_role IN ('admin','manager') THEN
    RAISE EXCEPTION 'لا يمكن للمدير إيقاف مدير أعلى أو مساوي له';
  END IF;

  IF target_user_id=v_uid
     AND v_actor_role='admin'
     AND new_status='suspended' THEN
    SELECT count(*) INTO v_admin_count
    FROM public.profiles
    WHERE role='admin' AND status='active';

    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'لا يمكن إيقاف آخر مدير عام نشط';
    END IF;
  END IF;

  UPDATE public.profiles
  SET status=new_status,
      updated_at=now()
  WHERE id=target_user_id;

  PERFORM public.write_audit_log(
    'user_status_changed',
    'profile',
    target_user_id,
    jsonb_build_object('status',new_status)
  );

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_user_status(uuid,text) TO authenticated;


-- 2) مركز البلاغات كان يفتقر إلى سياسات قراءة واضحة.
-- نضيف سياسات مستقلة دون حذف سياسات قديمة.
ALTER TABLE public.ad_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS v56_reports_read_own ON public.ad_reports;
CREATE POLICY v56_reports_read_own
ON public.ad_reports
FOR SELECT TO authenticated
USING (
  reporter_id=auth.uid()
  OR public.has_permission('manage_reports')
);

DROP POLICY IF EXISTS v56_reports_insert_own ON public.ad_reports;
CREATE POLICY v56_reports_insert_own
ON public.ad_reports
FOR INSERT TO authenticated
WITH CHECK (reporter_id=auth.uid());


-- 3) سجل التدقيق يجب أن يكون متاحًا لمن يملك صلاحية البلاغات أيضًا.
DROP POLICY IF EXISTS v56_audit_read ON public.audit_logs;
CREATE POLICY v56_audit_read
ON public.audit_logs
FOR SELECT TO authenticated
USING (
  public.has_permission('manage_users')
  OR public.has_permission('manage_reports')
  OR public.has_permission('moderate_ads')
);


-- 4) منع إنشاء محادثة جديدة مع مستخدم قام أحد الطرفين بحظره.
DROP POLICY IF EXISTS conversations_participant_insert ON public.conversations;
CREATE POLICY conversations_participant_insert
ON public.conversations
FOR INSERT TO authenticated
WITH CHECK (
  buyer_id=auth.uid()
  AND buyer_id<>seller_id
  AND public.can_message_user(seller_id)
);


-- 5) منع إرسال رسالة جديدة في محادثة بين مستخدمين يوجد بينهما حظر.
DROP POLICY IF EXISTS messages_sender_insert ON public.messages;
CREATE POLICY messages_sender_insert
ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id=auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE c.id=messages.conversation_id
      AND (c.buyer_id=auth.uid() OR c.seller_id=auth.uid())
  )
  AND EXISTS (
    SELECT 1
    FROM public.conversations c2
    WHERE c2.id=messages.conversation_id
      AND public.can_message_user(
        CASE
          WHEN c2.buyer_id=auth.uid() THEN c2.seller_id
          ELSE c2.buyer_id
        END
      )
  )
);


-- 6) التأكد من أن صلاحية التوثيق لا تعتمد على manage_users فقط.
-- نبقي manage_users مسموحة للتوافق مع لوحة الإدارة الحالية.
CREATE OR REPLACE FUNCTION public.admin_set_user_verification(
  target_user_id uuid,
  new_verified boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF NOT (
    public.has_permission('manage_verification')
    OR public.has_permission('manage_users')
  ) THEN
    RAISE EXCEPTION 'غير مصرح';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id=target_user_id
  ) THEN
    RAISE EXCEPTION 'المستخدم غير موجود';
  END IF;

  UPDATE public.profiles
  SET is_verified=new_verified,
      verified_at=CASE WHEN new_verified THEN now() ELSE NULL END,
      verified_by=CASE WHEN new_verified THEN v_uid ELSE NULL END,
      updated_at=now()
  WHERE id=target_user_id;

  PERFORM public.write_audit_log(
    'user_verification_changed',
    'profile',
    target_user_id,
    jsonb_build_object('verified',new_verified)
  );

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_user_verification(uuid,boolean) TO authenticated;


-- ============================================================
-- V56.1 END
-- ============================================================
