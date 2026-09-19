"use client";

/**
 * Disparo de eventos de conversão pro Meta Pixel e pro Google Ads —
 * pra quando você rodar anúncio nessas plataformas, o algoritmo delas
 * otimize a entrega pra quem de fato converte (cadastra, agenda, paga),
 * não só quem clica. Você continua criando e controlando a campanha
 * direto no Gerenciador de Anúncios da Meta e no Google Ads; aqui só
 * avisamos os dois quando uma conversão de verdade acontece.
 *
 * Sem o Pixel/gtag carregado na página (chave não configurada), essas
 * funções não fazem nada — não quebram o app.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

function fireMeta(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

function fireGoogleConversion(label: string | undefined, params?: Record<string, unknown>) {
  if (!label || !GOOGLE_ADS_ID) return;
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "conversion", { send_to: `${GOOGLE_ADS_ID}/${label}`, ...params });
  }
}

/** Entrou na lista de espera (landing page). */
export function trackWaitlistSignup() {
  fireMeta("Lead");
  fireGoogleConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_WAITLIST);
}

/** Cliente criou conta (/c/cadastrar). */
export function trackClientSignup() {
  fireMeta("CompleteRegistration");
  fireGoogleConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_SIGNUP);
}

/** Profissional enviou a candidatura (/profissionais/cadastro). */
export function trackProfessionalApplication() {
  fireMeta("SubmitApplication");
  fireGoogleConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_APPLICATION);
}

/** Cliente confirmou um agendamento. */
export function trackBooking() {
  fireMeta("Schedule");
  fireGoogleConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_BOOKING);
}
