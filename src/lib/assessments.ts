/**
 * Testes de autoavaliação. Só instrumentos de domínio público (PHQ-9,
 * GAD-7) ou de autoria própria (Roda da Vida, formato genérico sem texto
 * protegido) entram aqui. Escalas proprietárias (DASS-21, Rosenberg, etc.)
 * do PRD original ficam de fora até confirmar licenciamento — ver
 * BRANDING.md / README para o motivo.
 */

export type ResponseType = "likert4" | "scale0to10";

export const CATEGORY_LABELS: Record<"clinico" | "coaching", string> = {
  clinico: "Clínico",
  coaching: "Coaching",
};

export interface AssessmentQuestion {
  id: string;
  text: string;
}

export interface SeverityBand {
  min: number;
  max: number;
  label: string;
}

export interface AssessmentTemplate {
  slug: string;
  name: string;
  description: string;
  category: "clinico" | "coaching";
  responseType: ResponseType;
  questions: AssessmentQuestion[];
  severityBands: SeverityBand[];
}

const LIKERT4_OPTIONS = [
  { value: 0, label: "Nunca" },
  { value: 1, label: "Vários dias" },
  { value: 2, label: "Mais da metade dos dias" },
  { value: 3, label: "Quase todos os dias" },
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

export const ASSESSMENT_TEMPLATES: AssessmentTemplate[] = [
  PHQ9,
  GAD7,
  WHEEL_OF_LIFE,
  LIMITING_BELIEFS,
];

export function getAssessmentTemplate(slug: string): AssessmentTemplate | undefined {
  return ASSESSMENT_TEMPLATES.find((t) => t.slug === slug);
}

export function isAssessmentTemplateSlug(value: unknown): value is string {
  return typeof value === "string" && ASSESSMENT_TEMPLATES.some((t) => t.slug === value);
}

export function getResponseOptions(responseType: ResponseType) {
  if (responseType === "likert4") return LIKERT4_OPTIONS;
  return Array.from({ length: 11 }, (_, value) => ({ value, label: String(value) }));
}

export interface ScoreResult {
  score: number;
  maxScore: number;
  severity: string;
}

/**
 * Calcula o score a partir das respostas (uma por pergunta, na mesma
 * ordem de `template.questions`). Nunca confiar em score calculado no
 * cliente — sempre recalcular aqui no servidor.
 */
export function scoreAssessment(
  template: AssessmentTemplate,
  answers: number[]
): ScoreResult {
  if (answers.length !== template.questions.length) {
    throw new Error("Número de respostas não bate com o número de perguntas.");
  }

  const maxPerQuestion = template.responseType === "likert4" ? 3 : 10;
  for (const answer of answers) {
    if (!Number.isInteger(answer) || answer < 0 || answer > maxPerQuestion) {
      throw new Error("Resposta fora da faixa permitida.");
    }
  }

  const total =
    template.responseType === "scale0to10"
      ? Math.round(answers.reduce((sum, a) => sum + a, 0) / answers.length)
      : answers.reduce((sum, a) => sum + a, 0);

  const maxScore =
    template.responseType === "scale0to10" ? 10 : template.questions.length * 3;

  const band = template.severityBands.find((b) => total >= b.min && total <= b.max);

  return { score: total, maxScore, severity: band?.label ?? "—" };
}
