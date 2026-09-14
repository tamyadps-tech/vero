export const PROFESSIONAL_CATEGORIES = [
  "terapeuta",
  "psicologo",
  "coach",
  "consultor",
  "mentor",
  "palestrante",
] as const;

export type ProfessionalCategory = (typeof PROFESSIONAL_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ProfessionalCategory, string> = {
  terapeuta: "Terapeuta",
  psicologo: "Psicólogo(a)",
  coach: "Coach",
  consultor: "Consultor(a)",
  mentor: "Mentor(a)",
  palestrante: "Palestrante",
};

export const CATEGORY_DESCRIPTIONS: Record<ProfessionalCategory, string> = {
  terapeuta:
    "Acompanhamento terapêutico contínuo pra processar emoções, hábitos e relações — de diversas abordagens (TCC, psicanálise, sistêmica e outras).",
  psicologo:
    "Profissionais formados em Psicologia, com registro no CRP, pra avaliação, diagnóstico e tratamento de questões emocionais e de saúde mental.",
  coach:
    "Apoio focado em metas concretas — carreira, produtividade, transições de vida — com método estruturado de curto e médio prazo.",
  consultor:
    "Orientação especializada pra decisões de negócio, carreira ou projeto específico, geralmente por tempo determinado.",
  mentor:
    "Alguém com experiência prática na sua área que compartilha vivência e rede de contatos pra acelerar seu caminho.",
  palestrante:
    "Especialistas disponíveis pra palestras, workshops e treinamentos em empresas, eventos ou grupos.",
};

export function isProfessionalCategory(
  value: unknown
): value is ProfessionalCategory {
  return (
    typeof value === "string" &&
    (PROFESSIONAL_CATEGORIES as readonly string[]).includes(value)
  );
}
