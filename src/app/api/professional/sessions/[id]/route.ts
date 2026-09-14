import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { parseSessionUpdate, notifySessionCompletion } from "@/lib/session-updates";

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

  const result = parseSessionUpdate(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

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

  // O filtro por professional_id aqui garante que o profissional só edita
  // as próprias sessões, mesmo que o :id na URL seja de outra pessoa.
  const { data: updatedRows, error } = await supabase
    .from("sessions")
    .update(result.data)
    .eq("id", id)
    .eq("professional_id", professionalId)
    .select("id");

  if (error) {
    console.error("[professional/sessions] update failed:", error.message);
    return NextResponse.json(
      { error: "Não foi possível salvar agora." },
      { status: 500 }
    );
  }

  if (!updatedRows || updatedRows.length === 0) {
    return NextResponse.json({ error: "Sessão não encontrada." }, { status: 404 });
  }

  if (result.data.status === "concluida") {
    await notifySessionCompletion(supabase, id, new URL(request.url).origin);
  }

  return NextResponse.json({ ok: true });
}
