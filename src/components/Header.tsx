import Link from "next/link";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3.5">
        <Link href="/" aria-label="Vero — página inicial" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-soft xl:flex">
          <Link href="/profissionais" className="whitespace-nowrap hover:text-ink">
            Encontrar profissionais
          </Link>
          <Link href="/#para-profissionais" className="whitespace-nowrap hover:text-ink">
            Para profissionais
          </Link>
          <Link href="/palestrantes-e-treinadores" className="whitespace-nowrap hover:text-ink">
            Palestrantes
          </Link>
          <Link href="/blog" className="whitespace-nowrap hover:text-ink">
            Blog
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/entrar"
            className="rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition hover:text-ink sm:px-4"
          >
            Entrar
          </Link>
          <Link
            href="/c/cadastrar"
            className="whitespace-nowrap rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-paper shadow-soft transition hover:bg-primary-dark hover:shadow-lifted sm:px-5"
          >
            Cadastre-se aqui
          </Link>
        </div>
      </div>
    </header>
  );
}
