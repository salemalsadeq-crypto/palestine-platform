-- فلسطين بلاتفورم: تحديث قاعدة البيانات والصلاحيات والأماكن والفيديو
-- شغّل هذا النص كاملًا في Supabase SQL Editor.

-- 1) الأدوار المسموح بها
DO $$ BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin','manager','editor','moderator','places_manager','ads_manager','member','user'));
EXCEPTION WHEN undefined_table THEN NULL; END $$;

UPDATE public.profiles SET role='member' WHERE role IS NULL OR role='user';

CREATE TABLE IF NOT EXISTS public.platform_permissions (
  code text PRIMARY KEY,
  label text NOT NULL
);
INSERT INTO public.platform_permissions(code,label) VALUES
('manage_users','إدارة المستخدمين'),('manage_roles','إدارة الصلاحيات'),('manage_ads','إدارة الإعلانات'),('publish_ads','نشر الإعلانات'),('moderate_ads','مراجعة الإعلانات'),('manage_places','إدارة الأماكن'),('publish_places','نشر الأماكن'),('manage_reports','إدارة البلاغات'),('manage_videos','إدارة الفيديوهات'),('view_stats','مشاهدة الإحصائيات')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.platform_role_permissions (
  role text NOT NULL,
  permission_code text NOT NULL REFERENCES public.platform_permissions(code) ON DELETE CASCADE,
  PRIMARY KEY(role,permission_code)
);

