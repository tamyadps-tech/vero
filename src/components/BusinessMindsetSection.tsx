import { Reveal } from "@/components/Reveal";

const AMATEUR_SIGNS = [
  "Trabalha bastante, a agenda vive cheia, e mesmo assim não sabe dizer se está sobrando dinheiro no fim do mês",
  "Decide preço, horário e divulgação no feeling, sem nenhum número real por trás",
  "Perde cliente sem perceber a tempo de fazer alguma coisa a respeito",
  "Cresce até um certo ponto e trava ali, porque não existe estrutura pra sustentar mais gente atendida",
];

export function BusinessMindsetSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-paper/80 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Reflexão
        </span>
        <h2 className="mt-5 font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
          Você ainda trata seu negócio com{" "}
          <span className="text-accent">amadorismo</span>?
        </h2>
        <p className="mt-4 text-ink-soft">
          Ser bom no que faz (terapia, coaching, consultoria) é uma coisa.
          Administrar bem o negócio que vive disso é outra completamente
          diferente, e a segunda não se aprende na formação clínica. A partir
          do momento em que você atende mais de um cliente, você já é uma
          empresa, só que a maioria segue sendo dirigida no achismo.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {AMATEUR_SIGNS.map((sign, index) => (
          <Reveal key={sign} delayMs={index * 100}>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-paper-alt/40 p-5 text-sm text-ink">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {sign}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delayMs={AMATEUR_SIGNS.length * 100}>
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-primary/20 bg-primary-light/40 p-8">
          <h3 className="font-display text-2xl font-medium text-ink">
            O que é CRM, e por que isso decide se você cresce ou trava
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            CRM significa <em>Customer Relationship Management</em>, gestão do
            relacionamento com o cliente. Na prática, é o sistema que guarda
            tudo sobre cada pessoa que já falou com você: quem demonstrou
            interesse e nunca fechou, quem é cliente ativo, quem sumiu, o que
            foi combinado na última conversa, quando é hora de mandar um
            lembrete. Sem isso, essas informações vivem espalhadas em
            memória, caderno, WhatsApp e planilha, e o que não está
            organizado em algum lugar confiável acaba esquecido.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            O perigo de não cuidar disso não é abstrato: é lead que pergunta o
            preço e nunca mais recebe resposta, cliente satisfeito que some
            porque ninguém notou a tempo, detalhe importante da sessão
            anterior esquecido bem na hora que fazia diferença lembrar. Cada
            um desses momentos é uma oportunidade perdida, e quando isso se
            repete todo mês, é dinheiro deixado na mesa sem ninguém perceber
            o tamanho da perda.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Um negócio que trata isso como estrutura, não como detalhe, é o
            que separa quem vive de indicação eventual de quem constrói uma
            base de clientes que cresce de forma previsível.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
