-- Ejecutar en el panel SQL de Supabase (Dashboard > SQL Editor)
-- Blog "Viñales Discovery Hub"

-- Tabla de entradas del blog
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  media_url text,
  media_type text CHECK (media_type IN ('image', 'video')),
  CONSTRAINT posts_slug_unique UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "Allow public read posts"
  ON public.posts
  FOR SELECT
  TO anon
  USING (true);

-- Escritura solo autenticada (admin)
CREATE POLICY "Allow authenticated insert posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update posts"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (true);

-- Bucket de Storage para medios del blog
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage: lectura pública, escritura autenticada
CREATE POLICY "Allow public read blog-media"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'blog-media');

CREATE POLICY "Allow authenticated upload blog-media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-media');

CREATE POLICY "Allow authenticated update blog-media"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-media');

CREATE POLICY "Allow authenticated delete blog-media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-media');
