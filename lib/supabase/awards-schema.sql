-- Ejecutar en el panel SQL de Supabase (Dashboard > SQL Editor)
-- Tabla de premios para la sección "Nuestros Premios" (CMS)

CREATE TABLE IF NOT EXISTS public.awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  position integer NOT NULL CHECK (position >= 1 AND position <= 10),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(position)
);

CREATE INDEX IF NOT EXISTS idx_awards_position ON public.awards (position);

ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "Allow public read awards"
  ON public.awards
  FOR SELECT
  TO anon
  USING (true);

-- Escritura abierta (para facilitar; en producción usar auth)
CREATE POLICY "Allow public insert awards"
  ON public.awards
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update awards"
  ON public.awards
  FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Allow public delete awards"
  ON public.awards
  FOR DELETE
  TO anon
  USING (true);
