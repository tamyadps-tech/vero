import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { getProfessionalStripeInfo } from "@/lib/professional-subscription";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe ainda não está configurado." }, { status: 503 });
  }

  const accessToken = await readAccessToken("professional");
  const professionalId = await getProfessionalIdFromAccessToken(accessToken);
  if (!professionalId) {
    return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
  }

  const stripeInfo = await getProfessionalStripeInfo(professionalId);
  if (!stripeInfo?.stripeCustomerId) {
    return NextResponse.json(
      { error: "Você ainda não tem nenhuma assinatura. Escolha um plano primeiro." },
      { status: 400 }
    );
  }

  const origin = new URL(request.url).origin;

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeInfo.stripeCustomerId,
      return_url: `${origin}/p/dashboard`,
    });

    return NextResponse.json({ portalUrl: portalSession.url });
  } catch (error) {
    console.error("[professional/subscription/portal] Stripe portal failed:", error);
    return NextResponse.json({ error: "Não foi possível abrir o portal agora." }, { status: 500 });
  }
}
