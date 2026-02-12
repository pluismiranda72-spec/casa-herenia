-- Ejecutar en el panel SQL de Supabase (Dashboard > SQL Editor)
-- Tabla de reservas para el motor de reservas

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  room_id text NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests_count integer NOT NULL,
  total_price numeric(10, 2) NOT NULL,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text,
  status text NOT NULL DEFAULT 'pending'
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON public.bookings (room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON public.bookings (check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);

-- Permitir inserciones desde la app (anon) si usas RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert bookings from app"
  ON public.bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Opcional: solo el dueño (authenticated o service_role) puede ver/actualizar
CREATE POLICY "Allow select for authenticated"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow update for authenticated"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (true);

-- Tabla de solicitudes de taxi (transfer La Habana → Viñales)
CREATE TABLE IF NOT EXISTS public.taxi_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  client_name text NOT NULL,
  client_whatsapp text NOT NULL,
  pickup_address text NOT NULL,
  pickup_date date NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('colectivo', 'privado')),
  passengers_count integer NOT NULL CHECK (passengers_count >= 1 AND passengers_count <= 8),
  total_price numeric(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_taxi_requests_pickup_date ON public.taxi_requests (pickup_date);
CREATE INDEX IF NOT EXISTS idx_taxi_requests_created_at ON public.taxi_requests (created_at);

ALTER TABLE public.taxi_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert taxi_requests from app"
  ON public.taxi_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow select taxi_requests for authenticated"
  ON public.taxi_requests
  FOR SELECT
  TO authenticated
  USING (true);
