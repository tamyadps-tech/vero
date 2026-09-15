import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { SessionStatus } from "@/lib/admin-sessions";

export interface ClientProgressSession {
  id: string;
  scheduled_at: string;
  status: SessionStatus;
  topics: string[] | null;
  homework: string | null;
  next_session_at: string | null;
  professional: { full_name: string } | null;
  review: { rating: number; comment: string | null } | null;
}

export interface ClientAssessmentResponse {
  id: string;
  template_slug: string;
  score: number;
  severity: string;
  created_at: string;
}

export interface ClientExerciseResponse {
  id: string;
  template_slug: string;
  answers: string[];
  created_at: string;
}

export interface ClientProgress {
  full_name: string;
  sessions: ClientProgressSession[];
  assessmentResponses: ClientAssessmentResponse[];
  exerciseResponses: ClientExerciseResponse[];
}

/** Retorna null quando o Supabase ainda não está configurado. */
export async function getClientProgress(clientId: string): Promise<ClientProgress | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, full_name")
    .eq("id", clientId)
    .maybeSingle();

  if (clientError || !client) {
    if (clientError) {
      console.error("[client-progress] Failed to load client:", clientError.message);
    }
    return null;
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select(
      "id, scheduled_at, status, topics, homework, next_session_at, professional:professionals(full_name), review:reviews(rating, comment)"
    )
    .eq("client_id", client.id)
    .order("scheduled_at", { ascending: false });

  if (sessionsError) {
    console.error("[client-progress] Failed to load sessions:", sessionsError.message);
  }

  const { data: assessmentResponses, error: assessmentsError } = await supabase
    .from("assessment_responses")
    .select("id, template_slug, score, severity, created_at")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  if (assessmentsError) {
    console.error(
      "[client-progress] Failed to load assessment responses:",
      assessmentsError.message
    );
  }

  const { data: exerciseResponses, error: exercisesError } = await supabase
    .from("exercise_responses")
    .select("id, template_slug, answers, created_at")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  if (exercisesError) {
    console.error(
      "[client-progress] Failed to load exercise responses:",
      exercisesError.message
    );
  }

  return {
    full_name: client.full_name,
    sessions: (sessions ?? []) as unknown as ClientProgressSession[],
    assessmentResponses: assessmentResponses ?? [],
    exerciseResponses: exerciseResponses ?? [],
  };
}
