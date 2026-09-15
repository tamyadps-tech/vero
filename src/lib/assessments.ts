/**
 * Testes de autoavaliação. Só instrumentos de domínio público (PHQ-9,
 * GAD-7) ou de autoria própria (Roda da Vida, formato genérico sem texto
 * protegido) entram aqui. Escalas proprietárias (DASS-21, Rosenberg, etc.)
 * do PRD original ficam de fora até confirmar licenciamento — ver
 * BRANDING.md / README para o motivo.
 */

export type ResponseType = "likert4" | "scale0to10" | "agreement4" | "yesno";

export const CATEGORY_LABELS: Record<"clinico" | "coaching", string> = {
  clinico: "Clínico",
  coaching: "Coaching",
};

export interface AssessmentQuestion {
  id: string;
  text: string;
  /** Só usado em testes de múltiplas escalas (ex: estilos de liderança) — a que dimensão essa pergunta pertence. */
  dimension?: string;
}

export interface SeverityBand {
  min: number;
  max: number;
  label: string;
}

export interface AssessmentDimension {
  key: string;
  label: string;
}

export interface AssessmentTemplate {
  slug: string;
  name: string;
  description: string;
  category: "clinico" | "coaching";
  responseType: ResponseType;
  questions: AssessmentQuestion[];
  /** Ignorado quando `dimensions` está definido. */
  severityBands: SeverityBand[];
  /**
   * Testes de múltiplas escalas (cada pergunta pertence a uma dimensão,
   * ex: 6 estilos de liderança): soma por dimensão, resultado é a
   * dimensão de maior soma — em vez de uma nota única com faixa.
   */
  dimensions?: AssessmentDimension[];
}

export const RESPONSE_RANGE: Record<ResponseType, { min: number; max: number }> = {
  likert4: { min: 0, max: 3 },
  agreement4: { min: 1, max: 4 },
  scale0to10: { min: 0, max: 10 },
  yesno: { min: 0, max: 1 },
};

const LIKERT4_OPTIONS = [
  { value: 0, label: "Nunca" },
  { value: 1, label: "Vários dias" },
  { value: 2, label: "Mais da metade dos dias" },
  { value: 3, label: "Quase todos os dias" },
];

const AGREEMENT4_OPTIONS = [
  { value: 1, label: "Discordo totalmente" },
  { value: 2, label: "Discordo" },
  { value: 3, label: "Concordo" },
  { value: 4, label: "Concordo totalmente" },
];

const YESNO_OPTIONS = [
  { value: 0, label: "Não" },
  { value: 1, label: "Sim" },
];

const PHQ9: AssessmentTemplate = {
  slug: "phq9",
  name: "PHQ-9 — Rastreio de Depressão",
  description:
    "Questionário de saúde do paciente (domínio público) para acompanhar sintomas de humor nas últimas 2 semanas.",
  category: "clinico",
  responseType: "likert4",
  questions: [
    { id: "q1", text: "Pouco interesse ou prazer em fazer as coisas" },
    { id: "q2", text: "Sentir-se para baixo, deprimido(a) ou sem esperança" },
    { id: "q3", text: "Dificuldade para pegar no sono, continuar dormindo ou dormir demais" },
    { id: "q4", text: "Sentir-se cansado(a) ou com pouca energia" },
    { id: "q5", text: "Falta de apetite ou comer demais" },
    {
      id: "q6",
      text: "Sentir-se mal consigo mesmo(a) — ou que é um fracasso, ou que decepcionou sua família",
    },
    {
      id: "q7",
      text: "Dificuldade para se concentrar em coisas como ler ou assistir TV",
    },
    {
      id: "q8",
      text: "Lentidão para se movimentar ou falar, ou o contrário: muita inquietação",
    },
    {
      id: "q9",
      text: "Pensar que seria melhor estar morto(a) ou em se machucar de alguma forma",
    },
  ],
  severityBands: [
    { min: 0, max: 4, label: "Mínimo" },
    { min: 5, max: 9, label: "Leve" },
    { min: 10, max: 14, label: "Moderado" },
    { min: 15, max: 19, label: "Moderadamente grave" },
    { min: 20, max: 27, label: "Grave" },
  ],
};

