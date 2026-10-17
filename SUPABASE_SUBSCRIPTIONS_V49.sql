-- فلسطين بلاتفورم V49 - نظام العضويات والاشتراكات
-- يشمل: عادي، بريميوم، مقدم خدمة فردي، شركة خدمات.
-- الدفع الحقيقي لا يتم هنا؛ هذا الجزء يجهز الاشتراك ويترك ربط بوابة الدفع للمرحلة التالية.

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  audience text NOT NULL CHECK (audience IN ('user','provider','company')),
  billing_period text NOT NULL CHECK (billing_period IN ('monthly','yearly')),
  duration_days integer NOT NULL CHECK (duration_days > 0),
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  currency text NOT NULL DEFAULT 'ILS',
  description text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscription_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.subscription_plans(id),
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'ILS',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled')),
  payment_method text,
  gateway_reference text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES public.subscription_plans(id),
  order_id uuid REFERENCES public.subscription_orders(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  auto_renew boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.subscription_orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'ILS',
  method text,
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','failed','refunded')),
  gateway_reference text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscription plans public read" ON public.subscription_plans;
CREATE POLICY "subscription plans public read" ON public.subscription_plans
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "subscription orders own read" ON public.subscription_orders;
CREATE POLICY "subscription orders own read" ON public.subscription_orders
FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "subscriptions own read" ON public.subscriptions;
CREATE POLICY "subscriptions own read" ON public.subscriptions
FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "subscription payments own read" ON public.subscription_payments;
CREATE POLICY "subscription payments own read" ON public.subscription_payments
FOR SELECT TO authenticated USING (user_id = auth.uid());

-- صلاحيات الإدارة
DROP POLICY IF EXISTS "subscription plans admin all" ON public.subscription_plans;
CREATE POLICY "subscription plans admin all" ON public.subscription_plans
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.status='active' AND p.role IN ('admin','manager'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.status='active' AND p.role IN ('admin','manager'))
);

DROP POLICY IF EXISTS "subscription orders admin all" ON public.subscription_orders;
CREATE POLICY "subscription orders admin all" ON public.subscription_orders
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.status='active' AND p.role IN ('admin','manager'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.status='active' AND p.role IN ('admin','manager'))
);

DROP POLICY IF EXISTS "subscriptions admin all" ON public.subscriptions;
CREATE POLICY "subscriptions admin all" ON public.subscriptions
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.status='active' AND p.role IN ('admin','manager'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.status='active' AND p.role IN ('admin','manager'))
);

DROP POLICY IF EXISTS "subscription payments admin all" ON public.subscription_payments;
CREATE POLICY "subscription payments admin all" ON public.subscription_payments
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.status='active' AND p.role IN ('admin','manager'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.status='active' AND p.role IN ('admin','manager'))
);

