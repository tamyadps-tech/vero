import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSupabaseAnon } from "@/lib/supabase-anon";

export interface ClientAccount {
  id: string;
  full_name: string;
  email: string;
  auth_user_id: string;
}

/**
 * Resolve o cliente logado a partir do access token da sessão (Supabase
 * Auth). Retorna null se o token for inválido/expirado ou se não houver
 * cliente vinculado a esse usuário.
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

  const { data } = await admin
    .from("clients")
    .select("id, full_name, email, auth_user_id")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();

  return data ?? null;
}

/** Resolve só o id do cliente logado — nunca confia num clientId vindo do corpo da requisição. */
export async function getClientIdFromAccessToken(
  accessToken: string | undefined
): Promise<string | null> {
  const client = await getClientFromAccessToken(accessToken);
  return client?.id ?? null;
}
