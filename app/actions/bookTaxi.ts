"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const PRICE_COLECTIVO = 25;
const PRICE_PRIVADO = 120;

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

function calculateTotal(serviceType: "colectivo" | "privado", passengers: number): number {
  if (serviceType === "privado") return PRICE_PRIVADO;
  return passengers * PRICE_COLECTIVO;
}

export async function bookTaxi(
  _prevState: BookTaxiState | null,
  formData: FormData
): Promise<BookTaxiState> {
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
  const totalPrice = calculateTotal(data.service_type, data.passengers_count);
  const bookingType = (formData.get("booking_type") as string) === "pago" ? "pago" : "solicitud";

  // Validación extra: colectivo puede tener más de 4 en lógica de negocio; el schema limita a 4 para privado. Aquí ambos están 1-4.
  if (data.service_type === "privado" && data.passengers_count > 4)
    return { success: false, error: "Taxi privado admite máximo 4 personas." };
  if (data.service_type === "colectivo" && data.passengers_count > 8)
    return { success: false, error: "Máximo 8 personas en colectivo." };

  const supabase = await createClient();
  const { error: insertError } = await supabase.from("taxi_requests").insert({
    client_name: data.client_name,
    client_whatsapp: data.client_whatsapp,
    pickup_address: data.pickup_address,
    pickup_date: data.pickup_date,
    service_type: data.service_type,
    passengers_count: data.passengers_count,
    total_price: totalPrice,
  });

  if (insertError) {
    console.error("[bookTaxi] Supabase:", insertError);
    // Continuar: enviar email aunque falle la tabla (por si no existe aún)
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey && fromEmail) {
    const resend = new Resend(apiKey);
    const serviceLabel = data.service_type === "privado" ? "Taxi Privado" : "Taxi Colectivo";
    const subject =
      bookingType === "pago"
        ? `⚠️ INTENTO DE PAGO ONLINE - Taxi - ${data.client_name}`
        : `Nueva Solicitud de Taxi (Pago en efectivo) - ${data.client_name}`;
    const actionLine =
      bookingType === "pago"
        ? ">>> El cliente pulsó 'Confirmar pago de viaje' (intento de pago online)."
        : ">>> El cliente pulsó 'Confirmar solicitud de viaje' (pago en efectivo).";
    const text = [
      actionLine,
      `Precio total calculado: ${totalPrice} EUR/USD`,
      "",
      "Cliente:",
      `Nombre: ${data.client_name}`,
      `WhatsApp: ${data.client_whatsapp}`,
      "",
      "Viaje:",
      `Dirección de recogida: ${data.pickup_address}`,
      `Fecha de recogida: ${data.pickup_date}`,
      `Tipo de taxi: ${serviceLabel}`,
      `Nº personas: ${data.passengers_count}`,
      `Precio total: ${totalPrice} EUR/USD`,
      "",
    ].join("\n");

    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: "pluismiranda72@gmail.com",
      subject,
      text,
    });
    if (emailError) {
      console.error("[bookTaxi] Resend:", emailError);
      return { success: false, error: "No se pudo enviar la solicitud. Inténtalo de nuevo." };
    }
  } else {
    return { success: false, error: "Servicio de email no configurado." };
  }

  return { success: true, type: bookingType };
}
