import { describe, it, expect, beforeEach } from "vitest";
import { GET } from "./route";

describe("GET /api/professional/google-calendar/connect", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_ANON_KEY;
  });

  it("returns 503 when Google Calendar isn't configured yet", async () => {
    const response = await GET(
      new Request("http://localhost/api/professional/google-calendar/connect")
    );
    expect(response.status).toBe(503);
  });
});
