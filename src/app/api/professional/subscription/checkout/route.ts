import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { getProfessionalStripeInfo } from "@/lib/professional-subscription";
import { isSubscriptionPlanId, getSubscriptionPlan } from "@/lib/subscription-plans";

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

  if (stripeInfo.subscriptionStatus === "ativa") {
    // Sem lógica de troca/proração ainda — evita criar uma segunda
    // assinatura em paralelo. Pra trocar de plano, cancela a atual no
    // portal primeiro.
    return NextResponse.json(
      { error: "Você já tem uma assinatura ativa. Cancele-a no portal antes de assinar outro plano." },
      { status: 409 }
    );
  }

  const planDef = getSubscriptionPlan(plan);
  const origin = new URL(request.url).origin;

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
