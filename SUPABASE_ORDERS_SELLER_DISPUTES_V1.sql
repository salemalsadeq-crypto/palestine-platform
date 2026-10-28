-- فلسطين بلاتفورم: تأمين مسار طلبات البائع والاعتراضات
-- نفّذ هذا الملف مرة واحدة من Supabase > SQL Editor.

CREATE TABLE IF NOT EXISTS public.order_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (char_length(trim(reason)) BETWEEN 5 AND 2000),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','rejected')),
  resolution_note text,
  resolved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.order_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_disputes FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.order_disputes FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.order_disputes TO authenticated;
DROP POLICY IF EXISTS order_disputes_read_parties_or_admin ON public.order_disputes;
CREATE POLICY order_disputes_read_parties_or_admin ON public.order_disputes
  FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid() OR public.has_permission('manage_orders'));
CREATE INDEX IF NOT EXISTS order_disputes_status_created_idx
  ON public.order_disputes(status, created_at DESC);

-- إنشاء اعتراض: للمشتري صاحب الطلب فقط وبعد تسجيل التسليم، اعتراض واحد لكل طلب.
CREATE OR REPLACE FUNCTION public.open_order_dispute(p_order_id uuid, p_reason text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE v_order public.orders%ROWTYPE; v_dispute_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  IF p_reason IS NULL OR char_length(trim(p_reason)) < 5 OR char_length(trim(p_reason)) > 2000 THEN
    RAISE EXCEPTION 'اكتب سبب الاعتراض (من 5 إلى 2000 حرف)';
  END IF;
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'الطلب غير موجود'; END IF;
  IF v_order.buyer_id <> auth.uid() THEN RAISE EXCEPTION 'يمكن للمشتري صاحب الطلب فقط تقديم الاعتراض'; END IF;
  IF v_order.order_status <> 'delivered' THEN RAISE EXCEPTION 'يمكن الاعتراض بعد تسجيل التسليم فقط'; END IF;
  INSERT INTO public.order_disputes(order_id,buyer_id,seller_id,reason)
  VALUES (v_order.id,v_order.buyer_id,v_order.seller_id,trim(p_reason))
  RETURNING id INTO v_dispute_id;
  RETURN v_dispute_id;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'يوجد اعتراض مسجل مسبقاً لهذا الطلب';
END;
$$;

-- تحديث الحالة: البائع لا يحدّث إلا طلبه وبانتقالات منطقية؛ المدير يستطيع التصحيح.
-- عندما يؤكد البائع حالة delivered فهذا يعني أنه يؤكد التسليم واستلام المبلغ.
CREATE OR REPLACE FUNCTION public.seller_update_order_status(p_order_id uuid, p_status text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE v_order public.orders%ROWTYPE; v_is_admin boolean; v_allowed boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  IF p_status NOT IN ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled') THEN
    RAISE EXCEPTION 'حالة الطلب غير صالحة';
  END IF;
  v_is_admin := public.has_permission('manage_orders');
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'الطلب غير موجود'; END IF;
  IF NOT v_is_admin AND v_order.seller_id <> auth.uid() THEN RAISE EXCEPTION 'غير مصرح لك بتعديل هذا الطلب'; END IF;
  IF v_is_admin THEN
    v_allowed := true;
  ELSE
    v_allowed := CASE v_order.order_status
      WHEN 'pending' THEN p_status IN ('confirmed','cancelled')
      WHEN 'confirmed' THEN p_status IN ('preparing','cancelled')
      WHEN 'preparing' THEN p_status IN ('out_for_delivery','delivered','cancelled')
      WHEN 'out_for_delivery' THEN p_status IN ('delivered','cancelled')
      ELSE false
    END;
  END IF;
  IF NOT v_allowed THEN RAISE EXCEPTION 'لا يمكن الانتقال من الحالة الحالية إلى الحالة المطلوبة'; END IF;
  UPDATE public.orders
     SET order_status = p_status,
         payment_status = CASE
           WHEN NOT v_is_admin AND p_status = 'delivered' THEN 'paid'
           ELSE payment_status
         END,
         updated_at = now()
   WHERE id = p_order_id;
  RETURN true;
END;
$$;

-- تأكيد الدفع اليدوي يبقى للمدير فقط؛ لا يوجد تكامل بوابة دفع في هذا الإصدار.
CREATE OR REPLACE FUNCTION public.set_order_paid(p_order_id uuid, p_provider_reference text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_permission('manage_orders') THEN RAISE EXCEPTION 'غير مصرح'; END IF;
  UPDATE public.orders
     SET payment_status='paid', provider_reference=NULLIF(trim(p_provider_reference),''), updated_at=now()
   WHERE id=p_order_id AND payment_method='online' AND order_status <> 'cancelled';
  RETURN FOUND;
END;
$$;

-- إغلاق الاعتراض أو رفضه: المدير/الموظف الذي يحمل manage_orders فقط.
CREATE OR REPLACE FUNCTION public.admin_resolve_order_dispute(p_dispute_id uuid, p_status text, p_note text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_permission('manage_orders') THEN RAISE EXCEPTION 'غير مصرح'; END IF;
  IF p_status NOT IN ('resolved','rejected') THEN RAISE EXCEPTION 'حالة الاعتراض غير صالحة'; END IF;
  UPDATE public.order_disputes
     SET status=p_status, resolution_note=NULLIF(trim(coalesce(p_note,'')),''),
         resolved_by=auth.uid(), resolved_at=now(), updated_at=now()
   WHERE id=p_dispute_id AND status='open';
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.open_order_dispute(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.open_order_dispute(uuid,text) TO authenticated;
REVOKE ALL ON FUNCTION public.seller_update_order_status(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seller_update_order_status(uuid,text) TO authenticated;
REVOKE ALL ON FUNCTION public.set_order_paid(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_order_paid(uuid,text) TO authenticated;
REVOKE ALL ON FUNCTION public.admin_resolve_order_dispute(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_resolve_order_dispute(uuid,text,text) TO authenticated;

COMMENT ON TABLE public.order_disputes IS 'اعتراضات المشتري بعد تسجيل تسليم الطلب؛ الاطلاع للأطراف والمدير، والإدارة عبر RPC محمية.';
COMMENT ON FUNCTION public.seller_update_order_status(uuid,text) IS 'تقييد تحديث الحالة للبائع صاحب الطلب مع تأكيد التسليم واستلام المبلغ عند delivered.';
