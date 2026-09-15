import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientFromAccessToken } from "@/lib/client-session";
import { readAccessToken } from "@/lib/read-session-token";
import { performLogin } from "@/lib/perform-login";
import { isValidPhoneNumber } from "@/lib/whatsapp";

const MIN_PASSWORD_LENGTH = 8;

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { fullName, phoneNumber, currentPassword, newPassword } = (body ?? {}) as {
    fullName?: unknown;
    phoneNumber?: unknown;
    currentPassword?: unknown;
    newPassword?: unknown;
  };

  const name = typeof fullName === "string" ? fullName.trim() : "";
  if (fullName !== undefined && name.length < 3) {
    return NextResponse.json({ error: "Informe seu nome completo." }, { status: 400 });
  }

  const phone = typeof phoneNumber === "string" ? phoneNumber.trim() : "";
  if (phoneNumber !== undefined && phone && !isValidPhoneNumber(phone)) {
    return NextResponse.json(
      { error: "Telefone inválido — use o formato +5511999998888." },
      { status: 400 }
    );
  }

  const wantsPasswordChange = newPassword !== undefined;
  const newPass = typeof newPassword === "string" ? newPassword : "";
  if (wantsPasswordChange && newPass.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `A nova senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` },
      { status: 400 }
    );
  }

  const currentPass = typeof currentPassword === "string" ? currentPassword : "";
  if (wantsPasswordChange && !currentPass) {
    return NextResponse.json(
      { error: "Informe sua senha atual pra confirmar a troca." },
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

  const accessToken = await readAccessToken("client");
  const client = await getClientFromAccessToken(accessToken);
  if (!client) {
    return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
  }

  if (wantsPasswordChange) {
    const loginResult = await performLogin(client.email, currentPass);
    if ("error" in loginResult) {
      return NextResponse.json({ error: "Senha atual incorreta." }, { status: 403 });
    }

    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      client.auth_user_id,
      { password: newPass }
    );
    if (passwordError) {
      console.error("[client/profile] Failed to update password:", passwordError.message);
      return NextResponse.json(
        { error: "Não foi possível trocar a senha agora." },
        { status: 500 }
      );
    }
  }

  if (fullName !== undefined || phoneNumber !== undefined) {
    const update: Record<string, string | null> = {};
    if (fullName !== undefined) update.full_name = name;
    if (phoneNumber !== undefined) update.phone_number = phone || null;

    const { error } = await supabase.from("clients").update(update).eq("id", client.id);
    if (error) {
      console.error("[client/profile] Failed to update profile:", error.message);
      return NextResponse.json(
        { error: "Não foi possível salvar agora." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
