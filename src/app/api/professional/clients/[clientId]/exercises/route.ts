import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { isExerciseSlug } from "@/lib/exercises";
import { setExerciseRelease } from "@/lib/exercise-releases";
import { professionalHasClient } from "@/lib/assessment-releases";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const templateSlug = new URL(request.url).searchParams.get("templateSlug");

  if (!isExerciseSlug(templateSlug)) {
    return NextResponse.json({ error: "Exercício inválido." }, { status: 400 });
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

  const hasClient = await professionalHasClient(professionalId, clientId);
  if (!hasClient) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("exercise_responses")
    .select("answers, created_at")
    .eq("client_id", clientId)
    .eq("template_slug", templateSlug)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[professional/clients/exercises] Failed to load response:", error.message);
    return NextResponse.json({ error: "Não foi possível carregar agora." }, { status: 500 });
  }

  return NextResponse.json({ response: data ?? null });
}

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

  if (!isExerciseSlug(templateSlug)) {
    return NextResponse.json({ error: "Exercício inválido." }, { status: 400 });
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

  const result = await setExerciseRelease(professionalId, clientId, templateSlug, released);
  if (result.error) {
    const status = result.error === "Cliente não encontrado." ? 403 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, released });
}