CREATE INDEX IF NOT EXISTS idx_subscription_orders_user_created
ON public.subscription_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_status
ON public.subscription_orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_ends
ON public.subscriptions(user_id, ends_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active
ON public.subscriptions(user_id, status, ends_at DESC);

-- الخطط الافتراضية المقترحة ويمكن تعديل الأسعار لاحقًا من قاعدة البيانات/لوحة الإدارة.
INSERT INTO public.subscription_plans(id,name,audience,billing_period,duration_days,price,currency,description,features,sort_order)
VALUES
('premium_monthly','بريميوم شهري','user','monthly',30,29,'ILS','عضوية بريميوم للمستخدم العادي', '["مزايا بريميوم","أولوية في بعض المزايا","شارة بريميوم"]'::jsonb,10),
('premium_yearly','بريميوم سنوي','user','yearly',365,290,'ILS','عضوية بريميوم لمدة سنة', '["كل مزايا بريميوم","مدة سنة كاملة","سعر سنوي أوفر"]'::jsonb,11),
('provider_monthly','مقدم خدمة شهري','provider','monthly',30,39,'ILS','للسائق ومقدم الخدمة الفردي', '["ملف مقدم خدمة","الظهور للعملاء","استقبال الطلبات","إدارة التوفر"]'::jsonb,20),
('provider_yearly','مقدم خدمة سنوي','provider','yearly',365,390,'ILS','للسائق ومقدم الخدمة الفردي لمدة سنة', '["كل مزايا مقدم الخدمة","مدة سنة","سعر سنوي أوفر"]'::jsonb,21),
('company_monthly','شركة خدمات شهري','company','monthly',30,99,'ILS','للشركات ومؤسسات الخدمات', '["صفحة شركة","إدارة الموظفين والسائقين","إدارة المركبات","استقبال الطلبات"]'::jsonb,30),
('company_yearly','شركة خدمات سنوي','company','yearly',365,990,'ILS','للشركات لمدة سنة', '["كل مزايا الشركة","مدة سنة","سعر سنوي أوفر"]'::jsonb,31)
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name,
  audience=EXCLUDED.audience,
  billing_period=EXCLUDED.billing_period,
  duration_days=EXCLUDED.duration_days,
  price=EXCLUDED.price,
  currency=EXCLUDED.currency,
  description=EXCLUDED.description,
  features=EXCLUDED.features,
  sort_order=EXCLUDED.sort_order,
  updated_at=now();

CREATE OR REPLACE FUNCTION public.request_subscription(p_plan_id text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_plan public.subscription_plans;
  v_order uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  SELECT * INTO v_plan FROM public.subscription_plans WHERE id=p_plan_id AND is_active=true;
  IF NOT FOUND THEN RAISE EXCEPTION 'خطة الاشتراك غير متاحة'; END IF;
  IF v_plan.id LIKE 'premium_%' AND EXISTS (
    SELECT 1 FROM public.subscriptions s WHERE s.user_id=v_uid AND s.status='active' AND s.ends_at>now() AND s.plan_id LIKE 'premium_%'
  ) THEN RAISE EXCEPTION 'لديك اشتراك بريميوم فعال بالفعل'; END IF;
  IF v_plan.id LIKE 'provider_%' AND EXISTS (
    SELECT 1 FROM public.subscriptions s WHERE s.user_id=v_uid AND s.status='active' AND s.ends_at>now() AND s.plan_id LIKE 'provider_%'
  ) THEN RAISE EXCEPTION 'لديك اشتراك مقدم خدمة فعال بالفعل'; END IF;
  IF v_plan.id LIKE 'company_%' AND EXISTS (
    SELECT 1 FROM public.subscriptions s WHERE s.user_id=v_uid AND s.status='active' AND s.ends_at>now() AND s.plan_id LIKE 'company_%'
  ) THEN RAISE EXCEPTION 'لديك اشتراك شركة فعال بالفعل'; END IF;
  IF EXISTS (SELECT 1 FROM public.subscription_orders WHERE user_id=v_uid AND plan_id=p_plan_id AND status='pending') THEN
    SELECT id INTO v_order FROM public.subscription_orders WHERE user_id=v_uid AND plan_id=p_plan_id AND status='pending' ORDER BY created_at DESC LIMIT 1;
    RETURN v_order;
  END IF;
  INSERT INTO public.subscription_orders(user_id,plan_id,amount,currency,status)
  VALUES(v_uid,v_plan.id,v_plan.price,v_plan.currency,'pending') RETURNING id INTO v_order;
  RETURN v_order;
END; $$;
GRANT EXECUTE ON FUNCTION public.request_subscription(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_activate_subscription(p_order_id uuid,p_payment_method text DEFAULT 'manual',p_gateway_reference text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_order public.subscription_orders;
  v_plan public.subscription_plans;
  v_sub uuid;
  v_admin boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.status='active' AND p.role IN ('admin','manager')) INTO v_admin;
  IF NOT v_admin THEN RAISE EXCEPTION 'لا تملك صلاحية تفعيل الاشتراكات'; END IF;
  SELECT * INTO v_order FROM public.subscription_orders WHERE id=p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'طلب الاشتراك غير موجود'; END IF;
  SELECT * INTO v_plan FROM public.subscription_plans WHERE id=v_order.plan_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'الخطة غير موجودة'; END IF;
  UPDATE public.subscription_orders SET status='paid',payment_method=p_payment_method,gateway_reference=p_gateway_reference,updated_at=now() WHERE id=v_order.id;
  UPDATE public.subscriptions SET status='cancelled',updated_at=now()
  WHERE user_id=v_order.user_id AND status='active' AND ends_at>now() AND plan_id=v_plan.id;
  INSERT INTO public.subscription_payments(order_id,user_id,amount,currency,method,status,gateway_reference)
  VALUES(v_order.id,v_order.user_id,v_order.amount,v_order.currency,p_payment_method,'paid',p_gateway_reference);
  INSERT INTO public.subscriptions(user_id,plan_id,order_id,status,starts_at,ends_at)
  VALUES(v_order.user_id,v_plan.id,v_order.id,'active',now(),now() + make_interval(days=>v_plan.duration_days))
  RETURNING id INTO v_sub;
  RETURN v_sub;
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_activate_subscription(uuid,text,text) TO authenticated;

-- تحديث حالة الاشتراكات المنتهية عند الاستدعاء.
UPDATE public.subscriptions SET status='expired',updated_at=now()
WHERE status='active' AND ends_at<=now();

-- منح القراءة للخطط عبر anon/authenticated، مع بقاء الطلبات محمية.
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT SELECT ON public.subscription_orders,public.subscriptions,public.subscription_payments TO authenticated;
