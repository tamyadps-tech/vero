import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSubscriptionPlan, type SubscriptionPlanId, type SubscriptionStatus } from "@/lib/subscription-plans";

export interface AdminSubscriptionRow {
  professionalId: string;
  professionalName: string;
  plan: SubscriptionPlanId;
  status: SubscriptionStatus;
  priceCents: number;
  currentPeriodEnd: string | null;
}

export interface AdminSubscriptionsSummary {
  rows: AdminSubscriptionRow[];
  /** MRR = soma do preço mensal de cada assinatura com status "ativa". */
  mrrCents: number;
  activeCount: number;
  pastDueCount: number;
}

/** Retorna null quando o Supabase ainda não está configurado. */
export async function getAdminSubscriptionsSummary(): Promise<AdminSubscriptionsSummary | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("professionals")
    .select("id, full_name, subscription_plan, subscription_status, subscription_current_period_end")
    .not("subscription_plan", "is", null)
    .order("subscription_current_period_end", { ascending: true });

  if (error) {
    console.error("[admin-subscriptions] Falha ao listar assinaturas:", error.message);
    return { rows: [], mrrCents: 0, activeCount: 0, pastDueCount: 0 };
  }

  const rows: AdminSubscriptionRow[] = (data ?? [])
    .filter((row) => row.subscription_plan && row.subscription_status)
    .map((row) => ({
      professionalId: row.id,
      professionalName: row.full_name,
      plan: row.subscription_plan as SubscriptionPlanId,
      status: row.subscription_status as SubscriptionStatus,
      priceCents: getSubscriptionPlan(row.subscription_plan as SubscriptionPlanId).priceCents,
      currentPeriodEnd: row.subscription_current_period_end,
    }));

  const activeRows = rows.filter((r) => r.status === "ativa");
  const mrrCents = activeRows.reduce((sum, r) => sum + r.priceCents, 0);
  const pastDueCount = rows.filter((r) => r.status === "inadimplente").length;

  return { rows, mrrCents, activeCount: activeRows.length, pastDueCount };
}
