import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Entrar — Vero",
  robots: { index: false, follow: false },
};

export default function ProfessionalLoginPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-md px-6 py-16">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
            Entrar como profissional
          </h1>
          <p className="mt-2 text-base text-ink-soft">
            Use o email e a senha que você cadastrou na candidatura.
          </p>
          <div className="mt-8">
            <LoginForm role="professional" redirectTo="/p/dashboard" />
          </div>
          <p className="mt-6 text-center text-base text-ink-soft">
            Ainda não se candidatou?{" "}
            <Link href="/profissionais/cadastro" className="text-primary hover:underline">
              Cadastre-se aqui
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
