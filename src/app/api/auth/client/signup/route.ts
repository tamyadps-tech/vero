import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { setSessionCookies } from "@/lib/auth-session";
import { performLogin } from "@/lib/perform-login";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { fullName, email, password } = (body ?? {}) as {
    fullName?: unknown;
    email?: unknown;
    password?: unknown;
  };

  const name = typeof fullName === "string" ? fullName.trim() : "";
  if (name.length < 3) {
    return NextResponse.json({ error: "Informe seu nome completo." }, { status: 400 });
  }

  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(normalizedEmail)) {
    return NextResponse.json({ error: "Informe um email válido." }, { status: 400 });
  }

  const pass = typeof password === "string" ? password : "";
  if (pass.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password: pass,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    if (authError?.code === "email_exists") {
      return NextResponse.json(
        { error: "Já existe uma conta com esse email. Faça login." },
        { status: 409 }
      );
    }
    console.error("[auth/client/signup] Failed to create auth user:", authError?.message);
    return NextResponse.json(
      { error: "Não foi possível criar a conta agora." },
      { status: 500 }
    );
  }

  const { error } = await supabase.from("clients").insert({
    auth_user_id: authUser.user.id,
    full_name: name,
    email: normalizedEmail,
  });

  if (error) {
    await supabase.auth.admin.deleteUser(authUser.user.id).catch(() => {});

    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Já existe uma conta com esse email. Faça login." },
        { status: 409 }
      );
    }
    console.error("[auth/client/signup] Insert failed:", error.message);
    return NextResponse.json(
      { error: "Não foi possível criar a conta agora." },
      { status: 500 }
    );
  }

  // Loga direto depois de criar a conta, pra não pedir email/senha de novo.
  const loginResult = await performLogin(normalizedEmail, pass);
  if ("error" in loginResult) {
    return NextResponse.json({ ok: true, autoLogin: false });
  }

  const response = NextResponse.json({ ok: true, autoLogin: true });
  setSessionCookies(response, "client", loginResult.session);
  return response;
}
