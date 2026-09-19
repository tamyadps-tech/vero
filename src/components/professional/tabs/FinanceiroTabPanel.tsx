import { ExpensesManager } from "@/components/professional/ExpensesManager";
import { FinancialHealthCalculator } from "@/components/FinancialHealthCalculator";
import { FinancialGlossary } from "@/components/FinancialGlossary";
import { computeFinancialHealth } from "@/lib/financial-health";
import type { ProfessionalFinance } from "@/lib/professional-finance";
import type { ProfessionalExpense } from "@/lib/professional-expenses";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function FinanceiroTabPanel({
  finance,
  expenses,
  pricePerSessionCents,
}: {
  finance: ProfessionalFinance | null;
  expenses: ProfessionalExpense[] | null;
  pricePerSessionCents: number;
}) {
  const totalExpensesCents = expenses?.reduce((sum, e) => sum + e.amountCents, 0) ?? 0;
  const netProfitCents = finance ? finance.receivedCents - totalExpensesCents : 0;

  const fixedMonthlyCostsCents =
    expenses?.filter((e) => e.kind === "fixo").reduce((sum, e) => sum + e.amountCents, 0) ?? 0;
  const variableCostPerSessionCents =
    expenses?.filter((e) => e.kind === "variavel").reduce((sum, e) => sum + e.amountCents, 0) ?? 0;
  const health = computeFinancialHealth({
    fixedMonthlyCostsCents,
    variableCostPerUnitCents: variableCostPerSessionCents,
    pricePerUnitCents: pricePerSessionCents,
  });

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
        Financeiro
      </h2>
      {finance === null ? (
        <p className="mt-3 text-sm text-ink-soft">Supabase ainda não está configurado.</p>
      ) : (
        <>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                Recebido
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                {formatPrice(finance.receivedCents)}
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                {finance.paidSessionsCount} sessões pagas
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                Pendente
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                {formatPrice(finance.pendingCents)}
              </p>
              <p className="mt-1 text-xs text-ink-soft">Checkout iniciado, ainda não pago</p>
            </div>
            <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                Lucro líquido
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                {formatPrice(netProfitCents)}
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                Recebido − {formatPrice(totalExpensesCents)} em despesas
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            Sem Stripe Connect ainda: o valor cai na conta da Vero e o repasse é
            manual, como descrito no Termo de Uso. Imposto não entra nessa
            conta — depende do seu regime tributário e fica pra uma próxima
            etapa.
          </p>
          {finance.transactions.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-paper-alt/60 text-xs uppercase tracking-wide text-ink-soft">
                  <tr>
                    <th className="px-4 py-2.5">Cliente</th>
                    <th className="px-4 py-2.5">Sessão</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {finance.transactions.slice(0, 20).map((tx) => (
                    <tr key={tx.sessionId}>
                      <td className="px-4 py-2.5 text-ink">{tx.clientName}</td>
                      <td className="px-4 py-2.5 text-ink-soft">
                        {dateFormatter.format(new Date(tx.scheduledAt))}
                      </td>
                      <td className="px-4 py-2.5 text-ink-soft">{tx.status}</td>
                      <td className="px-4 py-2.5 text-right text-ink">
                        {formatPrice(tx.amountCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-10">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Custos e despesas
            </h3>
            <p className="mt-1 text-sm text-ink-soft">
              Registre seus custos (aluguel, plataforma, marketing...) pra
              acompanhar o lucro líquido de verdade, não só o recebido.
            </p>
            <div className="mt-4 rounded-2xl border border-border bg-paper-alt/40 p-5">
              {expenses === null ? (
                <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
              ) : (
                <ExpensesManager expenses={expenses} apiBasePath="/api/professional/expenses" />
              )}
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Margem e preço sugerido
            </h3>
            <p className="mt-1 text-sm text-ink-soft">
              Com base nos custos fixos e variáveis cadastrados acima, aqui está a margem do
              seu preço atual e o preço que cobriria seus custos com uma margem saudável.
            </p>
            {expenses === null ? (
              <p className="mt-3 text-sm text-ink-soft">Supabase ainda não está configurado.</p>
            ) : (
              <>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                      Margem de contribuição (preço atual)
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                      {formatPrice(health.contributionMarginCents)}
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {health.contributionMarginPercent === null
                        ? "Cadastre um preço de sessão pra calcular"
                        : `${health.contributionMarginPercent.toFixed(0)}% do preço da sessão`}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                      Ponto de equilíbrio
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                      {health.breakEvenUnits === null ? "—" : health.breakEvenUnits}
                    </p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {health.breakEvenUnits === null
                        ? "Com esse preço, nunca cobre o custo fixo"
                        : "sessões por mês pra cobrir o custo fixo"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-ink-soft">
                    Calculadora — mude os valores abaixo pra simular outros cenários
                  </p>
                  <FinancialHealthCalculator
                    initialFixedMonthlyCostsCents={fixedMonthlyCostsCents}
                    initialVariableCostPerUnitCents={variableCostPerSessionCents}
                    initialPriceCents={pricePerSessionCents}
                    unitLabel="sessão"
                    unitLabelPlural="sessões"
                    priceLabel="Preço da sessão"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-10">
            <FinancialGlossary />
          </div>
        </>
      )}
    </section>
  );
}
