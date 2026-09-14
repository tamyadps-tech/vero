import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { sendSessionConfirmation } from "@/lib/session-updates";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  const origin = new URL(request.url).origin;
  const result = await sendSessionConfirmation(supabase, id, professionalId, origin);

  if (result.reason === "not_found") {
    return NextResponse.json({ error: "Sessão não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, sent: result.sent });
}
