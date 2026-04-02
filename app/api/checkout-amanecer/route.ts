import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { GLOBAL_CURRENCY } from "@/lib/constants/currency";

const PRODUCT_NAME = "Amanecer en Los Acuáticos";
const PRICE_PER_PERSON_EUR = 25;

/**
 * POST /api/checkout-amanecer
 * Misma lógica de sesión que habitaciones (createBooking): stripe.checkout.sessions.create
 * con price_data en EUR. Independiente de la tabla bookings.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const persons = Number(body.persons ?? body.personas);
  const totalPrice = Number(body.totalPrice ?? body.precioTotal);
  const dateFrom = String(body.dateFrom ?? body.fecha ?? "").trim();
  const dateToRaw = body.dateTo ?? body.fechaHasta;
  const dateTo =
    dateToRaw != null && String(dateToRaw).trim() !== ""
      ? String(dateToRaw).trim()
      : null;
  const locale = body.locale === "en" ? "en" : "es";

  if (!dateFrom || !/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }
  if (dateTo && !/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
    return NextResponse.json({ error: "Fecha fin inválida" }, { status: 400 });
  }
  if (!Number.isInteger(persons) || persons < 1 || persons > 10) {
    return NextResponse.json({ error: "Número de personas inválido" }, { status: 400 });
  }

  const expected = persons * PRICE_PER_PERSON_EUR;
  if (!Number.isFinite(totalPrice) || Math.abs(totalPrice - expected) > 0.01) {
    return NextResponse.json({ error: "Importe no coincide con el precio del tour" }, { status: 400 });
  }

  const headerList = await headers();
  let origin =
    headerList.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  origin = origin.replace(/\/$/, "");

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: GLOBAL_CURRENCY,
            unit_amount: Math.round(totalPrice * 100),
            product_data: { name: PRODUCT_NAME },
          },
        },
      ],
      metadata: {
        tour: "amanecer",
        date_from: dateFrom,
        date_to: dateTo ?? "",
        persons: String(persons),
        locale,
      },
      success_url: `${origin}/${locale}/gracias?type=amanecer_tour&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/reserva-amanecer`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "No se pudo crear la sesión de pago" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout-amanecer]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al crear el pago" },
      { status: 500 }
    );
  }
}
