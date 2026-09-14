import { NextResponse } from "next/server";
import { performLogin } from "@/lib/perform-login";
import { setSessionCookies } from "@/lib/auth-session";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "Informe seu email." }, { status: 400 });
  }
  if (typeof password !== "string" || !password) {
    return NextResponse.json({ error: "Informe sua senha." }, { status: 400 });
  }

  const result = await performLogin(email.trim(), password);
  if ("error" in result) {
    if (result.error === "not_configured") {
      return NextResponse.json(
        { error: "Supabase ainda não está configurado." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Email ou senha incorretos." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setSessionCookies(response, "client", result.session);
  return response;
}
