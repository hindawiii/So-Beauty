-- ========== CUSTOMER REVIEWS TABLE ==========
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved reviews
CREATE POLICY "public_read_approved_reviews" ON public.reviews
  FOR SELECT TO anon, authenticated
  USING (is_approved = true);

-- Anyone can insert a customer review
CREATE POLICY "public_insert_review" ON public.reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Admins can update or delete reviews
CREATE POLICY "admin_manage_reviews" ON public.reviews
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default initial customer reviews if table is empty
INSERT INTO public.reviews (name, rating, body, is_approved)
SELECT 'لولي', 5, 'المنتجات فعلاً غيرت روتين بشرتي.', true
WHERE NOT EXISTS (SELECT 1 FROM public.reviews WHERE name = 'لولي');

INSERT INTO public.reviews (name, rating, body, is_approved)
SELECT 'سيدة ( البطة )', 5, 'أحس الفرق من أول أسبوع.', true
WHERE NOT EXISTS (SELECT 1 FROM public.reviews WHERE name = 'سيدة ( البطة )');

INSERT INTO public.reviews (name, rating, body, is_approved)
SELECT 'ولاء 😇', 5, 'تجربتي معهم ممتازة والدعم متواجد دايماً.', true
WHERE NOT EXISTS (SELECT 1 FROM public.reviews WHERE name = 'ولاء 😇');
