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
