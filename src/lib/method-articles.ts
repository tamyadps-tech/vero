export type MethodCategory = "clinico" | "coaching";

/**
 * "artigo": texto corrido, pra entender um conceito ou técnica.
 * "ficha": roteiro de perguntas abertas pra usar ao vivo, conduzindo
 * a sessão com o cliente — cada item de `body` é uma pergunta/passo.
 */
export type MethodArticleKind = "artigo" | "ficha";

export type MethodArticle = {
  slug: string;
  title: string;
  summary: string;
  category: MethodCategory;
  kind: MethodArticleKind;
  sections: { heading: string; body: string[] }[];
};

const READING_CLIENT_RESPONSES: MethodArticle = {
  slug: "leitura-de-respostas-em-sessao",
  title: "Como ler as respostas do seu cliente em sessão",
  summary:
    "Um guia prático — com a pesquisa por trás de cada técnica — sobre os principais padrões de resposta que aparecem numa sessão e caminhos pra analisar o que foi dito além da fala em si.",
  category: "clinico",
  kind: "artigo",
  sections: [
    {
      heading: "Primeiro, reconheça o tipo de resposta",
      body: [
        "Nem toda resposta carrega a mesma informação. Antes de interpretar o conteúdo, vale notar qual desses padrões está na mesa — isso já diz muito sobre o que o cliente consegue (ou não) tocar naquele momento. A ideia de classificar respostas por padrão vem da tradição de entrevista motivacional e da técnica de entrevista clínica estruturada, que trata a forma da resposta como um dado tão relevante quanto o conteúdo.",
        "Resposta direta: é o dado mais sólido que você vai ter numa sessão — trate como referência quando comparar com outras respostas mais adiante.",
        "Mentira: a pergunta mais útil raramente é \"ele está mentindo?\". Pesquisas sobre detecção de mentira (o trabalho de Paul Ekman e colaboradores é a referência clássica aqui) mostram que humanos, incluindo profissionais treinados, acertam pouco mais que o acaso ao tentar identificar mentiras isoladamente pela fala. É mais produtivo comparar a plausibilidade da resposta com a comunicação não verbal que veio antes, durante e depois dela — e ainda assim, com cautela.",
        "Fuga do assunto: quando o cliente muda de tema ou responde algo desconectado da pergunta, geralmente vale reformular em vez de insistir do mesmo jeito.",
        "Resposta parcial: o cliente escolhe só um pedaço da pergunta pra responder — repare em qual parte ele deixou de lado.",
        "Evitar responder: devolver a pergunta ou puxar a conversa pra um assunto mais confortável costuma apontar exatamente pra onde dói.",
        "Ganhar tempo: às vezes o cliente só precisa de alguns segundos a mais pra organizar o que vai dizer. Segurar o silêncio costuma valer mais do que reformular a pergunta na hora — técnica descrita já nos primeiros manuais de escuta ativa de Carl Rogers, décadas antes de virar lugar-comum em treinamentos de entrevista.",
        "Distorção: uma resposta filtrada pelas crenças ou experiências do cliente, sem que ele necessariamente perceba a distorção — não é mentira, é a lente dele. É a mesma lógica das \"distorções cognitivas\" descritas por Aaron Beck na base da terapia cognitivo-comportamental.",
        "Recusa: silêncio ou recusa direta também é resposta. Costuma sinalizar um limite que vale respeitar antes de insistir.",
        "Postura defensiva: quando a pergunta incomoda, o tom muda antes do conteúdo — geralmente é a primeira pista de que você tocou em algo sensível.",
      ],
    },
    {
      heading: "Depois, vá além da fala",
      body: [
        "Com o padrão de resposta identificado, as técnicas abaixo — cada uma com raízes bem estabelecidas em metodologia de pesquisa qualitativa — ajudam a ler o que está por trás dela.",
        "Análise de conteúdo: organize o que foi dito em temas recorrentes ao longo de várias sessões, não só na fala isolada de hoje. É a técnica descrita por Klaus Krippendorff em \"Content Analysis: An Introduction to Its Methodology\" (1980), hoje referência-padrão em pesquisa qualitativa: categorizar unidades de fala e contar recorrência revela padrões que a memória sozinha não vê.",
        "Análise de discurso: preste atenção em como o cliente constrói a fala — quais palavras usa pra se descrever, o que evita nomear diretamente. A tradição de análise crítica do discurso (Norman Fairclough é uma referência central) parte da ideia de que a forma de falar sobre um problema já revela a relação de poder e controle que a pessoa sente ter sobre ele.",
        "Análise de sentimento: mapeie o tom emocional da fala (positivo, negativo, neutro) sessão após sessão. O psicólogo James Pennebaker, com seu software LIWC (Linguistic Inquiry and Word Count), passou décadas mostrando que a proporção de palavras emocionais e pronomes usados por alguém prediz de forma consistente seu estado psicológico — mesmo sem a pessoa perceber o próprio padrão.",
        "Linguagem corporal: postura fechada ou aberta, gestos, contato visual — pistas que muitas vezes chegam antes da própria fala. Vale uma ressalva importante: a ideia popular de que a comunicação é \"93% não verbal\" é uma leitura equivocada do estudo de Albert Mehrabian (1967), que media especificamente a congruência entre tom de voz, expressão facial e palavras isoladas sobre sentimentos — não comunicação em geral. Use a leitura corporal como sinal complementar, não como substituto da fala.",
        "Padrões comportamentais: comportamentos que se repetem (evitar um tema específico, sempre chegar atrasado nos dias que antecedem certo assunto) costumam contar mais do que um episódio isolado — é o princípio central da análise funcional do comportamento, da tradição comportamental clássica até a TCC.",
        "Mudanças na linguagem e na expressão emocional: comparar como o cliente fala hoje com como falava há algumas sessões é um termômetro simples de evolução, e é a mesma lógica usada em estudos longitudinais de processo terapêutico.",
        "Respostas fisiológicas: sinais físicos — respiração mais curta, tensão, rubor — que aparecem quando um tema específico é tocado. É a base fisiológica que sustenta técnicas de biofeedback, ainda que numa sessão comum você dependa da observação, não de sensores.",
        "Expressões faciais: sobrancelhas, boca, olhar. Paul Ekman e Wallace Friesen catalogaram isso de forma sistemática no FACS (Facial Action Coding System, 1978), mapeando como músculos específicos do rosto se combinam pra formar expressões associadas a emoções básicas. Combinadas com o resto, ajudam a confirmar ou questionar o que foi dito em palavras.",
      ],
    },
    {
      heading: "Os limites dessas leituras",
      body: [
        "Nenhuma dessas técnicas é uma verdade fechada — todas passam pela sua própria subjetividade como profissional, e a própria pesquisa que embasa cada uma delas costuma vir com ressalvas sobre generalização (diferenças culturais, neurodivergência, contexto). Use-as como direções pra explorar com o cliente, não como veredito.",
        "Combine mais de um sinal antes de tirar uma conclusão, e quando restar dúvida, pergunte diretamente em vez de presumir. A leitura serve pra abrir uma pergunta melhor, não pra fechar uma interpretação sozinha.",
      ],
    },
  ],
};

