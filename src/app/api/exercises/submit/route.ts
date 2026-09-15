import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getExercise } from "@/lib/exercises";
import { getClientIdFromAccessToken } from "@/lib/client-session";
import { readAccessToken } from "@/lib/read-session-token";
import { isExerciseReleasedForClient } from "@/lib/exercise-releases";

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

  const exercise = typeof templateSlug === "string" ? getExercise(templateSlug) : undefined;
  if (!exercise) {
    return NextResponse.json({ error: "Exercício inválido." }, { status: 400 });
  }

  if (!Array.isArray(answers) || answers.some((a) => typeof a !== "string")) {
    return NextResponse.json({ error: "Respostas inválidas." }, { status: 400 });
  }
  if (answers.length !== exercise.prompts.length) {
    return NextResponse.json({ error: "Respostas inválidas." }, { status: 400 });
  }
  if ((answers as string[]).every((a) => a.trim().length === 0)) {
    return NextResponse.json(
      { error: "Escreva ao menos uma resposta antes de enviar." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      {
        error: "Exercício ainda não está conectado ao banco de dados. Tente novamente em breve.",
      },
      { status: 503 }
    );
  }

  const accessToken = await readAccessToken("client");
  const clientId = await getClientIdFromAccessToken(accessToken);
  if (!clientId) {
    return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
  }

  const isReleased = await isExerciseReleasedForClient(clientId, exercise.slug);
  if (!isReleased) {
    return NextResponse.json(
      { error: "Esse exercício ainda não foi liberado pelo seu profissional." },
      { status: 403 }
    );
  }

  const { error: insertError } = await supabase.from("exercise_responses").insert({
    client_id: clientId,
    template_slug: exercise.slug,
    answers,
  });

  if (insertError) {
    console.error("[exercises/submit] insert failed:", insertError.message);
    return NextResponse.json(
      { error: "Não foi possível salvar agora. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
