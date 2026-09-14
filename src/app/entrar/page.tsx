import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Entrar — Vero",
  robots: { index: false, follow: false },
};

export default function EntrarChooserPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-6 py-16">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Entrar na Vero
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Escolha como você usa a Vero.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-paper-alt/40 p-6">
              <h2 className="font-semibold text-ink">Sou cliente</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Agendar sessões e acompanhar meu progresso.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/c/entrar"
                  className="rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-paper transition hover:bg-primary-dark"
                >
                  Entrar
                </Link>
                <Link
                  href="/c/cadastrar"
                  className="text-center text-sm text-primary hover:underline"
                >
                  Criar conta
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-paper-alt/40 p-6">
              <h2 className="font-semibold text-ink">Sou profissional</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Gerenciar agenda, clientes e sessões.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/p/entrar"
                  className="rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-paper transition hover:bg-primary-dark"
                >
                  Entrar
                </Link>
                <Link
                  href="/profissionais/cadastro"
                  className="text-center text-sm text-primary hover:underline"
                >
                  Candidatar-se
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
