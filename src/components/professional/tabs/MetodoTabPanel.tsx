import { METHOD_ARTICLES } from "@/lib/method-articles";
import { CATEGORY_LABELS } from "@/lib/assessments";

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

function KindBadge({ kind }: { kind: "artigo" | "ficha" }) {
  if (kind !== "ficha") return null;
  return (
    <span className="rounded-full bg-paper-alt px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-soft">
      Ficha de condução
    </span>
  );
}

export function MetodoTabPanel() {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Método</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Guias práticos com dicas e caminhos pra sua atuação com clientes,
        e fichas de condução — roteiros de perguntas abertas pra usar
        ao vivo em sessão. Conteúdo curado e escrito pela equipe Vero.
      </p>

      <div className="mt-6 divide-y divide-border">
        {METHOD_ARTICLES.map((article) => (
          <article key={article.slug} className="py-8 first:pt-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-ink">{article.title}</h3>
              <CategoryBadge category={article.category} />
              <KindBadge kind={article.kind} />
            </div>
            <p className="mt-1.5 text-sm text-ink-soft">{article.summary}</p>

            <div className="mt-5 space-y-5">
              {article.sections.map((section) => (
                <div key={section.heading}>
                  <h4 className="text-sm font-semibold text-ink">{section.heading}</h4>
                  {article.kind === "ficha" ? (
                    <ol className="mt-2 list-decimal space-y-2 pl-5">
                      {section.body.map((question, index) => (
                        <li key={index} className="text-sm leading-relaxed text-ink">
                          {question}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="mt-2 space-y-3">
                      {section.body.map((paragraph, index) => (
                        <p key={index} className="text-sm leading-relaxed text-ink-soft">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
