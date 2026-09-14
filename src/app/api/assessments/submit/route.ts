import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getAssessmentTemplate, scoreAssessment } from "@/lib/assessments";
import { getClientIdFromAccessToken } from "@/lib/client-session";
import { readAccessToken } from "@/lib/read-session-token";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { templateSlug, answers } = (body ?? {}) as {
    templateSlug?: unknown;
    answers?: unknown;
  };

  const template =
    typeof templateSlug === "string" ? getAssessmentTemplate(templateSlug) : undefined;
  if (!template) {
    return NextResponse.json({ error: "Teste inválido." }, { status: 400 });
  }

  if (!Array.isArray(answers) || answers.some((a) => typeof a !== "number")) {
    return NextResponse.json({ error: "Respostas inválidas." }, { status: 400 });
  }

  let result;
  try {
    // Recalcula o score no servidor — nunca confia no score que o
    // navegador mandaria de volta.
    result = scoreAssessment(template, answers as number[]);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Respostas inválidas." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Autoavaliação ainda não está conectada ao banco de dados. Tente novamente em breve.",
      },
      { status: 503 }
    );
  }

  const accessToken = await readAccessToken("client");
  const clientId = await getClientIdFromAccessToken(accessToken);
  if (!clientId) {
    return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
  }

  const { error: insertError } = await supabase.from("assessment_responses").insert({
    client_id: clientId,
    template_slug: template.slug,
    answers,
    score: result.score,
    severity: result.severity,
  });

  if (insertError) {
    console.error("[assessments/submit] insert failed:", insertError.message);
    return NextResponse.json(
      { error: "Não foi possível salvar agora. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, ...result });
}
