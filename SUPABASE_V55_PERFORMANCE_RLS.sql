-- فلسطين بلاتفورم V55
-- Performance + RLS Audit
-- شغّل بعد نجاح V54.
-- الهدف: تقليل تسريب بيانات الطلبات/الرسائل، إغلاق UPDATE المباشر للعمليات الحساسة،
-- وإضافة RPCs آمنة للقراءة والتحديثات التي تحتاجها الواجهة.

-- ============================================================
-- 1) الصلاحيات: منع manager من إنشاء/إدارة مدير أعلى منه
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_set_user_role(target_user_id uuid,new_role text)
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
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  IF NOT public.has_permission('manage_roles') THEN RAISE EXCEPTION 'غير مصرح'; END IF;

  IF new_role NOT IN ('admin','manager','editor','moderator','places_manager','ads_manager','member','user') THEN
    RAISE EXCEPTION 'دور غير صالح';
  END IF;

  SELECT role INTO v_actor_role FROM public.profiles WHERE id=v_uid;
  SELECT role INTO v_target_role FROM public.profiles WHERE id=target_user_id FOR UPDATE;
  IF v_target_role IS NULL THEN RAISE EXCEPTION 'المستخدم غير موجود'; END IF;

  -- المدير لا يستطيع إنشاء/تعديل مدير عام أو مدير آخر.
  IF v_actor_role='manager' AND new_role IN ('admin','manager') THEN
    RAISE EXCEPTION 'المدير لا يستطيع منح هذا الدور';
  END IF;

  IF v_actor_role='manager' AND v_target_role IN ('admin','manager') THEN
    RAISE EXCEPTION 'لا يمكن للمدير تعديل دور مدير آخر أو المدير العام';
  END IF;

  -- لا تسمح بخفض آخر مدير عام في النظام.
  IF target_user_id=v_uid AND v_actor_role='admin' AND new_role<>'admin' THEN
    SELECT count(*) INTO v_admin_count
    FROM public.profiles
    WHERE role='admin' AND status='active';
    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'لا يمكن إزالة آخر مدير عام نشط';
    END IF;
  END IF;

  UPDATE public.profiles SET role=new_role,updated_at=now() WHERE id=target_user_id;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid,text) TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_set_user_status(target_user_id uuid,new_status text)
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
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  IF NOT public.has_permission('manage_users') THEN RAISE EXCEPTION 'غير مصرح'; END IF;
  IF new_status NOT IN ('active','suspended') THEN RAISE EXCEPTION 'حالة غير صالحة'; END IF;

  SELECT role INTO v_actor_role FROM public.profiles WHERE id=v_uid;
  SELECT role INTO v_target_role FROM public.profiles WHERE id=target_user_id FOR UPDATE;
  IF v_target_role IS NULL THEN RAISE EXCEPTION 'المستخدم غير موجود'; END IF;

  IF v_actor_role='manager' AND v_target_role IN ('admin','manager') THEN
    RAISE EXCEPTION 'لا يمكن للمدير إيقاف مدير أعلى أو مساوي له';
  END IF;

  IF target_user_id=v_uid AND v_actor_role='admin' AND new_status='suspended' THEN
    SELECT count(*) INTO v_admin_count
    FROM public.profiles
    WHERE role='admin' AND status='active';
    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'لا يمكن إيقاف آخر مدير عام نشط';
    END IF;
  END IF;

  UPDATE public.profiles SET status=new_status,updated_at=now() WHERE id=target_user_id;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_user_status(uuid,text) TO authenticated;


-- ============================================================
-- 2) طلبات الخدمات: منع مقدم خدمة من قراءة الطلبات المكتملة/الملغاة
--    أو طلبات مدن أخرى إذا كانت مدينته محددة.
--    العمليات الحساسة تتم عبر RPCs الموجودة أصلًا.
-- ============================================================

DROP POLICY IF EXISTS service_requests_read_own ON public.service_requests;
CREATE POLICY service_requests_read_own
ON public.service_requests
FOR SELECT TO authenticated
USING (
  requester_id=auth.uid()
  OR provider_id=auth.uid()
  OR (
    status='pending'
    AND EXISTS (
      SELECT 1
      FROM public.service_providers sp
      WHERE sp.user_id=auth.uid()
        AND sp.is_active=true
        AND sp.service_type=service_requests.type
        AND (
          coalesce(trim(sp.city),'')=''
          OR lower(trim(sp.city))=lower(trim(service_requests.city))
        )
    )
  )
);

DROP POLICY IF EXISTS service_requests_update_own ON public.service_requests;
-- لا يوجد UPDATE مباشر. استخدم:
-- update_my_service_request / cancel_my_service_request / cancel_my_taxi_request


