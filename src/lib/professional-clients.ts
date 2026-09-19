import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { computeEngagementStatus, type EngagementStatus } from "@/lib/client-engagement";
import { ASSESSMENT_TEMPLATES } from "@/lib/assessments";
import { fetchReleasedSlugsByClient } from "@/lib/assessment-releases";
import { EXERCISES } from "@/lib/exercises";
import { fetchReleasedExerciseSlugsByClient } from "@/lib/exercise-releases";

export interface ClientLatestAssessment {
  templateSlug: string;
  score: number;
  severity: string;
  createdAt: string;
}

export interface ClientLatestExercise {
  templateSlug: string;
  createdAt: string;
}

export interface ProfessionalClient {
  id: string;
  full_name: string;
  email: string;
  sessionCount: number;
  lastSessionAt: string | null;
  /** Data da primeira sessão — usado pra calcular CAC (cliente "novo" num período). */
  firstSessionAt: string | null;
  /** Valor pago (histórico) por esse cliente — o "lifetime value" dele. */
  totalPaidCents: number;
  hasUpcomingSession: boolean;
  engagementStatus: EngagementStatus;
  /** Resultado mais recente de cada autoavaliação (PHQ-9, GAD-7, Roda da Vida) que o cliente já fez. */
  latestAssessments: ClientLatestAssessment[];
  /** Slugs de teste que este profissional já liberou pra esse cliente. */
  releasedAssessmentSlugs: string[];
  /** Data da resposta mais recente de cada exercício que o cliente já fez. */
  latestExercises: ClientLatestExercise[];
  /** Slugs de exercício que este profissional já liberou pra esse cliente. */
  releasedExerciseSlugs: string[];
}

type SessionRow = {
  scheduled_at: string;
  status: string;
  client: { id: string; full_name: string; email: string } | null;
  payment: { status: string; amount_cents: number } | null;
};

type AssessmentResponseRow = {
  client_id: string;
  template_slug: string;
  score: number;
  severity: string;
  created_at: string;
};

type ExerciseResponseRow = {
  client_id: string;
  template_slug: string;
  created_at: string;
};

type ClientAccumulator = Omit<
  ProfessionalClient,
  | "engagementStatus"
  | "latestAssessments"
  | "releasedAssessmentSlugs"
  | "latestExercises"
  | "releasedExerciseSlugs"
>;

/**
 * Busca o resultado mais recente de cada teste (PHQ-9, GAD-7, Roda da
 * Vida) por cliente. Autoavaliação é do cliente, não do profissional —
 * aqui só olhamos os clientes que já têm sessão com este profissional,
 * pra ele acompanhar a evolução de quem atende.
 */
async function fetchLatestAssessmentsByClient(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  clientIds: string[]
): Promise<Map<string, ClientLatestAssessment[]>> {
  const byClient = new Map<string, ClientLatestAssessment[]>();
  if (!supabase || clientIds.length === 0) return byClient;

  const { data, error } = await supabase
    .from("assessment_responses")
    .select("client_id, template_slug, score, severity, created_at")
    .in("client_id", clientIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[professional-clients] Failed to load assessments:", error.message);
    return byClient;
  }

  const seenTemplates = new Map<string, Set<string>>();
  for (const row of (data ?? []) as AssessmentResponseRow[]) {
    const seen = seenTemplates.get(row.client_id) ?? new Set<string>();
    if (seen.has(row.template_slug)) continue;
    seen.add(row.template_slug);
    seenTemplates.set(row.client_id, seen);

    const list = byClient.get(row.client_id) ?? [];
    list.push({
      templateSlug: row.template_slug,
      score: row.score,
      severity: row.severity,
      createdAt: row.created_at,
    });
    byClient.set(row.client_id, list);
  }

  const templateOrder = ASSESSMENT_TEMPLATES.map((t) => t.slug);
  for (const list of byClient.values()) {
    list.sort((a, b) => templateOrder.indexOf(a.templateSlug) - templateOrder.indexOf(b.templateSlug));
  }

  return byClient;
}

/**
 * Busca a resposta mais recente de cada exercício por cliente — mesmo
 * padrão de `fetchLatestAssessmentsByClient`, mas sem score (o
 * exercício é texto livre, sem pontuação).
 */
