import { describe, it, expect } from "vitest";
import { slugify } from "./blog";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Como Escolher Seu Terapeuta")).toBe("como-escolher-seu-terapeuta");
  });

  it("strips accents", () => {
    expect(slugify("Ansiedade e saúde mental")).toBe("ansiedade-e-saude-mental");
  });

  it("collapses punctuation into single hyphens", () => {
    expect(slugify("O que é burnout? (e como reconhecer)")).toBe(
      "o-que-e-burnout-e-como-reconhecer"
    );
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  -- Título --  ")).toBe("titulo");
  });
});
