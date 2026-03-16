-- Extiende la tabla awards con columnas para título y año (si aún no existen).
-- Ejecutar en Supabase Dashboard > SQL Editor una sola vez.

ALTER TABLE public.awards
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS year integer;

