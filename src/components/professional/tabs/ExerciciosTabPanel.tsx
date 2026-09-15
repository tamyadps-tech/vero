import { ExerciseListItem } from "@/components/professional/ExerciseListItem";
import { EXERCISES } from "@/lib/exercises";
import type { ProfessionalClient } from "@/lib/professional-clients";

function ExerciseCatalog() {
  return (
    <div className="space-y-3">
      {EXERCISES.map((exercise) => (
        <details
          key={exercise.slug}
          className="rounded-xl border border-border bg-paper p-4"
        >
          <summary className="cursor-pointer font-medium text-ink">{exercise.name}</summary>
          <p className="mt-2 text-sm text-ink-soft">{exercise.description}</p>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Contexto mostrado pro cliente
          </p>
          <p className="mt-1.5 whitespace-pre-line text-sm text-ink">{exercise.instructions}</p>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Perguntas
          </p>
          <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-sm text-ink">
            {exercise.prompts.map((prompt) => (
              <li key={prompt.id}>{prompt.label}</li>
            ))}
          </ol>

          <div className="mt-5 rounded-lg bg-paper-alt px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Pra você, profissional
            </p>
            <p className="mt-1 text-sm text-ink">{exercise.professionalNote}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

export function ExerciciosTabPanel({ clients }: { clients: ProfessionalClient[] | null }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Exercícios</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Reflexões em texto livre — sem pontuação, o &quot;resultado&quot; é o que
        o cliente escreve. O cliente só consegue responder depois que
        você envia o exercício.
      </p>

      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Exercícios disponíveis
        </h3>
        <p className="mt-1 text-xs text-ink-soft">
          Clique em cada um pra ver o contexto, as perguntas e a orientação de uso.
        </p>
        <div className="mt-2">
          <ExerciseCatalog />
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
            você, ele aparece aqui pra você enviar os exercícios.
          </p>
        ) : (
          clients.map((client) => (
            <div key={client.id}>
              <p className="font-medium text-ink">{client.full_name}</p>
              <p className="text-xs text-ink-soft">{client.email}</p>
              <div className="mt-2 space-y-2">
                {EXERCISES.map((exercise) => (
                  <ExerciseListItem
                    key={exercise.slug}
                    clientId={client.id}
                    exercise={exercise}
                    initialReleased={client.releasedExerciseSlugs.includes(exercise.slug)}
                    latest={client.latestExercises.find(
                      (e) => e.templateSlug === exercise.slug
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
