-- Eliminar reservas de prueba del mes de abril de 2026.
-- Ejecutar en Supabase Dashboard > SQL Editor (una sola vez).

DELETE FROM public.bookings
WHERE check_in >= '2026-04-01'
  AND check_in < '2026-05-01';