const GAD7: AssessmentTemplate = {
  slug: "gad7",
  name: "GAD-7 — Rastreio de Ansiedade",
  description:
    "Questionário de transtorno de ansiedade generalizada (domínio público) para acompanhar sintomas nas últimas 2 semanas.",
  category: "clinico",
  responseType: "likert4",
  questions: [
    { id: "q1", text: "Sentir-se nervoso(a), ansioso(a) ou muito tenso(a)" },
    { id: "q2", text: "Não conseguir parar ou controlar as preocupações" },
    { id: "q3", text: "Preocupar-se demais com coisas diferentes" },
    { id: "q4", text: "Dificuldade para relaxar" },
    {
      id: "q5",
      text: "Ficar tão inquieto(a) que é difícil permanecer parado(a)",
    },
    { id: "q6", text: "Ficar facilmente irritado(a) ou irritável" },
    {
      id: "q7",
      text: "Sentir medo, como se algo terrível fosse acontecer",
    },
  ],
  severityBands: [
    { min: 0, max: 4, label: "Mínimo" },
    { min: 5, max: 9, label: "Leve" },
    { min: 10, max: 14, label: "Moderado" },
    { min: 15, max: 21, label: "Grave" },
  ],
};

const WHEEL_OF_LIFE: AssessmentTemplate = {
  slug: "roda-da-vida",
  name: "Roda da Vida",
  description:
    "Nota de 0 a 10 para o nível de satisfação em cada área da vida agora.",
  category: "coaching",
  responseType: "scale0to10",
  questions: [
    { id: "saude", text: "Saúde e disposição" },
    { id: "carreira", text: "Carreira / trabalho" },
    { id: "financas", text: "Finanças" },
    { id: "relacionamentos", text: "Relacionamentos" },
    { id: "familia", text: "Família" },
    { id: "desenvolvimento", text: "Desenvolvimento pessoal" },
    { id: "lazer", text: "Lazer e diversão" },
    { id: "proposito", text: "Propósito / espiritualidade" },
  ],
  severityBands: [
    { min: 0, max: 4, label: "Baixa satisfação" },
    { min: 5, max: 7, label: "Satisfação moderada" },
    { min: 8, max: 10, label: "Alta satisfação" },
  ],
};

const LIMITING_BELIEFS: AssessmentTemplate = {
  slug: "crencas-limitantes",
  name: "Crenças Limitantes sobre Dinheiro",
  description:
    "Nota de 0 a 10 pra quanto cada crença abaixo ainda ressoa em você — autoconhecimento sobre o que pode estar travando sua relação com dinheiro.",
  category: "coaching",
  responseType: "scale0to10",
  questions: [
    { id: "b1", text: "Tenho de trabalhar duro para ter dinheiro suficiente para viver." },
    { id: "b2", text: "Sem sofrimento e perdas não há ganho." },
    { id: "b3", text: "Tenho de ser rico para ser feliz." },
    { id: "b4", text: "Dinheiro é sujo." },
    { id: "b5", text: "Nunca terei dinheiro suficiente." },
    { id: "b6", text: "Sou pobre, mas sou honesto." },
    { id: "b7", text: "Não me acho capaz de conseguir um trabalho melhor." },
    { id: "b8", text: "A maioria das pessoas é melhor do que eu." },
    { id: "b9", text: "Não sei quando vou morrer. É melhor gastar tudo agora." },
    { id: "b10", text: "Se eu não tiver o que mostrar aos outros, não terei valor." },
    { id: "b11", text: "Pau que nasce torto morre torto." },
    { id: "b12", text: "Não sou capaz de cobrar o justo pelo meu trabalho." },
    { id: "b13", text: "Não sou merecedor de coisas boas, nem de mais dinheiro." },
    { id: "b14", text: "Não tenho formação acadêmica, como posso ter sucesso?" },
    { id: "b15", text: "Dinheiro não é importante. Amar, sim, é importante." },
    { id: "b16", text: "A água só corre para o mar. Dinheiro só vai para quem já tem." },
    { id: "b17", text: "Não mereço ter sucesso." },
    { id: "b18", text: "Não se pode confiar em ninguém." },
    { id: "b19", text: "Sou assim mesmo. Fazer o quê, né?" },
    { id: "b20", text: "Dinheiro não traz felicidade." },
    { id: "b21", text: "Dinheiro não dá em árvores." },
    { id: "b22", text: "Não tenho. Não posso. Está pensando que a vida é fácil?" },
    { id: "b23", text: "Pessoas ricas não herdam o reino dos céus." },
    { id: "b24", text: "É bonito, é legal ser pobre e \"superar\" problemas financeiros." },
    { id: "b25", text: "Todo rico é mau ou desonesto." },
  ],
  severityBands: [
    { min: 0, max: 3, label: "Baixo impacto das crenças limitantes" },
    { min: 4, max: 6, label: "Impacto moderado das crenças limitantes" },
    { min: 7, max: 10, label: "Alto impacto das crenças limitantes" },
  ],
};

