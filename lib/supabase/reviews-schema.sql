-- Ejecutar en el panel SQL de Supabase (Dashboard > SQL Editor)
-- Tabla de reseñas (vinculadas a reservas) para el sistema de reputación

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  categories jsonb,
  -- Ejemplo categories: {"Limpieza": 5, "Servicio": 5, "Ubicación": 5, "Confort": 5}
  title text,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden'))
);

CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON public.reviews (booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews (status);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer reseñas publicadas
CREATE POLICY "Allow public read published reviews"
  ON public.reviews
  FOR SELECT
  TO anon
  USING (status = 'published');

CREATE POLICY "Allow authenticated read all reviews"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (true);

-- Solo la app (inserción desde server action con anon) puede escribir
CREATE POLICY "Allow insert reviews from app"
  ON public.reviews
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update for authenticated"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (true);
