import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { addAdminProfessionalNote } from "@/lib/admin-professional-crm";

const MAX_NOTE_LENGTH = 4000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { body: noteBody } = (body ?? {}) as { body?: unknown };
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

  const ok = await addAdminProfessionalNote(id, noteBody.trim());
  if (!ok) {
    return NextResponse.json({ error: "Não foi possível salvar a nota agora." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
