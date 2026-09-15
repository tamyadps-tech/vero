import { TestListItem } from "@/components/professional/TestListItem";
import { ASSESSMENT_TEMPLATES, getResponseOptions } from "@/lib/assessments";
import type { ProfessionalClient } from "@/lib/professional-clients";

function TestCatalog() {
  return (
    <div className="space-y-3">
      {ASSESSMENT_TEMPLATES.map((template) => {
        const options = getResponseOptions(template.responseType);
        return (
          <details
            key={template.slug}
            className="rounded-xl border border-border bg-paper p-4"
          >
            <summary className="cursor-pointer font-medium text-ink">
              {template.name}
            </summary>
            <p className="mt-2 text-sm text-ink-soft">{template.description}</p>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Perguntas
            </p>
            <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-sm text-ink">
              {template.questions.map((question) => (
                <li key={question.id}>{question.text}</li>
              ))}
            </ol>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Escala de resposta
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {options.map((option) => option.label).join(" · ")}
            </p>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Faixas de resultado
            </p>
            <ul className="mt-1.5 space-y-0.5 text-sm text-ink-soft">
              {template.severityBands.map((band) => (
                <li key={band.label}>
                  {band.min}–{band.max}: {band.label}
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}

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

      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Testes disponíveis
        </h3>
        <p className="mt-1 text-xs text-ink-soft">
          Clique em cada um pra ver as perguntas e como o resultado é calculado.
        </p>
        <div className="mt-2">
          <TestCatalog />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Por cliente
        </h3>
        {clients === null ? (
          <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
        ) : clients.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Nenhum cliente ainda — assim que alguém agendar uma sessão com
            você, ele aparece aqui pra você enviar os testes.
          </p>
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
