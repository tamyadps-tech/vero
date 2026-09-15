import { describe, it, expect } from "vitest";
import {
  scoreAssessment,
  getDimensionBreakdown,
  getAssessmentTemplate,
  isAssessmentTemplateSlug,
  ASSESSMENT_TEMPLATES,
  RESPONSE_RANGE,
} from "./assessments";

describe("scoreAssessment", () => {
  it("sums PHQ-9 answers and maps to the right severity band", () => {
    const phq9 = getAssessmentTemplate("phq9")!;
    const allZeros = new Array(9).fill(0);
    expect(scoreAssessment(phq9, allZeros)).toEqual({
      score: 0,
      maxScore: 27,
      severity: "Mínimo",
    });

    const moderate = [2, 2, 1, 2, 1, 1, 1, 0, 0]; // soma = 10
    expect(scoreAssessment(phq9, moderate)).toEqual({
      score: 10,
      maxScore: 27,
      severity: "Moderado",
    });

    const allMax = new Array(9).fill(3); // soma = 27
    expect(scoreAssessment(phq9, allMax)).toEqual({
      score: 27,
      maxScore: 27,
      severity: "Grave",
    });
  });

  it("sums GAD-7 answers and maps to the right severity band", () => {
    const gad7 = getAssessmentTemplate("gad7")!;
    const severe = new Array(7).fill(3); // soma = 21
    expect(scoreAssessment(gad7, severe).severity).toBe("Grave");
  });

  it("averages Roda da Vida answers instead of summing", () => {
    const wheel = getAssessmentTemplate("roda-da-vida")!;
    const answers = [8, 8, 8, 8, 8, 8, 8, 8]; // média 8
    expect(scoreAssessment(wheel, answers)).toEqual({
      score: 8,
      maxScore: 10,
      severity: "Alta satisfação",
    });
  });

  it("rejects a mismatched number of answers", () => {
    const phq9 = getAssessmentTemplate("phq9")!;
    expect(() => scoreAssessment(phq9, [0, 1, 2])).toThrow();
  });

  it("rejects an out-of-range answer", () => {
    const phq9 = getAssessmentTemplate("phq9")!;
    const answers = new Array(9).fill(0);
    answers[0] = 4; // likert4 só vai até 3
    expect(() => scoreAssessment(phq9, answers)).toThrow();
  });

  it("every single-scale template has a severity band covering its full score range", () => {
    for (const template of ASSESSMENT_TEMPLATES) {
      if (template.dimensions) continue;
      const maxTotal =
        template.responseType === "scale0to10"
          ? 10
          : template.questions.length * RESPONSE_RANGE[template.responseType].max;
      const bandsCoverMax = template.severityBands.some((b) => b.max >= maxTotal);
      const bandsCoverMin = template.severityBands.some((b) => b.min <= 0);
      expect(bandsCoverMax).toBe(true);
      expect(bandsCoverMin).toBe(true);
    }
  });

  it("sums yes/no answers for the sales diagnostic", () => {
    const sales = getAssessmentTemplate("autodiagnostico-vendas")!;
    const allYes = new Array(30).fill(1);
    expect(scoreAssessment(sales, allYes)).toEqual({
      score: 30,
      maxScore: 30,
      severity: "Processo comercial maduro",
    });

    const allNo = new Array(30).fill(0);
    expect(scoreAssessment(sales, allNo).severity).toBe(
      "Processo comercial pouco estruturado"
    );
  });

  it("scores multi-scale templates by the dimension with the highest sum", () => {
    const leadership = getAssessmentTemplate("estilos-lideranca")!;
    // Todas as 3 perguntas do "coercitivo" (primeiras 3) no máximo, resto no mínimo.
    const answers = new Array(18).fill(1);
    answers[0] = 4;
    answers[1] = 4;
    answers[2] = 4;

    expect(scoreAssessment(leadership, answers)).toEqual({
      score: 12,
      maxScore: 12,
      severity: "Coercitivo",
    });
  });

  it("computes the full dimension breakdown sorted by total", () => {
    const leadership = getAssessmentTemplate("estilos-lideranca")!;
    const answers = new Array(18).fill(1);
    answers[3] = 4;
    answers[4] = 4;
    answers[5] = 4;

    const breakdown = getDimensionBreakdown(leadership, answers);
    expect(breakdown[0]).toEqual({
      key: "dirigente",
      label: "Dirigente",
      total: 12,
      maxTotal: 12,
    });
    expect(breakdown).toHaveLength(6);
  });

  it("returns an empty breakdown for single-scale templates", () => {
    const phq9 = getAssessmentTemplate("phq9")!;
    expect(getDimensionBreakdown(phq9, new Array(9).fill(0))).toEqual([]);
  });
});

describe("isAssessmentTemplateSlug", () => {
  it("accepts every known template slug", () => {
    for (const template of ASSESSMENT_TEMPLATES) {
      expect(isAssessmentTemplateSlug(template.slug)).toBe(true);
    }
  });

  it("rejects unknown or non-string values", () => {
    expect(isAssessmentTemplateSlug("nao-existe")).toBe(false);
    expect(isAssessmentTemplateSlug(undefined)).toBe(false);
    expect(isAssessmentTemplateSlug(42)).toBe(false);
  });
});
