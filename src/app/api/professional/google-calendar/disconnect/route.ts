import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";

export async function POST() {
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
    .from("professionals")
    .update({ google_calendar_refresh_token: null, google_calendar_email: null })
    .eq("id", professionalId);

  if (error) {
    console.error("[google-calendar/disconnect] Failed to clear tokens:", error.message);
    return NextResponse.json(
      { error: "Não foi possível desconectar agora." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
