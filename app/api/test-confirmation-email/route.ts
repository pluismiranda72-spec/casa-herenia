import { NextResponse } from "next/server";
import { logConfirmationEmailForVerification } from "@/lib/confirmationEmail";

/**
 * Ruta de prueba: GET /api/test-confirmation-email
 * Query: ?locale=en o ?locale=es (default es)
 * En la consola del servidor se imprime el contenido del email y la URL #faq-section.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "es";

  logConfirmationEmailForVerification({
    guestName: locale === "en" ? "Guest" : "Señor(a) Cliente",
    checkIn: "2025-03-15",
    checkOut: "2025-03-18",
    locale,
  });

  return NextResponse.json({
    ok: true,
    locale,
    message:
      "Revisa la consola del servidor (terminal donde corre npm run dev) para ver el texto del email y el enlace a #faq-section.",
  });
}
