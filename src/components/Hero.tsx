import Link from "next/link";

const trustPoints = [
  { label: "Vetting manual", detail: "credencial conferida" },
  { label: "Sem mensalidade", detail: "cliente paga só a sessão" },
  { label: "Progresso visual", detail: "acompanhado no painel" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(var(--color-border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 90%)",
        }}
      />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-light blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-52 h-96 w-96 rounded-full bg-accent-light blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-paper/80 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft shadow-soft backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Marketplace de saúde &amp; bem-estar
          </span>
          <h1 className="mt-7 font-display text-5xl font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Profissionais verificados.
            <br className="hidden sm:block" /> Progresso que{" "}
            <span className="text-primary">se vê</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            A Vero conecta terapeutas, psicólogos, coaches e consultores a
            clientes que buscam acompanhamento sério — com aprovação por
            vetting, resumo de sessão automático e progresso visual, tudo
            na sua própria conta.
          </p>
        </div>
        <div
          id="lista-espera-cliente"
          className="mx-auto mt-10 flex max-w-md flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/c/cadastrar"
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-paper shadow-soft transition hover:bg-primary-dark hover:shadow-lifted"
          >
            Cadastre-se aqui
            <span className="transition group-hover:translate-x-0.5">→</span>
          </Link>
          <Link
            href="/profissionais"
            className="text-sm font-medium text-ink-soft transition hover:text-ink"
          >
            ou encontre um profissional
          </Link>
        </div>

        <div className="mx-auto mt-16 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-border/70 pt-8">
          {trustPoints.map((point, i) => (
            <div key={point.label} className="flex items-center gap-8">
              {i > 0 && <span className="hidden h-8 w-px bg-border sm:block" />}
              <div className="text-center sm:text-left">
                <p className="font-display text-base font-medium text-ink">
                  {point.label}
                </p>
                <p className="text-xs text-ink-soft">{point.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
