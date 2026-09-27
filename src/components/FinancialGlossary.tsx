const TERMS: {
  term: string;
  aka?: string;
  definition: string;
  whyItMatters: string;
  danger: string;
}[] = [
  {
    term: "Faturamento",
    definition:
      "Tudo que entrou das sessões pagas, sem descontar nada ainda. É o número \"bruto\".",
    whyItMatters:
      "É o primeiro número que qualquer negócio olha, mas sozinho não diz se você está ganhando ou perdendo dinheiro.",
    danger:
      "Confundir faturamento com lucro é o erro mais comum de quem começa: parece que está indo bem porque \"entrou dinheiro\", mas depois dos custos pode sobrar quase nada.",
  },
  {
    term: "Lucro líquido",
    definition:
      "O que sobra depois de tirar todos os custos (fixos e variáveis) e impostos do faturamento. É o número que realmente importa: quanto fica pra você.",
    whyItMatters:
      "É o único jeito honesto de saber se o seu trabalho está sendo bem pago pelo que ele custa pra existir.",
    danger:
      "Sem calcular isso, é fácil trabalhar bastante, faturar bem e mesmo assim estar no vermelho sem perceber, só descobrindo no fim do mês que não sobrou nada.",
  },
  {
    term: "Custo fixo",
    definition:
      "Não muda com a quantidade de sessões que você faz: aluguel de sala, assinatura de ferramenta, plano de internet. Você paga esse valor todo mês, mesmo que atenda 2 ou 20 clientes.",
    whyItMatters:
      "É o \"chão\" que você precisa cobrir todo mês antes de começar a lucrar de verdade — ele existe mesmo em mês fraco de agenda.",
    danger:
      "Ignorar o custo fixo faz o preço da sessão parecer suficiente quando na real ele só cobre o custo variável, deixando o fixo pra ser pago com o próprio bolso.",
  },
  {
    term: "Custo variável",
    definition:
      "Cresce junto com o número de sessões: material usado, taxa de processamento de pagamento, deslocamento. É um valor \"por sessão\", não mensal.",
    whyItMatters:
      "Mostra o custo real de atender mais um cliente — essencial pra saber se vale a pena aceitar mais um horário.",
    danger:
      "Não contabilizar isso faz o preço parecer mais lucrativo do que é, cada sessão a mais custa dinheiro além do seu tempo.",
  },
  {
    term: "Margem de contribuição",
    definition:
      "Preço da sessão menos o custo variável dela. É o quanto sobra de cada sessão pra pagar o custo fixo e, depois, virar lucro. Se for negativa, cada sessão dá prejuízo, antes mesmo de contar o custo fixo.",
    whyItMatters:
      "É o termômetro mais rápido pra saber se um preço faz sentido, antes mesmo de olhar o resto das contas do mês.",
    danger:
      "Cobrar abaixo da margem de contribuição significa perder dinheiro a cada sessão, quanto mais você atende, pior fica, não melhor.",
  },
  {
    term: "Margem líquida",
    definition:
      "O lucro líquido dividido pelo faturamento, em %. Diferente da margem de contribuição (que olha uma sessão isolada), essa olha o negócio inteiro no mês, já com custo fixo e imposto incluídos.",
    whyItMatters:
      "É a métrica que compara \"quanto sobra de verdade pra cada real que entra\", útil pra comparar meses diferentes ou decidir se vale expandir.",
    danger:
      "Uma margem de contribuição boa não garante margem líquida boa, se o custo fixo for alto ou o volume de sessões for baixo, o negócio inteiro pode fechar no vermelho mesmo com sessões individualmente lucrativas.",
  },
  {
    term: "Ponto de equilíbrio",
    aka: "break-even",
    definition:
      "Quantas sessões por mês bastam pra cobrir o custo fixo, nem lucro, nem prejuízo. Abaixo disso, o mês fecha no vermelho.",
    whyItMatters:
      "Dá uma meta mínima concreta e mensurável pro mês, em vez de trabalhar \"no sentimento\" sobre se a agenda está boa ou fraca.",
    danger:
      "Sem saber esse número, é impossível saber se um mês de agenda cheia foi realmente bom ou só suficiente pra não perder dinheiro.",
  },
  {
    term: "Ticket médio",
    definition:
      "O valor médio que você recebe por sessão ou por cliente num período. Faturamento dividido pelo número de sessões (ou de clientes).",
    whyItMatters:
      "Ajuda a decidir entre atender mais gente por um preço menor ou menos gente por um preço maior, e a medir o efeito de reajustes de preço ou pacotes.",
    danger:
      "Sem acompanhar o ticket médio, um desconto dado \"só dessa vez\" pra vários clientes pode derrubar a receita do mês inteiro sem que isso fique óbvio até o extrato bancário.",
  },
  {
    term: "ROI",
    aka: "Retorno sobre Investimento, do inglês Return on Investment",
    definition:
      "Quanto voltou em relação ao que foi investido, em %. Fórmula simples: (retorno − investimento) ÷ investimento. Um curso de R$500 que trouxe R$2.000 em sessões novas tem ROI de 300%.",
    whyItMatters:
      "É a pergunta que separa investimento de gasto: todo real gasto em ferramenta, anúncio ou curso deveria, em algum momento, voltar multiplicado.",
    danger:
      "Sem medir o retorno, gastos que não trazem resultado nenhum continuam sendo pagos mês após mês só porque \"parece importante ter\".",
  },
  {
    term: "Preço sugerido",
    aka: "método cost-plus",
    definition:
      "Custo variável + a fatia do custo fixo (dividido pelo volume estimado de sessões), somado à margem que você quer ganhar. É um piso técnico, o mercado ainda pode sustentar um preço maior.",
    whyItMatters:
      "Tira o preço do \"achismo\" e coloca em cima de números reais do seu próprio negócio, não do que o profissional ao lado cobra.",
    danger:
      "Copiar o preço de outro profissional sem saber os custos dele é apostar às cegas, o que é lucrativo pra ele pode ser prejuízo pra você.",
  },
];

