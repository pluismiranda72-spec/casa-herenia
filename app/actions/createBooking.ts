'use server';

import { stripe } from '@/lib/stripe';
import { GLOBAL_CURRENCY } from '@/lib/constants/currency';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function createBooking(
  _prevState: unknown,
  formData: FormData
) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Falta la clave de Stripe');
  }

  const headerList = await headers();
  let origin =
    headerList.get('origin') ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000';
  origin = origin.replace(/\/$/, '');

  let sessionUrl: string | null = null;

  try {
    const supabase = await createClient();
    const payload = Object.fromEntries(formData.entries()) as Record<string, string>;
    const guest_phone = payload.guest_phone?.trim() || null;
    const locale = (payload.locale === 'en' ? 'en' : 'es') as 'es' | 'en';

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

    // All payments in EUR only (GLOBAL_CURRENCY). No dynamic currency or Price IDs.
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: GLOBAL_CURRENCY,
            product_data: { name: 'Reserva: ' + roomName },
            unit_amount: Math.round(Number(payload.total_price) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: payload.guest_email,
      metadata: { bookingId: booking.id, locale },
      success_url: `${origin}/${locale}/gracias?session_id={CHECKOUT_SESSION_ID}&name=${encodeURIComponent(payload.guest_name)}&checkin=${payload.check_in}&checkout=${payload.check_out}`,
      cancel_url: `${origin}/${locale}/reservas`,
    });

    sessionUrl = session.url ?? null;
  } catch (error) {
    console.error('🔴 ERROR CRÍTICO EN PAGO:', error);
    throw error;
  }

  if (sessionUrl) redirect(sessionUrl);
}
