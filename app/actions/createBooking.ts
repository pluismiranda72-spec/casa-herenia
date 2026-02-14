"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const bookingSchema = z.object({
  room_id: z.enum(["room_1", "room_2", "full_villa"]),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests_count: z.number().int().min(1).max(6),
  total_price: z.number().min(0),
  guest_name: z.string().min(2).max(200),
  guest_email: z.string().email(),
  guest_phone: z.string().max(50).optional().or(z.literal("")),
});

export type CreateBookingState =
  | { success: true; redirectUrl: string }
  | { success: false; error: string };

export async function createBooking(
  _prevState: CreateBookingState | null,
  formData: FormData
): Promise<CreateBookingState> {
  const raw = {
    room_id: formData.get("room_id"),
    check_in: formData.get("check_in"),
    check_out: formData.get("check_out"),
    guests_count: Number(formData.get("guests_count")),
    total_price: Number(formData.get("total_price")),
    guest_name: formData.get("guest_name"),
    guest_email: formData.get("guest_email"),
    guest_phone: formData.get("guest_phone") ?? "",
  };

  const parsed = bookingSchema.safeParse({
    ...raw,
    guest_phone: raw.guest_phone === "" ? undefined : raw.guest_phone,
  });

  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const first = Object.values(msg).flat().find(Boolean);
    return { success: false, error: first ?? "Datos inválidos." };
  }

  const data = parsed.data;

  const supabase = await createClient();
  const { data: row, error: insertError } = await supabase
    .from("bookings")
    .insert({
      room_id: data.room_id,
      check_in: data.check_in,
      check_out: data.check_out,
      guests_count: data.guests_count,
      total_price: data.total_price,
      guest_name: data.guest_name,
      guest_email: data.guest_email,
      guest_phone: data.guest_phone || null,
      status: "confirmed",
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[createBooking] Supabase:", insertError);
    return { success: false, error: "No se pudo guardar la reserva. Inténtalo de nuevo." };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL;
  // Destinatario: dueño de la casa (notificación). Por defecto tu correo; puede sobreescribirse con RESEND_TO_EMAIL.
  const toEmail = process.env.RESEND_TO_EMAIL ?? "pluismiranda72@gmail.com";
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey && fromEmail) {
    const resend = new Resend(apiKey);
    const roomLabel =
      data.room_id === "room_1"
        ? "Junior Suite I"
        : data.room_id === "room_2"
          ? "Junior Suite II"
          : "TWO-BEDROOM SUITE (Villa Completa)";
    const subject = "Confirmación de Reserva";
    const text = [
      `Confirmación de reserva`,
      ``,
      `La siguiente reserva ha sido confirmada:`,
      ``,
      `Habitación: ${roomLabel}`,
      `Entrada: ${data.check_in}`,
      `Salida: ${data.check_out}`,
      `Huéspedes: ${data.guests_count}`,
      `Total: ${data.total_price} €`,
      ``,
      `Contacto:`,
      `Nombre: ${data.guest_name}`,
      `Email: ${data.guest_email}`,
      data.guest_phone ? `Teléfono: ${data.guest_phone}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      text,
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const cancelUrl = siteUrl
      ? `${siteUrl.replace(/\/$/, "")}/es/reservas/cancelar/${row.id}?email=${encodeURIComponent(data.guest_email)}`
      : "";
    const clientText = [
      `Hola ${data.guest_name},`,
      ``,
      `Su reserva en Casa Herenia y Pedro ha sido confirmada.`,
      ``,
      `Habitación: ${roomLabel}`,
      `Entrada: ${data.check_in}`,
      `Salida: ${data.check_out}`,
      `Huéspedes: ${data.guests_count}`,
      `Total: ${data.total_price} €`,
      ``,
      cancelUrl
        ? `Para cancelar o modificar: ${cancelUrl}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    await resend.emails.send({
      from: fromEmail,
      to: data.guest_email,
      subject: "Confirmación de su reserva - Casa Herenia y Pedro",
      text: clientText,
    });
  }

  // Ruta sin locale: el router de next-intl (useRouter) añade el locale al navegar
  const redirectUrl = `/gracias?name=${encodeURIComponent(data.guest_name)}&checkin=${data.check_in}&checkout=${data.check_out}`;
  return { success: true, redirectUrl };
}
