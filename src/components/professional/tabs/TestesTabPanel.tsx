import { TestListItem } from "@/components/professional/TestListItem";
import { ASSESSMENT_TEMPLATES, CATEGORY_LABELS, getResponseOptions } from "@/lib/assessments";
import type { ProfessionalClient } from "@/lib/professional-clients";

function CategoryBadge({ category }: { category: "clinico" | "coaching" }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        category === "coaching"
          ? "bg-primary-light text-primary-dark"
          : "bg-accent-light text-accent-dark"
      }`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

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
            <summary className="flex cursor-pointer flex-wrap items-center gap-2 font-medium text-ink">
              {template.name}
              <CategoryBadge category={template.category} />
            </summary>
            <p className="mt-2 text-sm text-ink-soft">{template.description}</p>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Prévia do formulário que o cliente responde
            </p>
            <div className="mt-2 divide-y divide-border rounded-lg border border-border bg-paper-alt/40 px-3">
              {template.questions.map((question) => (
                <div key={question.id} className="py-3 first:pt-3 last:pb-3">
                  <p className="text-sm text-ink">{question.text}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5" aria-hidden="true">
                    {options.map((option) => (
                      <span
                        key={option.value}
                        className="rounded-lg border border-border bg-paper px-2.5 py-1 text-xs text-ink-soft"
                      >
                        {option.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {template.dimensions ? (
              <>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Resultado
                </p>
                <p className="mt-1.5 text-sm text-ink-soft">
                  Soma das respostas por dimensão — a de maior soma é o resultado:
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {template.dimensions.map((dimension) => (
                    <span
                      key={dimension.key}
                      className="rounded-full bg-paper-alt px-2.5 py-1 text-xs text-ink"
                    >
                      {dimension.label}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Faixas de resultado
                </p>
                <div className="mt-2 space-y-1.5">
                  {template.severityBands.map((band) => (
                    <div
                      key={band.label}
                      className="flex items-center gap-2 rounded-lg bg-paper-alt px-3 py-1.5 text-sm"
                    >
                      <span className="font-mono text-xs text-ink-soft">
                        {band.min}–{band.max}
                      </span>
                      <span className="text-ink">{band.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
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
