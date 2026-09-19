/**
 * Meta Conversions API — envia o evento de compra (pagamento confirmado)
 * direto do servidor, sem depender do navegador do cliente (mais
 * confiável que só o Pixel: funciona mesmo com bloqueador de anúncio ou
 * cookie de terceiro bloqueado). Usa o mesmo Pixel ID do Pixel do
 * navegador — só precisa de mais um token, gerado no Gerenciador de
 * Eventos da Meta.
 *
 * Sem META_CONVERSIONS_API_TOKEN configurado, não falha: só avisa e
 * segue, mesmo padrão de fallback gracioso do resto do app.
 */

type SendResult = { sent: true } | { sent: false; reason: string };

export async function sendMetaPurchaseEvent({
  amountCents,
  eventId,
}: {
  amountCents: number;
  /** Mesmo id do evento client-side (se houver), pra Meta deduplicar. */
  eventId?: string;
}): Promise<SendResult> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CONVERSIONS_API_TOKEN;

  if (!pixelId || !token) {
    console.warn(
      "[meta-conversions-api] NEXT_PUBLIC_META_PIXEL_ID / META_CONVERSIONS_API_TOKEN não configurados — evento não enviado."
    );
    return { sent: false, reason: "not_configured" };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: "Purchase",
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId,
              action_source: "website",
              custom_data: {
                value: amountCents / 100,
                currency: "BRL",
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("[meta-conversions-api] Meta respondeu com erro:", response.status, body);
      return { sent: false, reason: `meta_${response.status}` };
    }

    return { sent: true };
  } catch (error) {
    console.error("[meta-conversions-api] Falha ao chamar a Meta:", error);
    return { sent: false, reason: "network_error" };
  }
}
