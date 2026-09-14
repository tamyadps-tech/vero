import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slotId: string }> }
) {
  const { slotId } = await params;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const accessToken = await readAccessToken("professional");
  const professionalId = await getProfessionalIdFromAccessToken(accessToken);
  if (!professionalId) {
    return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
  }

  const { error } = await supabase
    .from("availability_slots")
    .delete()
    .eq("id", slotId)
    .eq("professional_id", professionalId);

  if (error) {
    console.error("[professional/availability] delete failed:", error.message);
    return NextResponse.json(
      { error: "Não foi possível remover agora." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
