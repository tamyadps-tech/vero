const steps = [
  {
    step: "01",
    title: "Encontre e agende",
    description:
      "Busque por especialidade, veja avaliações reais e agende sua sessão com um profissional aprovado pela Vero.",
  },
  {
    step: "02",
    title: "Tenha sua sessão",
    description:
      "Online ou presencial. O profissional registra tópicos, metas e tarefas no prontuário compartilhado.",
  },
  {
    step: "03",
    title: "Acompanhe seu progresso",
    description:
      "Receba um resumo por email e veja sua evolução no seu painel pessoal, com o histórico de todas as sessões.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="border-y border-border/70 bg-paper-alt/40"
    >
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Como funciona
          </h2>
          <p className="mt-4 text-ink-soft">
            Do agendamento ao acompanhamento, sem ferramentas soltas.
          </p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step}>
              <span className="font-display text-3xl font-medium text-accent">
                {item.step}
              </span>
              <h3 className="mt-3 font-display text-lg font-medium text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
