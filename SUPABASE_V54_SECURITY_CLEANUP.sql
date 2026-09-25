-- فلسطين بلاتفورم V54: تنظيف أمني وتوحيد دورة الخدمات/المحادثات
-- شغّل هذا الملف بعد كل migrations السابقة.

-- 1) حذف محادثة المستخدم عبر دالة آمنة بدل DELETE مباشر.
CREATE OR REPLACE FUNCTION public.delete_my_conversation(p_conversation_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_uid uuid := auth.uid(); v_deleted integer;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  DELETE FROM public.conversations
  WHERE id=p_conversation_id AND (buyer_id=v_uid OR seller_id=v_uid);
  GET DIAGNOSTICS v_deleted=ROW_COUNT;
  RETURN v_deleted>0;
END; $$;
GRANT EXECUTE ON FUNCTION public.delete_my_conversation(uuid) TO authenticated;

-- 2) حماية الحقول الحساسة في مقدمي الخدمات. تبقى الحقول التشغيلية قابلة للتحديث من المالك،
-- لكن لا يمكن تغيير ملكية السجل أو نوع الخدمة مباشرة من المتصفح.
CREATE OR REPLACE FUNCTION public.protect_service_provider_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN RAISE EXCEPTION 'لا يمكن تغيير مالك مقدم الخدمة'; END IF;
  IF NEW.service_type IS DISTINCT FROM OLD.service_type
     AND NOT public.has_permission('manage_services') THEN
    RAISE EXCEPTION 'لا يمكن تغيير نوع الخدمة مباشرة';
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS protect_service_provider_fields_trg ON public.service_providers;
CREATE TRIGGER protect_service_provider_fields_trg
BEFORE UPDATE ON public.service_providers
FOR EACH ROW EXECUTE FUNCTION public.protect_service_provider_fields();

-- 3) منع الإعلانات القديمة من العودة إلى تصنيف الخدمات.
UPDATE public.ads SET category='إعلانات أخرى' WHERE category='خدمات';

DO $$ BEGIN
  ALTER TABLE public.ads DROP CONSTRAINT IF EXISTS ads_category_not_services;
  ALTER TABLE public.ads ADD CONSTRAINT ads_category_not_services CHECK (category <> 'خدمات');
EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- 4) فهارس للأداء في القوائم والرسائل.
CREATE INDEX IF NOT EXISTS ads_active_created_idx ON public.ads(status,created_at DESC);
CREATE INDEX IF NOT EXISTS messages_conversation_created_idx ON public.messages(conversation_id,created_at DESC);
CREATE INDEX IF NOT EXISTS conversations_participants_last_message_idx ON public.conversations(buyer_id,seller_id,last_message_at DESC);

-- 5) صلاحية مستقلة للخدمات؛ تُستخدم فقط في العمليات الإدارية الحساسة.
INSERT INTO public.platform_permissions(code,label)
VALUES ('manage_services','إدارة مقدمي وطلبات الخدمات')
ON CONFLICT (code) DO NOTHING;

-- ملاحظة: لا يتم حذف سياسات RLS القديمة هنا لأن بعض إصدارات V32/V33 قد تختلف في أعمدة service_providers.
-- الحماية الأساسية أعلاه تعمل كطبقة إضافية حتى بعد التحديثات القديمة.
