import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { computeEngagementStatus, type EngagementStatus } from "@/lib/client-engagement";

export interface ProfessionalClient {
  id: string;
  full_name: string;
  email: string;
  sessionCount: number;
  lastSessionAt: string | null;
  /** Valor pago (histórico) por esse cliente — o "lifetime value" dele. */
  totalPaidCents: number;
  hasUpcomingSession: boolean;
  engagementStatus: EngagementStatus;
}

type SessionRow = {
  scheduled_at: string;
  status: string;
  client: { id: string; full_name: string; email: string } | null;
  payment: { status: string; amount_cents: number } | null;
};

type ClientAccumulator = Omit<ProfessionalClient, "engagementStatus">;

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
      totalPaidCents: 0,
      hasUpcomingSession: false,
    };

    entry.sessionCount += 1;
    if (!entry.lastSessionAt || row.scheduled_at > entry.lastSessionAt) {
      entry.lastSessionAt = row.scheduled_at;
    }
    if (row.payment?.status === "pago") {
      entry.totalPaidCents += row.payment.amount_cents;
    }
    if (row.status === "agendada" && new Date(row.scheduled_at) > now) {
      entry.hasUpcomingSession = true;
    }

    byClient.set(client.id, entry);
  }

  return Array.from(byClient.values())
    .map((entry) => ({
      ...entry,
      engagementStatus: computeEngagementStatus({
        lastSessionAt: entry.lastSessionAt,
        hasUpcomingSession: entry.hasUpcomingSession,
        now,
      }),
    }))
    .sort((a, b) => (b.lastSessionAt ?? "").localeCompare(a.lastSessionAt ?? ""));
}
