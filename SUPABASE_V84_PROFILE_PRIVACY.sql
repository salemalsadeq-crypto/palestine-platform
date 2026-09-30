-- فلسطين بلاتفورم V84 - Profile Privacy
-- يحمي بيانات profiles الخاصة ويتيح نسخة عامة آمنة.
-- نفّذ مرة واحدة فقط في Supabase SQL Editor.

BEGIN;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
    id,
    full_name,
    city,
    avatar_url,
    is_verified
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

COMMIT;

-- تحقق
SELECT schemaname, tablename, policyname, roles, cmd, permissive,
       qual AS using_condition, with_check
FROM pg_policies
WHERE schemaname='public' AND tablename='profiles'
ORDER BY policyname;

SELECT id, full_name, city, avatar_url, is_verified
FROM public.public_profiles
LIMIT 5;
