import { createClient } from "@supabase/supabase-js";

/**
 * Server-only client using a chave anon/publishable — usado só pra
 * operações de auth (login, validar/renovar sessão) que rodam no
 * contexto do próprio usuário, não com privilégio de service role.
 */
export function getSupabaseAnon() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
