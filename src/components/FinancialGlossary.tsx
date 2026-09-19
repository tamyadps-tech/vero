const TERMS: { term: string; definition: string }[] = [
  {
    term: "Recebido",
    definition:
      "O que já caiu de verdade, das sessões pagas. Não é a mesma coisa que lucro — ainda falta tirar os custos.",
  },
  {
    term: "Custo fixo",
    definition:
      "Não muda com a quantidade de sessões que você faz: aluguel de sala, assinatura de ferramenta, plano de internet. Você paga esse valor todo mês, mesmo que atenda 2 ou 20 clientes.",
  },
  {
    term: "Custo variável",
    definition:
      "Cresce junto com o número de sessões: material usado, taxa de processamento de pagamento, deslocamento. É um valor \"por sessão\", não mensal.",
  },
  {
    term: "Margem de contribuição",
    definition:
      "Preço da sessão menos o custo variável dela. É o quanto sobra de cada sessão pra pagar o custo fixo e, depois, virar lucro. Se for negativa, cada sessão dá prejuízo — antes mesmo de contar o custo fixo.",
  },
  {
    term: "Ponto de equilíbrio",
    definition:
      "Quantas sessões por mês bastam pra cobrir o custo fixo — nem lucro, nem prejuízo. Abaixo disso, o mês fecha no vermelho.",
  },
  {
    term: "Margem líquida",
    definition:
      "O lucro (recebido menos todos os custos) dividido pela receita, em %. É a métrica mais direta de \"quanto sobra de verdade\" pra cada real que entra.",
  },
  {
    term: "Preço sugerido (cost-plus)",
    definition:
      "Custo variável + a fatia do custo fixo (dividido pelo volume estimado de sessões), somado à margem que você quer ganhar. É um piso técnico — o mercado ainda pode sustentar um preço maior.",
  },
];

const CARE_TIPS: string[] = [
  "Não subprecifique: um preço abaixo da margem de contribuição significa perder dinheiro a cada sessão — quanto mais você atende, pior fica, não melhor.",
  "Separe uma parte da receita pro imposto (o valor varia pelo seu regime tributário — MEI, autônomo, etc.) antes de contar o resto como lucro disponível.",
  "Revise o preço periodicamente — custo fixo e variável mudam (aluguel reajusta, ferramenta fica mais cara), e o preço da sessão devia acompanhar.",
  "Faturamento não é lucro. O valor recebido antes de tirar os custos pode parecer bom e ainda assim não sobrar quase nada no fim do mês.",
  "Use o ponto de equilíbrio como piso de planejamento, não como meta — o objetivo é ficar bem acima dele, não só empatar.",
];

export function FinancialGlossary() {
  return (
    <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
      <h3 className="text-sm font-semibold text-ink">Manual financeiro</h3>
      <p className="mt-1 text-xs text-ink-soft">
        O que cada termo do painel significa, em português direto.
      </p>

      <dl className="mt-4 space-y-3">
        {TERMS.map(({ term, definition }) => (
          <div key={term}>
            <dt className="text-sm font-semibold text-ink">{term}</dt>
            <dd className="mt-0.5 text-sm text-ink-soft">{definition}</dd>
          </div>
        ))}
      </dl>

      <h4 className="mt-6 text-sm font-semibold text-ink">Cuidados</h4>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
        {CARE_TIPS.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}
