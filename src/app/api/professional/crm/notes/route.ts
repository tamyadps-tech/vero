import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { ensureContactId, addNote } from "@/lib/professional-crm";

const MAX_NOTE_LENGTH = 4000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { contactId, clientId, body: noteBody } = (body ?? {}) as {
    contactId?: unknown;
    clientId?: unknown;
    body?: unknown;
  };

  if (typeof contactId !== "string" && typeof clientId !== "string") {
    return NextResponse.json({ error: "Informe contactId ou clientId." }, { status: 400 });
  }
  if (typeof noteBody !== "string" || noteBody.trim().length === 0) {
    return NextResponse.json({ error: "A nota não pode ficar em branco." }, { status: 400 });
  }
  if (noteBody.length > MAX_NOTE_LENGTH) {
    return NextResponse.json({ error: "Nota muito longa." }, { status: 400 });
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

  const resolvedContactId = await ensureContactId(professionalId, {
    contactId: typeof contactId === "string" ? contactId : undefined,
    clientId: typeof clientId === "string" ? clientId : undefined,
  });
  if (!resolvedContactId) {
    return NextResponse.json({ error: "Contato não encontrado." }, { status: 404 });
  }

  const ok = await addNote(resolvedContactId, noteBody.trim());
  if (!ok) {
    return NextResponse.json({ error: "Não foi possível salvar a nota agora." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, contactId: resolvedContactId });
}
