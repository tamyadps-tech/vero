import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { deleteLead } from "@/lib/professional-crm";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const { contactId } = await params;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase ainda não está configurado." }, { status: 503 });
  }

  const accessToken = await readAccessToken("professional");
  const professionalId = await getProfessionalIdFromAccessToken(accessToken);
  if (!professionalId) {
    return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
  }

  const ok = await deleteLead(professionalId, contactId);
  if (!ok) {
    return NextResponse.json(
      { error: "Não foi possível apagar — só leads (contatos sem sessão) podem ser removidos." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
