import { describe, it, expect, beforeEach } from "vitest";
import { PATCH } from "./route";

const VALID_BODY = {
  bio: "Psicóloga com 10 anos de experiência em TCC.",
  yearsExperience: 10,
  specialties: ["Ansiedade", "Burnout"],
  methods: ["TCC"],
  sessionFormat: "online",
  priceCents: 25000,
};

function makeRequest(body: Record<string, unknown>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      formData.set(key, JSON.stringify(value));
    } else {
      formData.set(key, String(value));
    }
  }
  return new Request("http://localhost/api/professional/profile", {
    method: "PATCH",
    body: formData,
  });
}

describe("PATCH /api/professional/profile", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("rejects a too-short bio", async () => {
    const response = await PATCH(makeRequest({ ...VALID_BODY, bio: "curto" }));
    expect(response.status).toBe(400);
  });

  it("rejects an out-of-range years of experience", async () => {
    const response = await PATCH(makeRequest({ ...VALID_BODY, yearsExperience: 200 }));
    expect(response.status).toBe(400);
  });

  it("rejects an empty specialties list", async () => {
    const response = await PATCH(makeRequest({ ...VALID_BODY, specialties: [] }));
    expect(response.status).toBe(400);
  });

  it("requires city/state when the format isn't online", async () => {
    const response = await PATCH(
      makeRequest({ ...VALID_BODY, sessionFormat: "presencial" })
    );
    expect(response.status).toBe(400);
  });

  it("rejects a malformed social link", async () => {
    const response = await PATCH(
      makeRequest({ ...VALID_BODY, instagramUrl: "not-a-url" })
    );
    expect(response.status).toBe(400);
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await PATCH(makeRequest(VALID_BODY));
    expect(response.status).toBe(503);
  });
});
