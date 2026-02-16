'use server';

import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function createBooking(
  _prevState: unknown,
  formData: FormData
) {
    console.log("🚨🚨🚨 ¡¡ESTOY EJECUTANDO EL CÓDIGO NUEVO!! 🚨🚨🚨");
  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get('origin') || 'http://localhost:3000';

  const payload = Object.fromEntries(formData.entries()) as Record<string, string>;
  const guest_phone = payload.guest_phone?.trim() || null;

  // 1. Guardar en Supabase
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      room_id: payload.room_id,
      check_in: payload.check_in,
      check_out: payload.check_out,
      guests_count: Number(payload.guests_count),
      total_price: Number(payload.total_price),
      guest_name: payload.guest_name,
      guest_email: payload.guest_email,
      guest_phone,
      status: 'pending_payment',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const roomName =
    payload.room_id === 'room_1'
      ? 'Junior Suite I'
      : payload.room_id === 'room_2'
        ? 'Junior Suite II'
        : payload.room_id === 'full_villa'
          ? 'Villa Completa'
          : payload.room_id;

  // 2. Stripe Session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: { name: 'Reserva: ' + roomName },
          unit_amount: Math.round(Number(payload.total_price) * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    customer_email: payload.guest_email,
    metadata: { bookingId: booking.id },
    success_url: `${origin}/es/gracias?session_id={CHECKOUT_SESSION_ID}&name=${encodeURIComponent(payload.guest_name)}&checkin=${payload.check_in}&checkout=${payload.check_out}`,
    cancel_url: `${origin}/es/reservas`,
  });

  if (session.url) redirect(session.url);
}
