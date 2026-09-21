import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { getProfessionalStripeInfo } from "@/lib/professional-subscription";
import { isSubscriptionPlanId, getSubscriptionPlan } from "@/lib/subscription-plans";
import { getOrCreateStripeProduct } from "@/lib/stripe-products";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe ainda não está configurado." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { plan } = (body ?? {}) as { plan?: unknown };
  if (!isSubscriptionPlanId(plan)) {
    return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
  }

  const accessToken = await readAccessToken("professional");
  const professionalId = await getProfessionalIdFromAccessToken(accessToken);
  if (!professionalId) {
    return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
  }

  const stripeInfo = await getProfessionalStripeInfo(professionalId);
  if (!stripeInfo) {
    return NextResponse.json({ error: "Não foi possível carregar sua conta agora." }, { status: 500 });
  }

  const planDef = getSubscriptionPlan(plan);
  const origin = new URL(request.url).origin;

  // Já tem assinatura ativa: troca o preço na MESMA assinatura (com
  // proração), em vez de criar uma segunda em paralelo — sem precisar
  // cancelar antes.
  if (stripeInfo.subscriptionStatus === "ativa" && stripeInfo.stripeSubscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(stripeInfo.stripeSubscriptionId);
      const itemId = subscription.items.data[0]?.id;
      if (!itemId) {
        return NextResponse.json({ error: "Não foi possível localizar sua assinatura atual." }, { status: 500 });
      }

      const productId = await getOrCreateStripeProduct(stripe, planDef);
      await stripe.subscriptions.update(stripeInfo.stripeSubscriptionId, {
        items: [
          {
            id: itemId,
            price_data: {
              currency: "brl",
              unit_amount: planDef.priceCents,
              product: productId,
              recurring: { interval: "month" },
            },
          },
        ],
        proration_behavior: "create_prorations",
        metadata: { professionalId, plan: planDef.id },
      });

      // Atualiza local pra refletir na hora — o webhook confirma de novo
      // depois (customer.subscription.updated), sem conflito.
      const supabase = getSupabaseAdmin();
      if (supabase) {
        await supabase
          .from("professionals")
          .update({ subscription_plan: planDef.id })
          .eq("id", professionalId);
      }

      return NextResponse.json({ ok: true, switched: true });
    } catch (error) {
      console.error("[professional/subscription/checkout] Plan switch failed:", error);
      return NextResponse.json({ error: "Não foi possível trocar de plano agora." }, { status: 500 });
    }
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      currency: "brl",
      ...(stripeInfo.stripeCustomerId
        ? { customer: stripeInfo.stripeCustomerId }
        : { customer_email: stripeInfo.email }),
      line_items: [
        {
          price_data: {
            currency: "brl",
            unit_amount: planDef.priceCents,
            recurring: { interval: "month" },
            product_data: { name: `Vero — Plano ${planDef.name}` },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: { professionalId, plan: planDef.id },
      },
      success_url: `${origin}/p/dashboard?assinatura=sucesso`,
      cancel_url: `${origin}/p/dashboard?assinatura=cancelado`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: "Não foi possível iniciar o checkout." }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl: checkoutSession.url });
  } catch (error) {
    console.error("[professional/subscription/checkout] Stripe checkout failed:", error);
    return NextResponse.json({ error: "Não foi possível iniciar o checkout agora." }, { status: 500 });
  }
}