const LEADERSHIP_STYLES: AssessmentTemplate = {
  slug: "estilos-lideranca",
  name: "Estilos de Liderança",
  description:
    "18 afirmações sobre como você lidera — o resultado mostra qual dos 6 estilos mais te representa hoje.",
  category: "coaching",
  responseType: "agreement4",
  dimensions: [
    { key: "coercitivo", label: "Coercitivo" },
    { key: "dirigente", label: "Dirigente" },
    { key: "afetivo", label: "Afetivo" },
    { key: "democratico", label: "Democrático" },
    { key: "modelador", label: "Modelador" },
    { key: "treinador", label: "Treinador" },
  ],
  questions: [
    {
      id: "l1",
      text: "Sinto que às vezes provoco medo ou ansiedade nas pessoas do time.",
      dimension: "coercitivo",
    },
    {
      id: "l2",
      text: "O exercício da liderança ocorre por meio de forte e constante cobrança sobre as pessoas.",
      dimension: "coercitivo",
    },
    {
      id: "l3",
      text: "Mandar é mais fácil do que compartilhar ou obter consenso.",
      dimension: "coercitivo",
    },
    { id: "l4", text: "Costumo dar direções claras para o time.", dimension: "dirigente" },
    {
      id: "l5",
      text: "Procuro o engajamento dos colegas para que eles se sintam mais à vontade para jogar ou treinar.",
      dimension: "dirigente",
    },
    {
      id: "l6",
      text: "Meus companheiros sabem exatamente o que espero delas.",
      dimension: "dirigente",
    },
    {
      id: "l7",
      text: "Dou muito valor à lealdade dos colegas para com a liderança.",
      dimension: "afetivo",
    },
    { id: "l8", text: "Trato bem as pessoas. Gosto delas genuinamente.", dimension: "afetivo" },
    {
      id: "l9",
      text: "Crio um ambiente de harmonia e proximidade com os colegas de time.",
      dimension: "afetivo",
    },
    {
      id: "l10",
      text: "Meus colegas de equipe sabem que são corresponsáveis pelo resultado.",
      dimension: "democratico",
    },
    {
      id: "l11",
      text: "Procuro criar ambientes de alta performance.",
      dimension: "democratico",
    },
    {
      id: "l12",
      text: "Acredito que pessoas que já têm alguma experiência no time podem contribuir mais para o desempenho.",
      dimension: "democratico",
    },
    {
      id: "l13",
      text: "Acredito que liderança tem a ver com formar pessoas.",
      dimension: "modelador",
    },
    {
      id: "l14",
      text: "Sou exigente porque dou instruções claras sobre o trabalho e sobre o que espero dos colegas.",
      dimension: "modelador",
    },
    {
      id: "l15",
      text: "Penso que meus colegas terão melhor desempenho na medida que pensarem e agirem de forma semelhante a mim.",
      dimension: "modelador",
    },
    {
      id: "l16",
      text: "Invisto tempo e esforço para compreender os pontos fortes e de melhoria de cada colega de time.",
      dimension: "treinador",
    },
    {
      id: "l17",
      text: "Me interesso em conhecer cada pessoa do time.",
      dimension: "treinador",
    },
    { id: "l18", text: "Gosto de formar novos líderes.", dimension: "treinador" },
  ],
  severityBands: [],
};

