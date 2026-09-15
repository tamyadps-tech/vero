import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-light blur-3xl" />
      <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-accent-light blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-paper-alt px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
            Marketplace de saúde &amp; bem-estar
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
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
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-paper transition hover:bg-primary-dark"
          >
            Cadastre-se aqui
          </Link>
          <Link
            href="/profissionais"
            className="text-sm font-medium text-ink-soft hover:text-ink"
          >
            ou encontre um profissional
          </Link>
        </div>
      </div>
    </section>
  );
}
