import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

describe("POST /api/professional/google-calendar/disconnect", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST();
    expect(response.status).toBe(503);
  });
});
