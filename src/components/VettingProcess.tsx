const steps = [
  {
    step: "01",
    title: "Candidatura completa",
    description:
      "O profissional envia formação, anos de experiência, especialidades, métodos e o documento da credencial (diploma, registro profissional como CRP, certificações).",
  },
  {
    step: "02",
    title: "Verificação pela equipe",
    description:
      "Conferimos o documento enviado e a experiência declarada antes de aprovar qualquer perfil. Quem não comprova não entra.",
  },
  {
    step: "03",
    title: "Perfil só fica público depois de aprovado",
    description:
      "Enquanto a candidatura está em análise, o perfil não aparece na busca. Ninguém agenda com alguém ainda não verificado.",
  },
  {
    step: "04",
    title: "Avaliações reais mantêm o padrão",
    description:
      "Só quem realizou a sessão pode avaliar. As notas e comentários ficam públicos no perfil pra sempre — não dá pra esconder um mau atendimento.",
  },
];

export function VettingProcess() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          Como funciona o vetting
        </h2>
        <p className="mt-4 text-ink-soft">
          A gente é rigoroso aqui de propósito — é isso que diferencia a
          Vero de procurar &ldquo;qualquer profissional&rdquo; na internet.
        </p>
      </div>
      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((item) => (
          <div key={item.step}>
            <span className="font-display text-2xl font-medium text-accent">
              {item.step}
            </span>
            <h3 className="mt-3 font-display text-base font-medium text-ink">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
