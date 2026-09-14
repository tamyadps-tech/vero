import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Entrar — Vero",
  robots: { index: false, follow: false },
};

export default function ClientLoginPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-md px-6 py-16">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Entrar
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Acompanhe suas sessões e progresso.
          </p>
          <div className="mt-8">
            <LoginForm role="client" redirectTo="/c/dashboard" />
          </div>
          <p className="mt-6 text-center text-sm text-ink-soft">
            Ainda não tem conta?{" "}
            <Link href="/c/cadastrar" className="text-primary hover:underline">
              Criar conta
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
