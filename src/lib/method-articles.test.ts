import { describe, it, expect } from "vitest";
import { METHOD_ARTICLES, getMethodArticle } from "./method-articles";

describe("method-articles", () => {
  it("has at least one article, each with sections and non-empty paragraphs", () => {
    expect(METHOD_ARTICLES.length).toBeGreaterThan(0);
    for (const article of METHOD_ARTICLES) {
      expect(article.sections.length).toBeGreaterThan(0);
      for (const section of article.sections) {
        expect(section.body.length).toBeGreaterThan(0);
        for (const paragraph of section.body) {
          expect(paragraph.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("has unique slugs", () => {
    const slugs = METHOD_ARTICLES.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("finds an article by slug", () => {
    const article = getMethodArticle("leitura-de-respostas-em-sessao");
    expect(article?.title).toBe("Como ler as respostas do seu cliente em sessão");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getMethodArticle("nao-existe")).toBeUndefined();
  });
});
