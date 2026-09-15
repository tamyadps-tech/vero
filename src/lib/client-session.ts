import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSupabaseAnon } from "@/lib/supabase-anon";

export interface ClientAccount {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  auth_user_id: string;
}

interface AuthUserLike {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

/**
 * Garante que existe uma linha em `clients` vinculada a esse usuário do
 * Supabase Auth — criando (ou linkando por email) se ainda não existir.
 *
 * Existir no Supabase Auth e existir em `clients` são duas coisas
 * diferentes: um usuário pode autenticar com sucesso (senha ou Google) e
 * ainda assim não ter cliente vinculado — por exemplo se foi criado
 * direto no painel do Supabase, ou se algum passo de provisionamento
 * falhou no meio do caminho. Sem essa linha, o cliente cai num "login
 * funcionou mas a área não abre" sem explicação nenhuma. Por isso todo
 * ponto que resolve o cliente logado (não só o signup/callback) chama
 * isso — o sistema se autorrepara em vez de deixar a conta travada.
 */
export async function ensureClientForAuthUser(
  admin: SupabaseClient,
  authUser: AuthUserLike
): Promise<ClientAccount | null> {
  const { data: byAuthId } = await admin
    .from("clients")
    .select("id, full_name, email, phone_number, auth_user_id")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (byAuthId) return byAuthId;

  const email = authUser.email?.toLowerCase();
  if (!email) return null;

  const { data: byEmail } = await admin
    .from("clients")
    .select("id, full_name, email, phone_number, auth_user_id")
    .eq("email", email)
    .maybeSingle();

  if (byEmail && !byEmail.auth_user_id) {
    const { data: linked, error: linkError } = await admin
      .from("clients")
      .update({ auth_user_id: authUser.id })
      .eq("id", byEmail.id)
      .select("id, full_name, email, phone_number, auth_user_id")
      .maybeSingle();
    if (linkError) {
      console.error("[client-session] Failed to link existing client:", linkError.message);
      return null;
    }
    return linked;
  }

  // Email já vinculado a outra conta de auth — não criamos duplicata,
  // mesmo raro (mesmo email, contas diferentes).
  if (byEmail) return null;

  const fullName =
    (authUser.user_metadata?.full_name as string | undefined) ??
    (authUser.user_metadata?.name as string | undefined) ??
    email.split("@")[0];

  const { data: created, error: insertError } = await admin
    .from("clients")
    .insert({ auth_user_id: authUser.id, full_name: fullName, email })
    .select("id, full_name, email, phone_number, auth_user_id")
    .maybeSingle();

  if (insertError) {
    console.error("[client-session] Failed to create client:", insertError.message);
    return null;
  }

  return created;
}

/**
 * Resolve o cliente logado a partir do access token da sessão (Supabase
 * Auth). Retorna null se o token for inválido/expirado. Se o token é
 * válido mas ainda não existe cliente vinculado, provisiona um agora
 * (ver `ensureClientForAuthUser`) em vez de travar a conta num limbo.
 */
export async function getClientFromAccessToken(
  accessToken: string | undefined
): Promise<ClientAccount | null> {
  if (!accessToken) return null;

  const anon = getSupabaseAnon();
  const admin = getSupabaseAdmin();
  if (!anon || !admin) return null;

  const { data: userData, error } = await anon.auth.getUser(accessToken);
  if (error || !userData.user) return null;

  return ensureClientForAuthUser(admin, userData.user);
}

/** Resolve só o id do cliente logado — nunca confia num clientId vindo do corpo da requisição. */
export async function getClientIdFromAccessToken(
  accessToken: string | undefined
): Promise<string | null> {
  const client = await getClientFromAccessToken(accessToken);
  return client?.id ?? null;
}
