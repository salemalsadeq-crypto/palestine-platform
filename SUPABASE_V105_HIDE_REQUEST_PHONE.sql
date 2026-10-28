-- ============================================================
-- V105: إخفاء هاتف صاحب الطلب عن مقدمي الخدمة قبل قبول الطلب
-- ------------------------------------------------------------
-- المشكلة: سياسة القراءة تسمح لمقدم الخدمة برؤية كل الطلبات المعلّقة
--          في مدينته بكل أعمدتها، ومنها phone.
-- الحل:    1) سحب صلاحية قراءة عمود phone من الجدول (على مستوى العمود)
--          2) دالة get_service_request_phone تُرجع الرقم فقط لصاحب الطلب
--             أو لمقدم الخدمة الذي قبل الطلب (accepted / in_progress).
-- ملاحظات:
--  * شغّل الملف مرة واحدة في Supabase SQL Editor بعد رفع ملفات الواجهة الجديدة
--    (لأن الواجهة القديمة تستخدم select('*') وستفشل بعد هذا التغيير).
--  * أي عمود جديد تضيفه لاحقًا لـ service_requests يجب منحه صلاحية SELECT:
--      GRANT SELECT (اسم_العمود) ON public.service_requests TO authenticated;
--  * دوال SECURITY DEFINER والـ triggers الحالية لا تتأثر.
-- للتراجع (Rollback):
--      GRANT SELECT ON public.service_requests TO authenticated;
-- ============================================================

-- 1) دالة جلب الرقم بشكل مضبوط
CREATE OR REPLACE FUNCTION public.get_service_request_phone(p_request_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT sr.phone
  FROM public.service_requests sr
  WHERE sr.id = p_request_id
    AND auth.uid() IS NOT NULL
    AND (
      sr.requester_id = auth.uid()
      OR (sr.provider_id = auth.uid() AND sr.status IN ('accepted','in_progress'))
    )
$$;
REVOKE ALL ON FUNCTION public.get_service_request_phone(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_service_request_phone(uuid) TO authenticated;

-- 2) صلاحيات الأعمدة: كل الأعمدة ما عدا phone
REVOKE SELECT ON public.service_requests FROM anon, authenticated;

DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
    INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name   = 'service_requests'
    AND column_name <> 'phone';

  IF cols IS NULL THEN
    RAISE EXCEPTION 'جدول service_requests غير موجود';
  END IF;

  EXECUTE format('GRANT SELECT (%s) ON public.service_requests TO authenticated', cols);
END $$;

-- 3) تحقق (يجب أن يرجع صفًا واحدًا فقط: عمود phone غير ممنوح)
-- SELECT column_name, privilege_type
-- FROM information_schema.column_privileges
-- WHERE table_name='service_requests' AND grantee='authenticated' AND column_name='phone';
