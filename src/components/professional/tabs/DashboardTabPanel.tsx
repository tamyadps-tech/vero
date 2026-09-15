import type { ProfessionalFinance } from "@/lib/professional-finance";
import type { ProfessionalClient } from "@/lib/professional-clients";
import type { ProfessionalExpense } from "@/lib/professional-expenses";
import type { AdminSession, SessionStatus } from "@/lib/admin-sessions";
import { ENGAGEMENT_STATUS_LABELS } from "@/lib/client-engagement";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  agendada: "Agendada",
  concluida: "Concluída",
  cancelada_cliente: "Cancelada (cliente)",
  cancelada_profissional: "Cancelada (profissional)",
};

const SESSION_STATUS_ORDER: SessionStatus[] = [
  "concluida",
  "agendada",
  "cancelada_cliente",
  "cancelada_profissional",
];

const ENGAGEMENT_ORDER = ["ativo", "em_risco", "inativo"] as const;

const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });

function Kpi({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      {detail && <p className="mt-1 text-xs text-ink-soft">{detail}</p>}
    </div>
  );
}

/** Barra horizontal de magnitude — uma única cor porque é uma série só; o rótulo à esquerda já identifica a categoria (sem precisar de legenda). */
function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-36 shrink-0 text-ink-soft">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-paper">
        <div
          className="h-2 rounded-full bg-primary transition-[width]"
          style={{ width: `${Math.max(pct, value > 0 ? 3 : 0)}%` }}
        />
      </div>
      <span className="w-6 shrink-0 text-right font-medium text-ink">{value}</span>
    </div>
  );
}

function MonthlyRevenueChart({ months }: { months: { label: string; cents: number }[] }) {
  const max = Math.max(1, ...months.map((m) => m.cents));
  const hasData = months.some((m) => m.cents > 0);

  if (!hasData) {
    return <p className="text-sm text-ink-soft">Ainda sem sessões pagas nos últimos meses.</p>;
  }

  return (
    <div className="flex items-end gap-3">
      {months.map((m) => {
        const pct = Math.round((m.cents / max) * 100);
        return (
          <div key={m.label} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-24 w-full items-end justify-center">
              <div
                className="w-full max-w-8 rounded-t-md bg-primary"
                style={{ height: `${Math.max(pct, m.cents > 0 ? 6 : 0)}%` }}
                title={formatPrice(m.cents)}
              />
            </div>
            <span className="text-[10px] text-ink-soft">{m.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardTabPanel({
  finance,
  clients,
  sessions,
  expenses,
}: {
  finance: ProfessionalFinance | null;
  clients: ProfessionalClient[] | null;
  sessions: AdminSession[] | null;
  expenses: ProfessionalExpense[] | null;
}) {
  if (finance === null || clients === null || sessions === null || expenses === null) {
    return (
      <section>
        <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
      </section>
    );
  }

  const totalClients = clients.length;
  const repeatClients = clients.filter((c) => c.sessionCount > 1).length;
  const recompraPct = totalClients > 0 ? Math.round((repeatClients / totalClients) * 100) : 0;
  const ticketMedioCents =
    finance.paidSessionsCount > 0 ? Math.round(finance.receivedCents / finance.paidSessionsCount) : 0;
  const totalExpensesCents = expenses.reduce((sum, e) => sum + e.amountCents, 0);
  const netProfitCents = finance.receivedCents - totalExpensesCents;

  const sessionStatusCounts = sessions.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<SessionStatus, number>
  );
  const maxStatusCount = Math.max(1, ...SESSION_STATUS_ORDER.map((s) => sessionStatusCounts[s] ?? 0));
  const totalSessions = sessions.length;
  const completedCount = sessionStatusCounts.concluida ?? 0;
  const canceledCount =
    (sessionStatusCounts.cancelada_cliente ?? 0) + (sessionStatusCounts.cancelada_profissional ?? 0);
  const conclusionPct = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;
  const cancellationPct = totalSessions > 0 ? Math.round((canceledCount / totalSessions) * 100) : 0;

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth(), label: monthFormatter.format(d), cents: 0 };
  });
  for (const tx of finance.transactions) {
    if (tx.status !== "pago") continue;
    const txDate = new Date(tx.scheduledAt);
    const bucket = months.find(
      (m) => m.year === txDate.getFullYear() && m.month === txDate.getMonth()
    );
    if (bucket) bucket.cents += tx.amountCents;
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi
            label="Recebido"
            value={formatPrice(finance.receivedCents)}
            detail={`${finance.paidSessionsCount} sessões pagas`}
          />
          <Kpi label="Ticket médio" value={formatPrice(ticketMedioCents)} />
          <Kpi label="Clientes" value={String(totalClients)} />
          <Kpi
            label="Recompra"
            value={`${recompraPct}%`}
            detail={`${repeatClients} de ${totalClients} voltaram`}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Kpi
            label="Taxa de conclusão"
            value={`${conclusionPct}%`}
            detail={`${completedCount} de ${totalSessions} sessões`}
          />
          <Kpi
            label="Taxa de cancelamento"
            value={`${cancellationPct}%`}
            detail={`${canceledCount} de ${totalSessions} sessões`}
          />
          <Kpi
            label="Lucro líquido"
            value={formatPrice(netProfitCents)}
            detail={`Recebido − ${formatPrice(totalExpensesCents)} em despesas`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Faturamento por mês
        </h2>
        <p className="mt-1 text-sm text-ink-soft">Sessões pagas, últimos 6 meses.</p>
        <div className="mt-4 rounded-2xl border border-border bg-paper-alt/40 p-5">
          <MonthlyRevenueChart months={months} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Sessões por status
        </h2>
        <div className="mt-4 space-y-2 rounded-2xl border border-border bg-paper-alt/40 p-5">
          {totalSessions === 0 ? (
            <p className="text-sm text-ink-soft">Nenhuma sessão ainda.</p>
          ) : (
            SESSION_STATUS_ORDER.map((status) => (
              <BarRow
                key={status}
                label={SESSION_STATUS_LABELS[status]}
                value={sessionStatusCounts[status] ?? 0}
                max={maxStatusCount}
              />
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Clientes por engajamento
        </h2>
        <div className="mt-4 space-y-2 rounded-2xl border border-border bg-paper-alt/40 p-5">
          {totalClients === 0 ? (
            <p className="text-sm text-ink-soft">Nenhum cliente ainda.</p>
          ) : (
            ENGAGEMENT_ORDER.map((status) => (
              <BarRow
                key={status}
                label={ENGAGEMENT_STATUS_LABELS[status]}
                value={clients.filter((c) => c.engagementStatus === status).length}
                max={totalClients}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
