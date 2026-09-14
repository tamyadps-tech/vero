import Link from "next/link";

const points = [
  {
    title: "LGPD desde o design",
    description:
      "Seus dados são usados só pro que você pediu — agendar, acompanhar sessões, receber email transacional. Nada de venda de dados pra terceiros.",
  },
  {
    title: "Prontuário é privado",
    description:
      "Tópicos, tarefas e anotações de cada sessão só aparecem pra você e pro seu profissional. Ninguém mais tem acesso.",
  },
  {
    title: "Pagamento não passa pela Vero",
    description:
      "Quando há cobrança, o cartão vai direto pro Checkout da Stripe (processadora certificada PCI-DSS) — a Vero nunca vê nem guarda o número do seu cartão.",
  },
];

export function SecuritySection() {
  return (
    <section className="border-y border-border/70 bg-paper-alt/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-ink">
            Segurança e privacidade
          </h2>
          <p className="mt-4 text-ink-soft">
            Dados de saúde exigem mais cuidado — é assim que tratamos os
            seus.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {points.map((point) => (
            <div
              key={point.title}
              className="rounded-2xl border border-border bg-paper p-6"
            >
              <h3 className="font-semibold text-ink">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {point.description}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-ink-soft">
          Leia a{" "}
          <Link href="/privacidade" className="text-primary hover:underline">
            Política de Privacidade
          </Link>{" "}
          e o{" "}
          <Link href="/termos" className="text-primary hover:underline">
            Termo de Uso
          </Link>{" "}
          completos.
        </p>
      </div>
    </section>
  );
}
