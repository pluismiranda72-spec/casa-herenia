import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con service_role para uso solo en servidor (cron, jobs).
 * Bypasea RLS. No exponer a cliente.
 * Requiere SUPABASE_SERVICE_ROLE_KEY en .env.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
