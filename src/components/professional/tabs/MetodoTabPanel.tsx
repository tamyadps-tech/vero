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

export function MetodoTabPanel() {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Método</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Guias práticos com dicas e caminhos pra sua atuação com clientes —
        conteúdo curado e escrito pela equipe Vero.
      </p>

      <div className="mt-4 space-y-3">
        {METHOD_ARTICLES.map((article) => (
          <details
            key={article.slug}
            className="rounded-xl border border-border bg-paper p-4"
          >
            <summary className="flex cursor-pointer flex-wrap items-center gap-2 font-medium text-ink">
              {article.title}
              <CategoryBadge category={article.category} />
            </summary>
            <p className="mt-2 text-sm text-ink-soft">{article.summary}</p>

            <div className="mt-4 space-y-4">
              {article.sections.map((section) => (
                <div key={section.heading}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    {section.heading}
                  </p>
                  <div className="mt-1.5 space-y-2">
                    {section.body.map((paragraph, index) => (
                      <p key={index} className="text-sm text-ink">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
