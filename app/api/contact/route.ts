import { NextResponse } from "next/server";
import { Resend } from "resend";

type ContactBody = { name?: string; email?: string; message?: string; locale?: string };

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactBody;

    if (!body.email || !body.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userLocale = body.locale === "en" ? "en" : "es";
    const apiKey = process.env.RESEND_API_KEY;

    // 1. Remitente OBLIGATORIO para cuentas de Resend en modo pruebas
    const fromEmail = "onboarding@resend.dev";

    // 2. Destino OBLIGATORIO (Tu correo autorizado en Resend)
    const toEmail = process.env.RESEND_TO_EMAIL || "pluismiranda72@gmail.com";

    if (!apiKey) {
      console.error("[contact] RESEND_API_KEY missing");
      return NextResponse.json({ error: "Config error" }, { status: 500 });
    }

    const resend = new Resend(apiKey);

    const subject =
      userLocale === "en"
        ? `New message from ${body.name || "Guest"}`
        : `Nuevo mensaje de ${body.name || "Invitado"}`;

    const { data, error: emailError } = await resend.emails.send({
      from: `Casa Herenia <${fromEmail}>`,
      to: [toEmail],
      subject,
      reply_to: body.email, // La magia para responder directo al cliente
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #000;">Nuevo contacto desde la web de Casa Herenia</h2>
          <p><strong>Nombre:</strong> ${body.name || "No proporcionado"}</p>
          <p><strong>Email del cliente:</strong> ${body.email}</p>
          <p><strong>Mensaje:</strong></p>
          <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #ccc; border-radius: 4px; white-space: pre-wrap;">${body.message}</p>
        </div>
      `,
    });

    if (emailError) {
      console.error("[resend_error]", emailError);
      return NextResponse.json({ error: emailError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[contact_exception]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}