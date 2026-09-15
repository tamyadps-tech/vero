import { AssessmentReleaseCell } from "@/components/professional/AssessmentReleaseCell";
import { ASSESSMENT_TEMPLATES } from "@/lib/assessments";
import type { ProfessionalClient } from "@/lib/professional-clients";

export function TestesTabPanel({ clients }: { clients: ProfessionalClient[] | null }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Testes</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Visão de todos os seus clientes e as autoavaliações (PHQ-9, GAD-7,
        Roda da Vida). Cada teste fica escondido no painel do cliente até
        você liberar aqui — libere só quando fizer sentido clinicamente.
      </p>
      <div className="mt-4">
        {clients === null ? (
          <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
        ) : clients.length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhum cliente ainda.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-alt/60 text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-2.5">Cliente</th>
                  {ASSESSMENT_TEMPLATES.map((template) => (
                    <th key={template.slug} className="px-4 py-2.5">
                      {template.name.split(" — ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{client.full_name}</p>
                      <p className="text-xs text-ink-soft">{client.email}</p>
                    </td>
                    {ASSESSMENT_TEMPLATES.map((template) => (
                      <td key={template.slug} className="px-4 py-3">
                        <AssessmentReleaseCell
                          clientId={client.id}
                          templateSlug={template.slug}
                          initialReleased={client.releasedAssessmentSlugs.includes(template.slug)}
                          latest={client.latestAssessments.find(
                            (a) => a.templateSlug === template.slug
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
