/**
 * Plantilla del email de confirmación post-pago (locale-aware).
 * Incluye enlace a #faq-section en el idioma correcto (/es#faq-section o /en#faq-section).
 */

export function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

/** URL directa a la sección de Preguntas frecuentes en el idioma del usuario */
export function getFaqSectionUrl(locale: string = "es"): string {
  const base = getBaseUrl();
  const lang = locale === "en" ? "en" : "es";
  return `${base}/${lang}#faq-section`;
}

const CONTENT_ES = {
  subject: "Reserva Confirmada - Casa Herenia y Pedro",
  title: "¡Reserva confirmada!",
  greeting: "Hola",
  body1: "Su reserva en Casa Herenia y Pedro está confirmada para los días",
  body2: "Gracias por confiar en nosotros.",
  body3: "Muy pronto nos pondremos en contacto para ultimar detalles.",
  faqIntro:
    "¿Tienes dudas sobre el transporte, internet o los pagos en destino? Consulta nuestra sección de Preguntas frecuentes aquí:",
  faqCta: "Ver Preguntas frecuentes",
  faqLinkLabel: "Enlace directo:",
  signOff: "Saludos cordiales,",
  signNames: "Pedro y Herenia.",
};

const CONTENT_EN = {
  subject: "Reservation Confirmed - Casa Herenia y Pedro",
  title: "Reservation confirmed!",
  greeting: "Hello",
  body1: "Your booking at Casa Herenia y Pedro is confirmed for",
  body2: "Thank you for choosing us.",
  body3: "We will be in touch soon to finalise details.",
  faqIntro:
    "Questions about transport, internet or payment on arrival? Check our Frequently Asked Questions:",
  faqCta: "View FAQ",
  faqLinkLabel: "Direct link:",
  signOff: "Kind regards,",
  signNames: "Pedro and Herenia.",
};

function getContent(locale: string) {
  return locale === "en" ? CONTENT_EN : CONTENT_ES;
}

/** Asunto del correo según idioma */
export function getConfirmationEmailSubject(locale: string = "es"): string {
  return getContent(locale).subject;
}

/**
 * Genera el HTML del email de confirmación con el enlace a la FAQ en el idioma correcto.
 */
export function buildConfirmationEmailHtml(options: {
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  locale?: string;
}): string {
  const {
    guestName = "cliente",
    checkIn = "[fecha entrada]",
    checkOut = "[fecha salida]",
    locale = "es",
  } = options;
  const c = getContent(locale);
  const faqUrl = getFaqSectionUrl(locale);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h1 style="color: #0A0A0A;">${c.title}</h1>
  <p>${c.greeting} ${guestName},</p>
  <p>${c.body1} <strong>${checkIn}</strong> ${locale === "en" ? "to" : "al"} <strong>${checkOut}</strong>. ${c.body2}</p>
  <p>${c.body3}</p>

  <p style="margin-top: 24px;">${c.faqIntro}</p>
  <p style="margin: 16px 0;">
    <a href="${faqUrl}" style="display: inline-block; padding: 12px 24px; background: #C5A059; color: #0A0A0A; text-decoration: none; font-weight: bold; border-radius: 4px;">${c.faqCta}</a>
  </p>
  <p style="font-size: 14px; color: #666;">${c.faqLinkLabel} <a href="${faqUrl}" style="color: #C5A059; text-decoration: underline;">${faqUrl}</a></p>

  <p style="margin-top: 32px;">${c.signOff}<br/>${c.signNames}</p>
</body>
</html>
`.trim();
}

/**
 * Versión en texto plano del mismo contenido (locale-aware).
 */
export function buildConfirmationEmailText(options: {
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  locale?: string;
}): string {
  const {
    guestName = "cliente",
    checkIn = "[fecha entrada]",
    checkOut = "[fecha salida]",
    locale = "es",
  } = options;
  const c = getContent(locale);
  const faqUrl = getFaqSectionUrl(locale);
  const toOrAl = locale === "en" ? "to" : "al";

  return [
    c.title,
    "",
    `${c.greeting} ${guestName},`,
    `${c.body1} ${checkIn} ${toOrAl} ${checkOut}. ${c.body2}`,
    c.body3,
    "",
    c.faqIntro,
    faqUrl,
    "",
    c.signOff,
    c.signNames,
  ].join("\n");
}

/**
 * Imprime en consola el contenido del correo y la URL del ancla (para verificación).
 */
export function logConfirmationEmailForVerification(options: {
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  locale?: string;
} = {}): void {
  const baseUrl = getBaseUrl();
  const locale = options.locale ?? "es";
  const faqUrl = getFaqSectionUrl(locale);

  console.log("========== EMAIL DE CONFIRMACIÓN (verificación) ==========");
  console.log("Locale:", locale);
  console.log("Base URL:", baseUrl);
  console.log("Enlace a FAQ (debe terminar en #faq-section):", faqUrl);
  console.log("¿Termina en #faq-section?", faqUrl.endsWith("#faq-section") ? "Sí ✓" : "No ✗");
  console.log("");
  console.log("--- TEXTO PLANO (cuerpo del correo) ---");
  console.log(buildConfirmationEmailText({ ...options, locale }));
  console.log("");
  console.log("--- HTML (fragmento con el enlace) ---");
  const html = buildConfirmationEmailHtml({ ...options, locale });
  const linkLine = html.split("\n").find((l) => l.includes("faq-section"));
  console.log(linkLine ?? html.slice(0, 500));
  console.log("==========================================================");
}
