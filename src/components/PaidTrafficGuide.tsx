const STEPS: { title: string; body: string[] }[] = [
  {
    title: "1. Antes de gastar 1 real",
    body: [
      "Defina o objetivo com uma frase clara: \"quero X agendamentos novos por mês pagando até Y por cliente\". Sem isso, não dá pra saber depois se o anúncio funcionou ou não.",
      "Separe um orçamento de teste pequeno (R$20 a R$50 por dia já é suficiente pra começar) e trate como um experimento, não como uma aposta grande. Ninguém acerta o anúncio de primeira.",
      "Garanta que o link de destino (seu perfil na Vero, ou um WhatsApp) está pronto pra receber gente: perfil completo, foto boa, preço claro. Anúncio bom levando pra perfil incompleto desperdiça o clique.",
    ],
  },
  {
    title: "2. Escolha a plataforma",
    body: [
      "Instagram e Facebook Ads (pelo Meta Ads Manager): bom pra quem já tem perfil ativo, público mais visual, funciona bem pra terapia, coaching e consultoria porque as pessoas descobrem o profissional \"por acaso\" enquanto rolam o feed.",
      "Google Ads: aparece pra quem já está procurando ativamente (\"psicólogo perto de mim\", \"coach de carreira online\"), costuma converter mais rápido mas exige mais orçamento e configuração.",
      "Pra quem está começando, Instagram/Meta Ads costuma ser o ponto de partida mais simples e barato.",
    ],
  },
  {
    title: "3. Defina o público (segmentação)",
    body: [
      "Escolha idade, localização e interesses de quem realmente se beneficiaria do seu trabalho, não \"todo mundo\". Um público muito amplo custa mais caro por resultado.",
      "Comece específico e vá ampliando: é mais fácil um público pequeno e certeiro do que um público grande e genérico.",
      "Se atende presencial, sempre limite a região, anúncio nacional pra quem só atende numa cidade é dinheiro jogado fora.",
    ],
  },
  {
    title: "4. Crie o criativo (imagem/vídeo + texto)",
    body: [
      "A imagem ou vídeo precisa parar o scroll em menos de 2 segundos: rosto real (seu, não banco de imagens), boa iluminação, texto curto sobreposto se possível.",
      "O texto do anúncio deve nomear a dor ou o desejo de quem você quer atrair (\"cansado de terapia que não sai do lugar?\") antes de falar de você.",
      "Termine sempre com uma ação clara: \"agende sua primeira sessão\", \"mande mensagem\", não deixe a pessoa adivinhar o próximo passo.",
    ],
  },
  {
    title: "5. Publique com orçamento de teste",
    body: [
      "Rode por pelo menos 3 a 5 dias antes de julgar, o algoritmo precisa de tempo pra aprender quem responde melhor ao anúncio.",
      "Evite mudar o anúncio no meio do teste (texto, imagem, público), cada mudança reinicia o aprendizado da plataforma.",
      "Teste duas versões diferentes (imagem ou texto) ao mesmo tempo com o mesmo orçamento pra descobrir qual funciona melhor, em vez de adivinhar.",
    ],
  },
  {
    title: "6. Meça o resultado",
    body: [
      "Acompanhe CTR (quantos clicaram), quantos viraram lead de verdade (mandaram mensagem, agendaram) e o CAC (quanto custou cada cliente novo), todos explicados no manual de marketing acima.",
      "Calcule o ROAS: quanto voltou em sessões pagas pra cada real investido no anúncio. Esse é o número que decide se vale continuar.",
      "Não julgue só pelo alcance ou pelos likes, um anúncio pode parecer \"bombando\" e não trazer cliente nenhum.",
    ],
  },
  {
    title: "7. Ajuste ou pause",
    body: [
      "Se o CTR estiver baixo, o problema geralmente é a peça (imagem/texto), troque antes de aumentar orçamento.",
      "Se o CTR estiver bom mas ninguém vira cliente, o problema pode estar no perfil ou na primeira resposta, revise o que a pessoa encontra depois do clique.",
      "Se o ROAS for positivo, aumente o orçamento aos poucos (20% a 30% por vez), não dobre de uma vez, isso costuma piorar o desempenho.",
      "Se depois de um teste honesto (orçamento e tempo mínimos) o resultado continuar ruim, pause e revise a estratégia inteira antes de continuar gastando.",
    ],
  },
];

const MISTAKES: string[] = [
  "Aumentar o orçamento de um anúncio ruim esperando que \"gastando mais\" ele melhore, isso só faz o prejuízo crescer mais rápido.",
  "Trocar a peça do anúncio todo dia, sem deixar o algoritmo aprender, e nunca saber o que realmente funcionou.",
  "Anunciar pra público genérico demais achando que \"quanto mais gente ver, melhor\", quando público certeiro custa menos por resultado.",
  "Medir sucesso por curtida e comentário, sem nunca calcular quanto isso custou por cliente de verdade (CAC).",
  "Levar o clique pra um perfil incompleto ou sem preço claro, perdendo pessoas que já estavam interessadas o bastante pra clicar.",
];

export function PaidTrafficGuide() {
  return (
    <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
      <h3 className="font-display text-xl font-semibold text-ink">
        Guia: tráfego pago passo a passo
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Tráfego pago é pagar pra sua divulgação aparecer pra mais gente
        (Instagram, Facebook ou Google), em vez de depender só do alcance
        orgânico. Bem feito, é uma forma previsível de trazer cliente novo,
        mal feito, é uma forma rápida de gastar dinheiro sem entender por quê.
        Esse guia leva do zero até o primeiro anúncio rodando, com o que medir
        em cada etapa.
      </p>

      <div className="mt-5 space-y-5">
        {STEPS.map((step) => (
          <div key={step.title}>
            <h4 className="font-display text-base font-semibold text-ink">
              {step.title}
            </h4>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
              {step.body.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h4 className="mt-6 font-display text-lg font-semibold text-ink">
        Erros mais comuns
      </h4>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
        {MISTAKES.map((mistake) => (
          <li key={mistake}>{mistake}</li>
        ))}
      </ul>
    </div>
  );
}
