-- RPC para fechas ocupadas por reservas (con room_id y filtro de estado).
-- Ejecutar en Supabase Dashboard > SQL Editor si la RPC no existe o no devuelve room_id.
-- Usado por lib/ical.ts para bloquear solo la habitación correspondiente (room_1 → room_1 + full_villa; full_villa → las tres).

CREATE OR REPLACE FUNCTION public.get_occupied_dates()
RETURNS TABLE (start_date date, end_date date, room_id text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.check_in AS start_date,
    b.check_out AS end_date,
    b.room_id
  FROM public.bookings b
  WHERE b.status = 'confirmed'
     OR (b.status = 'pending_payment' AND b.created_at >= now() - interval '30 minutes');
$$;
