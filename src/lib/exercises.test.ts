import { describe, it, expect } from "vitest";
import { EXERCISES, getExercise, isExerciseSlug } from "./exercises";

describe("exercises", () => {
  it("has at least one exercise, each with prompts and a professional note", () => {
    expect(EXERCISES.length).toBeGreaterThan(0);
    for (const exercise of EXERCISES) {
      expect(exercise.prompts.length).toBeGreaterThan(0);
      expect(exercise.instructions.trim().length).toBeGreaterThan(0);
      expect(exercise.professionalNote.trim().length).toBeGreaterThan(0);
      for (const prompt of exercise.prompts) {
        expect(prompt.label.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("has unique slugs and unique prompt ids within each exercise", () => {
    const slugs = EXERCISES.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const exercise of EXERCISES) {
      const promptIds = exercise.prompts.map((p) => p.id);
      expect(new Set(promptIds).size).toBe(promptIds.length);
    }
  });

  it("finds an exercise by slug", () => {
    const exercise = getExercise("carta-de-despedida");
    expect(exercise?.name).toBe("Carta de Despedida");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getExercise("nao-existe")).toBeUndefined();
  });
});

describe("isExerciseSlug", () => {
  it("accepts every known exercise slug", () => {
    for (const exercise of EXERCISES) {
      expect(isExerciseSlug(exercise.slug)).toBe(true);
    }
  });

  it("rejects unknown or non-string values", () => {
    expect(isExerciseSlug("nao-existe")).toBe(false);
    expect(isExerciseSlug(undefined)).toBe(false);
    expect(isExerciseSlug(42)).toBe(false);
  });
});
