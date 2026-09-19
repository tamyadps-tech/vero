import { sendEmail } from "@/lib/email";
import { sendWhatsAppMessage, isValidPhoneNumber } from "@/lib/whatsapp";

/**
 * Envio de campanha de marketing em massa — email e WhatsApp — pra
 * divulgar a própria Vero (não o negócio de um profissional específico).
 *
 * Não usa nenhuma plataforma nova: reaproveita o Resend (já conectado
 * pros emails transacionais, em email.ts) e o Twilio (já conectado pros
 * lembretes de WhatsApp, em whatsapp.ts). Sem precisar criar conta em
 * lugar nenhum — tudo roda de dentro da Vero, com a mesma chave que já
 * está configurada.
 */

export interface MarketingIntegrationStatus {
  configured: boolean;
  missing: string[];
  provider: string;
}

export function getEmailMarketingStatus(): MarketingIntegrationStatus {
  const missing: string[] = [];
  if (!process.env.RESEND_API_KEY) missing.push("RESEND_API_KEY");
  if (!process.env.RESEND_FROM) missing.push("RESEND_FROM");
  return { configured: missing.length === 0, missing, provider: "Resend" };
}

export function getWhatsAppMarketingStatus(): MarketingIntegrationStatus {
  const missing: string[] = [];
  if (!process.env.TWILIO_ACCOUNT_SID) missing.push("TWILIO_ACCOUNT_SID");
  if (!process.env.TWILIO_AUTH_TOKEN) missing.push("TWILIO_AUTH_TOKEN");
  if (!process.env.TWILIO_WHATSAPP_FROM) missing.push("TWILIO_WHATSAPP_FROM");
  return { configured: missing.length === 0, missing, provider: "Twilio" };
}

export interface BulkSendResult {
  sent: number;
  failed: number;
  reasons: string[];
}

export async function sendBulkMarketingEmail(
  recipients: string[],
  campaign: { subject: string; html: string }
): Promise<BulkSendResult> {
  const result: BulkSendResult = { sent: 0, failed: 0, reasons: [] };
  for (const to of recipients) {
    const outcome = await sendEmail({ to, subject: campaign.subject, html: campaign.html });
    if (outcome.sent) {
      result.sent += 1;
    } else {
      result.failed += 1;
      if (!result.reasons.includes(outcome.reason)) result.reasons.push(outcome.reason);
    }
  }
  return result;
}

/**
 * Números inválidos (fora do formato E.164, ex: +5511999999999) contam
 * como falha com motivo "invalid_phone_number" — nunca chegam a bater na
 * API do Twilio.
 */
export async function sendBulkWhatsAppMessages(
  recipients: string[],
  text: string
): Promise<BulkSendResult> {
  const result: BulkSendResult = { sent: 0, failed: 0, reasons: [] };
  for (const to of recipients) {
    if (!isValidPhoneNumber(to)) {
      result.failed += 1;
      if (!result.reasons.includes("invalid_phone_number")) {
        result.reasons.push("invalid_phone_number");
      }
      continue;
    }

    const outcome = await sendWhatsAppMessage(to, text);
    if (outcome.sent) {
      result.sent += 1;
    } else {
      result.failed += 1;
      if (!result.reasons.includes(outcome.reason)) result.reasons.push(outcome.reason);
    }
  }
  return result;
}
