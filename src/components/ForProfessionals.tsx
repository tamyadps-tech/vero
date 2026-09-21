import Link from "next/link";

const perks = [
  "Agenda, prontuário e cobrança num só lugar",
  "Calculadora de margem e preço sugerido, a partir dos seus custos reais — chega de cobrar no chute",
  "Testes e exercícios prontos pra enviar, pra nunca faltar ideia de conteúdo pra próxima sessão",
  "CRM com o histórico de cada cliente e o valor que ele já gerou (LTV)",
  "Sinal de quem está sumindo, pra você reengajar antes de perder o cliente",
  "Envie mensagens (avisos, novidades, promoções) direto pros seus clientes",
  "Perfil público com avaliações reais de clientes",
  "Resumo de sessão automático — você não escreve o email",
  "Comissão simples por sessão, sem mensalidade no início",
];

export function ForProfessionals() {
  return (
    <section id="para-profissionais" className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-10 rounded-3xl border border-border bg-paper-alt/50 p-8 shadow-soft sm:grid-cols-2 sm:p-12">
        <div>
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Para profissionais
          </h2>
          <p className="mt-4 text-ink-soft">
            Menos ferramentas soltas, mais tempo com quem importa: seus
            clientes.
          </p>
          <ul className="mt-6 space-y-3">
            {perks.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-3 text-sm text-ink"
              >
                <svg
                  viewBox="0 0 20 20"
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary"
                  fill="currentColor"
                >
                  <path d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.6 3.6 6.7-6.7a1 1 0 011.4 0z" />
                </svg>
                {perk}
              </li>
            ))}
          </ul>
        </div>
        <div id="lista-espera-profissional" className="flex flex-col justify-center">
          <p className="mb-3 text-sm font-medium text-ink">
            Candidate-se e aguarde a aprovação da equipe — todo perfil
            precisa ser verificado antes de ir ao ar:
          </p>
          <Link
            href="/profissionais/cadastro"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-paper shadow-soft transition hover:bg-primary-dark hover:shadow-lifted"
          >
            Cadastre-se aqui
          </Link>
        </div>
      </div>
    </section>
  );
}
