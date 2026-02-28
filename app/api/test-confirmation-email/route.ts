import { NextResponse } from "next/server";
import { logConfirmationEmailForVerification } from "@/lib/confirmationEmail";

/**
 * Ruta de prueba: GET /api/test-confirmation-email
 * Al llamarla, en la CONSOLA DEL SERVIDOR (terminal donde corre npm run dev)
 * se imprime el contenido del email y la URL del enlace #faq-section
 * para que puedas verificar que está bien escrito.
 */
export async function GET() {
  logConfirmationEmailForVerification({
    guestName: "Señor(a) Cliente",
    checkIn: "2025-03-15",
    checkOut: "2025-03-18",
    locale: "es",
  });

  return NextResponse.json({
    ok: true,
    message:
      "Revisa la consola del servidor (terminal donde corre npm run dev) para ver el texto del email y el enlace a #faq-section.",
  });
}
