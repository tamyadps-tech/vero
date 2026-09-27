const TERMS: {
  term: string;
  aka?: string;
  definition: string;
  whyItMatters: string;
  danger: string;
}[] = [
  {
    term: "Lead",
    definition:
      "Alguém que demonstrou interesse mas ainda não virou cliente, pediu informação, seguiu seu perfil, respondeu um story, perguntou o preço e sumiu.",
    whyItMatters:
      "É o estágio antes da venda, cuidar bem dos leads (responder rápido, fazer follow-up) é o que os transforma em clientes de verdade.",
    danger:
      "Lead que não recebe resposta ou follow-up esfria em poucos dias e vira oportunidade perdida, mesmo quando o interesse inicial era real.",
  },
  {
    term: "CAC",
    aka: "Custo de Aquisição de Cliente, do inglês Customer Acquisition Cost",
    definition:
      "Quanto custou, em média, conseguir cada cliente novo. Soma tudo que foi gasto pra atrair (tempo, anúncio, ferramenta) e divide pelo número de clientes que vieram disso.",
    whyItMatters:
      "Sem saber o CAC, é impossível saber se vale a pena continuar investindo num canal de divulgação ou se ele está caro demais pro retorno que dá.",
    danger:
      "Um CAC maior do que o cliente vai gerar de receita (veja LTV abaixo) significa que cada cliente novo está, na prática, custando dinheiro em vez de gerar lucro.",
  },
  {
    term: "LTV",
    aka: "Valor do Cliente ao Longo do Tempo, do inglês Lifetime Value",
    definition:
      "Quanto um cliente gera de receita, no total, enquanto continua com você (não só na primeira sessão). Ticket médio × número médio de sessões que um cliente costuma fazer.",
    whyItMatters:
      "É o número que dá sentido ao CAC: um CAC alto pode valer a pena se o cliente ficar meses ou anos gerando receita.",
    danger:
      "Focar só em atrair cliente novo (e não em reter o que já tem) deixa o LTV baixo, o negócio vira uma esteira cara de trocar cliente por cliente, em vez de construir relações que rendem no longo prazo.",
  },
  {
    term: "Funil de vendas",
    definition:
      "O caminho que alguém percorre até virar cliente: topo (descobre que você existe), meio (considera, tira dúvidas, compara) e fundo (decide e agenda a primeira sessão).",
    whyItMatters:
      "Ajuda a identificar em qual etapa as pessoas estão \"travando\", muita gente conhecendo o perfil mas pouca agendando é um problema diferente de pouca gente conhecendo o perfil.",
    danger:
      "Tratar todo mundo do mesmo jeito (a mesma mensagem pra quem nunca ouviu falar de você e pra quem já é cliente) desperdiça a chance de conduzir cada pessoa pra etapa certa.",
  },
  {
    term: "Taxa de conversão",
    definition:
      "De cada 100 pessoas que chegam numa etapa (viram o perfil, mandaram mensagem), quantas avançam pra próxima (agendam, viram cliente). Em %.",
    whyItMatters:
      "Mostra onde otimizar primeiro: se muita gente vê o perfil mas pouca manda mensagem, o problema está na apresentação, não na falta de audiência.",
    danger:
      "Sem medir a conversão, é fácil gastar energia tentando atrair mais gente pro topo do funil quando o problema real está em etapas seguintes, perdendo pessoas que já tinham chegado até ali.",
  },
  {
    term: "Ticket médio",
    definition:
      "O valor médio que cada cliente paga por sessão ou por período. Já explicado no manual financeiro, mas também é uma métrica de marketing: mostra o valor real de cada cliente conquistado.",
    whyItMatters:
      "Um ticket médio maior significa que vale mais a pena investir em atrair cada cliente novo (o CAC \"cabe\" mais fácil).",
    danger:
      "Descontos frequentes \"pra fechar\" derrubam o ticket médio sem que isso apareça em nenhum outro número óbvio, até o balanço do mês.",
  },
  {
    term: "Engajamento",
    definition:
      "O quanto as pessoas interagem com o que você publica: curtidas, comentários, compartilhamentos, respostas a stories. Diferente de alcance (quantas pessoas viram).",
    whyItMatters:
      "Conteúdo com engajamento alto tende a ser mostrado pra mais gente pelas próprias redes sociais, é um sinal de que o conteúdo está gerando conexão real, não só visualização passiva.",
    danger:
      "Perseguir só alcance (número de visualizações) sem olhar engajamento pode significar audiência grande mas desconectada, gente que vê e esquece, em vez de gente que se interessa de verdade.",
  },
  {
    term: "Churn",
    aka: "taxa de cancelamento ou abandono",
    definition:
      "De cada 100 clientes que você tinha, quantos pararam de agendar num período (mês, trimestre). Em %.",
    whyItMatters:
      "Reter um cliente que já confia em você custa muito menos do que conquistar um novo (veja CAC), então churn alto é um alerta de que algo no acompanhamento pode estar falhando.",
    danger:
      "Sem acompanhar o churn, a sensação de \"a agenda está cheia\" pode esconder que você está perdendo tantos clientes quanto conquista, só trocando de gente sem crescer de verdade.",
  },
  {
    term: "ROAS",
    aka: "Retorno sobre Investimento em Anúncios, do inglês Return on Ad Spend",
    definition:
      "Quanto voltou em receita pra cada real gasto em anúncio pago. ROAS de 3 significa que cada R$1 investido em anúncio trouxe R$3 em sessões.",
    whyItMatters:
      "É a versão do ROI (veja o manual financeiro) específica pra tráfego pago, o número que decide se vale continuar, aumentar ou pausar um anúncio.",
    danger:
      "Julgar um anúncio só pelo alcance ou pelos likes (sem olhar o ROAS) pode manter dinheiro sendo gasto num anúncio que parece \"bombando\" mas não está trazendo cliente nenhum.",
  },
  {
    term: "CTR",
    aka: "Taxa de Cliques, do inglês Click-Through Rate",
    definition:
      "De cada 100 pessoas que viram um anúncio ou post, quantas clicaram nele. Em %.",
    whyItMatters:
      "Mede se a peça (imagem, texto, chamada) está despertando interesse suficiente pra fazer alguém agir, antes mesmo de saber se essa pessoa vai virar cliente.",
    danger:
      "CTR baixo geralmente significa que o problema está na peça (imagem, texto), não necessariamente no público ou no orçamento, aumentar o valor investido num anúncio com CTR ruim só gasta mais rápido pelo mesmo resultado fraco.",
  },
  {
    term: "Segmentação",
    definition:
      "Escolher pra quem exatamente uma mensagem ou anúncio vai (idade, localização, interesse), em vez de mandar a mesma coisa pra todo mundo.",
    whyItMatters:
      "Uma mensagem certa pra pessoa errada não converte, segmentar é o que faz o orçamento de divulgação (pago ou não) render mais com menos.",
    danger:
      "Divulgar sem segmentar é como queimar orçamento mostrando anúncio de terapia de casal pra quem claramente não é o público, o CAC sobe sem motivo.",
  },
];

