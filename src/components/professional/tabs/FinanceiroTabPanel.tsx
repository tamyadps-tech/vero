import type { ProfessionalFinance } from "@/lib/professional-finance";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function FinanceiroTabPanel({ finance }: { finance: ProfessionalFinance | null }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
        Financeiro
      </h2>
      {finance === null ? (
        <p className="mt-3 text-sm text-ink-soft">Supabase ainda não está configurado.</p>
      ) : (
        <>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
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
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            Sem Stripe Connect ainda: o valor cai na conta da Vero e o repasse é
            manual, como descrito no Termo de Uso. Controle de custos/despesas
            e lucro líquido chegam numa próxima versão.
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
        </>
      )}
    </section>
  );
}
