import Link from "next/link";

const shifts = [
  {
    before: "Ansiedade que não passa, mesmo tentando “dar conta sozinho(a)”",
    after: "Ferramentas práticas pra lidar com a ansiedade no dia a dia",
  },
  {
    before: "Sensação de estar sempre apagando incêndio",
    after: "Clareza sobre prioridades — e espaço pra dizer não ao resto",
  },
  {
    before: "Metas de carreira ou de vida que nunca saem do papel",
    after: "Um plano com etapas, revisado com quem te acompanha de perto",
  },
  {
    before: "Cansaço que continua mesmo depois de dormir",
    after: "Rotina mais sustentável, com descanso de verdade — sem culpa",
  },
];

export function DesiredState() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-paper/80 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          O que muda
        </span>
        <h2 className="mt-5 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          Como fica quando você tem o apoio certo
        </h2>
        <p className="mt-4 text-ink-soft">
          Não é sobre virar outra pessoa da noite pro dia — é sobre ter, com
          regularidade, alguém que te ajuda a sair do modo sobrevivência.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-border shadow-soft">
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="bg-paper-alt/50 px-5 py-3 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Hoje
            </p>
          </div>
          <div className="bg-primary-light/40 px-5 py-3 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
              Com acompanhamento
            </p>
          </div>
        </div>
        {shifts.map((shift) => (
          <div
            key={shift.before}
            className="grid grid-cols-2 divide-x divide-border border-t border-border"
          >
            <p className="px-5 py-4 text-sm leading-relaxed text-ink-soft sm:px-8">
              {shift.before}
            </p>
            <p className="bg-primary-light/10 px-5 py-4 text-sm leading-relaxed text-ink sm:px-8">
              {shift.after}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/profissionais"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-paper shadow-soft transition hover:bg-primary-dark hover:shadow-lifted"
        >
          Quero começar essa mudança
          <span>→</span>
        </Link>
      </div>
    </section>
  );
}
