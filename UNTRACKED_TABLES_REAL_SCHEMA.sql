-- فلسطين بلاتفورم — التعريف الحقيقي للجداول العشرة غير المتتبَّعة سابقًا
-- مبني من نتائج information_schema + pg_constraint الفعلية بتاريخ المراجعة.
-- هذا الملف للتوثيق والأرشفة فقط — الجداول موجودة بالفعل، لا تشغّل CREATE TABLE
-- بدون IF NOT EXISTS (وهو مضاف احتياطًا، لن يفعل شيئًا إذا كانت موجودة).

-- =========================================================
-- profiles
-- =========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  city text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user'
    CHECK (role IN ('admin','manager','editor','moderator','places_manager','ads_manager','member','user')),
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =========================================================
-- ads
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  description text,
  price numeric,
  city text,
  phone text,
  created_at timestamptz DEFAULT now(),
  image_urls text[] DEFAULT '{}',
  latitude double precision,
  longitude double precision,
  location_name text,
  video_url text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','hidden','deleted')),
  delivery_available boolean NOT NULL DEFAULT false,
  delivery_fee numeric NOT NULL DEFAULT 0,
  allow_cod boolean NOT NULL DEFAULT true,
  allow_online_payment boolean NOT NULL DEFAULT false
);

-- =========================================================
-- conversations
-- =========================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES public.ads(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  CONSTRAINT conversations_different_users CHECK (buyer_id <> seller_id)
);

-- =========================================================
-- messages
-- =========================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
-- ملاحظة: هذا يؤكد أن delete_my_conversation() اللي أضفناها كانت ضرورية فعلاً —
-- حذف صف بـ conversations يحذف رسائله تلقائيًا (CASCADE)، فحتى لو أضفنا سياسة
-- DELETE مباشرة على conversations لكانت الرسائل انحذفت تلقائيًا بدون داعٍ لحذفها
-- يدويًا. الدالة تبقى الخيار الأصح لأنها تتحقق من الملكية بالخادم قبل الحذف.

-- =========================================================
-- favorites
-- =========================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, ad_id)
);

-- =========================================================
-- ad_reviews
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ad_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','hidden')),
  UNIQUE (reviewer_id, ad_id)
);

-- =========================================================
-- ad_reports
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ad_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  created_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed')),
  admin_note text,
  resolved_at timestamptz,
  UNIQUE (reporter_id, ad_id)
);

-- =========================================================
-- ad_video_likes
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ad_video_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, ad_id)
);

-- =========================================================
-- ad_video_views
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ad_video_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- ad_views
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ad_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at timestamptz DEFAULT now()
);
