-- Ejecutar en el panel SQL de Supabase (Dashboard > SQL Editor)
-- Añade soporte para galerías de múltiples imágenes (carrusel por post).
-- media_url se mantiene como foto de portada (primera del array).

-- Columna gallery_urls: array de URLs de imágenes (galería/carrusel).
-- Si está rellenada, la primera debe coincidir con media_url para la portada.
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT NULL;

COMMENT ON COLUMN public.posts.gallery_urls IS 'URLs de imágenes de la galería (carrusel). La primera es la portada (media_url).';