const FIRST_SESSION_SHEET: MethodArticle = {
  slug: "ficha-primeira-sessao",
  title: "Ficha de Condução: Primeira Sessão",
  summary:
    "Um roteiro de perguntas abertas pra conduzir a primeira sessão com um cliente novo — dá estrutura sem perder a escuta.",
  category: "coaching",
  kind: "ficha",
  sections: [
    {
      heading: "Abertura",
      body: [
        "O que te trouxe até aqui hoje?",
        "Como você descreveria, com suas palavras, o que está buscando resolver ou melhorar?",
        "Há quanto tempo isso vem acontecendo?",
      ],
    },
    {
      heading: "Contexto",
      body: [
        "O que você já tentou fazer em relação a isso?",
        "O que funcionou, mesmo que só um pouco? E o que não funcionou?",
        "Tem alguém na sua vida que sabe o que você está passando?",
      ],
    },
    {
      heading: "Expectativas e objetivos",
      body: [
        "Se esse processo desse certo, o que estaria diferente na sua vida daqui a alguns meses?",
        "O que você espera de mim nesse processo?",
        "Existe algo que você já sabe que não quer, mesmo que ainda não saiba exatamente o que quer?",
      ],
    },
    {
      heading: "Fechamento",
      body: [
        "O que você está levando dessa conversa?",
        "Como você está se sentindo agora, comparado a quando começamos?",
        "Combine com o cliente a expectativa de frequência e formato das próximas sessões antes de encerrar.",
      ],
    },
  ],
};

