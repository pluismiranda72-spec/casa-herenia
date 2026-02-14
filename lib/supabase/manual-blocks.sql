-- Ejecutar en el panel SQL de Supabase (Dashboard > SQL Editor)
-- Bloqueos manuales de disponibilidad (independientes de Airbnb)

CREATE TABLE IF NOT EXISTS public.manual_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT manual_blocks_dates_order CHECK (end_date >= start_date)
);

COMMENT ON COLUMN public.manual_blocks.room_id IS 'room_1, room_2 o full_villa';
COMMENT ON COLUMN public.manual_blocks.reason IS 'Ej: Mantenimiento, uso personal';

CREATE INDEX IF NOT EXISTS idx_manual_blocks_room_id ON public.manual_blocks (room_id);
CREATE INDEX IF NOT EXISTS idx_manual_blocks_dates ON public.manual_blocks (start_date, end_date);

ALTER TABLE public.manual_blocks ENABLE ROW LEVEL SECURITY;

-- Lectura pública para que la API de disponibilidad pueda incluir bloqueos (vía service_role en servidor)
-- Escritura: solo desde servidor con service_role (admin). Opcional policy para authenticated:
CREATE POLICY "Allow select manual_blocks"
  ON public.manual_blocks
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow insert manual_blocks"
  ON public.manual_blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow delete manual_blocks"
  ON public.manual_blocks
  FOR DELETE
  TO authenticated
  USING (true);
