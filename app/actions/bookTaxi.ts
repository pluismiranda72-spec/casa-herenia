"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { stripe } from "@/lib/stripe";

const PRICE_COLECTIVO = 25;
const PRICE_PRIVADO = 120;
const TAXI_EMAIL_TO = "pluismiranda72@gmail.com";

const taxiSchema = z.object({
  client_name: z.string().min(2).max(200),
  client_whatsapp: z.string().min(8).max(30),
  pickup_address: z.string().min(5).max(500),
  pickup_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  service_type: z.enum(["colectivo", "privado"]),
  passengers_count: z.number().int().min(1).max(8),
});

export type BookTaxiState =
  | { success: true; type: "solicitud" | "pago" }
  | { success: false; error: string };

function calculateTotal(
  serviceType: "colectivo" | "privado",
  passengers: number
): number {
  if (serviceType === "privado") return PRICE_PRIVADO;
  return passengers * PRICE_COLECTIVO;
}

export async function bookTaxi(
  _prevState: BookTaxiState | null,
  formData: FormData
): Promise<BookTaxiState> {
  const headerList = await headers();
  const originRaw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    headerList.get("origin") ||
    "http://localhost:3000";
  const origin = originRaw.replace(/\/$/, "");
  console.log("Entorno:", process.env.NODE_ENV, "Origen:", origin);

  const raw = {
    client_name: formData.get("client_name"),
    client_whatsapp: formData.get("client_whatsapp"),
    pickup_address: formData.get("pickup_address"),
    pickup_date: formData.get("pickup_date"),
    service_type: formData.get("service_type"),
    passengers_count: Number(formData.get("passengers_count")),
  };

  const parsed = taxiSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const first = Object.values(msg).flat().find(Boolean);
    return { success: false, error: (first as string) ?? "Datos inválidos." };
  }

  const data = parsed.data;
  const type =
    formData.get("booking_type") === "pago" ? "pago" : "solicitud";

  if (data.service_type === "privado" && data.passengers_count > 4)
    return { success: false, error: "Taxi privado admite máximo 4 personas." };
  if (data.service_type === "colectivo" && data.passengers_count > 8)
    return { success: false, error: "Máximo 8 personas en colectivo." };

  const totalPrice = calculateTotal(data.service_type, data.passengers_count);

  // ——— CASO 1: Solicitud (pago en efectivo) ———
  if (type === "solicitud") {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey)
      return { success: false, error: "Servicio de email no configurado." };

    const resend = new Resend(apiKey);
    const fromEmail =
      process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
    const serviceLabel =
      data.service_type === "privado" ? "Taxi Privado" : "Taxi Colectivo";

    const text = [
      "Nueva solicitud de taxi (pago en efectivo).",
      "",
      "Nombre: " + data.client_name,
      "WhatsApp: " + data.client_whatsapp,
      "Origen (recogida): " + data.pickup_address,
      "Destino: Viñales (Casa Herenia y Pedro)",
      "Fecha de recogida: " + data.pickup_date,
      "Tipo: " + serviceLabel,
      "Nº personas: " + data.passengers_count,
      "Precio estimado: " + totalPrice + " EUR/USD",
    ].join("\n");

    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: TAXI_EMAIL_TO,
      subject: "🚖 Nueva Solicitud de TAXI (Pago en efectivo)",
      text,
    });

    if (emailError) {
      console.error("[bookTaxi] Resend:", emailError);
      return {
        success: false,
        error: "No se pudo enviar la solicitud. Inténtalo de nuevo.",
      };
    }

    const supabase = await createClient();
    await supabase.from("taxi_requests").insert({
      client_name: data.client_name,
      client_whatsapp: data.client_whatsapp,
      pickup_address: data.pickup_address,
      pickup_date: data.pickup_date,
      service_type: data.service_type,
      passengers_count: data.passengers_count,
      total_price: totalPrice,
    });

    return { success: true, type: "solicitud" };
  }

  // ——— CASO 2: Pago con Stripe ———
  if (type === "pago") {
    if (!process.env.STRIPE_SECRET_KEY)
      return { success: false, error: "Pago no configurado." };

    const serviceLabel =
      data.service_type === "privado" ? "Privado" : "Colectivo";
    const productName = `Transporte: ${serviceLabel} (${data.passengers_count} pax)`;
    const amountCents = Math.round(totalPrice * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: { name: productName },
          },
        },
      ],
      metadata: {
        client_name: data.client_name,
        client_whatsapp: data.client_whatsapp,
        pickup_address: data.pickup_address,
        pickup_date: data.pickup_date,
        service_type: data.service_type,
        passengers_count: String(data.passengers_count),
      },
      success_url: `${origin}/es/gracias?type=taxi`,
      cancel_url: origin,
    });

    if (session.url) redirect(session.url);
    return { success: false, error: "No se pudo crear la sesión de pago." };
  }

  return { success: false, error: "Tipo de reserva no válido." };
}
