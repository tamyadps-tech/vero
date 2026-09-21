import { getSupabaseAdmin } from "@/lib/supabase-admin";

export interface AdminClientDirectoryRow {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  professionalNames: string[];
  sessionCount: number;
  totalPaidCents: number;
  lastSessionAt: string | null;
}

type SessionRow = {
  scheduled_at: string;
  client: { id: string; full_name: string; email: string; phone_number: string | null } | null;
  professional: { full_name: string } | null;
  payment: { status: string; amount_cents: number } | null;
};

/**
 * Diretório read-only de TODOS os clientes da plataforma, agregado a
 * partir de `sessions` (mesmo princípio de listProfessionalClients, sem
 * filtrar por profissional) — pra suporte/visibilidade do admin, sem
 * gerenciamento (notas/tags ficam só do lado do profissional dono do
 * cliente). Retorna null quando o Supabase ainda não está configurado.
 */
export async function listAllClientsDirectory(): Promise<AdminClientDirectoryRow[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("sessions")
    .select(
      "scheduled_at, client:clients(id, full_name, email, phone_number), professional:professionals(full_name), payment:payments(status, amount_cents)"
    )
    .order("scheduled_at", { ascending: false });

  if (error) {
    console.error("[admin-clients] Failed to list clients:", error.message);
    return [];
  }

  const byClient = new Map<string, AdminClientDirectoryRow & { professionalNameSet: Set<string> }>();

  for (const row of (data ?? []) as unknown as SessionRow[]) {
    const client = row.client;
    if (!client) continue;

    const entry =
      byClient.get(client.id) ??
      ({
        id: client.id,
        fullName: client.full_name,
        email: client.email,
        phoneNumber: client.phone_number,
        professionalNames: [],
        professionalNameSet: new Set<string>(),
        sessionCount: 0,
        totalPaidCents: 0,
        lastSessionAt: null,
      } as AdminClientDirectoryRow & { professionalNameSet: Set<string> });

    entry.sessionCount += 1;
    if (!entry.lastSessionAt || row.scheduled_at > entry.lastSessionAt) {
      entry.lastSessionAt = row.scheduled_at;
    }
    if (row.payment?.status === "pago") {
      entry.totalPaidCents += row.payment.amount_cents;
    }
    if (row.professional?.full_name) {
      entry.professionalNameSet.add(row.professional.full_name);
    }

    byClient.set(client.id, entry);
  }

  return Array.from(byClient.values())
    .map((entry) => ({
      id: entry.id,
      fullName: entry.fullName,
      email: entry.email,
      phoneNumber: entry.phoneNumber,
      professionalNames: Array.from(entry.professionalNameSet).sort((a, b) => a.localeCompare(b, "pt-BR")),
      sessionCount: entry.sessionCount,
      totalPaidCents: entry.totalPaidCents,
      lastSessionAt: entry.lastSessionAt,
    }))
    .sort((a, b) => (b.lastSessionAt ?? "").localeCompare(a.lastSessionAt ?? ""));
}
