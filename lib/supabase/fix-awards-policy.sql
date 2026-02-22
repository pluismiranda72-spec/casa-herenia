-- Ejecutar en el panel SQL de Supabase (Dashboard > SQL Editor)
-- Asegura que la tabla awards sea accesible públicamente
-- Si falla por políticas existentes, ejecuta antes: DROP POLICY IF EXISTS "nombre" ON public.awards;

ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read awards" ON public.awards;
DROP POLICY IF EXISTS "Allow public insert awards" ON public.awards;
DROP POLICY IF EXISTS "Allow public update awards" ON public.awards;
DROP POLICY IF EXISTS "Allow public delete awards" ON public.awards;

CREATE POLICY "Lectura Pública Premios"
  ON public.awards FOR SELECT TO anon USING (true);

CREATE POLICY "Escritura Pública Premios"
  ON public.awards FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Borrado Público Premios"
  ON public.awards FOR DELETE TO anon USING (true);