const SALES_DIAGNOSTIC: AssessmentTemplate = {
  slug: "autodiagnostico-vendas",
  name: "Autodiagnóstico de Vendas",
  description:
    "30 perguntas sim/não sobre como a venda é conduzida, da abordagem ao pós-venda — mapeia onde o processo comercial está maduro e onde precisa de atenção.",
  category: "coaching",
  responseType: "yesno",
  questions: [
    { id: "v1", text: "O vendedor aborda gerando rapport?" },
    { id: "v2", text: "O vendedor se apresenta falando seu nome?" },
    { id: "v3", text: "Ele pergunta o nome do cliente?" },
    { id: "v4", text: "Ele chama o cliente durante todo o atendimento pelo nome?" },
    {
      id: "v5",
      text: "Em caso de ter mais de uma pessoa na venda, ele trata as pessoas da mesma forma?",
    },
    { id: "v6", text: "O vendedor descobre as necessidades do cliente?" },
    { id: "v7", text: "O vendedor descobre as motivações do cliente?" },
    { id: "v8", text: "O vendedor descobre o que é importante para o cliente (o porquê)?" },
    { id: "v9", text: "O vendedor identifica como o cliente quer ser atendido?" },
    { id: "v10", text: "Visualiza quem é importante no processo de decisão?" },
    { id: "v11", text: "O vendedor fala mais de benefícios do que de características?" },
    {
      id: "v12",
      text: "O vendedor argumenta focando nos benefícios que mais interessam ao cliente?",
    },
    {
      id: "v13",
      text: "O vendedor faz o cliente sentir/visualizar/experimentar os benefícios do que vende?",
    },
    { id: "v14", text: "O vendedor fala dos benefícios da empresa?" },
    { id: "v15", text: "O vendedor valoriza as vantagens do que vende?" },
    { id: "v16", text: "O vendedor valoriza na argumentação o preço e a forma de pagamento?" },
    { id: "v17", text: "O vendedor visualiza o cenário antes de argumentar com o cliente?" },
    { id: "v18", text: "Frente a objeções, o vendedor mantém a inteligência emocional?" },
    { id: "v19", text: "O vendedor é persistente na negociação?" },
    { id: "v20", text: "Identifica os sinais de compra do cliente?" },
    { id: "v21", text: "Utiliza técnicas de fechamento?" },
    { id: "v22", text: "É persistente no fechamento?" },
    { id: "v23", text: "Em caso de objeções, utiliza técnicas de negociação?" },
    { id: "v24", text: "Ao fechar a venda, agradece o cliente?" },
    { id: "v25", text: "Registra os dados do cliente?" },
    { id: "v26", text: "Pede indicação de novos clientes?" },
    { id: "v27", text: "Entra em contato posteriormente para novas vendas?" },
    { id: "v28", text: "Quando não fecha, se despede cordialmente do cliente?" },
    { id: "v29", text: "Analisa o que errou e reconstrói uma estratégia de resgate?" },
    {
      id: "v30",
      text: "Entra em contato de forma persistente pra tentar recuperar a venda que não fechou?",
    },
  ],
  severityBands: [
    { min: 0, max: 10, label: "Processo comercial pouco estruturado" },
    { min: 11, max: 20, label: "Processo comercial em desenvolvimento" },
    { min: 21, max: 30, label: "Processo comercial maduro" },
  ],
};

