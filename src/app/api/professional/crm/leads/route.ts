import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { createLead } from "@/lib/professional-crm";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { fullName, email, phone } = (body ?? {}) as {
    fullName?: unknown;
    email?: unknown;
    phone?: unknown;
  };

  if (typeof fullName !== "string" || fullName.trim().length < 2) {
    return NextResponse.json({ error: "Informe o nome do contato." }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Informe um email válido." }, { status: 400 });
  }
  if (phone !== undefined && phone !== null && typeof phone !== "string") {
    return NextResponse.json({ error: "Telefone inválido." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase ainda não está configurado." }, { status: 503 });
  }

  const accessToken = await readAccessToken("professional");
  const professionalId = await getProfessionalIdFromAccessToken(accessToken);
  if (!professionalId) {
    return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
  }

  const result = await createLead(professionalId, {
    fullName: fullName.trim(),
    email: email.trim(),
    phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
  });

  if (!result.ok) {
    if (result.reason === "duplicate") {
      return NextResponse.json(
        { error: "Você já tem um contato com esse email." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Não foi possível criar o contato agora." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, contactId: result.contactId });
}
