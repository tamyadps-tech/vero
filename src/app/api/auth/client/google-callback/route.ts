import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSupabaseAnon } from "@/lib/supabase-anon";
import { setSessionCookies } from "@/lib/auth-session";
import { ensureClientForAuthUser } from "@/lib/client-session";

/**
 * Recebe o access/refresh token que o próprio navegador já extraiu do
 * fragmento da URL de callback (fluxo implícito — ver
 * getSupabaseBrowserClient) e confirma que o access token é legítimo
 * antes de abrir sessão. Nunca confiamos direto no que o cliente manda:
 * `getUser` verifica o token contra o próprio Supabase Auth.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { accessToken, refreshToken, expiresIn } = (body ?? {}) as {
    accessToken?: unknown;
    refreshToken?: unknown;
    expiresIn?: unknown;
  };
  if (
    typeof accessToken !== "string" ||
    !accessToken ||
    typeof refreshToken !== "string" ||
    !refreshToken
  ) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const anon = getSupabaseAnon();
  if (!admin || !anon) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const { data: userData, error: userError } = await anon.auth.getUser(accessToken);
  if (userError || !userData.user) {
    console.error(
      "[auth/client/google-callback] Failed to verify access token:",
      userError?.message
    );
    return NextResponse.json(
      { error: "Não foi possível concluir o login com Google. Tente novamente." },
      { status: 401 }
    );
  }

  const authUser = userData.user;
  if (!authUser.email) {
    return NextResponse.json(
      { error: "Sua conta Google precisa ter um email associado." },
      { status: 400 }
    );
  }

  const client = await ensureClientForAuthUser(admin, authUser);
  if (!client) {
    return NextResponse.json(
      { error: "Não foi possível entrar agora. Tente novamente." },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true });
  setSessionCookies(response, "client", {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: typeof expiresIn === "number" ? expiresIn : 3600,
  });
  return response;
}
