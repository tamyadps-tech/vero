import { Reveal } from "@/components/Reveal";

const features = [
  {
    number: "01",
    title: "Vetting de verdade",
    description:
      "Cada profissional passa por verificação de credenciais (CRP, certificações, diplomas) antes de entrar na Vero. Só aprova quem comprova.",
  },
  {
    number: "02",
    title: "Avaliações públicas",
    description:
      "Só quem realizou sessão pode avaliar. Rating e comentários ficam visíveis no perfil — prova social real, sem espaço para fraude.",
  },
  {
    number: "03",
    title: "Progresso visual, na sua conta",
    description:
      "Depois de cada sessão, o cliente recebe um resumo por email e acompanha sua evolução no próprio painel, com histórico completo de tudo.",
  },
];

export function Features() {
  return (
    <section id="confianca" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          Confiança do primeiro clique à última sessão
        </h2>
        <p className="mt-4 text-ink-soft">
          Três pilares resolvem o que mais trava marketplaces de saúde e
          bem-estar: confiança, engajamento e retenção.
        </p>
      </div>
      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {features.map((feature, index) => (
          <Reveal key={feature.title} delayMs={index * 100}>
            <div className="h-full border-t-2 border-ink pt-5">
              <p className="font-display text-4xl font-medium text-accent">
                {feature.number}
              </p>
              <h3 className="mt-3 font-display text-lg font-medium text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {feature.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
