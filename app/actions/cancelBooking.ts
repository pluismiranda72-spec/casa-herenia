'use server';

import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { differenceInDays } from 'date-fns';
import { revalidatePath } from 'next/cache';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function cancelBooking(bookingId: string) {
  const supabase = createClient();

  try {
    // 1. Obtener la reserva
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      throw new Error('Reserva no encontrada');
    }

    // 2. Calcular días para el check-in
    const checkInDate = new Date(booking.check_in);
    const today = new Date();
    
    // Calculamos la diferencia
    const daysUntilCheckIn = differenceInDays(checkInDate, today);
    const UMBRAL_REEMBOLSO = 5;

    // 3. Determinar el nuevo estado
    let newStatus = 'cancelled_no_refund'; // Por defecto no reembolsable
    if (daysUntilCheckIn > UMBRAL_REEMBOLSO) {
      newStatus = 'cancelled_refund'; // Reembolsable si faltan más de 5 días
    }

    // 4. Actualizar en Supabase
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (updateError) {
      throw new Error('Error al actualizar la reserva');
    }

    // 5. Enviar Emails (Notificación)
    
    // A) Al Dueño (Tú)
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: 'pluismiranda72@gmail.com', // Tu correo fijo para asegurar que llega
      subject: `RESERVA CANCELADA - ${booking.guest_name}`,
      html: `
        <h1>Cancelación de Reserva</h1>
        <p>El huésped <strong>${booking.guest_name}</strong> ha cancelado.</p>
        <p><strong>Estado de reembolso:</strong> ${newStatus === 'cancelled_refund' ? '✅ REEMBOLSABLE (Devolver dinero)' : '❌ NO REEMBOLSABLE'}</p>
        <p>Fechas liberadas: ${booking.check_in} al ${booking.check_out}</p>
      `
    });

    // B) Al Cliente (Usamos tu correo para probar)
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: 'pluismiranda72@gmail.com', 
      subject: 'Confirmación de Cancelación - Casa Herenia y Pedro',
      html: `
        <h1>Su reserva ha sido cancelada</h1>
        <p>Hola ${booking.guest_name}, hemos procesado su cancelación.</p>
        <p>Estado: ${newStatus === 'cancelled_refund' ? 'Se procederá al reembolso según política.' : 'Cancelación fuera de plazo (Sin reembolso).'}</p>
      `
    });

    revalidatePath('/reservas');
    return { success: true, status: newStatus };

  } catch (error) {
    console.error('Error al cancelar:', error);
    return { success: false, error: 'No se pudo cancelar la reserva' };
  }
}