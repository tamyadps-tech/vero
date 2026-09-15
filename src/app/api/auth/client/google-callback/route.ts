import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { setSessionCookies } from "@/lib/auth-session";
import { ensureClientForAuthUser } from "@/lib/client-session";

interface PkceTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: { id: string; email?: string; user_metadata?: Record<string, unknown> };
  error?: string;
  error_description?: string;
}

/**
 * Troca o `code` do OAuth do Google (fluxo PKCE) por uma sessão — feito
 * aqui no servidor, e não no navegador, porque a chamada equivalente do
 * SDK no navegador (`exchangeCodeForSession`) vem falhando com um erro
 * de baixo nível do próprio Fetch API do browser antes da requisição
 * sequer sair. O servidor usa as mesmas variáveis (SUPABASE_URL /
 * SUPABASE_ANON_KEY) que já autenticam login por senha com sucesso.
 */
async function exchangeCodeForSession(
  code: string,
  codeVerifier: string
): Promise<{ data?: PkceTokenResponse; error?: string }> {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { error: "not_configured" };

  const response = await fetch(`${url}/auth/v1/token?grant_type=pkce`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: anonKey },
    body: JSON.stringify({ auth_code: code, code_verifier: codeVerifier }),
  });

  const data = (await response.json().catch(() => ({}))) as PkceTokenResponse;
  if (!response.ok) {
    console.error(
      "[auth/client/google-callback] PKCE exchange failed:",
      response.status,
      data.error_description ?? data.error
    );
    return { error: data.error_description ?? data.error ?? "exchange_failed" };
  }

  return { data };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { code, codeVerifier } = (body ?? {}) as { code?: unknown; codeVerifier?: unknown };
  if (typeof code !== "string" || !code || typeof codeVerifier !== "string" || !codeVerifier) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const { data: tokenData, error: exchangeError } = await exchangeCodeForSession(
    code,
    codeVerifier
  );
  if (exchangeError || !tokenData?.access_token || !tokenData.refresh_token || !tokenData.user) {
    return NextResponse.json(
      { error: "Não foi possível concluir o login com Google. Tente novamente." },
      { status: 401 }
    );
  }

  const authUser = tokenData.user;
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
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in ?? 3600,
  });
  return response;
}