-- ============================================================
-- 3) مقدم الخدمة: منع تفعيل الحساب مباشرة دون اشتراك فعال.
--    كما يمنع تغيير user_id و service_type و provider_kind من المتصفح.
-- ============================================================

CREATE OR REPLACE FUNCTION public.guard_service_provider_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_is_admin boolean := public.has_permission('manage_services') OR public.has_permission('manage_users');
  v_has_subscription boolean;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;

  IF TG_OP='UPDATE' THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id AND NOT v_is_admin THEN
      RAISE EXCEPTION 'لا يمكن تغيير مالك مقدم الخدمة';
    END IF;

    IF NEW.service_type IS DISTINCT FROM OLD.service_type AND NOT v_is_admin THEN
      RAISE EXCEPTION 'لا يمكن تغيير نوع الخدمة مباشرة';
    END IF;

    IF NEW.provider_kind IS DISTINCT FROM OLD.provider_kind AND NOT v_is_admin THEN
      RAISE EXCEPTION 'لا يمكن تغيير نوع مقدم الخدمة مباشرة';
    END IF;
  END IF;

  IF (NEW.is_active=true OR NEW.is_available=true) AND NOT v_is_admin THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.subscriptions s
      JOIN public.subscription_plans p ON p.id=s.plan_id
      WHERE s.user_id=CASE WHEN TG_OP='INSERT' THEN NEW.user_id ELSE OLD.user_id END
        AND s.status='active'
        AND s.ends_at>now()
        AND (
          (coalesce(CASE WHEN TG_OP='INSERT' THEN NEW.provider_kind ELSE OLD.provider_kind END,'individual')='company' AND p.audience='company')
          OR
          (coalesce(CASE WHEN TG_OP='INSERT' THEN NEW.provider_kind ELSE OLD.provider_kind END,'individual')<>'company' AND p.audience='provider')
        )
    ) INTO v_has_subscription;

    IF NOT v_has_subscription THEN
      RAISE EXCEPTION 'لا يمكن تفعيل استقبال الطلبات دون اشتراك مقدم خدمة فعال';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_service_provider_update_trg ON public.service_providers;
DROP TRIGGER IF EXISTS guard_service_provider_insert_trg ON public.service_providers;
CREATE TRIGGER guard_service_provider_update_trg
BEFORE UPDATE ON public.service_providers
FOR EACH ROW EXECUTE FUNCTION public.guard_service_provider_update();
CREATE TRIGGER guard_service_provider_insert_trg
BEFORE INSERT ON public.service_providers
FOR EACH ROW EXECUTE FUNCTION public.guard_service_provider_update();


-- ============================================================
-- 4) الطلبات التجارية: لا UPDATE مباشر من العميل.
--    الواجهة تستخدم seller_update_order_status / set_order_paid.
-- ============================================================

DROP POLICY IF EXISTS orders_admin_update ON public.orders;

-- ============================================================
-- 5) المحادثات والرسائل: RLS صريح
-- ============================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversations_participant_read ON public.conversations;
CREATE POLICY conversations_participant_read
ON public.conversations
FOR SELECT TO authenticated
USING (buyer_id=auth.uid() OR seller_id=auth.uid());

DROP POLICY IF EXISTS conversations_participant_insert ON public.conversations;
CREATE POLICY conversations_participant_insert
ON public.conversations
FOR INSERT TO authenticated
WITH CHECK (
  buyer_id=auth.uid()
  AND buyer_id<>seller_id
);

DROP POLICY IF EXISTS conversations_participant_update ON public.conversations;
CREATE POLICY conversations_participant_update
ON public.conversations
FOR UPDATE TO authenticated
USING (buyer_id=auth.uid() OR seller_id=auth.uid())
WITH CHECK (buyer_id=auth.uid() OR seller_id=auth.uid());

DROP POLICY IF EXISTS conversations_participant_delete ON public.conversations;
-- لا DELETE مباشر؛ الحذف عبر delete_my_conversation().

DROP POLICY IF EXISTS messages_participant_read ON public.messages;
CREATE POLICY messages_participant_read
ON public.messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id=messages.conversation_id
      AND (c.buyer_id=auth.uid() OR c.seller_id=auth.uid())
  )
);

DROP POLICY IF EXISTS messages_sender_insert ON public.messages;
CREATE POLICY messages_sender_insert
ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id=auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id=messages.conversation_id
      AND (c.buyer_id=auth.uid() OR c.seller_id=auth.uid())
  )
);

DROP POLICY IF EXISTS messages_read_update ON public.messages;
-- لا UPDATE مباشر؛ تغيير is_read عبر RPC أدناه.

DROP POLICY IF EXISTS messages_delete_own ON public.messages;
-- لا DELETE مباشر من المستخدم.


