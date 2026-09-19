/**
 * Orçado x realizado x projeção — quanto do mês já passou, quanto já foi
 * realizado nesse ritmo, e onde isso termina se o ritmo continuar igual
 * até o fim do mês. Pura, sem I/O, pra dar pra testar e reusar entre o
 * profissional (receita) e o admin (custo).
 */

export interface MonthProgress {
  /** Dia do mês "hoje" representa (1 a daysInMonth). */
  daysElapsed: number;
  /** Quantos dias tem o mês corrente. */
  daysInMonth: number;
}

export function getMonthProgress(now: Date = new Date()): MonthProgress {
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysElapsed = now.getDate();
  return { daysElapsed, daysInMonth };
}

/**
 * Projeção linear: no ritmo de "realizado até agora", quanto o mês
 * fecha. Simplificação intencional — não tenta prever sazonalidade,
 * só estica o ritmo atual até o fim do mês.
 */
export function projectMonthEnd(realizedCents: number, progress: MonthProgress): number {
  if (progress.daysElapsed <= 0) return 0;
  return Math.round((realizedCents / progress.daysElapsed) * progress.daysInMonth);
}

/** true quando a data (ISO ou parseável pelo Date) cai no mesmo mês/ano de "now". */
export function isInCurrentMonth(dateValue: string, now: Date = new Date()): boolean {
  const date = new Date(dateValue);
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}
