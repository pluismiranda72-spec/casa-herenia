/**
 * Verificación del token de Cloudflare Turnstile en el servidor.
 * POST a https://challenges.cloudflare.com/turnstile/v0/siteverify
 */
const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Sin clave: no exigir Turnstile (ej. desarrollo local)
  if (!token?.trim()) return false;

  const formData = new URLSearchParams();
  formData.set("secret", secret);
  formData.set("response", token);

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (e) {
    console.error("[turnstile] siteverify error:", e);
    return false;
  }
}
