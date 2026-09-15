type SendWhatsAppResult = { sent: true } | { sent: false; reason: string };

const E164_RE = /^\+[1-9]\d{7,14}$/;

/** Formato E.164 (ex: +5511999998888) — o único que a API do WhatsApp aceita. */
export function isValidPhoneNumber(value: string): boolean {
  return E164_RE.test(value);
}

/**
 * Envia mensagem via WhatsApp usando a API do Twilio (twilio.com — tem
 * sandbox pra testar sem número de verdade). Sem as credenciais
 * configuradas, não falha: só loga e segue em frente, mesmo padrão de
 * fallback gracioso do resto do app (email, Stripe).
 */
export async function sendWhatsAppMessage(
  to: string | null | undefined,
  body: string
): Promise<SendWhatsAppResult> {
  if (!to) {
    return { sent: false, reason: "no_phone_number" };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    console.warn(
      "[whatsapp] TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_FROM não configurados — mensagem não enviada:",
      { to }
    );
    return { sent: false, reason: "not_configured" };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: `whatsapp:${from}`,
          To: `whatsapp:${to}`,
          Body: body,
        }),
      }
    );

    if (!response.ok) {
      const responseBody = await response.text().catch(() => "");
      console.error("[whatsapp] Twilio respondeu com erro:", response.status, responseBody);
      return { sent: false, reason: `twilio_${response.status}` };
    }

    return { sent: true };
  } catch (error) {
    console.error("[whatsapp] Falha ao chamar a Twilio:", error);
    return { sent: false, reason: "network_error" };
  }
}
