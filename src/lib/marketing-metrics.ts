/**
 * Métricas de marketing (CAC, LTV) calculadas a partir dos mesmos dados
 * já usados no CRM e no Financeiro — sem tabela nova. "Investimento em
 * marketing" é qualquer despesa cuja categoria (texto livre, cadastrado
 * na aba Financeiro) contenha a palavra "marketing".
 */

export interface MarketingMetricsClientInput {
  totalPaidCents: number;
  firstSessionAt: string | null;
}

export interface MarketingMetricsExpenseInput {
  amountCents: number;
  category: string | null;
  expenseDate: string;
}

export interface MarketingMetrics {
  windowDays: number;
  /** Total gasto em despesas categorizadas como marketing, dentro da janela. */
  marketingSpendCents: number;
  /** Clientes cuja primeira sessão caiu dentro da janela. */
  newClientsInWindow: number;
  /** null quando não há clientes novos no período (não dá pra dividir por zero). */
  cacCents: number | null;
  /** Média do valor vitalício (LTV) entre todos os clientes, dentro ou fora da janela. */
  averageLtvCents: number;
  totalLtvCents: number;
  totalClients: number;
  /** null quando o CAC não pôde ser calculado. >= 3 costuma ser considerado saudável. */
  ltvToCacRatio: number | null;
}

export function computeMarketingMetrics(
  clients: MarketingMetricsClientInput[],
  expenses: MarketingMetricsExpenseInput[],
  options?: { windowDays?: number; now?: Date }
): MarketingMetrics {
  const windowDays = options?.windowDays ?? 30;
  const now = options?.now ?? new Date();
  const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

  const marketingSpendCents = expenses
    .filter(
      (e) =>
        (e.category ?? "").toLowerCase().includes("marketing") &&
        new Date(e.expenseDate) >= windowStart
    )
    .reduce((sum, e) => sum + e.amountCents, 0);

  const newClientsInWindow = clients.filter(
    (c) => c.firstSessionAt && new Date(c.firstSessionAt) >= windowStart
  ).length;

  const cacCents =
    newClientsInWindow > 0 ? Math.round(marketingSpendCents / newClientsInWindow) : null;

  const totalLtvCents = clients.reduce((sum, c) => sum + c.totalPaidCents, 0);
  const averageLtvCents = clients.length > 0 ? Math.round(totalLtvCents / clients.length) : 0;

  const ltvToCacRatio = cacCents && cacCents > 0 ? averageLtvCents / cacCents : null;

  return {
    windowDays,
    marketingSpendCents,
    newClientsInWindow,
    cacCents,
    averageLtvCents,
    totalLtvCents,
    totalClients: clients.length,
    ltvToCacRatio,
  };
}
