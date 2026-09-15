import { TestListItem } from "@/components/professional/TestListItem";
import { ASSESSMENT_TEMPLATES } from "@/lib/assessments";
import type { ProfessionalClient } from "@/lib/professional-clients";

export function TestesTabPanel({ clients }: { clients: ProfessionalClient[] | null }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Testes</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Visão completa das autoavaliações (PHQ-9, GAD-7, Roda da Vida) de
        cada cliente. O cliente só consegue responder depois que você
        envia o teste — envie só quando fizer sentido clinicamente, e
        confira as respostas completas de quem já respondeu.
      </p>
      <div className="mt-4 space-y-6">
        {clients === null ? (
          <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
        ) : clients.length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhum cliente ainda.</p>
        ) : (
          clients.map((client) => (
            <div key={client.id}>
              <p className="font-medium text-ink">{client.full_name}</p>
              <p className="text-xs text-ink-soft">{client.email}</p>
              <div className="mt-2 space-y-2">
                {ASSESSMENT_TEMPLATES.map((template) => (
                  <TestListItem
                    key={template.slug}
                    clientId={client.id}
                    template={template}
                    initialReleased={client.releasedAssessmentSlugs.includes(template.slug)}
                    latest={client.latestAssessments.find(
                      (a) => a.templateSlug === template.slug
                    )}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
