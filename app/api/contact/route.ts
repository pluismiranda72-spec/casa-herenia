import { NextResponse } from "next/server";

type ContactBody = { name?: string; email?: string; message?: string; locale?: string };

/**
 * POST /api/contact
 * Recibe nombre, email, mensaje y locale (es|en). Por ahora responde OK sin enviar correo.
 * Al añadir email transaccional, usar body.locale para el idioma del mensaje.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactBody;
    if (!body.email || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const userLocale = body.locale === "en" ? "en" : "es";
    // TODO: enviar email (Resend, etc.) usando userLocale para contenido en ES/EN
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
