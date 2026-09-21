import Link from "next/link";

const stats = [
  {
    number: "1 em 8",
    label: "pessoas no mundo",
    detail:
      "vivem com algum transtorno mental, segundo o Relatório Mundial de Saúde Mental da Organização Mundial da Saúde (OMS).",
  },
  {
    number: "Nº1",
    label: "em ansiedade",
    detail:
      "O Brasil é apontado pela OMS como o país com a maior prevalência de ansiedade do mundo.",
  },
  {
    number: "70%",
    label: "relatam melhora real",
    detail:
      "de quem passa por acompanhamento com coaching relata evolução no desempenho e nas relações, segundo a Federação Internacional de Coaching (ICF).",
  },
  {
    number: "Maioria",
    label: "nunca busca ajuda",
    detail:
      "A maior parte de quem precisa de acompanhamento nunca chega a iniciar um tratamento, segundo a OMS — muitas vezes por não saber por onde começar.",
  },
];

export function WhyItMatters() {
  return (
    <section id="por-que-importa" className="border-y border-border/70 bg-paper-alt/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-paper/80 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Por que isso importa
          </span>
          <h2 className="mt-5 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Cuidar da cabeça não devia ficar pro fim da lista
          </h2>
          <p className="mt-4 text-ink-soft">
            Ansiedade, sobrecarga, estagnação na carreira, relações que travam — a maioria de
            nós carrega alguma dessas dores em silêncio, esperando &quot;ter mais tempo&quot;
            pra cuidar disso. Só que esse tempo raramente chega sozinho. Os números mostram
            por que vale dar o primeiro passo agora:
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-paper p-6 shadow-soft"
            >
              <p className="font-display text-3xl font-medium text-primary">{stat.number}</p>
              <p className="mt-1 text-sm font-semibold text-ink">{stat.label}</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">{stat.detail}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-primary/20 bg-primary-light/40 p-8 text-center shadow-soft">
          <h3 className="font-display text-xl font-medium text-ink">
            Um espaço de acolhimento, não de julgamento
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            Na Vero você não está escolhendo &quot;um nome qualquer na internet&quot; — está
            escolhendo entre profissionais que passaram por verificação de credenciais e que
            têm avaliações reais de quem já fez sessão com eles. É a chance de dar esse
            primeiro passo com quem é, de fato, confiável.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/profissionais"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-paper shadow-soft transition hover:bg-primary-dark hover:shadow-lifted"
            >
              Encontrar meu profissional
              <span>→</span>
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-ink-soft transition hover:text-ink"
            >
              ler mais no blog
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
