"use client";

import { useState } from "react";
import { computeFinancialHealth, suggestPrice } from "@/lib/financial-health";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseReais(value: string): number {
  const parsed = parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) : 0;
}

/**
 * Calculadora de margem, ponto de equilíbrio e preço sugerido — mesma
 * lib (financial-health.ts) pro profissional (preço da sessão) e pro
 * admin (comissão da Vero). Os valores iniciais vêm dos dados reais
 * (despesas cadastradas, preço atual), mas tudo é editável — é uma
 * calculadora, não só um relatório.
 */
export function FinancialHealthCalculator({
  initialFixedMonthlyCostsCents,
  initialVariableCostPerUnitCents,
  initialPriceCents,
  initialUnitsPerMonth = 10,
  unitLabel = "sessão",
  unitLabelPlural = "sessões",
  priceLabel = "Preço da sessão",
}: {
  initialFixedMonthlyCostsCents: number;
  initialVariableCostPerUnitCents: number;
  initialPriceCents: number;
  initialUnitsPerMonth?: number;
  unitLabel?: string;
  unitLabelPlural?: string;
  priceLabel?: string;
}) {
  const [fixedCosts, setFixedCosts] = useState(String(initialFixedMonthlyCostsCents / 100));
  const [variableCost, setVariableCost] = useState(String(initialVariableCostPerUnitCents / 100));
  const [price, setPrice] = useState(String(initialPriceCents / 100));
  const [unitsPerMonth, setUnitsPerMonth] = useState(String(initialUnitsPerMonth));

  const fixedCents = parseReais(fixedCosts);
  const variableCents = parseReais(variableCost);
  const priceCents = parseReais(price);
  const units = Math.max(0, parseInt(unitsPerMonth, 10) || 0);

  const health = computeFinancialHealth({
    fixedMonthlyCostsCents: fixedCents,
    variableCostPerUnitCents: variableCents,
    pricePerUnitCents: priceCents,
  });

  const suggestedHealthy = suggestPrice({
    fixedMonthlyCostsCents: fixedCents,
    variableCostPerUnitCents: variableCents,
    estimatedUnitsPerMonth: units,
    targetMarginPercent: 30,
  });
  const suggestedComfortable = suggestPrice({
    fixedMonthlyCostsCents: fixedCents,
    variableCostPerUnitCents: variableCents,
    estimatedUnitsPerMonth: units,
    targetMarginPercent: 50,
  });

  const isUnhealthy = health.contributionMarginCents <= 0 && priceCents > 0;

  return (
    <div className="rounded-2xl border border-border bg-paper p-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="text-xs font-medium text-ink-soft">
          Custo fixo mensal (R$)
          <input
            type="number"
            min={0}
            step="0.01"
            value={fixedCosts}
            onChange={(event) => setFixedCosts(event.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="text-xs font-medium text-ink-soft">
          Custo variável por {unitLabel} (R$)
          <input
            type="number"
            min={0}
            step="0.01"
            value={variableCost}
            onChange={(event) => setVariableCost(event.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="text-xs font-medium text-ink-soft">
          {priceLabel} (R$)
          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="text-xs font-medium text-ink-soft">
          {unitLabelPlural} estimadas / mês
          <input
            type="number"
            min={0}
            step="1"
            value={unitsPerMonth}
            onChange={(event) => setUnitsPerMonth(event.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
          />
        </label>
      </div>

      {isUnhealthy && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Atenção: com esses números, cada {unitLabel} dá prejuízo — o custo variável já é
          maior que o preço cobrado. Não existe ponto de equilíbrio possível enquanto isso
          não mudar.
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
            Margem de contribuição
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            {formatPrice(health.contributionMarginCents)}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            {health.contributionMarginPercent === null
              ? "—"
              : `${health.contributionMarginPercent.toFixed(0)}% do preço`}{" "}
            por {unitLabel}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
            Ponto de equilíbrio
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            {health.breakEvenUnits === null ? "—" : health.breakEvenUnits}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            {health.breakEvenUnits === null
              ? "Nunca cobre o custo fixo com esse preço"
              : `${unitLabelPlural} por mês pra cobrir o custo fixo`}
          </p>
        </div>
        <div className="rounded-2xl border border-primary bg-primary/5 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
            Preço sugerido
          </p>
          <p className="mt-2 text-sm text-ink">
            Margem saudável (30%):{" "}
            <strong>{suggestedHealthy === null ? "—" : formatPrice(suggestedHealthy)}</strong>
          </p>
          <p className="mt-1 text-sm text-ink">
            Margem confortável (50%):{" "}
            <strong>
              {suggestedComfortable === null ? "—" : formatPrice(suggestedComfortable)}
            </strong>
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            Considerando o custo fixo rateado pelas {unitLabelPlural} estimadas por mês.
          </p>
        </div>
      </div>
    </div>
  );
}