async function fetchLatestExercisesByClient(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  clientIds: string[]
): Promise<Map<string, ClientLatestExercise[]>> {
  const byClient = new Map<string, ClientLatestExercise[]>();
  if (!supabase || clientIds.length === 0) return byClient;

  const { data, error } = await supabase
    .from("exercise_responses")
    .select("client_id, template_slug, created_at")
    .in("client_id", clientIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[professional-clients] Failed to load exercises:", error.message);
    return byClient;
  }

  const seenTemplates = new Map<string, Set<string>>();
  for (const row of (data ?? []) as ExerciseResponseRow[]) {
    const seen = seenTemplates.get(row.client_id) ?? new Set<string>();
    if (seen.has(row.template_slug)) continue;
    seen.add(row.template_slug);
    seenTemplates.set(row.client_id, seen);

    const list = byClient.get(row.client_id) ?? [];
    list.push({ templateSlug: row.template_slug, createdAt: row.created_at });
    byClient.set(row.client_id, list);
  }

  const templateOrder = EXERCISES.map((e) => e.slug);
  for (const list of byClient.values()) {
    list.sort((a, b) => templateOrder.indexOf(a.templateSlug) - templateOrder.indexOf(b.templateSlug));
  }

  return byClient;
}

/**
 * CRM básico: agrega as sessões do profissional por cliente, sem tabela
 * própria — a "carteira de clientes" já está implícita em `sessions`.
 * Retorna null quando o Supabase ainda não está configurado.
 */
export async function listProfessionalClients(
  professionalId: string
): Promise<ProfessionalClient[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("sessions")
    .select(
      "scheduled_at, status, client:clients(id, full_name, email), payment:payments(status, amount_cents)"
    )
    .eq("professional_id", professionalId)
    .order("scheduled_at", { ascending: false });

  if (error) {
    console.error("[professional-clients] Failed to list clients:", error.message);
    return [];
  }

  const now = new Date();
  const byClient = new Map<string, ClientAccumulator>();
  for (const row of (data ?? []) as unknown as SessionRow[]) {
    const client = row.client;
    if (!client) continue;

    const entry = byClient.get(client.id) ?? {
      id: client.id,
      full_name: client.full_name,
      email: client.email,
      sessionCount: 0,
      lastSessionAt: null,
      firstSessionAt: null,
      totalPaidCents: 0,
      hasUpcomingSession: false,
    };

    entry.sessionCount += 1;
    if (!entry.lastSessionAt || row.scheduled_at > entry.lastSessionAt) {
      entry.lastSessionAt = row.scheduled_at;
    }
    if (!entry.firstSessionAt || row.scheduled_at < entry.firstSessionAt) {
      entry.firstSessionAt = row.scheduled_at;
    }
    if (row.payment?.status === "pago") {
      entry.totalPaidCents += row.payment.amount_cents;
    }
    if (row.status === "agendada" && new Date(row.scheduled_at) > now) {
      entry.hasUpcomingSession = true;
    }

    byClient.set(client.id, entry);
  }

  const clientIds = Array.from(byClient.keys());
  const [assessmentsByClient, releasedByClient, exercisesByClient, releasedExercisesByClient] =
    await Promise.all([
      fetchLatestAssessmentsByClient(supabase, clientIds),
      fetchReleasedSlugsByClient(professionalId, clientIds),
      fetchLatestExercisesByClient(supabase, clientIds),
      fetchReleasedExerciseSlugsByClient(professionalId, clientIds),
    ]);

  return Array.from(byClient.values())
    .map((entry) => ({
      ...entry,
      engagementStatus: computeEngagementStatus({
        lastSessionAt: entry.lastSessionAt,
        hasUpcomingSession: entry.hasUpcomingSession,
        now,
      }),
      latestAssessments: assessmentsByClient.get(entry.id) ?? [],
      releasedAssessmentSlugs: Array.from(releasedByClient.get(entry.id) ?? []),
      latestExercises: exercisesByClient.get(entry.id) ?? [],
      releasedExerciseSlugs: Array.from(releasedExercisesByClient.get(entry.id) ?? []),
    }))
    .sort((a, b) => (b.lastSessionAt ?? "").localeCompare(a.lastSessionAt ?? ""));
}
