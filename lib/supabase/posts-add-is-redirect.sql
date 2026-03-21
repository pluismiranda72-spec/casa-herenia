-- Ejecutar en Supabase Dashboard > SQL Editor (una vez).
-- Marca publicaciones que solo redirigen a Instagram (sin cuerpo de texto obligatorio).

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS is_redirect boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.posts.is_redirect IS 'true = miniatura + enlace externo; el contenido HTML puede ir vacío';
