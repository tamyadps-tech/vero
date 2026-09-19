import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";
import { bookingConfirmationEmail } from "@/lib/email-templates";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { bookingConfirmationWhatsApp } from "@/lib/whatsapp-templates";
import { sendMetaPurchaseEvent } from "@/lib/meta-conversions-api";
import {
  applySubscriptionEvent,
  mapStripeSubscriptionStatus,
} from "@/lib/professional-subscription";
import { isSubscriptionPlanId } from "@/lib/subscription-plans";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe ainda não está configurado." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe/webhook] Assinatura inválida:", error);
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  if (event.type === "checkout.session.completed" && (event.data.object as Stripe.Checkout.Session).mode === "payment") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .update({ status: "pago", updated_at: new Date().toISOString() })
      .eq("stripe_checkout_session_id", checkoutSession.id)
      .select("session_id")
      .single();

    if (paymentError || !payment) {
      console.error(
        "[stripe/webhook] Pagamento não encontrado para o checkout:",
        checkoutSession.id,
        paymentError?.message
      );
      // 200 mesmo assim: retentativa da Stripe não vai resolver um dado
      // que não existe do nosso lado.
      return NextResponse.json({ ok: true });
    }

    // Evento de compra pro Meta — disparado do servidor (não depende do
    // navegador do cliente estar na página no momento do pagamento).
    if (typeof checkoutSession.amount_total === "number") {
      await sendMetaPurchaseEvent({
        amountCents: checkoutSession.amount_total,
        eventId: checkoutSession.id,
      });
    }

    const { data: session } = await supabase
      .from("sessions")
      .select(
        "scheduled_at, professional:professionals(full_name), client:clients(full_name, email, phone_number)"
      )
      .eq("id", payment.session_id)
      .single();

    const client = session?.client as unknown as
      | { full_name: string; email: string; phone_number: string | null }
      | undefined;
    const professional = session?.professional as unknown as
      | { full_name: string }
      | undefined;

    if (session && client && professional) {
      const { subject, html } = bookingConfirmationEmail({
        clientName: client.full_name,
        professionalName: professional.full_name,
        scheduledAt: session.scheduled_at,
        progressUrl: `${new URL(request.url).origin}/c/dashboard`,
      });
      await sendEmail({ to: client.email, subject, html });
      await sendWhatsAppMessage(
        client.phone_number,
        bookingConfirmationWhatsApp({
          clientName: client.full_name,
          professionalName: professional.full_name,
          scheduledAt: session.scheduled_at,
        })
      );
    }
  }

  if (event.type === "checkout.session.expired" && (event.data.object as Stripe.Checkout.Session).mode === "payment") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    await supabase
      .from("payments")
      .update({ status: "falhou", updated_at: new Date().toISOString() })
      .eq("stripe_checkout_session_id", checkoutSession.id);
  }

  // Assinatura do profissional (planos Básico/Pro/Premium) — os três
  // eventos carregam o objeto Subscription completo, com o professionalId
  // e o plano no metadata (setado na criação do Checkout em modo
  // "subscription"). Sem esse metadata, o evento não é nosso — ignora.
  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const professionalId = subscription.metadata?.professionalId;

    if (professionalId) {
      const planMeta = subscription.metadata?.plan;
      const status =
        event.type === "customer.subscription.deleted"
          ? "cancelada"
          : mapStripeSubscriptionStatus(subscription.status);
      const currentPeriodEndUnix = subscription.items.data[0]?.current_period_end;

      await applySubscriptionEvent({
        professionalId,
        stripeCustomerId:
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id,
        stripeSubscriptionId: subscription.id,
        status,
        plan: isSubscriptionPlanId(planMeta) ? planMeta : null,
        currentPeriodEnd: currentPeriodEndUnix
          ? new Date(currentPeriodEndUnix * 1000).toISOString()
          : null,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
