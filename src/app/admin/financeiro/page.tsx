import { AdminNav } from "@/components/admin/AdminNav";
import { ExpensesManager } from "@/components/professional/ExpensesManager";
import { FinancialHealthCalculator } from "@/components/FinancialHealthCalculator";
import { FinancialGlossary } from "@/components/FinancialGlossary";
import { getAdminMetrics } from "@/lib/admin-metrics";
import { listAdminExpenses } from "@/lib/admin-expenses";
import { computeFinancialHealth } from "@/lib/financial-health";
import { getMonthProgress, projectMonthEnd, isInCurrentMonth } from "@/lib/financial-projection";

export const dynamic = "force-dynamic";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminFinanceiroPage() {
  const [metrics, expenses] = await Promise.all([getAdminMetrics(), listAdminExpenses()]);

  const fixedMonthlyCostsCents =
    expenses?.filter((e) => e.kind === "fixo").reduce((sum, e) => sum + e.amountCents, 0) ?? 0;
  const variableCostPerSessionCents =
    expenses?.filter((e) => e.kind === "variavel").reduce((sum, e) => sum + e.amountCents, 0) ?? 0;

  // Hoje não existe comissão nem assinatura real — a "comissão" abaixo é
  // 0 de propósito, pra mostrar honestamente que com o preço atual (R$0
  // de receita própria) a Vero só acumula custo. É o ponto de partida
  // pra decidir que comissão cobrar.
  const health = computeFinancialHealth({
    fixedMonthlyCostsCents,
    variableCostPerUnitCents: variableCostPerSessionCents,
    pricePerUnitCents: 0,
  });

  const realizedThisMonthCents =
    expenses
      ?.filter((e) => isInCurrentMonth(e.expenseDate))
      .reduce((sum, e) => sum + e.amountCents, 0) ?? 0;
  const monthProgress = getMonthProgress();
  const projectedCostCents = projectMonthEnd(realizedThisMonthCents, monthProgress);

  return (
    <>
      <AdminNav active="/admin/financeiro" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Financeiro</h1>
        <p className="mt-1 text-sm text-ink-soft">
          A saúde financeira da própria Vero — não a de um profissional específico.
        </p>

        {!metrics ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-paper-alt/40 p-8 text-center">
            <p className="font-medium text-ink">Supabase ainda não está configurado.</p>
          </div>
        ) : (
          <>
            <section className="mt-8">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <strong>Importante:</strong> a Vero ainda não cobra comissão por sessão nem
                assinatura — o valor abaixo é o volume processado no Stripe (que é repassado
                ao profissional), não receita própria. Hoje, o que sustenta a operação são só
                os custos abaixo, sem nenhuma receita entrando ainda.
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Volume processado
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                    {formatPrice(metrics.revenue.totalCents)}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {metrics.revenue.pagas} sessões pagas — repassado ao profissional, não é
                    receita da Vero
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Custo fixo mensal
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                    {formatPrice(fixedMonthlyCostsCents)}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    Supabase, Vercel, Resend, Twilio, domínio...
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Custo variável por sessão
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                    {formatPrice(variableCostPerSessionCents)}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    Taxa do Stripe, WhatsApp por mensagem...
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                Custos operacionais da Vero
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Cadastre aqui o que a própria plataforma custa pra rodar — é isso que entra
                no cálculo de margem e comissão sugerida abaixo.
              </p>
              <div className="mt-4 rounded-2xl border border-border bg-paper-alt/40 p-5">
                {expenses === null ? (
                  <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
                ) : (
                  <ExpensesManager expenses={expenses} apiBasePath="/api/admin/expenses" />
                )}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                Custo do mês: orçado × realizado × projeção
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Orçado é o custo fixo mensal cadastrado acima. Realizado é o que já foi
                registrado com data neste mês (fixo e variável). Projeção estica esse ritmo
                até o fim do mês.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Orçado
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                    {formatPrice(fixedMonthlyCostsCents)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Realizado (mês)
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                    {formatPrice(realizedThisMonthCents)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Projeção (fim do mês)
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                    {formatPrice(projectedCostCents)}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                Comissão necessária pra Vero se sustentar
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Com R$0 de comissão (situação atual), a margem de contribuição é negativa —
                cada sessão processada custa mais do que gera. Simule uma comissão por sessão
                abaixo pra ver o que cobriria os custos com uma margem saudável.
              </p>
              <div className="mt-4 rounded-2xl border border-border bg-paper-alt/40 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                  Margem de contribuição hoje (comissão R$0)
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {formatPrice(health.contributionMarginCents)}
                </p>
                <p className="mt-1 text-xs text-ink-soft">por sessão processada</p>
              </div>
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-ink-soft">
                  Calculadora — teste diferentes comissões e volumes
                </p>
                <FinancialHealthCalculator
                  initialFixedMonthlyCostsCents={fixedMonthlyCostsCents}
                  initialVariableCostPerUnitCents={variableCostPerSessionCents}
                  initialPriceCents={0}
                  unitLabel="sessão processada"
                  unitLabelPlural="sessões processadas"
                  priceLabel="Comissão por sessão (simulada)"
                />
              </div>
            </section>

            <section className="mt-10">
              <FinancialGlossary />
            </section>
          </>
        )}
      </main>
    </>
  );
}
