import { describe, it, expect, beforeEach } from "vitest";
import { GET } from "./route";

describe("GET /api/professional/crm/export", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await GET();
    expect(response.status).toBe(503);
  });
});