const SALES_MANAGEMENT_DIAGNOSTIC: AssessmentTemplate = {
  slug: "autodiagnostico-gestao-vendas",
  name: "Autodiagnóstico de Gestão de Vendas",
  description:
    "30 perguntas sim/não sobre como você gerencia o time comercial — mapeia qual das 6 frentes de gestão está mais consolidada e quais precisam de mais atenção.",
  category: "coaching",
  responseType: "yesno",
  dimensions: [
    { key: "mudanca", label: "Gestão da Mudança" },
    { key: "ativacao", label: "Gestão da Ativação" },
    { key: "metodo", label: "Gestão do Método" },
    { key: "conhecimento", label: "Gestão do Conhecimento" },
    { key: "meta", label: "Gestão da Meta" },
    { key: "tempo", label: "Gestão do Tempo" },
  ],
  questions: [
    {
      id: "g1",
      text: "Você identifica o sonho do vendedor, traduz em indicadores de vendas e constrói um plano pra ele superar a meta da empresa?",
      dimension: "mudanca",
    },
    {
      id: "g2",
      text: "Cada vendedor possui um plano de desenvolvimento individual, com o que precisa aprender de técnicas, produtos/serviços e qual indicador focar?",
      dimension: "mudanca",
    },
    {
      id: "g3",
      text: "Todos os meses o plano individual é revisitado e atualizado sobre avanços, pontos de melhoria e novas missões?",
      dimension: "mudanca",
    },
    {
      id: "g4",
      text: "O planejamento estratégico da empresa foi traduzido em linguagem prática pra operação, com todas as funções treinadas pra executar sua parte?",
      dimension: "mudanca",
    },
    {
      id: "g5",
      text: "Você investe em si mesmo pra se tornar um gestor de alto nível que bate metas todos os meses?",
      dimension: "mudanca",
    },
    {
      id: "g6",
      text: "Você está capacitado pra saber, de forma científica, a desenvolver a atitude dos vendedores?",
      dimension: "ativacao",
    },
    {
      id: "g7",
      text: "Está claro pra cada vendedor qual atitude especificamente deve desenvolver pra bater mais metas?",
      dimension: "ativacao",
    },
    {
      id: "g8",
      text: "O vendedor é desenvolvido na atitude que mais lhe falta?",
      dimension: "ativacao",
    },
    {
      id: "g9",
      text: "Semanalmente é detectada a atitude mais necessária pra bater a meta, e você implanta estratégias pra ativá-la?",
      dimension: "ativacao",
    },
    {
      id: "g10",
      text: "Você mesmo é desenvolvido de forma estruturada pra também evoluir em sua atitude?",
      dimension: "ativacao",
    },
    {
      id: "g11",
      text: "Vendedores praticam um método de vendas claro, com técnicas definidas pra online e offline?",
      dimension: "metodo",
    },
    {
      id: "g12",
      text: "Vendedores têm uma estratégia praticada rotineiramente pra aumentar o índice de recompra dos clientes?",
      dimension: "metodo",
    },
    {
      id: "g13",
      text: "Vendedores praticam rotineiramente a solicitação de indicação de novos clientes?",
      dimension: "metodo",
    },
    {
      id: "g14",
      text: "Os principais erros do time são mapeados com uma ferramenta de diagnóstico e treinados semanalmente?",
      dimension: "metodo",
    },
    {
      id: "g15",
      text: "Existe um processo de formação do novo vendedor pra que ele já saiba vender desde o início, sem aprender errando com o cliente?",
      dimension: "metodo",
    },
    {
      id: "g16",
      text: "As campanhas de marketing vêm acompanhadas de treinamento pros vendedores ofertarem produtos/serviços complementares?",
      dimension: "conhecimento",
    },
    {
      id: "g17",
      text: "Os vendedores são formados continuamente pra vender produtos/serviços de maior valor agregado, aumentando o ticket médio?",
      dimension: "conhecimento",
    },
    {
      id: "g18",
      text: "Os vendedores dominam as vantagens dos produtos/serviços pra negociar com mais propriedade e aumentar a margem?",
      dimension: "conhecimento",
    },
    {
      id: "g19",
      text: "Os vendedores são treinados pra customizar a linguagem dos benefícios pra cada perfil de cliente, aumentando a conversão?",
      dimension: "conhecimento",
    },
    {
      id: "g20",
      text: "Existe um calendário de desenvolvimento do time, claro sobre o que será treinado a cada semana?",
      dimension: "conhecimento",
    },
    {
      id: "g21",
      text: "Pra cada indicador de vendas existe um processo claro sobre como diagnosticar o motivo dele estar baixo e como resolver?",
      dimension: "meta",
    },
    {
      id: "g22",
      text: "Os vendedores têm rotina de levar seus indicadores, com diagnóstico do que lhes falta, pra debater com você?",
      dimension: "meta",
    },
    {
      id: "g23",
      text: "Você tem um plano de ação atualizado sobre o que fazer semanalmente com os vendedores de baixa performance?",
      dimension: "meta",
    },
    {
      id: "g24",
      text: "Está claro pra todos os vendedores quais técnicas praticar pra aumentar cada indicador?",
      dimension: "meta",
    },
    {
      id: "g25",
      text: "Você tem um processo claro sobre como bater a meta em cada indicador?",
      dimension: "meta",
    },
    {
      id: "g26",
      text: "Vendedores em baixo fluxo prospectam clientes, ativam clientes inativos ou criam conteúdo pra internet?",
      dimension: "tempo",
    },
    {
      id: "g27",
      text: "Você passa mais tempo desenvolvendo vendedores do que em tarefas operacionais?",
      dimension: "tempo",
    },
    {
      id: "g28",
      text: "Os erros mais comuns que geram retrabalho são pauta de formação e melhoria contínua?",
      dimension: "tempo",
    },
    {
      id: "g29",
      text: "A forma como o tempo é gerido na empresa hoje te leva na direção da sua meta pessoal?",
      dimension: "tempo",
    },
    {
      id: "g30",
      text: "Você reconhece que precisa evoluir em método de gestão pra atingir sua meta pessoal?",
      dimension: "tempo",
    },
  ],
  severityBands: [],
};

