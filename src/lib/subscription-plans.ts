/**
 * Definição dos planos de assinatura do profissional. Puro — sem
 * Supabase, sem Stripe — pra poder ser importado tanto no servidor
 * (checkout, webhook, gate de acesso) quanto no client (cards de plano).
 */

export type SubscriptionPlanId = "basico" | "pro" | "premium";
export type SubscriptionStatus = "ativa" | "inadimplente" | "cancelada";

export interface SubscriptionPlanDef {
  id: SubscriptionPlanId;
  name: string;
  priceCents: number;
  tagline: string;
  benefits: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanDef[] = [
  {
    id: "basico",
    name: "Básico",
    priceCents: 9900,
    tagline: "O essencial pra rodar sua prática",
    benefits: [
      "Agenda online e prontuário compartilhado",
      "Painel de clientes (CRM) automático, com status de engajamento",
      "Dashboard com KPIs da sua prática",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceCents: 17900,
    tagline: "Tudo do Básico + ferramentas de marketing",
    benefits: [
      "Tudo do plano Básico",
      "Campanhas de email e WhatsApp pros seus clientes",
      "Modelos de mensagem prontos e editáveis",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    priceCents: 29900,
    tagline: "Tudo do Pro + financeiro completo",
    benefits: [
      "Tudo do plano Pro",
      "Painel financeiro completo (margem, ponto de equilíbrio, preço sugerido)",
      "Orçado × realizado × projeção mensal",
      "Manual financeiro com cuidados práticos",
    ],
  },
];

export function getSubscriptionPlan(id: SubscriptionPlanId): SubscriptionPlanDef {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Plano de assinatura desconhecido: ${id}`);
  return plan;
}

export function isSubscriptionPlanId(value: unknown): value is SubscriptionPlanId {
  return typeof value === "string" && SUBSCRIPTION_PLANS.some((p) => p.id === value);
}

function planRank(plan: SubscriptionPlanId): number {
  return SUBSCRIPTION_PLANS.findIndex((p) => p.id === plan);
}

/**
 * Um profissional só tem acesso a uma funcionalidade que exige um plano
 * mínimo se a assinatura estiver ativa E o plano atual for igual ou acima
 * do exigido. Sem assinatura, ou com assinatura inadimplente/cancelada,
 * não conta.
 */
export function hasPlanAccess(
  currentPlan: SubscriptionPlanId | null,
  currentStatus: SubscriptionStatus | null,
  requiredPlan: SubscriptionPlanId
): boolean {
  if (!currentPlan || currentStatus !== "ativa") return false;
  return planRank(currentPlan) >= planRank(requiredPlan);
}
