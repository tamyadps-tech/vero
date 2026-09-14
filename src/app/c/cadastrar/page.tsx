import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ClientSignupForm } from "@/components/auth/ClientSignupForm";

export const metadata: Metadata = {
  title: "Criar conta — Vero",
  robots: { index: false, follow: false },
};

export default function ClientSignupPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-md px-6 py-16">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Criar conta
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Pra agendar sessões e acompanhar seu progresso.
          </p>
          <div className="mt-8">
            <ClientSignupForm redirectTo="/c/dashboard" />
          </div>
          <p className="mt-6 text-center text-sm text-ink-soft">
            Já tem conta?{" "}
            <Link href="/c/entrar" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
