-- Ejecutar en el panel SQL de Supabase (Dashboard > SQL Editor)
-- Galerías de habitaciones (8 imágenes por habitación)

-- Tabla: una fila por habitación, array fijo de 8 URLs
CREATE TABLE IF NOT EXISTS public.room_galleries (
  room_slug text PRIMARY KEY,
  images jsonb NOT NULL DEFAULT '[null,null,null,null,null,null,null,null]'::jsonb
);

COMMENT ON COLUMN public.room_galleries.room_slug IS 'Identificador de la habitación (ej: room-1, room-2)';
COMMENT ON COLUMN public.room_galleries.images IS 'Array de 8 posiciones con URLs de imagen (null = hueco vacío)';

ALTER TABLE public.room_galleries ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "Allow public read room_galleries"
  ON public.room_galleries
  FOR SELECT
  TO anon
  USING (true);

-- Inserción pública (para facilitar gestión)
CREATE POLICY "Allow public insert room_galleries"
  ON public.room_galleries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Actualización pública
CREATE POLICY "Allow public update room_galleries"
  ON public.room_galleries
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
