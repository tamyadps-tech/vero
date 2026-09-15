import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Client-only client (chave pública/anon), usado exclusivamente pro
 * fluxo de OAuth (Google), que precisa rodar no navegador — o redirect
 * pra Google e a troca do code por sessão não dá pra fazer numa rota de
 * servidor. Nunca use isso pra outra coisa: login/senha continua
 * passando pelas rotas de API, com cookies httpOnly.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  if (!client) {
    client = createClient(url, anonKey);
  }
  return client;
}
