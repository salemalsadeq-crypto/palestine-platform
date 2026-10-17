-- فلسطين بلاتفورم V67 — تقييمات الأماكن ومقدمي الخدمات

CREATE TABLE IF NOT EXISTS public.place_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review text,
  status text NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','hidden')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(place_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS public.provider_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review text,
  status text NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','hidden')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider_id, reviewer_id),
  CHECK (provider_id <> reviewer_id)
);

CREATE INDEX IF NOT EXISTS place_reviews_place_idx ON public.place_reviews(place_id, created_at DESC);
CREATE INDEX IF NOT EXISTS provider_reviews_provider_idx ON public.provider_reviews(provider_id, created_at DESC);

ALTER TABLE public.place_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "place reviews visible read" ON public.place_reviews;
CREATE POLICY "place reviews visible read" ON public.place_reviews
FOR SELECT TO authenticated USING (status='visible');

DROP POLICY IF EXISTS "place reviews own insert" ON public.place_reviews;
CREATE POLICY "place reviews own insert" ON public.place_reviews
FOR INSERT TO authenticated
WITH CHECK (
  reviewer_id=auth.uid()
  AND EXISTS (SELECT 1 FROM public.places p WHERE p.id=place_id AND p.status='published' AND p.user_id<>auth.uid())
);

DROP POLICY IF EXISTS "provider reviews visible read" ON public.provider_reviews;
CREATE POLICY "provider reviews visible read" ON public.provider_reviews
FOR SELECT TO authenticated USING (status='visible');

DROP POLICY IF EXISTS "provider reviews own insert" ON public.provider_reviews;
CREATE POLICY "provider reviews own insert" ON public.provider_reviews
FOR INSERT TO authenticated
WITH CHECK (
  reviewer_id=auth.uid()
  AND provider_id<>auth.uid()
  AND EXISTS (SELECT 1 FROM public.service_providers sp WHERE sp.user_id=provider_id)
  AND EXISTS (
    SELECT 1 FROM public.service_requests sr
    WHERE sr.requester_id=auth.uid()
      AND sr.provider_id=provider_id
      AND sr.status='completed'
  )
);

CREATE OR REPLACE FUNCTION public.get_place_rating(p_place_id uuid)
RETURNS TABLE(average_rating numeric, review_count integer)
LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  SELECT COALESCE(ROUND(AVG(r.rating)::numeric,1),0), COUNT(*)::integer
  FROM public.place_reviews r
  WHERE r.place_id=p_place_id AND r.status='visible';
$$;
GRANT EXECUTE ON FUNCTION public.get_place_rating(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_provider_rating(p_provider_id uuid)
RETURNS TABLE(average_rating numeric, review_count integer)
LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  SELECT COALESCE(ROUND(AVG(r.rating)::numeric,1),0), COUNT(*)::integer
  FROM public.provider_reviews r
  WHERE r.provider_id=p_provider_id AND r.status='visible';
$$;
GRANT EXECUTE ON FUNCTION public.get_provider_rating(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.add_place_review(
  p_place_id uuid, p_rating integer, p_review text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_uid uuid:=auth.uid(); v_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  IF p_rating NOT BETWEEN 1 AND 5 THEN RAISE EXCEPTION 'التقييم يجب أن يكون بين 1 و5'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.places WHERE id=p_place_id AND status='published' AND user_id<>v_uid) THEN
    RAISE EXCEPTION 'لا يمكن تقييم هذا المكان';
  END IF;
  INSERT INTO public.place_reviews(place_id,reviewer_id,rating,review)
  VALUES(p_place_id,v_uid,p_rating,NULLIF(trim(p_review),''))
  RETURNING id INTO v_id;
  RETURN v_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.add_place_review(uuid,integer,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.add_provider_review(
  p_provider_id uuid, p_rating integer, p_review text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_uid uuid:=auth.uid(); v_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'يجب تسجيل الدخول'; END IF;
  IF p_rating NOT BETWEEN 1 AND 5 THEN RAISE EXCEPTION 'التقييم يجب أن يكون بين 1 و5'; END IF;
  IF p_provider_id=v_uid OR NOT EXISTS (SELECT 1 FROM public.service_providers WHERE user_id=p_provider_id) THEN
    RAISE EXCEPTION 'مقدم الخدمة غير صالح';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.service_requests
    WHERE requester_id=v_uid AND provider_id=p_provider_id AND status='completed'
  ) THEN
    RAISE EXCEPTION 'يمكنك تقييم مقدم الخدمة بعد إكمال طلب خدمة معه';
  END IF;
  INSERT INTO public.provider_reviews(provider_id,reviewer_id,rating,review)
  VALUES(p_provider_id,v_uid,p_rating,NULLIF(trim(p_review),''))
  RETURNING id INTO v_id;
  RETURN v_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.add_provider_review(uuid,integer,text) TO authenticated;
