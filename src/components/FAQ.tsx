const faqs = [
  {
    question: "Os profissionais são verificados de verdade?",
    answer:
      "Sim. Todo perfil passa por vetting antes de ficar público — conferimos credencial (diploma, registro como CRP) e experiência declarada. Veja o processo completo acima.",
  },
  {
    question: "Meus dados ficam seguros?",
    answer:
      "Sim, seguimos a LGPD e não vendemos dados pra terceiros. Prontuário e histórico de sessão só ficam visíveis pra você e pro seu profissional. Detalhes na Política de Privacidade.",
  },
  {
    question: "Preciso pagar alguma mensalidade?",
    answer:
      "Não. Como cliente, você paga só a sessão em si, quando o profissional cobra. Sem taxa de adesão, sem mensalidade.",
  },
  {
    question: "Como cancelo ou remarco uma sessão?",
    answer:
      "Por enquanto isso é combinado direto com o profissional (contato dele aparece depois de agendar) ou escrevendo pra suporte@vero.app — o cancelamento pelo próprio painel ainda está a caminho.",
  },
  {
    question: "Preciso criar conta?",
    answer:
      "Sim — leva menos de um minuto, só email e senha. É o que garante que seu histórico e progresso fiquem só com você.",
  },
  {
    question: "Sou profissional, como entro na Vero?",
    answer:
      "Se candidate em /profissionais/cadastro com seus dados e credencial. Depois de aprovado, você já entra com o email e a senha que cadastrou.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
      <div className="text-center">
        <h2 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          Perguntas frequentes
        </h2>
      </div>
      <div className="mt-10 space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-2xl border border-border bg-paper p-5 shadow-soft transition open:shadow-lifted"
          >
            <summary className="cursor-pointer list-none font-medium text-ink marker:content-none">
              <span className="flex items-center justify-between gap-3">
                {faq.question}
                <span className="shrink-0 text-ink-soft transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-ink-soft">
        Outra dúvida?{" "}
        <a href="mailto:suporte@vero.app" className="text-primary hover:underline">
          suporte@vero.app
        </a>
      </p>
    </section>
  );
}
