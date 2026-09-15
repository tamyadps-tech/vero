export type MethodCategory = "clinico" | "coaching";

export type MethodArticle = {
  slug: string;
  title: string;
  summary: string;
  category: MethodCategory;
  sections: { heading: string; body: string[] }[];
};

const READING_CLIENT_RESPONSES: MethodArticle = {
  slug: "leitura-de-respostas-em-sessao",
  title: "Como ler as respostas do seu cliente em sessão",
  summary:
    "Um guia prático com os principais padrões de resposta que aparecem numa sessão e caminhos pra analisar o que foi dito além da fala em si.",
  category: "clinico",
  sections: [
    {
      heading: "Primeiro, reconheça o tipo de resposta",
      body: [
        "Nem toda resposta carrega a mesma informação. Antes de interpretar o conteúdo, vale notar qual desses padrões está na mesa — isso já diz muito sobre o que o cliente consegue (ou não) tocar naquele momento.",
        "Resposta direta: é o dado mais sólido que você vai ter numa sessão — trate como referência quando comparar com outras respostas mais adiante.",
        "Mentira: a pergunta mais útil raramente é \"ele está mentindo?\". É mais produtivo comparar a plausibilidade da resposta com a comunicação não verbal que veio antes, durante e depois dela.",
        "Fuga do assunto: quando o cliente muda de tema ou responde algo desconectado da pergunta, geralmente vale reformular em vez de insistir do mesmo jeito.",
        "Resposta parcial: o cliente escolhe só um pedaço da pergunta pra responder — repare em qual parte ele deixou de lado.",
        "Evitar responder: devolver a pergunta ou puxar a conversa pra um assunto mais confortável costuma apontar exatamente pra onde dói.",
        "Ganhar tempo: às vezes o cliente só precisa de alguns segundos a mais pra organizar o que vai dizer. Segurar o silêncio costuma valer mais do que reformular a pergunta na hora.",
        "Distorção: uma resposta filtrada pelas crenças ou experiências do cliente, sem que ele necessariamente perceba a distorção — não é mentira, é a lente dele.",
        "Recusa: silêncio ou recusa direta também é resposta. Costuma sinalizar um limite que vale respeitar antes de insistir.",
        "Postura defensiva: quando a pergunta incomoda, o tom muda antes do conteúdo — geralmente é a primeira pista de que você tocou em algo sensível.",
      ],
    },
    {
      heading: "Depois, vá além da fala",
      body: [
        "Com o padrão de resposta identificado, as técnicas abaixo ajudam a ler o que está por trás dela.",
        "Análise de conteúdo: organize o que foi dito em temas recorrentes ao longo de várias sessões, não só na fala isolada de hoje — padrões que se repetem contam mais do que um episódio único.",
        "Análise de discurso: preste atenção em como o cliente constrói a fala — quais palavras usa pra se descrever, o que evita nomear diretamente.",
        "Análise de sentimento: mapeie o tom emocional da fala (positivo, negativo, neutro) sessão após sessão. Isso revela tendências que a memória sozinha não capta.",
        "Linguagem corporal: postura fechada ou aberta, gestos, contato visual — pistas que muitas vezes chegam antes da própria fala.",
        "Padrões comportamentais: comportamentos que se repetem (evitar um tema específico, sempre chegar atrasado nos dias que antecedem certo assunto) costumam contar mais do que um episódio isolado.",
        "Mudanças na linguagem e na expressão emocional: comparar como o cliente fala hoje com como falava há algumas sessões é um termômetro simples de evolução.",
        "Respostas fisiológicas: sinais físicos — respiração mais curta, tensão, rubor — que aparecem quando um tema específico é tocado.",
        "Expressões faciais: sobrancelhas, boca, olhar. Combinadas com o resto, ajudam a confirmar ou questionar o que foi dito em palavras.",
      ],
    },
    {
      heading: "Os limites dessas leituras",
      body: [
        "Nenhuma dessas técnicas é uma verdade fechada — todas passam pela sua própria subjetividade como profissional. Use-as como direções pra explorar com o cliente, não como veredito.",
        "Combine mais de um sinal antes de tirar uma conclusão, e quando restar dúvida, pergunte diretamente em vez de presumir. A leitura serve pra abrir uma pergunta melhor, não pra fechar uma interpretação sozinha.",
      ],
    },
  ],
};

export const METHOD_ARTICLES: MethodArticle[] = [READING_CLIENT_RESPONSES];

export function getMethodArticle(slug: string): MethodArticle | undefined {
  return METHOD_ARTICLES.find((article) => article.slug === slug);
}