export const ASSESSMENT_TEMPLATES: AssessmentTemplate[] = [
  PHQ9,
  GAD7,
  WHEEL_OF_LIFE,
  LIMITING_BELIEFS,
  LEADERSHIP_STYLES,
  SALES_DIAGNOSTIC,
  SALES_MANAGEMENT_DIAGNOSTIC,
];

export function getAssessmentTemplate(slug: string): AssessmentTemplate | undefined {
  return ASSESSMENT_TEMPLATES.find((t) => t.slug === slug);
}

export function isAssessmentTemplateSlug(value: unknown): value is string {
  return typeof value === "string" && ASSESSMENT_TEMPLATES.some((t) => t.slug === value);
}

export function getResponseOptions(responseType: ResponseType) {
  if (responseType === "likert4") return LIKERT4_OPTIONS;
  if (responseType === "agreement4") return AGREEMENT4_OPTIONS;
  if (responseType === "yesno") return YESNO_OPTIONS;
  return Array.from({ length: 11 }, (_, value) => ({ value, label: String(value) }));
}

export interface ScoreResult {
  score: number;
  maxScore: number;
  severity: string;
}

export interface DimensionScore {
  key: string;
  label: string;
  total: number;
  maxTotal: number;
}

function validateAnswers(template: AssessmentTemplate, answers: number[]) {
  if (answers.length !== template.questions.length) {
    throw new Error("Número de respostas não bate com o número de perguntas.");
  }

  const { min, max } = RESPONSE_RANGE[template.responseType];
  for (const answer of answers) {
    if (!Number.isInteger(answer) || answer < min || answer > max) {
      throw new Error("Resposta fora da faixa permitida.");
    }
  }
}

/**
 * Soma das respostas por dimensão — só faz sentido pra testes de
 * múltiplas escalas (`template.dimensions` definido). Ordenado da maior
 * pra menor soma.
 */
export function getDimensionBreakdown(
  template: AssessmentTemplate,
  answers: number[]
): DimensionScore[] {
  if (!template.dimensions) return [];
  validateAnswers(template, answers);

  const totals = new Map<string, { total: number; count: number }>();
  template.questions.forEach((question, index) => {
    if (!question.dimension) return;
    const entry = totals.get(question.dimension) ?? { total: 0, count: 0 };
    entry.total += answers[index];
    entry.count += 1;
    totals.set(question.dimension, entry);
  });

  const { max } = RESPONSE_RANGE[template.responseType];
  return template.dimensions
    .map((dimension) => {
      const entry = totals.get(dimension.key) ?? { total: 0, count: 0 };
      return {
        key: dimension.key,
        label: dimension.label,
        total: entry.total,
        maxTotal: entry.count * max,
      };
    })
    .sort((a, b) => b.total - a.total);
}

/**
 * Calcula o score a partir das respostas (uma por pergunta, na mesma
 * ordem de `template.questions`). Nunca confiar em score calculado no
 * cliente — sempre recalcular aqui no servidor.
 *
 * Testes de múltiplas escalas (`template.dimensions`) retornam a
 * dimensão de maior soma como `severity`, em vez de buscar uma faixa.
 */
export function scoreAssessment(
  template: AssessmentTemplate,
  answers: number[]
): ScoreResult {
  validateAnswers(template, answers);

  if (template.dimensions) {
    const [top] = getDimensionBreakdown(template, answers);
    return { score: top.total, maxScore: top.maxTotal, severity: top.label };
  }

  const total =
    template.responseType === "scale0to10"
      ? Math.round(answers.reduce((sum, a) => sum + a, 0) / answers.length)
      : answers.reduce((sum, a) => sum + a, 0);

  const maxScore =
    template.responseType === "scale0to10"
      ? 10
      : template.questions.length * RESPONSE_RANGE[template.responseType].max;

  const band = template.severityBands.find((b) => total >= b.min && total <= b.max);

  return { score: total, maxScore, severity: band?.label ?? "—" };
}