const DIFFERENCES: { pair: string; explanation: string }[] = [
  {
    pair: "CAC × LTV",
    explanation:
      "CAC é quanto custou trazer um cliente. LTV é quanto esse cliente gera de receita ao longo do tempo. A regra de ouro do marketing saudável: LTV precisa ser bem maior que CAC, senão cada cliente novo dá prejuízo.",
  },
  {
    pair: "ROI × ROAS",
    explanation:
      "ROI (explicado no manual financeiro) é o retorno de qualquer investimento no negócio. ROAS é a versão específica pra anúncio pago: quanto voltou em receita pra cada real gasto em tráfego pago. Todo ROAS é um tipo de ROI, mas nem todo ROI é ROAS.",
  },
  {
    pair: "Lead × Cliente",
    explanation:
      "Lead é quem demonstrou interesse, mas ainda não pagou por nada. Cliente é quem já agendou e pagou uma sessão. Confundir os dois números (achar que \"tenho 50 clientes\" quando são 50 pessoas que só perguntaram o preço) distorce qualquer cálculo de CAC ou taxa de conversão.",
  },
  {
    pair: "Alcance × Engajamento",
    explanation:
      "Alcance é quantas pessoas viram o conteúdo. Engajamento é quantas interagiram de verdade (curtida, comentário, resposta). Alcance alto com engajamento baixo costuma significar audiência desconectada, não interessada o bastante pra agir.",
  },
];

const CARE_TIPS: string[] = [
  "Divulgação sem acompanhar nenhum número (quantos leads viraram cliente, quanto custou cada um) é achismo disfarçado de estratégia, dá pra parecer ativo sem saber se está funcionando.",
  "Tráfego pago sem entender ROAS é a forma mais rápida de gastar dinheiro sem controle, sempre comece pequeno e meça antes de aumentar o orçamento.",
  "Churn alto costuma ser mais barato de resolver do que parece: um lembrete, uma mensagem de reengajamento ou ajustar o acompanhamento pode custar muito menos do que conquistar um cliente novo pra substituir quem saiu.",
  "Segmentar antes de divulgar, mesmo que reduza o alcance, é quase sempre melhor do que atirar pra todo mundo e esperar que alguém se interesse.",
];

export function MarketingGlossary() {
  return (
    <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
      <h3 className="font-display text-xl font-semibold text-ink">Manual de marketing</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Divulgar não é só postar e esperar, é um processo com números que dão
        pra medir e melhorar, igual ao financeiro. Sem entender esses termos, é
        fácil gastar tempo e dinheiro em divulgação que parece estar
        funcionando (curtidas, seguidores, visualizações) mas não está trazendo
        cliente nenhum de verdade, e só descobrir isso muito depois. Esse
        manual explica cada termo em português direto, com o perigo real de
        ignorar cada um.
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
