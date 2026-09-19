/**
 * Matemática pura de saúde financeira — sem Supabase, sem I/O. Reaproveitada
 * pelo profissional (preço da própria sessão) e pelo admin (comissão da
 * Vero): pra ambos, "unidade" é uma sessão/atendimento paga.
 *
 * Vocabulário (ver também o manual financeiro na UI):
 * - Custo fixo: não muda com o volume de sessões (aluguel, assinatura).
 * - Custo variável: soma por sessão (material, taxa de pagamento).
 * - Margem de contribuição: preço da sessão menos o custo variável dela —
 *   é o quanto cada sessão "contribui" pra pagar o custo fixo e sobrar
 *   lucro.
 * - Ponto de equilíbrio: quantas sessões por mês bastam pra cobrir o
 *   custo fixo (lucro zero — nem ganha, nem perde).
 */

export interface FinancialHealthInput {
  fixedMonthlyCostsCents: number;
  variableCostPerUnitCents: number;
  pricePerUnitCents: number;
}

export interface FinancialHealthResult {
  /** Preço da sessão menos o custo variável dela. */
  contributionMarginCents: number;
  /** null quando o preço é 0 (não dá pra calcular percentual sobre nada). */
  contributionMarginPercent: number | null;
  /**
   * Sessões por mês pra cobrir o custo fixo. null quando a margem de
   * contribuição é zero ou negativa — nesse caso não existe ponto de
   * equilíbrio: quanto mais sessão, mais prejuízo (custo variável já é
   * maior que o preço cobrado).
   */
  breakEvenUnits: number | null;
}

export function computeFinancialHealth(input: FinancialHealthInput): FinancialHealthResult {
  const contributionMarginCents = input.pricePerUnitCents - input.variableCostPerUnitCents;

  const contributionMarginPercent =
    input.pricePerUnitCents > 0
      ? (contributionMarginCents / input.pricePerUnitCents) * 100
      : null;

  const breakEvenUnits =
    contributionMarginCents > 0
      ? Math.ceil(input.fixedMonthlyCostsCents / contributionMarginCents)
      : null;

  return { contributionMarginCents, contributionMarginPercent, breakEvenUnits };
}

export interface SuggestPriceInput {
  fixedMonthlyCostsCents: number;
  variableCostPerUnitCents: number;
  /** Quantas sessões você estima fazer por mês, pra ratear o custo fixo. */
  estimatedUnitsPerMonth: number;
  /** Margem líquida desejada, em % (ex: 30 = 30%). */
  targetMarginPercent: number;
}

/**
 * Preço "cost-plus": custo variável + fatia do custo fixo (rateado pelo
 * volume estimado), dividido pela margem que sobra depois de tirar a
 * margem-alvo. null quando o cálculo não faz sentido (0 sessões/mês, ou
 * margem-alvo >= 100%, que exigiria preço infinito).
 */
export function suggestPrice(input: SuggestPriceInput): number | null {
  if (input.estimatedUnitsPerMonth <= 0) return null;
  if (input.targetMarginPercent >= 100 || input.targetMarginPercent < 0) return null;

  const fixedCostPerUnitCents = input.fixedMonthlyCostsCents / input.estimatedUnitsPerMonth;
  const totalCostPerUnitCents = input.variableCostPerUnitCents + fixedCostPerUnitCents;

  return Math.round(totalCostPerUnitCents / (1 - input.targetMarginPercent / 100));
}
