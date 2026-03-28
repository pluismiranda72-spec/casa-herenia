/**
 * formData envía checkboxes/booleans como string ("true" | "false").
 * Convierte a boolean nativo para columnas PostgreSQL boolean / Supabase.
 */
export function parseIsRedirectFromFormData(formData: FormData): boolean {
  const v =
    formData.get("is_redirect") ??
    formData.get("isRedirect") ??
    formData.get("is-redirect");
  if (v == null) return false;
  const s = String(v).trim().toLowerCase();
  return s === "true" || s === "1" || s === "on" || s === "yes";
}

/** instagram_url | instagramUrl (compatibilidad con el cliente). */
export function parseInstagramUrlFromFormData(formData: FormData): string {
  const raw =
    formData.get("instagram_url") ??
    formData.get("instagramUrl") ??
    formData.get("instagramURL");
  return typeof raw === "string" ? raw.trim() : "";
}
