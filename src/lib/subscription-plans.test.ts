import { describe, expect, it } from "vitest";
import { hasPlanAccess, getSubscriptionPlan, isSubscriptionPlanId, SUBSCRIPTION_PLANS } from "./subscription-plans";

describe("SUBSCRIPTION_PLANS", () => {
  it("está em ordem crescente de preço (básico < pro < premium)", () => {
    const prices = SUBSCRIPTION_PLANS.map((p) => p.priceCents);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});

describe("getSubscriptionPlan", () => {
  it("retorna a definição do plano pedido", () => {
    expect(getSubscriptionPlan("pro").name).toBe("Pro");
  });
});

describe("isSubscriptionPlanId", () => {
  it("aceita os três ids válidos", () => {
    expect(isSubscriptionPlanId("basico")).toBe(true);
    expect(isSubscriptionPlanId("pro")).toBe(true);
    expect(isSubscriptionPlanId("premium")).toBe(true);
  });

  it("rejeita qualquer outra coisa", () => {
    expect(isSubscriptionPlanId("gold")).toBe(false);
    expect(isSubscriptionPlanId(null)).toBe(false);
    expect(isSubscriptionPlanId(undefined)).toBe(false);
  });
});

describe("hasPlanAccess", () => {
  it("nega quando não há plano nenhum", () => {
    expect(hasPlanAccess(null, null, "basico")).toBe(false);
  });

  it("nega quando a assinatura não está ativa", () => {
    expect(hasPlanAccess("premium", "cancelada", "basico")).toBe(false);
    expect(hasPlanAccess("premium", "inadimplente", "basico")).toBe(false);
  });

  it("nega quando o plano atual é menor que o exigido", () => {
    expect(hasPlanAccess("basico", "ativa", "pro")).toBe(false);
    expect(hasPlanAccess("pro", "ativa", "premium")).toBe(false);
  });

  it("permite quando o plano atual é igual ao exigido", () => {
    expect(hasPlanAccess("pro", "ativa", "pro")).toBe(true);
  });

  it("permite quando o plano atual é maior que o exigido", () => {
    expect(hasPlanAccess("premium", "ativa", "basico")).toBe(true);
    expect(hasPlanAccess("premium", "ativa", "pro")).toBe(true);
  });
});