-- صلاحيات افتراضية
INSERT INTO public.platform_role_permissions(role,permission_code)
SELECT 'admin',code FROM public.platform_permissions ON CONFLICT DO NOTHING;
INSERT INTO public.platform_role_permissions(role,permission_code) VALUES
('manager','manage_users'),('manager','manage_roles'),('manager','manage_ads'),('manager','publish_ads'),('manager','moderate_ads'),('manager','manage_places'),('manager','publish_places'),('manager','manage_reports'),('manager','manage_videos'),('manager','view_stats'),
('editor','publish_ads'),('editor','moderate_ads'),('editor','view_stats'),
('moderator','moderate_ads'),('moderator','manage_reports'),
('places_manager','manage_places'),('places_manager','publish_places'),
('ads_manager','manage_ads'),('ads_manager','publish_ads'),('ads_manager','moderate_ads'),('ads_manager','manage_videos'),
('member','publish_ads') ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.has_permission(permission_code text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.platform_role_permissions rp ON rp.role=p.role
    WHERE p.id=auth.uid() AND p.status='active' AND rp.permission_code=has_permission.permission_code
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT public.has_permission('manage_roles');
$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(target_user_id uuid,new_role text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.has_permission('manage_roles') THEN RAISE EXCEPTION 'غير مصرح'; END IF;
 IF new_role NOT IN ('admin','manager','editor','moderator','places_manager','ads_manager','member','user') THEN RAISE EXCEPTION 'دور غير صالح'; END IF;
 UPDATE public.profiles SET role=new_role WHERE id=target_user_id;
 RETURN FOUND;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_set_user_status(target_user_id uuid,new_status text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.has_permission('manage_users') THEN RAISE EXCEPTION 'غير مصرح'; END IF;
 IF new_status NOT IN ('active','suspended') THEN RAISE EXCEPTION 'حالة غير صالحة'; END IF;
 UPDATE public.profiles SET status=new_status WHERE id=target_user_id;
 RETURN FOUND;
END; $$;

GRANT EXECUTE ON FUNCTION public.has_permission(text) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_status(uuid,text) TO authenticated;

-- 2) جدول الأماكن
CREATE TABLE IF NOT EXISTS public.places (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 name text NOT NULL,
 category text NOT NULL DEFAULT 'أخرى',
 city text,
 address text,
 description text,
 phone text,
 website text,
 latitude double precision,
 longitude double precision,
 image_urls text[] DEFAULT '{}',
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','published','hidden','rejected')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS places_location_idx ON public.places(latitude,longitude);
CREATE INDEX IF NOT EXISTS places_status_idx ON public.places(status);
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "places_public_read" ON public.places;
CREATE POLICY "places_public_read" ON public.places FOR SELECT USING (status='published' OR user_id=auth.uid() OR public.has_permission('manage_places'));
DROP POLICY IF EXISTS "places_insert_auth" ON public.places;
CREATE POLICY "places_insert_auth" ON public.places FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
DROP POLICY IF EXISTS "places_update_owner_or_manager" ON public.places;
CREATE POLICY "places_update_owner_or_manager" ON public.places FOR UPDATE TO authenticated USING (user_id=auth.uid() OR public.has_permission('manage_places')) WITH CHECK (user_id=auth.uid() OR public.has_permission('manage_places'));
DROP POLICY IF EXISTS "places_delete_manager" ON public.places;
CREATE POLICY "places_delete_manager" ON public.places FOR DELETE TO authenticated USING (public.has_permission('manage_places'));

-- 3) تخزين الفيديو والصور: اجعل bucket الفيديو عامًا حتى تعمل روابط الفيديو في الموقع الثابت.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES
('ad-videos','ad-videos',true,52428800,ARRAY['video/mp4','video/webm','video/quicktime'])
ON CONFLICT(id) DO UPDATE SET public=true,file_size_limit=52428800,allowed_mime_types=ARRAY['video/mp4','video/webm','video/quicktime'];
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES
('ad-images','ad-images',true,5242880,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT(id) DO UPDATE SET public=true,file_size_limit=5242880,allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp'];

DROP POLICY IF EXISTS "public read ad videos" ON storage.objects;
CREATE POLICY "public read ad videos" ON storage.objects FOR SELECT USING (bucket_id='ad-videos');
DROP POLICY IF EXISTS "auth upload ad videos" ON storage.objects;
CREATE POLICY "auth upload ad videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='ad-videos' AND (storage.foldername(name))[1]=auth.uid()::text);
DROP POLICY IF EXISTS "owner delete ad videos" ON storage.objects;
CREATE POLICY "owner delete ad videos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='ad-videos' AND (storage.foldername(name))[1]=auth.uid()::text);

DROP POLICY IF EXISTS "public read ad images" ON storage.objects;
CREATE POLICY "public read ad images" ON storage.objects FOR SELECT USING (bucket_id='ad-images');
DROP POLICY IF EXISTS "auth upload ad images" ON storage.objects;
CREATE POLICY "auth upload ad images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='ad-images' AND (storage.foldername(name))[1]=auth.uid()::text);
DROP POLICY IF EXISTS "owner delete ad images" ON storage.objects;
CREATE POLICY "owner delete ad images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='ad-images' AND (storage.foldername(name))[1]=auth.uid()::text);

-- 4) تحديث updated_at للأماكن
CREATE OR REPLACE FUNCTION public.set_places_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS places_updated_at ON public.places;
CREATE TRIGGER places_updated_at BEFORE UPDATE ON public.places FOR EACH ROW EXECUTE FUNCTION public.set_places_updated_at();

-- بعد تشغيل SQL: اجعل حسابك الشخصي role='admin' مرة واحدة فقط:
-- UPDATE public.profiles SET role='admin' WHERE id='ضع-UUID-حسابك-هنا';


-- 5) التجارة: الطلبات والتوصيل والدفع الإلكتروني
-- هذا الجزء لا يخزن أرقام البطاقات أو CVV. الدفع بالبطاقة يجب أن يتم عبر بوابة دفع خارجية آمنة.
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS delivery_available boolean NOT NULL DEFAULT false;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS delivery_fee numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS allow_cod boolean NOT NULL DEFAULT true;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS allow_online_payment boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE RESTRICT,
 buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
 seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
 quantity integer NOT NULL DEFAULT 1 CHECK(quantity > 0 AND quantity <= 100),
 unit_price numeric(12,2) NOT NULL CHECK(unit_price >= 0),
 delivery_fee numeric(12,2) NOT NULL DEFAULT 0 CHECK(delivery_fee >= 0),
 total_amount numeric(12,2) NOT NULL CHECK(total_amount >= 0),
 delivery_method text NOT NULL DEFAULT 'pickup' CHECK(delivery_method IN ('pickup','delivery')),
 payment_method text NOT NULL DEFAULT 'cash_on_delivery' CHECK(payment_method IN ('cash_on_delivery','online')),
 payment_provider text CHECK(payment_provider IN ('bank_of_palestine','palpay') OR payment_provider IS NULL),
 payment_status text NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending','awaiting_gateway','paid','failed','refunded','cancelled')),
 order_status text NOT NULL DEFAULT 'pending' CHECK(order_status IN ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled')),
 customer_name text NOT NULL,
 customer_phone text NOT NULL,
 city text,
 address text,
 notes text,
 provider_reference text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_buyer_idx ON public.orders(buyer_id,created_at DESC);
CREATE INDEX IF NOT EXISTS orders_seller_idx ON public.orders(seller_id,created_at DESC);
CREATE INDEX IF NOT EXISTS orders_ad_idx ON public.orders(ad_id,created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(order_status,payment_status);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS orders_buyer_read ON public.orders;
CREATE POLICY orders_buyer_read ON public.orders FOR SELECT TO authenticated USING(buyer_id=auth.uid() OR seller_id=auth.uid() OR public.has_permission('manage_orders'));
DROP POLICY IF EXISTS orders_admin_update ON public.orders;
CREATE POLICY orders_admin_update ON public.orders FOR UPDATE TO authenticated USING(public.has_permission('manage_orders')) WITH CHECK(public.has_permission('manage_orders'));

INSERT INTO public.platform_permissions(code,label) VALUES ('manage_orders','إدارة الطلبات والتوصيل') ON CONFLICT(code) DO NOTHING;
INSERT INTO public.platform_role_permissions(role,permission_code) VALUES ('admin','manage_orders'),('manager','manage_orders') ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.create_order(
 p_ad_id uuid,
 p_quantity integer,
 p_delivery_method text,
 p_payment_method text,
 p_payment_provider text,
 p_customer_name text,
 p_customer_phone text,
 p_city text,
 p_address text,
 p_notes text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
 v_ad public.ads%ROWTYPE;
 v_uid uuid := auth.uid();
 v_delivery numeric(12,2) := 0;
 v_total numeric(12,2);
 v_id uuid;
BEGIN
 IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
 IF p_quantity IS NULL OR p_quantity < 1 OR p_quantity > 100 THEN RAISE EXCEPTION 'الكمية غير صالحة'; END IF;
 SELECT * INTO v_ad FROM public.ads WHERE id=p_ad_id AND status='active' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'الإعلان غير متاح للطلب'; END IF;
 IF v_ad.user_id=v_uid THEN RAISE EXCEPTION 'لا يمكنك شراء إعلانك'; END IF;
 IF v_ad.price IS NULL OR v_ad.price < 0 THEN RAISE EXCEPTION 'هذا الإعلان لا يملك سعرًا ثابتًا للشراء'; END IF;
 IF p_delivery_method NOT IN ('pickup','delivery') THEN RAISE EXCEPTION 'طريقة التوصيل غير صالحة'; END IF;
 IF p_delivery_method='delivery' THEN
   IF NOT COALESCE(v_ad.delivery_available,false) THEN RAISE EXCEPTION 'التوصيل غير متاح لهذا الإعلان'; END IF;
   v_delivery := COALESCE(v_ad.delivery_fee,0);
   IF COALESCE(trim(p_address),'')='' OR COALESCE(trim(p_city),'')='' THEN RAISE EXCEPTION 'عنوان التوصيل والمدينة مطلوبان'; END IF;
 END IF;
 IF p_payment_method NOT IN ('cash_on_delivery','online') THEN RAISE EXCEPTION 'طريقة الدفع غير صالحة'; END IF;
 IF p_payment_method='cash_on_delivery' AND NOT COALESCE(v_ad.allow_cod,true) THEN RAISE EXCEPTION 'الدفع عند الاستلام غير متاح'; END IF;
 IF p_payment_method='online' THEN
   IF NOT COALESCE(v_ad.allow_online_payment,false) THEN RAISE EXCEPTION 'الدفع الإلكتروني غير مفعل لهذا الإعلان'; END IF;
   IF p_payment_provider NOT IN ('bank_of_palestine','palpay') THEN RAISE EXCEPTION 'اختر بوابة دفع معتمدة'; END IF;
 END IF;
 v_total := (v_ad.price * p_quantity) + v_delivery;
 INSERT INTO public.orders(ad_id,buyer_id,seller_id,quantity,unit_price,delivery_fee,total_amount,delivery_method,payment_method,payment_provider,payment_status,order_status,customer_name,customer_phone,city,address,notes)
 VALUES(p_ad_id,v_uid,v_ad.user_id,p_quantity,v_ad.price,v_delivery,v_total,p_delivery_method,p_payment_method,CASE WHEN p_payment_method='online' THEN p_payment_provider ELSE NULL END,CASE WHEN p_payment_method='online' THEN 'awaiting_gateway' ELSE 'pending' END,'pending',trim(p_customer_name),trim(p_customer_phone),NULLIF(trim(p_city),''),NULLIF(trim(p_address),''),NULLIF(trim(p_notes),''))
 RETURNING id INTO v_id;
 RETURN v_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.create_order(uuid,integer,text,text,text,text,text,text,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.cancel_my_order(p_order_id uuid) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 UPDATE public.orders SET order_status='cancelled',payment_status=CASE WHEN payment_status='paid' THEN 'refunded' ELSE 'cancelled' END,updated_at=now()
 WHERE id=p_order_id AND buyer_id=auth.uid() AND order_status IN ('pending','confirmed');
 RETURN FOUND;
END; $$;
GRANT EXECUTE ON FUNCTION public.cancel_my_order(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.seller_update_order_status(p_order_id uuid,p_status text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF p_status NOT IN ('confirmed','preparing','out_for_delivery','delivered','cancelled') THEN RAISE EXCEPTION 'حالة الطلب غير صالحة'; END IF;
 UPDATE public.orders SET order_status=p_status,updated_at=now() WHERE id=p_order_id AND (seller_id=auth.uid() OR public.has_permission('manage_orders'));
 RETURN FOUND;
END; $$;
GRANT EXECUTE ON FUNCTION public.seller_update_order_status(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_order_paid(p_order_id uuid,p_provider_reference text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.has_permission('manage_orders') THEN RAISE EXCEPTION 'غير مصرح'; END IF;
 UPDATE public.orders SET payment_status='paid',provider_reference=NULLIF(trim(p_provider_reference),''),updated_at=now() WHERE id=p_order_id AND payment_method='online';
 RETURN FOUND;
END; $$;
GRANT EXECUTE ON FUNCTION public.set_order_paid(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_orders_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_orders_updated_at();


-- =========================================================
-- 15) نظام الإشعارات
-- =========================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  message text NOT NULL,
  related_ad_id uuid REFERENCES public.ads(id) ON DELETE SET NULL,
  related_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  related_conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx
ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_unread_idx
ON public.notifications(user_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_read_own ON public.notifications;
CREATE POLICY notifications_read_own
ON public.notifications FOR SELECT TO authenticated
USING (user_id=auth.uid());

DROP POLICY IF EXISTS notifications_update_own ON public.notifications;
CREATE POLICY notifications_update_own
ON public.notifications FOR UPDATE TO authenticated
USING (user_id=auth.uid())
WITH CHECK (user_id=auth.uid());

DROP POLICY IF EXISTS notifications_insert_system ON public.notifications;
CREATE POLICY notifications_insert_system
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (user_id=auth.uid());

CREATE OR REPLACE FUNCTION public.notify_order_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
DECLARE
  v_title text;
  v_message text;
BEGIN
  IF TG_OP='INSERT' THEN
    v_title := 'طلب جديد 🛍️';
    v_message := 'لديك طلب جديد رقم ' || left(NEW.id::text,8) || ' بانتظار المراجعة.';
    INSERT INTO public.notifications(user_id,type,title,message,related_ad_id,related_order_id)
    VALUES(NEW.seller_id,'order',v_title,v_message,NEW.ad_id,NEW.id);
    RETURN NEW;
  END IF;

  IF TG_OP='UPDATE' THEN
    IF NEW.order_status IS DISTINCT FROM OLD.order_status THEN
      v_title := 'تحديث حالة الطلب 📦';
      v_message := CASE NEW.order_status
        WHEN 'confirmed' THEN 'تم تأكيد طلبك.'
        WHEN 'preparing' THEN 'بدأ تجهيز طلبك.'
        WHEN 'out_for_delivery' THEN 'طلبك خرج للتوصيل.'
        WHEN 'delivered' THEN 'تم تسليم طلبك.'
        WHEN 'cancelled' THEN 'تم إلغاء الطلب.'
        ELSE 'تم تحديث حالة طلبك إلى: ' || NEW.order_status
      END;
      INSERT INTO public.notifications(user_id,type,title,message,related_ad_id,related_order_id)
      VALUES(NEW.buyer_id,'order',v_title,v_message,NEW.ad_id,NEW.id);
    END IF;

    IF NEW.payment_status IS DISTINCT FROM OLD.payment_status AND NEW.payment_status='paid' THEN
      INSERT INTO public.notifications(user_id,type,title,message,related_ad_id,related_order_id)
      VALUES(NEW.buyer_id,'payment','تم تأكيد الدفع 💳','تم تسجيل دفع طلبك بنجاح.',NEW.ad_id,NEW.id);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_notify_trigger ON public.orders;
CREATE TRIGGER orders_notify_trigger
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.notify_order_event();

CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public
AS $$
DECLARE
  v_recipient uuid;
  v_ad uuid;
BEGIN
  SELECT CASE WHEN buyer_id=NEW.sender_id THEN seller_id ELSE buyer_id END, ad_id
  INTO v_recipient, v_ad
  FROM public.conversations
  WHERE id=NEW.conversation_id;

  IF v_recipient IS NOT NULL AND v_recipient <> NEW.sender_id THEN
    INSERT INTO public.notifications(user_id,type,title,message,related_ad_id,related_conversation_id)
    VALUES(v_recipient,'message','رسالة جديدة 💬','لديك رسالة جديدة في المحادثات.',v_ad,NEW.conversation_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_notify_trigger ON public.messages;
CREATE TRIGGER messages_notify_trigger
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();
