"use server";

import { differenceInDays, parseISO, startOfDay } from "date-fns";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

const REFUND_THRESHOLD_DAYS = 5;

export type BookingForCancel = {
  id: string;
  check_in: string;
  check_out: string;
  guest_name: string;
  guest_email: string;
  total_price: number;
  room_id: string;
  status: string;
};

/** Devuelve la reserva solo si el email coincide (para la página de cancelación). */
export async function getBookingForCancel(
  bookingId: string,
  email: string
): Promise<BookingForCancel | null> {
  const supabase = createServiceRoleClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("bookings")
    .select("id, check_in, check_out, guest_name, guest_email, total_price, room_id, status")
    .eq("id", bookingId)
    .single();

  if (error || !data) return null;
  if (data.guest_email?.toLowerCase().trim() !== email?.toLowerCase().trim()) return null;
  return data as BookingForCancel;
}

/** Calcula si la cancelación tendría reembolso (más de 5 días hasta check-in). */
export function isRefundable(daysUntilCheckIn: number): boolean {
  return daysUntilCheckIn > REFUND_THRESHOLD_DAYS;
}

export type CancelBookingState =
  | { success: true; status: "cancelled_refund" | "cancelled_no_refund" }
  | { success: false; error: string };

export async function cancelBooking(
  bookingId: string,
  email: string
): Promise<CancelBookingState> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return { success: false, error: "Servidor no configurado." };
  }

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, check_in, check_out, guest_name, guest_email, total_price, room_id, status")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, error: "Reserva no encontrada." };
  }

  if (booking.guest_email.toLowerCase().trim() !== email.toLowerCase().trim()) {
    return { success: false, error: "El email no coincide con esta reserva." };
  }

  if (booking.status === "cancelled_refund" || booking.status === "cancelled_no_refund") {
    return { success: false, error: "Esta reserva ya está cancelada." };
  }

  const today = startOfDay(new Date());
  const checkInDate = startOfDay(
    typeof booking.check_in === "string" ? parseISO(booking.check_in) : new Date(booking.check_in)
  );
  const daysUntilCheckIn = differenceInDays(checkInDate, today);

  const newStatus: "cancelled_refund" | "cancelled_no_refund" =
    daysUntilCheckIn > REFUND_THRESHOLD_DAYS ? "cancelled_refund" : "cancelled_no_refund";

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: newStatus })
    .eq("id", bookingId);

  if (updateError) {
    console.error("[cancelBooking] Update:", updateError);
    return { success: false, error: "No se pudo cancelar la reserva." };
  }

  const roomLabel =
    booking.room_id === "room_1"
      ? "Junior Suite I"
      : booking.room_id === "room_2"
        ? "Junior Suite II"
        : "TWO-BEDROOM SUITE (Villa Completa)";

  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toOwnerEmail = process.env.RESEND_TO_EMAIL ?? process.env.RESEND_FROM_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey && fromEmail) {
    const resend = new Resend(apiKey);
    const refundMessage =
      newStatus === "cancelled_refund"
        ? "DEBE reembolsar el 100% del importe al cliente."
        : "NO debe reembolsar; la cancelación está dentro de los 5 días previos al check-in.";

    const ownerText = [
      "Cancelación de reserva",
      "",
      `La reserva ${bookingId} ha sido cancelada por el cliente.`,
      "",
      `Habitación: ${roomLabel}`,
      `Entrada: ${booking.check_in}`,
      `Salida: ${booking.check_out}`,
      `Cliente: ${booking.guest_name} (${booking.guest_email})`,
      `Importe total: ${booking.total_price} €`,
      "",
      refundMessage,
    ].join("\n");

    await resend.emails.send({
      from: fromEmail,
      to: toOwnerEmail ?? fromEmail,
      subject: "Cancelación de reserva - Casa Herenia y Pedro",
      text: ownerText,
    });

    const clientRefundText =
      newStatus === "cancelled_refund"
        ? "Recibirá el reembolso del 100% del importe en el mismo método de pago utilizado."
        : "Según la política de cancelación, al estar dentro de los 5 días previos a la llegada, esta cancelación no conlleva reembolso.";

    const clientText = [
      "Confirmación de cancelación",
      "",
      `Hola ${booking.guest_name},`,
      "",
      "Su reserva ha sido cancelada correctamente.",
      "",
      `Habitación: ${roomLabel}`,
      `Fechas: ${booking.check_in} - ${booking.check_out}`,
      `Importe: ${booking.total_price} €`,
      "",
      clientRefundText,
      "",
      "Gracias por haber considerado Casa Herenia y Pedro.",
    ].join("\n");

    await resend.emails.send({
      from: fromEmail,
      to: booking.guest_email,
      subject: "Su reserva ha sido cancelada - Casa Herenia y Pedro",
      text: clientText,
    });
  }

  return { success: true, status: newStatus };
}
