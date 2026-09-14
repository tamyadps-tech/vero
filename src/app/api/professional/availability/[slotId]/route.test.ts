import { describe, it, expect, beforeEach } from "vitest";
import { DELETE } from "./route";

describe("DELETE /api/professional/availability/[slotId]", () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("returns 503 when Supabase isn't configured yet", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/professional/availability/slot-1", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ slotId: "slot-1" }) }
    );
    expect(response.status).toBe(503);
  });
});
