"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Orçado (meta editável) x realizado (mês corrente) x projeção (ritmo
 * atual esticado até o fim do mês) — só pro lado da receita do
 * profissional (o admin ainda não tem meta de receita própria, ver
 * /admin/financeiro).
 */
export function MonthlyGoalTracker({
  goalCents,
  realizedCents,
  projectedCents,
}: {
  goalCents: number | null;
  realizedCents: number;
  projectedCents: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(goalCents !== null ? String(goalCents / 100) : "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function saveGoal() {
    let cents: number | null;
    if (value.trim() === "") {
      cents = null;
    } else {
      cents = Math.round(parseFloat(value.replace(",", ".")) * 100);
      if (!Number.isFinite(cents) || cents < 0) {
        setError("Informe um valor válido.");
        return;
      }
    }

    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/professional/financial-goal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyRevenueGoalCents: cents }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível salvar agora.");
      }
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setPending(false);
    }
  }

  const progressPercent = goalCents && goalCents > 0 ? Math.min(100, (realizedCents / goalCents) * 100) : null;

  return (
    <div className="rounded-2xl border border-border bg-paper p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">Meta do mês: orçado × realizado × projeção</p>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {goalCents === null ? "Definir meta" : "Editar meta"}
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-xs font-medium text-ink-soft">
            Meta de receita mensal (R$) — deixe em branco pra remover
            <input
              type="number"
              min={0}
              step="0.01"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="mt-1 block w-40 rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
            />
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={saveGoal}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setValue(goalCents !== null ? String(goalCents / 100) : "");
              setError("");
            }}
            className="text-xs font-medium text-ink-soft hover:text-ink"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              Orçado (meta)
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">
              {goalCents === null ? "—" : formatPrice(goalCents)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              Realizado (mês)
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">
              {formatPrice(realizedCents)}
            </p>
            {progressPercent !== null && (
              <p className="mt-1 text-xs text-ink-soft">{progressPercent.toFixed(0)}% da meta</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              Projeção (fim do mês)
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">
              {formatPrice(projectedCents)}
            </p>
            {goalCents !== null && (
              <p className="mt-1 text-xs text-ink-soft">
                {projectedCents >= goalCents
                  ? "No ritmo de bater a meta"
                  : "Abaixo do ritmo pra bater a meta"}
              </p>
            )}
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-accent-dark">
          {error}
        </p>
      )}
    </div>
  );
}
