import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

const VALID_BODY = {
  title: "Sinais de que pode ser hora de buscar terapia",
  excerpt: "Alguns sinais comuns de que vale a pena procurar apoio profissional.",
  content: "# Título\n\nConteúdo do post.",
  tags: ["saúde mental"],
  published: false,
};

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/admin/blog", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/blog", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects an empty title", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, title: "  " }));
    expect(response.status).toBe(400);
  });

  it("rejects an empty excerpt", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, excerpt: "" }));
    expect(response.status).toBe(400);
  });

  it("rejects an empty content", async () => {
    const response = await POST(makeRequest({ ...VALID_BODY, content: "" }));
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(makeRequest(VALID_BODY));
    expect(response.status).toBe(503);
  });
});
