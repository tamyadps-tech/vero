export type EngagementStatus = "ativo" | "em_risco" | "inativo";

export const ENGAGEMENT_STATUS_LABELS: Record<EngagementStatus, string> = {
  ativo: "Ativo",
  em_risco: "Em risco",
  inativo: "Inativo",
};

/** Dias sem sessão (passada ou futura) até virar "em risco", depois "inativo". */
const AT_RISK_AFTER_DAYS = 60;
const INACTIVE_AFTER_DAYS = 120;

/**
 * Regra simples de engajamento/churn pra MVP: um cliente com sessão futura
 * agendada está sempre "ativo"; sem isso, olha há quanto tempo foi a
 * última sessão. Não é ciência de dados, é o suficiente pra sinalizar quem
 * o profissional deveria tentar reengajar.
 */
export function computeEngagementStatus({
  lastSessionAt,
  hasUpcomingSession,
  now = new Date(),
}: {
  lastSessionAt: string | null;
  hasUpcomingSession: boolean;
  now?: Date;
}): EngagementStatus {
  if (hasUpcomingSession) return "ativo";
  if (!lastSessionAt) return "inativo";

  const daysSince = (now.getTime() - new Date(lastSessionAt).getTime()) / 86_400_000;
  if (daysSince <= AT_RISK_AFTER_DAYS) return "ativo";
  if (daysSince <= INACTIVE_AFTER_DAYS) return "em_risco";
  return "inativo";
}
