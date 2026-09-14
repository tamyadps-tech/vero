import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { isAssessmentTemplateSlug } from "@/lib/assessments";
import { setAssessmentRelease } from "@/lib/assessment-releases";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { templateSlug, released } = (body ?? {}) as {
    templateSlug?: unknown;
    released?: unknown;
  };

  if (!isAssessmentTemplateSlug(templateSlug)) {
    return NextResponse.json({ error: "Teste inválido." }, { status: 400 });
  }
  if (typeof released !== "boolean") {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
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

  const result = await setAssessmentRelease(professionalId, clientId, templateSlug, released);
  if (result.error) {
    const status = result.error === "Cliente não encontrado." ? 403 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, released });
}
