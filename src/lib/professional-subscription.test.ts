import { describe, expect, it } from "vitest";
import { mapStripeSubscriptionStatus } from "./professional-subscription";

describe("mapStripeSubscriptionStatus", () => {
  it("mapeia active e trialing pra ativa", () => {
    expect(mapStripeSubscriptionStatus("active")).toBe("ativa");
    expect(mapStripeSubscriptionStatus("trialing")).toBe("ativa");
  });

  it("mapeia canceled e incomplete_expired pra cancelada", () => {
    expect(mapStripeSubscriptionStatus("canceled")).toBe("cancelada");
    expect(mapStripeSubscriptionStatus("incomplete_expired")).toBe("cancelada");
  });

  it("mapeia past_due, unpaid e incomplete pra inadimplente", () => {
    expect(mapStripeSubscriptionStatus("past_due")).toBe("inadimplente");
    expect(mapStripeSubscriptionStatus("unpaid")).toBe("inadimplente");
    expect(mapStripeSubscriptionStatus("incomplete")).toBe("inadimplente");
  });
});
