import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isSubscriptionPlanId, type SubscriptionPlanId, type SubscriptionStatus } from "@/lib/subscription-plans";

export interface ProfessionalStripeInfo {
  email: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: SubscriptionStatus | null;
}

/** Retorna null quando o Supabase ainda não está configurado ou o profissional não existe. */
export async function getProfessionalStripeInfo(
  professionalId: string
): Promise<ProfessionalStripeInfo | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("professionals")
    .select("email, stripe_customer_id, stripe_subscription_id, subscription_status")
    .eq("id", professionalId)
    .maybeSingle();

  if (!data) return null;
  return {
    email: data.email,
    stripeCustomerId: data.stripe_customer_id,
    stripeSubscriptionId: data.stripe_subscription_id,
    subscriptionStatus: data.subscription_status,
  };
}

/**
 * Mapeia o status de assinatura da Stripe pro nosso vocabulário de 3
 * estados. `past_due`/`unpaid`/`incomplete` viram "inadimplente" — a
 * cobrança falhou mas a Stripe ainda está tentando, não cancelamos o
 * acesso de cara.
 */
export function mapStripeSubscriptionStatus(stripeStatus: string): SubscriptionStatus {
  if (stripeStatus === "active" || stripeStatus === "trialing") return "ativa";
  if (stripeStatus === "canceled" || stripeStatus === "incomplete_expired") return "cancelada";
  return "inadimplente";
}

export interface SubscriptionEventUpdate {
  professionalId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlanId | null;
  currentPeriodEnd: string | null;
}

/**
 * Aplica um evento de assinatura (created/updated/deleted) da Stripe no
 * profissional dono dela. `plan` vem do metadata da subscription — só
 * atualizamos a coluna quando ele está presente, pra nunca apagar o plano
 * atual num evento que não carrega essa informação.
 */
export async function applySubscriptionEvent(update: SubscriptionEventUpdate): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const patch: Record<string, unknown> = {
    stripe_customer_id: update.stripeCustomerId,
    stripe_subscription_id: update.stripeSubscriptionId,
    subscription_status: update.status,
    subscription_current_period_end: update.currentPeriodEnd,
  };
  if (update.plan && isSubscriptionPlanId(update.plan)) {
    patch.subscription_plan = update.plan;
  }

  const { error } = await supabase
    .from("professionals")
    .update(patch)
    .eq("id", update.professionalId);

  if (error) {
    console.error("[professional-subscription] Falha ao aplicar evento:", error.message);
  }
}
