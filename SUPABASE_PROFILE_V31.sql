-- فلسطين بلاتفورم V31
-- نظام متابعة المستخدمين في الملفات الشخصية

CREATE TABLE IF NOT EXISTS public.profile_follows (
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT profile_follows_no_self CHECK (follower_id <> following_id)
);

ALTER TABLE public.profile_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profile follows read" ON public.profile_follows;
CREATE POLICY "profile follows read"
ON public.profile_follows
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "profile follows insert own" ON public.profile_follows;
CREATE POLICY "profile follows insert own"
ON public.profile_follows
FOR INSERT
TO authenticated
WITH CHECK (follower_id = auth.uid());

DROP POLICY IF EXISTS "profile follows delete own" ON public.profile_follows;
CREATE POLICY "profile follows delete own"
ON public.profile_follows
FOR DELETE
TO authenticated
USING (follower_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_profile_follows_following
ON public.profile_follows(following_id);

CREATE INDEX IF NOT EXISTS idx_profile_follows_follower
ON public.profile_follows(follower_id);
