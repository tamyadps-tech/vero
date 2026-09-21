import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { updateAdminProfessionalTags } from "@/lib/admin-professional-crm";

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

export async function PATCH(
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

  const { tags } = (body ?? {}) as { tags?: unknown };
  if (
    !Array.isArray(tags) ||
    tags.length > MAX_TAGS ||
    tags.some((t) => typeof t !== "string" || t.trim().length === 0 || t.length > MAX_TAG_LENGTH)
  ) {
    return NextResponse.json({ error: "Tags inválidas (máx. 10, até 30 caracteres cada)." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase ainda não está configurado." }, { status: 503 });
  }

  const cleanedTags = Array.from(new Set(tags.map((t) => t.trim())));
  const ok = await updateAdminProfessionalTags(id, cleanedTags);
  if (!ok) {
    return NextResponse.json({ error: "Não foi possível salvar agora." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
