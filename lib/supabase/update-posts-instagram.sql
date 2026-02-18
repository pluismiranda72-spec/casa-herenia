-- Ejecutar en el panel SQL de Supabase (Dashboard > SQL Editor)
-- Añade soporte para posts tipo "instagram" (embed) sin borrar datos existentes.

-- Columna type: 'standard' (foto + texto) o 'instagram' (embed)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'standard';

-- Columna instagram_url: enlace del post de Instagram para embeber
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS instagram_url text;

-- Comentarios opcionales para documentar
COMMENT ON COLUMN public.posts.type IS 'standard = historia propia (media_url); instagram = embed por URL';
COMMENT ON COLUMN public.posts.instagram_url IS 'URL del post de Instagram cuando type = instagram';
