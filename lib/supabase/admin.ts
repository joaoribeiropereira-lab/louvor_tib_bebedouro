import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com a chave service_role. Ignora o RLS.
 * Use SOMENTE no servidor, depois de exigirAdmin(), e só para a API de
 * administração do Auth (convidar e bloquear usuários).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  return createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } });
}
