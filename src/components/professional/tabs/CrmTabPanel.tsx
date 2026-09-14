import { AssessmentReleaseToggles } from "@/components/professional/AssessmentReleaseToggles";
import { ENGAGEMENT_STATUS_LABELS } from "@/lib/client-engagement";
import type { ProfessionalClient } from "@/lib/professional-clients";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const ENGAGEMENT_BADGE_STYLES: Record<string, string> = {
  ativo: "bg-primary-light text-primary-dark",
  em_risco: "bg-accent-light text-accent-dark",
  inativo: "bg-paper-alt text-ink-soft",
};

export function CrmTabPanel({ clients }: { clients: ProfessionalClient[] | null }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
        Meus clientes
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Quem já passou por sessões com você, com histórico, valor
        vitalício (LTV) e sinal de quem precisa de reengajamento.
        Autoavaliações (PHQ-9, GAD-7, Roda da Vida) ficam ocultas pro
        cliente até você liberar — libere só quando fizer sentido
        clinicamente.
      </p>
      <div className="mt-4">
        {clients === null ? (
          <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
        ) : clients.length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhum cliente ainda.</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              {(["ativo", "em_risco", "inativo"] as const).map((status) => (
                <div
                  key={status}
                  className="rounded-xl border border-border bg-paper-alt/40 px-4 py-3"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    {ENGAGEMENT_STATUS_LABELS[status]}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-ink">
                    {clients.filter((c) => c.engagementStatus === status).length}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-paper px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-ink">
                      {client.full_name}{" "}
                      <span
                        className={`ml-1 rounded-full px-2 py-0.5 text-xs ${ENGAGEMENT_BADGE_STYLES[client.engagementStatus]}`}
                      >
                        {ENGAGEMENT_STATUS_LABELS[client.engagementStatus]}
                      </span>
                    </p>
                    <p className="text-xs text-ink-soft">{client.email}</p>
                  </div>
                  <div className="text-right text-xs text-ink-soft">
                    <p>
                      {client.sessionCount} sessõe{client.sessionCount === 1 ? "" : "s"} ·{" "}
                      LTV {formatPrice(client.totalPaidCents)}
                    </p>
                    {client.lastSessionAt && (
                      <p>Última: {dateFormatter.format(new Date(client.lastSessionAt))}</p>
                    )}
                  </div>
                  <AssessmentReleaseToggles
                    clientId={client.id}
                    releasedSlugs={client.releasedAssessmentSlugs}
                    latestAssessments={client.latestAssessments}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
