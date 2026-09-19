import { AdminNav } from "@/components/admin/AdminNav";
import { getAdminSubscriptionsSummary } from "@/lib/admin-subscriptions";
import { getSubscriptionPlan } from "@/lib/subscription-plans";

export const dynamic = "force-dynamic";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

const STATUS_LABELS: Record<string, string> = {
  ativa: "Ativa",
  inadimplente: "Inadimplente",
  cancelada: "Cancelada",
};

const STATUS_STYLES: Record<string, string> = {
  ativa: "bg-emerald-100 text-emerald-800",
  inadimplente: "bg-amber-100 text-amber-900",
  cancelada: "bg-ink/10 text-ink-soft",
};

export default async function AdminSubscriptionsPage() {
  const summary = await getAdminSubscriptionsSummary();

  return (
    <>
      <AdminNav active="/admin/assinaturas" />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Assinaturas
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Planos SaaS para profissionais (R$99–299/mês), cobrados via Stripe.
        </p>

        {!summary ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-paper-alt/40 p-8 text-center">
            <p className="font-medium text-ink">Supabase ainda não está configurado.</p>
          </div>
        ) : (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">MRR</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {formatPrice(summary.mrrCents)}
                </p>
                <p className="mt-1 text-xs text-ink-soft">soma das assinaturas ativas</p>
              </div>
              <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                  Assinantes ativos
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {summary.activeCount}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                  Inadimplentes
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  {summary.pastDueCount}
                </p>
                <p className="mt-1 text-xs text-ink-soft">cobrança falhou, Stripe está retentando</p>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                Assinaturas
              </h2>
              {summary.rows.length === 0 ? (
                <p className="mt-4 text-sm text-ink-soft">
                  Nenhum profissional assinou um plano ainda.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-paper-alt/60 text-xs uppercase tracking-wide text-ink-soft">
                      <tr>
                        <th className="px-4 py-3">Profissional</th>
                        <th className="px-4 py-3">Plano</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Valor/mês</th>
                        <th className="px-4 py-3">Próxima cobrança</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {summary.rows.map((row) => (
                        <tr key={row.professionalId}>
                          <td className="px-4 py-3 text-ink">{row.professionalName}</td>
                          <td className="px-4 py-3 text-ink-soft">
                            {getSubscriptionPlan(row.plan).name}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[row.status]}`}
                            >
                              {STATUS_LABELS[row.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-ink-soft">{formatPrice(row.priceCents)}</td>
                          <td className="px-4 py-3 text-ink-soft">
                            {formatDate(row.currentPeriodEnd)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
