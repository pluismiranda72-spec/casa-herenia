"use server";

import { differenceInDays } from "date-fns";
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
  const guestEmail = (data.guest_email as string) ?? "";
  const inputEmail = (email ?? "").toLowerCase().trim();
  if (guestEmail.toLowerCase().trim() !== inputEmail) return null;
  return data as BookingForCancel;
}

export function isRefundable(daysUntilCheckIn: number): boolean {
  return daysUntilCheckIn > REFUND_THRESHOLD_DAYS;
}

export type CancelBookingState =
  | { success: true; status: "cancelled_refund" | "cancelled_no_refund" }
  | { success: false; error: string };

function getRoomLabel(roomId: string): string {
  if (roomId === "room_1") return "Junior Suite I";
  if (roomId === "room_2") return "Junior Suite II";
  return "TWO-BEDROOM SUITE (Villa Completa)";
}

export async function cancelBooking(
  bookingId: string,
  email: string
): Promise<CancelBookingState> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return { success: false, error: "Server not configured." };
  }

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, check_in, check_out, guest_name, guest_email, total_price, room_id, status")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, error: "Booking not found." };
  }

  const guestEmail = String(booking.guest_email ?? "").toLowerCase().trim();
  const inputEmail = (email ?? "").toLowerCase().trim();
  if (guestEmail !== inputEmail) {
    return { success: false, error: "Email does not match this booking." };
  }

  const status = String(booking.status ?? "");
  if (status === "cancelled_refund" || status === "cancelled_no_refund") {
    return { success: false, error: "This booking is already cancelled." };
  }

  const today = new Date();
  const checkIn = new Date(booking.check_in);
  const days = differenceInDays(checkIn, today);

  const newStatus: "cancelled_refund" | "cancelled_no_refund" =
    days > REFUND_THRESHOLD_DAYS ? "cancelled_refund" : "cancelled_no_refund";

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: newStatus })
    .eq("id", bookingId);

  if (updateError) {
    console.error("[cancelBooking] Update:", updateError);
    return { success: false, error: "Could not cancel booking." };
  }

  const roomLabel = getRoomLabel(String(booking.room_id ?? ""));
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toOwnerEmail = process.env.RESEND_TO_EMAIL ?? process.env.RESEND_FROM_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey && fromEmail) {
    const resend = new Resend(apiKey);
    const refundNote =
      newStatus === "cancelled_refund"
        ? "Full refund required (100%)."
        : "No refund; cancellation within 5 days of check-in.";

    const ownerLines = [
      "Booking cancellation",
      "",
      `Booking ${bookingId} has been cancelled.`,
      "",
      `Room: ${roomLabel}`,
      `Check-in: ${booking.check_in}`,
      `Check-out: ${booking.check_out}`,
      `Guest: ${booking.guest_name} (${booking.guest_email})`,
      `Total: ${booking.total_price} EUR`,
      "",
      refundNote,
    ];
    await resend.emails.send({
      from: fromEmail,
      to: toOwnerEmail ?? fromEmail,
      subject: "Booking cancelled",
      text: ownerLines.join("\n"),
    });

    const clientRefundNote =
      newStatus === "cancelled_refund"
        ? "You will receive a full refund (100%) to your original payment method."
        : "Per cancellation policy, cancellations within 5 days of arrival are non-refundable.";

    const clientLines = [
      "Cancellation confirmation",
      "",
      `Hello ${booking.guest_name},`,
      "",
      "Your booking has been cancelled.",
      "",
      `Room: ${roomLabel}`,
      `Dates: ${booking.check_in} - ${booking.check_out}`,
      `Amount: ${booking.total_price} EUR`,
      "",
      clientRefundNote,
    ];
    await resend.emails.send({
      from: fromEmail,
      to: String(booking.guest_email),
      subject: "Your booking has been cancelled",
      text: clientLines.join("\n"),
    });
  }

  return { success: true, status: newStatus };
}
