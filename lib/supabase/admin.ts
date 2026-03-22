import { createClient } from '@supabase/supabase-js'

// Este cliente tiene "superpoderes" y solo debe usarse en el servidor
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/** Alias usado por rutas API y acciones que esperan un factory (mismo cliente que supabaseAdmin). */
export function createServiceRoleClient() {
  return supabaseAdmin;
}