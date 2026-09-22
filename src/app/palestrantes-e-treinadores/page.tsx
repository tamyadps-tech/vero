import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Palestrantes e treinadores — Vero",
  description:
    "Encontre palestrantes e treinadores verificados pra levar desenvolvimento de verdade pra sua empresa — com avaliações reais de quem já contratou.",
};

const painPoints = [
  "Treinamentos genéricos que ninguém lembra depois de uma semana",
  "Dificuldade de achar um palestrante confiável, sem depender só de indicação",
  "Engajamento baixo em capacitações obrigatórias — todo mundo só quer que acabe",
  "Orçamento de desenvolvimento gasto em algo que não muda comportamento nenhum",
];

const benefits = [
  {
    title: "Equipe mais engajada",
    description:
      "Conteúdo relevante, aplicado à realidade do time, muda a forma como as pessoas encaram capacitação — deixa de ser obrigação e vira interesse.",
  },
  {
    title: "Habilidade que sai da teoria",
    description:
      "A diferença entre uma palestra motivacional e um treinamento que funciona é ferramenta prática que a equipe usa depois — não só slide bonito.",
  },
  {
    title: "Retenção de talento",
    description:
      "Investir em desenvolvimento é um dos sinais mais fortes de que a empresa se importa com quem trabalha nela — e isso aparece na retenção.",
  },
  {
    title: "Marca empregadora mais forte",
    description:
      "Empresa que desenvolve gente de verdade constrói reputação — dentro e fora, com quem já trabalha lá e com quem está pensando em entrar.",
  },
];

const formats = [
  {
    title: "Palestra corporativa",
    description: "Um evento, um tema, impacto imediato — pra kickoffs, convenções ou datas específicas.",
  },
  {
    title: "Workshop prático",
    description: "Formato mais interativo, com exercícios e aplicação direta durante o próprio encontro.",
  },
  {
    title: "Treinamento in-company contínuo",
    description: "Séries de encontros pra desenvolver uma competência específica ao longo do tempo, com acompanhamento de evolução.",
  },
];

export default function PalestrantesETreinadoresPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/70">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-light blur-3xl" />
          <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-paper/80 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft shadow-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Palestrantes e treinadores
            </span>
            <h1 className="mt-6 font-display text-4xl font-medium leading-tight tracking-tight text-ink sm:text-5xl">
              Palestras e treinamentos que ficam
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
              Encontre especialistas verificados pra levar desenvolvimento de verdade pra sua
              empresa — com avaliações reais de quem já contratou, não só um portfólio bonito.
            </p>
            <Link
              href="/profissionais?category=palestrante"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-paper shadow-soft transition hover:bg-primary-dark hover:shadow-lifted"
            >
              Ver palestrantes e treinadores
              <span>→</span>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              O treinamento certo resolve problema de verdade
            </h2>
            <p className="mt-4 text-ink-soft">
              Se algum desses cenários é familiar, provavelmente o problema não é falta de
              orçamento — é escolha de quem conduz:
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {painPoints.map((point, index) => (
              <Reveal key={point} delayMs={index * 100}>
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-paper-alt/40 p-5 text-sm text-ink">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {point}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="border-y border-border/70 bg-paper-alt/40">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
                O que muda com o profissional certo
              </h2>
              <p className="mt-4 text-ink-soft">
                Segundo a Federação Internacional de Coaching (ICF), até 70% de quem passa por
                acompanhamento profissional relata melhora real no desempenho e nas relações —
                o mesmo princípio vale pra treinamento em equipe, quando conduzido por quem
                sabe transformar conteúdo em prática.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {benefits.map((benefit, index) => (
                <Reveal key={benefit.title} delayMs={index * 100}>
                  <div className="h-full rounded-2xl border border-border bg-paper p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lifted">
                    <h3 className="font-display text-lg font-medium text-ink">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {benefit.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              Formatos disponíveis
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {formats.map((format, index) => (
              <Reveal key={format.title} delayMs={index * 100}>
                <div className="h-full rounded-2xl border border-border bg-paper p-6 shadow-soft">
                  <h3 className="font-display text-lg font-medium text-ink">{format.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {format.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <Reveal>
            <div className="rounded-2xl border border-primary/20 bg-primary-light/40 p-8 text-center shadow-soft">
              <h2 className="font-display text-xl font-medium text-ink">
                Escolha com a mesma confiança de quem já contratou
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                Todo palestrante e treinador na Vero passa por verificação de credenciais e
                acumula avaliações reais de quem já contratou uma sessão — nada de escolher no
                escuro.
              </p>
              <Link
                href="/profissionais?category=palestrante"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-paper shadow-soft transition hover:bg-primary-dark hover:shadow-lifted"
              >
                Ver palestrantes e treinadores
                <span>→</span>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