const GRIEF_SESSION_SHEET: MethodArticle = {
  slug: "ficha-sessao-de-luto",
  title: "Ficha de Condução: Sessão de Luto",
  summary:
    "Um roteiro de perguntas abertas pra conduzir uma sessão focada em processar uma perda — combina bem com os exercícios de luto da aba Exercícios.",
  category: "clinico",
  kind: "ficha",
  sections: [
    {
      heading: "Abertura: acolhimento",
      body: [
        "Como você está chegando hoje?",
        "Desde a última vez que conversamos, como tem sido lidar com a perda no dia a dia?",
        "Antes de começarmos, tem algo urgente que você precisa colocar pra fora?",
      ],
    },
    {
      heading: "Desenvolvimento: explorando a perda",
      body: [
        "Quer me contar um pouco sobre quem era essa pessoa (ou o que essa perda significava) pra você?",
        "Qual tem sido a emoção mais presente essa semana — tristeza, raiva, culpa, alívio, vazio?",
        "Tem alguma lembrança ou pensamento que vem voltando com frequência?",
        "O que tem sido mais difícil de encarar: a saudade, as tarefas práticas, ou as duas coisas ao mesmo tempo?",
      ],
    },
    {
      heading: "Fechamento: cuidado e próximos passos",
      body: [
        "O que ajudaria você a se cuidar nos próximos dias?",
        "Existe alguém que você pode procurar se um dia difícil aparecer entre as sessões?",
        "Antes de encerrar: como você está se sentindo agora, nesse momento?",
        "Se fizer sentido, combine um exercício da aba Exercícios pra ele levar pra casa.",
      ],
    },
  ],
};

const SESSION_CLOSING_SHEET: MethodArticle = {
  slug: "ficha-fechamento-de-sessao",
  title: "Ficha de Condução: Fechamento de Sessão",
  summary:
    "Um roteiro curto de perguntas pra fechar qualquer sessão com clareza, independente do tema trabalhado.",
  category: "coaching",
  kind: "ficha",
  sections: [
    {
      heading: "Perguntas de fechamento",
      body: [
        "O que foi mais importante pra você na nossa conversa hoje?",
        "Tem algo que ficou sem terminar que você quer guardar pra próxima vez?",
        "O que você pretende fazer diferente até a gente se falar de novo?",
        "Numa escala de 0 a 10, como você está saindo daqui hoje, comparado a como chegou?",
      ],
    },
    {
      heading: "Antes de encerrar",
      body: [
        "Confirme a data e o horário da próxima sessão.",
        "Se combinou alguma tarefa ou exercício, relembre em voz alta antes de encerrar.",
        "Pergunte diretamente se há algo de segurança ou urgência que precisa de atenção antes de a pessoa ir embora.",
      ],
    },
  ],
};

export const METHOD_ARTICLES: MethodArticle[] = [
  READING_CLIENT_RESPONSES,
  FIRST_SESSION_SHEET,
  GRIEF_SESSION_SHEET,
  SESSION_CLOSING_SHEET,
];

export function getMethodArticle(slug: string): MethodArticle | undefined {
  return METHOD_ARTICLES.find((article) => article.slug === slug);
}
