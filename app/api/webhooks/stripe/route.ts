import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import {
  getConfirmationEmailSubject,
  buildConfirmationEmailHtml,
  buildConfirmationEmailText,
} from "@/lib/confirmationEmail";

/**
 * Stripe webhook: checkout.session.completed
 * - For accommodation (metadata.bookingId): update booking status, send locale-aware confirmation email.
 * - For taxi (no bookingId): optional future handling.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook/stripe] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("[webhook/stripe] Signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata ?? {};
  const bookingId = metadata.bookingId;
  const userLocale = metadata.locale === "en" ? "en" : "es";

  // Accommodation booking: send confirmation email in the user's language
  if (bookingId) {
    const supabase = createServiceRoleClient();
    if (!supabase) {
      console.error("[webhook/stripe] Supabase service role not configured");
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("guest_email, guest_name, check_in, check_out")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking?.guest_email) {
      console.error("[webhook/stripe] Booking not found or no email:", bookingId, fetchError);
      return NextResponse.json({ received: true });
    }

    await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId);

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
    if (!apiKey) {
      console.error("[webhook/stripe] RESEND_API_KEY not set, skipping email");
      return NextResponse.json({ received: true });
    }

    const resend = new Resend(apiKey);
    const subject = getConfirmationEmailSubject(userLocale);
    const html = buildConfirmationEmailHtml({
      guestName: booking.guest_name ?? "cliente",
      checkIn: booking.check_in ?? "",
      checkOut: booking.check_out ?? "",
      locale: userLocale,
    });
    const text = buildConfirmationEmailText({
      guestName: booking.guest_name ?? "cliente",
      checkIn: booking.check_in ?? "",
      checkOut: booking.check_out ?? "",
      locale: userLocale,
    });

    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: booking.guest_email,
      subject,
      html,
      text,
    });

    if (emailError) {
      console.error("[webhook/stripe] Resend error:", emailError);
    }
  }

  return NextResponse.json({ received: true });
}
