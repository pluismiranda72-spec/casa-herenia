/**
 * Plantilla del email de confirmación post-pago.
 * Incluye enlace a #faq-section. Usar getBaseUrl() para la URL dinámica.
 */

export function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

/** URL directa a la sección de Preguntas frecuentes (anchor #faq-section) */
export function getFaqSectionUrl(locale: string = "es"): string {
  const base = getBaseUrl();
  return `${base}/${locale}#faq-section`;
}

/**
 * Genera el HTML del email de confirmación con el enlace a la FAQ.
 * guestName, checkIn, checkOut son opcionales para personalizar.
 */
export function buildConfirmationEmailHtml(options: {
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  locale?: string;
}): string {
  const { guestName = "cliente", checkIn = "[fecha entrada]", checkOut = "[fecha salida]", locale = "es" } = options;
  const faqUrl = getFaqSectionUrl(locale);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h1 style="color: #0A0A0A;">¡Reserva confirmada!</h1>
  <p>Hola ${guestName},</p>
  <p>Su reserva en Casa Herenia y Pedro está confirmada para los días <strong>${checkIn}</strong> al <strong>${checkOut}</strong>. Gracias por confiar en nosotros.</p>
  <p>Muy pronto nos pondremos en contacto para ultimar detalles.</p>

  <p style="margin-top: 24px;">¿Tienes dudas sobre el transporte, internet o los pagos en destino? Consulta nuestra sección de <strong>Preguntas frecuentes</strong> aquí:</p>
  <p style="margin: 16px 0;">
    <a href="${faqUrl}" style="display: inline-block; padding: 12px 24px; background: #C5A059; color: #0A0A0A; text-decoration: none; font-weight: bold; border-radius: 4px;">Ver Preguntas frecuentes</a>
  </p>
  <p style="font-size: 14px; color: #666;">Enlace directo: <a href="${faqUrl}" style="color: #C5A059; text-decoration: underline;">${faqUrl}</a></p>

  <p style="margin-top: 32px;">Saludos cordiales,<br/>Pedro y Herenia.</p>
</body>
</html>
`.trim();
}

/**
 * Versión en texto plano del mismo contenido (para verificación en consola o fallback).
 */
export function buildConfirmationEmailText(options: {
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  locale?: string;
}): string {
  const { guestName = "cliente", checkIn = "[fecha entrada]", checkOut = "[fecha salida]", locale = "es" } = options;
  const faqUrl = getFaqSectionUrl(locale);

  return [
    "¡Reserva confirmada!",
    "",
    `Hola ${guestName},`,
    `Su reserva en Casa Herenia y Pedro está confirmada para los días ${checkIn} al ${checkOut}. Gracias por confiar en nosotros.`,
    "Muy pronto nos pondremos en contacto para ultimar detalles.",
    "",
    "¿Tienes dudas sobre el transporte, internet o los pagos en destino? Consulta nuestra sección de Preguntas frecuentes aquí:",
    faqUrl,
    "",
    "Saludos cordiales,",
    "Pedro y Herenia.",
  ].join("\n");
}

/**
 * Imprime en consola el contenido del correo y la URL del ancla para que puedas verificar que #faq-section está bien.
 * Llama a esta función desde tu webhook o desde una ruta API de prueba.
 */
export function logConfirmationEmailForVerification(options: {
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  locale?: string;
} = {}): void {
  const baseUrl = getBaseUrl();
  const faqUrl = getFaqSectionUrl(options.locale ?? "es");

  console.log("========== EMAIL DE CONFIRMACIÓN (verificación) ==========");
  console.log("Base URL:", baseUrl);
  console.log("Enlace a FAQ (debe terminar en #faq-section):", faqUrl);
  console.log("¿Termina en #faq-section?", faqUrl.endsWith("#faq-section") ? "Sí ✓" : "No ✗");
  console.log("");
  console.log("--- TEXTO PLANO (cuerpo del correo) ---");
  console.log(buildConfirmationEmailText(options));
  console.log("");
  console.log("--- HTML (fragmento con el enlace) ---");
  const html = buildConfirmationEmailHtml(options);
  const linkLine = html.split("\n").find((l) => l.includes("faq-section"));
  console.log(linkLine ?? html.slice(0, 500));
  console.log("==========================================================");
}