-- ============================================================
-- 6) تعليم الرسائل كمقروءة عبر RPC آمن
-- ============================================================

CREATE OR REPLACE FUNCTION public.mark_conversation_messages_read(p_conversation_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_count integer;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id=p_conversation_id
      AND (buyer_id=v_uid OR seller_id=v_uid)
  ) THEN
    RAISE EXCEPTION 'غير مصرح';
  END IF;

  UPDATE public.messages
  SET is_read=true
  WHERE conversation_id=p_conversation_id
    AND sender_id<>v_uid
    AND is_read=false;

  GET DIAGNOSTICS v_count=ROW_COUNT;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_conversation_messages_read(uuid) TO authenticated;


-- ============================================================
-- 7) قراءة قائمة المحادثات بآخر رسالة + unread count
--    بدل تحميل جميع الرسائل لكل المحادثات.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_conversations(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  ad_id uuid,
  buyer_id uuid,
  seller_id uuid,
  created_at timestamptz,
  last_message text,
  last_message_at timestamptz,
  unread_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path=public
AS $$
  SELECT
    c.id,
    c.ad_id,
    c.buyer_id,
    c.seller_id,
    c.created_at,
    lm.body AS last_message,
    COALESCE(lm.created_at,c.last_message_at,c.created_at) AS last_message_at,
    (
      SELECT count(*)
      FROM public.messages m2
      WHERE m2.conversation_id=c.id
        AND m2.sender_id<>auth.uid()
        AND m2.is_read=false
    ) AS unread_count
  FROM public.conversations c
  LEFT JOIN LATERAL (
    SELECT m.body,m.created_at
    FROM public.messages m
    WHERE m.conversation_id=c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) lm ON true
  WHERE auth.uid() IS NOT NULL
    AND (c.buyer_id=auth.uid() OR c.seller_id=auth.uid())
  ORDER BY COALESCE(lm.created_at,c.last_message_at,c.created_at) DESC
  LIMIT GREATEST(1,LEAST(COALESCE(p_limit,50),100))
  OFFSET GREATEST(COALESCE(p_offset,0),0);
$$;

GRANT EXECUTE ON FUNCTION public.get_my_conversations(integer,integer) TO authenticated;


-- ============================================================
-- 8) قراءة رسائل المحادثة بحد أقصى 100 رسالة في كل مرة.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_conversation_messages(
  p_conversation_id uuid,
  p_limit integer DEFAULT 100
)
RETURNS TABLE(
  id uuid,
  conversation_id uuid,
  sender_id uuid,
  body text,
  is_read boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path=public
AS $$
  SELECT m.id,m.conversation_id,m.sender_id,m.body,m.is_read,m.created_at
  FROM public.messages m
  JOIN public.conversations c ON c.id=m.conversation_id
  WHERE m.conversation_id=p_conversation_id
    AND auth.uid() IS NOT NULL
    AND (c.buyer_id=auth.uid() OR c.seller_id=auth.uid())
  ORDER BY m.created_at ASC
  LIMIT GREATEST(1,LEAST(COALESCE(p_limit,100),200));
$$;

GRANT EXECUTE ON FUNCTION public.get_my_conversation_messages(uuid,integer) TO authenticated;


-- ============================================================
-- 9) فهارس الرسائل والمحادثات المطلوبة للـRPCs وRLS
-- ============================================================

CREATE INDEX IF NOT EXISTS conversations_buyer_last_idx
ON public.conversations(buyer_id,last_message_at DESC);

CREATE INDEX IF NOT EXISTS conversations_seller_last_idx
ON public.conversations(seller_id,last_message_at DESC);

CREATE INDEX IF NOT EXISTS messages_conversation_created_desc_idx
ON public.messages(conversation_id,created_at DESC);

CREATE INDEX IF NOT EXISTS messages_unread_conversation_idx
ON public.messages(conversation_id,is_read,created_at DESC);


-- ============================================================
-- 10) تحسين orders: فهرس الحالة مع المشتري/البائع
-- ============================================================

CREATE INDEX IF NOT EXISTS orders_buyer_status_created_idx
ON public.orders(buyer_id,order_status,created_at DESC);

CREATE INDEX IF NOT EXISTS orders_seller_status_created_idx
ON public.orders(seller_id,order_status,created_at DESC);


-- ============================================================
-- 11) منع الرسائل الضخمة جدًا من استنزاف التخزين/الواجهة.
-- ============================================================

DO $$
BEGIN
  ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_body_length_check;

  ALTER TABLE public.messages
  ADD CONSTRAINT messages_body_length_check
  CHECK (char_length(trim(body)) BETWEEN 1 AND 5000);
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;


-- ============================================================
-- V55 END
-- ============================================================
