import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

export const maxDuration = 60;

function yesterdayISO(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    console.error("[send-survey] SUPABASE_SERVICE_ROLE_KEY no configurado");
    return NextResponse.json(
      { error: "Service role no configurado", sent: 0 },
      { status: 500 }
    );
  }

  const checkOutYesterday = yesterdayISO();
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id, guest_name, guest_email")
    .eq("check_out", checkOutYesterday);

  if (error) {
    console.error("[send-survey] Supabase:", error);
    return NextResponse.json({ error: error.message, sent: 0 }, { status: 500 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "https://tudominio.com";
  const locale = "es";
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || !fromEmail) {
    return NextResponse.json(
      { error: "Resend no configurado", sent: 0 },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);
  let sent = 0;

  for (const b of bookings ?? []) {
    const surveyUrl = `${baseUrl}/${locale}/encuesta/${b.id}`;
    const name = b.guest_name?.trim() || "Huésped";
    const subject = `¿Qué tal estuvo todo, ${name}?`;
    const text = [
      `Hola ${name},`,
      "",
      "Gracias por visitarnos. Nos encantaría saber su opinión para seguir mejorando. Solo le tomará 2 minutos.",
      "",
      "Escribir opinión:",
      surveyUrl,
      "",
    ].join("\n");

    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: b.guest_email ?? "",
      subject,
      text,
    });

    if (emailError) {
      console.error("[send-survey] Resend para", b.id, emailError);
    } else {
      sent++;
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    total: bookings?.length ?? 0,
    check_out_date: checkOutYesterday,
  });
}
