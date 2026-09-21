import type Stripe from "stripe";
import type { SubscriptionPlanDef } from "@/lib/subscription-plans";

const PRODUCT_METADATA_KEY = "vero_plan";

/**
 * Busca (ou cria, na primeira vez) o Product da Stripe pra esse plano.
 * O preço em si continua ad-hoc (price_data) a cada cobrança — só o
 * Product precisa ser persistente, porque trocar o preço de uma
 * assinatura JÁ existente exige um `product` (id), a API não aceita
 * `product_data` inline ali como aceita no Checkout.
 */
export async function getOrCreateStripeProduct(
  stripe: Stripe,
  plan: SubscriptionPlanDef
): Promise<string> {
  const products = await stripe.products.list({ limit: 100 });
  const existing = products.data.find((p) => p.metadata?.[PRODUCT_METADATA_KEY] === plan.id);
  if (existing) return existing.id;

  const created = await stripe.products.create({
    name: `Vero — Plano ${plan.name}`,
    metadata: { [PRODUCT_METADATA_KEY]: plan.id },
  });
  return created.id;
}
