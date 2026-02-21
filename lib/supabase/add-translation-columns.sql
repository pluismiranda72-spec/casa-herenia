-- Ejecutar en el panel SQL de Supabase (Dashboard > SQL Editor)
-- Añade columnas para contenido traducido al inglés en posts (Descubre Viñales)

ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS title_en text;

ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS content_en text;

ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS excerpt_en text;

COMMENT ON COLUMN public.posts.title_en IS 'Título en inglés (traducción automática)';
COMMENT ON COLUMN public.posts.content_en IS 'Contenido en inglés (traducción automática)';
COMMENT ON COLUMN public.posts.excerpt_en IS 'Resumen en inglés (traducción automática)';
