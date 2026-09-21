"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ENGAGEMENT_STATUS_LABELS } from "@/lib/client-engagement";
import {
  CRM_STAGES,
  CRM_STAGE_LABELS,
  contactLinkId,
  type CrmContactSummary,
  type CrmStage,
} from "@/lib/professional-crm";
import { AddLeadForm } from "@/components/professional/AddLeadForm";
import { useDashboardShell } from "@/components/professional/DashboardShellContext";

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

const STAGE_BADGE_STYLES: Record<CrmStage, string> = {
  lead: "bg-paper-alt text-ink-soft",
  contatado: "bg-primary-light text-primary-dark",
  agendado: "bg-primary-light text-primary-dark",
  cliente_ativo: "bg-primary-light text-primary-dark",
  inativo: "bg-accent-light text-accent-dark",
};

export function CrmTabPanel({ contacts }: { contacts: CrmContactSummary[] | null }) {
  const { requestCampaignFor } = useDashboardShell();
  const [showAddForm, setShowAddForm] = useState(false);
  const [stageFilter, setStageFilter] = useState<"todos" | CrmStage>("todos");
  const [tagFilter, setTagFilter] = useState<string>("todas");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const c of contacts ?? []) {
      for (const tag of c.tags) set.add(tag);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [contacts]);

  const filtered = useMemo(() => {
    return (contacts ?? []).filter((c) => {
      if (stageFilter !== "todos" && c.stage !== stageFilter) return false;
      if (tagFilter !== "todas" && !c.tags.includes(tagFilter)) return false;
      return true;
    });
  }, [contacts, stageFilter, tagFilter]);

  // Só clientes reais (com conta) recebem campanha — lead ainda não tem
  // sessão verificada, então o envio nunca confiaria só no email dele.
  const campaignEligibleIds = filtered
    .filter((c) => c.clientId)
    .map((c) => c.clientId as string);

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Meus clientes
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Clientes reais (quem já passou por sessão) e leads que você cadastrar
            manualmente, num funil só. Clique num contato pra ver detalhe, notas e
            tarefas de follow-up.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <a
            href="/api/professional/crm/export"
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-primary hover:text-ink"
          >
            Exportar CSV
          </a>
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary-dark transition hover:bg-primary-light"
          >
            + Novo contato
          </button>
        </div>
      </div>

      {showAddForm && <AddLeadForm onDone={() => setShowAddForm(false)} />}

      <div className="mt-4">
        {contacts === null ? (
          <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
        ) : contacts.length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhum contato ainda.</p>
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
                    {contacts.filter((c) => c.engagementStatus === status).length}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value as "todos" | CrmStage)}
                className="rounded-lg border border-border bg-paper px-3 py-1.5 text-xs text-ink"
              >
                <option value="todos">Todos os estágios</option>
                {CRM_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {CRM_STAGE_LABELS[stage]}
                  </option>
                ))}
              </select>
              {allTags.length > 0 && (
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="rounded-lg border border-border bg-paper px-3 py-1.5 text-xs text-ink"
                >
                  <option value="todas">Todas as tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              )}
              {campaignEligibleIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => requestCampaignFor(campaignEligibleIds)}
                  className="rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary-dark transition hover:bg-primary-light"
                >
                  Mandar campanha pros {campaignEligibleIds.length} filtrado
                  {campaignEligibleIds.length === 1 ? "" : "s"}
                </button>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {filtered.length === 0 && (
                <p className="text-sm text-ink-soft">Nenhum contato com esse filtro.</p>
              )}
              {filtered.map((contact) => (
                <Link
                  key={contactLinkId(contact)}
                  href={`/p/dashboard/clientes/${contactLinkId(contact)}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-paper px-4 py-3 text-sm transition hover:border-primary"
                >
                  <div>
                    <p className="font-medium text-ink">
                      {contact.fullName}{" "}
                      <span
                        className={`ml-1 rounded-full px-2 py-0.5 text-xs ${STAGE_BADGE_STYLES[contact.stage]}`}
                      >
                        {CRM_STAGE_LABELS[contact.stage]}
                      </span>
                      {contact.engagementStatus && (
                        <span
                          className={`ml-1 rounded-full px-2 py-0.5 text-xs ${ENGAGEMENT_BADGE_STYLES[contact.engagementStatus]}`}
                        >
                          {ENGAGEMENT_STATUS_LABELS[contact.engagementStatus]}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-ink-soft">{contact.email}</p>
                    {contact.tags.length > 0 && (
                      <p className="mt-1 flex flex-wrap gap-1">
                        {contact.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-paper-alt px-2 py-0.5 text-[11px] text-ink-soft"
                          >
                            {tag}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-ink-soft">
                    {contact.isLead ? (
                      <p>Sem sessão ainda</p>
                    ) : (
                      <>
                        <p>
                          {contact.sessionCount} sessõe{contact.sessionCount === 1 ? "" : "s"} ·{" "}
                          LTV {formatPrice(contact.totalPaidCents)}
                        </p>
                        {contact.lastSessionAt && (
                          <p>Última: {dateFormatter.format(new Date(contact.lastSessionAt))}</p>
                        )}
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
