import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSupabaseAnon } from "@/lib/supabase-anon";
import { setSessionCookies } from "@/lib/auth-session";

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
  const email = authUser.email?.toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: "Sua conta Google precisa ter um email associado." },
      { status: 400 }
    );
  }

  // Já existe um cliente vinculado a esse usuário do Supabase Auth —
  // login normal.
  const { data: byAuthId } = await admin
    .from("clients")
    .select("id")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  if (!byAuthId) {
    // Cliente com esse email já existe (veio do cadastro por senha) mas
    // ainda não tem esse login do Google vinculado — vincula em vez de
    // criar um cliente duplicado.
    const { data: byEmail } = await admin
      .from("clients")
      .select("id, auth_user_id")
      .eq("email", email)
      .maybeSingle();

    if (byEmail && !byEmail.auth_user_id) {
      const { error: linkError } = await admin
        .from("clients")
        .update({ auth_user_id: authUser.id })
        .eq("id", byEmail.id);
      if (linkError) {
        console.error("[auth/client/google-callback] link failed:", linkError.message);
        return NextResponse.json(
          { error: "Não foi possível entrar agora. Tente novamente." },
          { status: 500 }
        );
      }
    } else if (!byEmail) {
      const fullName =
        (authUser.user_metadata?.full_name as string | undefined) ??
        (authUser.user_metadata?.name as string | undefined) ??
        email.split("@")[0];

      const { error: insertError } = await admin.from("clients").insert({
        auth_user_id: authUser.id,
        full_name: fullName,
        email,
      });
      if (insertError) {
        console.error("[auth/client/google-callback] insert failed:", insertError.message);
        return NextResponse.json(
          { error: "Não foi possível criar sua conta agora. Tente novamente." },
          { status: 500 }
        );
      }
    }
    // Se `byEmail` já tem auth_user_id (de outro provedor/conta), segue
    // em frente mesmo assim — o login funciona pelo auth_user_id que
    // acabamos de autenticar; não haverá client vinculado a esse
    // auth_user_id específico até a próxima verificação, então nesse
    // caso raro (mesmo email, contas diferentes) o acesso fica só pelo
    // outro vínculo já existente.
  }

  const response = NextResponse.json({ ok: true });
  setSessionCookies(response, "client", { access_token, refresh_token, expires_in });
  return response;
}
