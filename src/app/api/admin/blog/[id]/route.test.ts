import { describe, it, expect, beforeEach } from "vitest";
import { PATCH, DELETE } from "./route";

function makeRequest(method: string, body?: Record<string, unknown>) {
  return new Request("http://localhost/api/admin/blog/post-1", {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
}

const params = Promise.resolve({ id: "post-1" });

describe("PATCH /api/admin/blog/[id]", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects an empty title when provided", async () => {
    const response = await PATCH(makeRequest("PATCH", { title: "  " }), { params });
    expect(response.status).toBe(400);
  });

  it("rejects an empty content when provided", async () => {
    const response = await PATCH(makeRequest("PATCH", { content: "" }), { params });
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await PATCH(makeRequest("PATCH", { published: true }), { params });
    expect(response.status).toBe(503);
  });
});

describe("DELETE /api/admin/blog/[id]", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await DELETE(makeRequest("DELETE"), { params });
    expect(response.status).toBe(503);
  });
});
