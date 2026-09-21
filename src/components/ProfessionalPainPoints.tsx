const painPoints = [
  "Agenda num app, prontuário em outro, cobrança numa planilha — nada conversa entre si",
  "Definir preço no chute, sem saber se cobre os custos e ainda sobra margem saudável",
  "Anotações e ideias de sessão espalhadas em caderno, notas do celular ou grupos de WhatsApp",
  "Depender só de indicação boca a boca, sem controle sobre a própria divulgação",
  "Perceber tarde demais que um cliente sumiu, quando já não dá mais pra reengajar",
];

export function ProfessionalPainPoints() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-paper/80 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Pra quem atende
        </span>
        <h2 className="mt-5 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          Gerir o próprio negócio não devia ser mais cansativo que o trabalho em si
        </h2>
        <p className="mt-4 text-ink-soft">
          Se algum desses cenários soa familiar, o problema não é falta de esforço — é falta
          de uma estrutura que junte tudo:
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {painPoints.map((point) => (
          <div
            key={point}
            className="flex items-start gap-3 rounded-2xl border border-border bg-paper-alt/40 p-5 text-sm text-ink"
          >
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {point}
          </div>
        ))}
      </div>
    </section>
  );
}
