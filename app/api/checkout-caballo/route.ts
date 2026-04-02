import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { precioTotal, personas, fecha } = body;

    if (!precioTotal || !personas || !fecha) {
      return NextResponse.json(
        { error: "Faltan datos para la reserva" },
        { status: 400 }
      );
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";
    const base = origin.replace(/\/$/, "");

    const unitAmount = Math.round(Number(precioTotal) * 100);
    if (!Number.isFinite(unitAmount) || unitAmount < 1) {
      return NextResponse.json({ error: "Importe inválido" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Tour: Ruta a Caballo en Viñales",
              description: `Reserva para ${personas} persona(s). Fecha: ${fecha ?? "—"}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${base}/es/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/es/reserva-caballo`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error en Stripe API:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
