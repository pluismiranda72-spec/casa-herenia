-- Opcional: restricción de valores para status de reservas (cancelación).
-- Ejecutar en Supabase SQL Editor si quieres validar los estados en BD.
-- La columna status ya existe como TEXT; estos son los valores usados por el flujo de cancelación.

-- Añadir CHECK solo si no rompe datos existentes (ajusta según tus valores actuales).
-- ALTER TABLE public.bookings
--   DROP CONSTRAINT IF EXISTS bookings_status_check;
-- ALTER TABLE public.bookings
--   ADD CONSTRAINT bookings_status_check CHECK (status IN (
--     'pending', 'confirmed', 'cancelled_refund', 'cancelled_no_refund'
--   ));

-- Estados de cancelación:
-- cancelled_refund  = Cancelación con más de 5 días antes del check-in. Reembolso 100%.
-- cancelled_no_refund = Cancelación a 5 días o menos. Sin reembolso.
