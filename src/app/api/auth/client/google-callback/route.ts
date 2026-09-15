import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSupabaseAnon } from "@/lib/supabase-anon";
import { setSessionCookies } from "@/lib/auth-session";
import { ensureClientForAuthUser } from "@/lib/client-session";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { access_token, refresh_token, expires_in } = (body ?? {}) as {
    access_token?: unknown;
    refresh_token?: unknown;
    expires_in?: unknown;
  };

  if (
    typeof access_token !== "string" ||
    !access_token ||
    typeof refresh_token !== "string" ||
    !refresh_token ||
    typeof expires_in !== "number"
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

  const { data: userData, error: userError } = await anon.auth.getUser(access_token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
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
  setSessionCookies(response, "client", { access_token, refresh_token, expires_in });
  return response;
}
