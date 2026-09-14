import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "./route";

function makeRequest() {
  return new Request(
    "http://localhost/api/professional/sessions/abc/send-confirmation",
    { method: "POST" }
  );
}

describe("POST /api/professional/sessions/[id]/send-confirmation", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await POST(makeRequest(), { params: Promise.resolve({ id: "abc" }) });
    expect(response.status).toBe(503);
  });
});
