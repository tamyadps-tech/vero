import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Client-only client (chave pública/anon), usado exclusivamente pro
 * fluxo de OAuth (Google), que precisa rodar no navegador — o redirect
 * pra Google não dá pra fazer numa rota de servidor. Nunca use isso pra
 * outra coisa: login/senha continua passando pelas rotas de API, com
 * cookies httpOnly.
 *
 * `flowType: "implicit"` (não "pkce") de propósito: o PKCE depende do
 * navegador guardar um "code_verifier" em localStorage durante a
 * ida-e-volta pro Google, e isso vinha falhando de forma consistente pra
 * usuárias reais (erro "code challenge does not match previously saved
 * code verifier") — inclusive em navegadores com proteção contra
 * rastreamento mais agressiva (Brave, Safari ITP), que podem não
 * preservar localStorage nessa viagem redonda. No fluxo implícito o
 * Supabase devolve o token pronto no fragmento da própria URL de
 * callback, sem precisar de nenhum segredo guardado no navegador antes.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        flowType: "implicit",
        // Lemos o token do fragmento na mão em GoogleCallbackClient —
        // desliga a detecção automática pra ela não competir com isso.
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
