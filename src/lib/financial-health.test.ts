import { describe, it, expect } from "vitest";
import { computeFinancialHealth, suggestPrice } from "./financial-health";

describe("computeFinancialHealth", () => {
  it("computes contribution margin and its percent over price", () => {
    const result = computeFinancialHealth({
      fixedMonthlyCostsCents: 0,
      variableCostPerUnitCents: 3000,
      pricePerUnitCents: 10000,
    });
    expect(result.contributionMarginCents).toBe(7000);
    expect(result.contributionMarginPercent).toBe(70);
    expect(result.breakEvenUnits).toBe(0);
  });

  it("returns a positive break-even session count when there's fixed cost", () => {
    const result = computeFinancialHealth({
      fixedMonthlyCostsCents: 100000, // R$1000/mês
      variableCostPerUnitCents: 0,
      pricePerUnitCents: 20000, // R$200/sessão
    });
    // 100000 / 20000 = 5 sessões cobrem o custo fixo
    expect(result.breakEvenUnits).toBe(5);
  });

  it("rounds break-even up (partial session still costs a full session)", () => {
    const result = computeFinancialHealth({
      fixedMonthlyCostsCents: 100000,
      variableCostPerUnitCents: 0,
      pricePerUnitCents: 30000, // 100000/30000 = 3.33...
    });
    expect(result.breakEvenUnits).toBe(4);
  });

  it("returns null margin percent when price is zero", () => {
    const result = computeFinancialHealth({
      fixedMonthlyCostsCents: 0,
      variableCostPerUnitCents: 0,
      pricePerUnitCents: 0,
    });
    expect(result.contributionMarginPercent).toBeNull();
  });

  it("returns null break-even when variable cost matches or exceeds price (never breaks even)", () => {
    const result = computeFinancialHealth({
      fixedMonthlyCostsCents: 50000,
      variableCostPerUnitCents: 12000,
      pricePerUnitCents: 10000,
    });
    expect(result.contributionMarginCents).toBe(-2000);
    expect(result.breakEvenUnits).toBeNull();
  });
});

describe("suggestPrice", () => {
  it("suggests a price covering variable cost + rateio of fixed cost at the target margin", () => {
    const price = suggestPrice({
      fixedMonthlyCostsCents: 100000, // R$1000/mês
      variableCostPerUnitCents: 0,
      estimatedUnitsPerMonth: 10,
      targetMarginPercent: 50,
    });
    // custo por sessão = 100000/10 = 10000; preço = 10000 / (1-0.5) = 20000
    expect(price).toBe(20000);
  });

  it("factors in variable cost per unit", () => {
    const price = suggestPrice({
      fixedMonthlyCostsCents: 0,
      variableCostPerUnitCents: 5000,
      estimatedUnitsPerMonth: 10,
      targetMarginPercent: 0,
    });
    expect(price).toBe(5000);
  });

  it("returns null when estimated volume is zero or negative", () => {
    expect(
      suggestPrice({
        fixedMonthlyCostsCents: 1000,
        variableCostPerUnitCents: 0,
        estimatedUnitsPerMonth: 0,
        targetMarginPercent: 30,
      })
    ).toBeNull();
  });

  it("returns null when target margin is 100% or more (would need infinite price)", () => {
    expect(
      suggestPrice({
        fixedMonthlyCostsCents: 1000,
        variableCostPerUnitCents: 0,
        estimatedUnitsPerMonth: 10,
        targetMarginPercent: 100,
      })
    ).toBeNull();
  });

  it("returns null for a negative target margin", () => {
    expect(
      suggestPrice({
        fixedMonthlyCostsCents: 1000,
        variableCostPerUnitCents: 0,
        estimatedUnitsPerMonth: 10,
        targetMarginPercent: -5,
      })
    ).toBeNull();
  });
});