const DIFFERENCES: { pair: string; explanation: string }[] = [
  {
    pair: "Faturamento × Lucro líquido",
    explanation:
      "Faturamento é tudo que entra. Lucro líquido é o que sobra depois de todos os custos e impostos. Os dois são números completamente diferentes, e só o segundo diz se o negócio está saudável.",
  },
  {
    pair: "Margem de contribuição × Margem líquida",
    explanation:
      "Margem de contribuição olha uma sessão isolada (preço menos custo variável dela). Margem líquida olha o negócio inteiro no mês, com custo fixo e imposto já descontados. Uma sessão pode ter margem de contribuição ótima e o mês ainda assim fechar no vermelho.",
  },
  {
    pair: "Custo fixo × Custo variável",
    explanation:
      "Custo fixo existe mesmo com agenda vazia (aluguel, assinatura). Custo variável só existe quando você atende (material, taxa de pagamento). Separar os dois é o que permite calcular ponto de equilíbrio e margem de contribuição corretamente.",
  },
  {
    pair: "Recebido × Pendente",
    explanation:
      "Recebido é dinheiro que já caiu na conta. Pendente é sessão que aconteceu mas o pagamento ainda não foi processado. Contar pendente como se já fosse receita disponível é um erro comum de planejamento de caixa.",
  },
];

const CARE_TIPS: string[] = [
  "Não subprecifique: um preço abaixo da margem de contribuição significa perder dinheiro a cada sessão, quanto mais você atende, pior fica, não melhor.",
  "Separe uma parte da receita pro imposto (o valor varia pelo seu regime tributário, MEI, autônomo, etc.) antes de contar o resto como lucro disponível.",
  "Revise o preço periodicamente, custo fixo e variável mudam (aluguel reajusta, ferramenta fica mais cara), e o preço da sessão devia acompanhar.",
  "Faturamento não é lucro. O valor recebido antes de tirar os custos pode parecer bom e ainda assim não sobrar quase nada no fim do mês.",
  "Use o ponto de equilíbrio como piso de planejamento, não como meta, o objetivo é ficar bem acima dele, não só empatar.",
];

export function FinancialGlossary() {
  return (
    <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
      <h3 className="font-display text-xl font-semibold text-ink">Manual financeiro</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Atender bem é metade do trabalho, a outra metade é entender os números do
        próprio negócio. Sem isso, decisões importantes (quanto cobrar, quando
        aceitar mais um cliente, quando investir em divulgação) acabam sendo
        tomadas no achismo, e achismo cobrado errado vira prejuízo silencioso: você
        pode estar trabalhando bastante e mesmo assim ganhando menos do que
        pensa, sem nenhum sinal claro disso até faltar dinheiro. Esse manual
        explica cada termo do painel Financeiro em português direto, sem jargão
        de curso de gestão.
      </p>

      <dl className="mt-5 divide-y divide-border">
        {TERMS.map(({ term, aka, definition, whyItMatters, danger }) => (
          <div key={term} className="py-4 first:pt-0">
            <dt className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm font-semibold text-ink">{term}</span>
              {aka && (
                <span className="text-xs italic text-ink-soft">({aka})</span>
              )}
            </dt>
            <dd className="mt-1 text-sm text-ink-soft">{definition}</dd>
            <p className="mt-2 text-xs text-ink-soft">
              <span className="font-semibold text-primary-dark">Por que importa: </span>
              {whyItMatters}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              <span className="font-semibold text-accent-dark">Perigo de ignorar: </span>
              {danger}
            </p>
          </div>
        ))}
      </dl>

      <h4 className="mt-6 font-display text-lg font-semibold text-ink">
        Termos que se confundem
      </h4>
      <div className="mt-3 space-y-3">
        {DIFFERENCES.map(({ pair, explanation }) => (
          <div key={pair} className="rounded-xl border border-border bg-paper p-3">
            <p className="text-sm font-semibold text-ink">{pair}</p>
            <p className="mt-1 text-xs text-ink-soft">{explanation}</p>
          </div>
        ))}
      </div>

      <h4 className="mt-6 font-display text-lg font-semibold text-ink">Cuidados</h4>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
        {CARE_TIPS.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}
