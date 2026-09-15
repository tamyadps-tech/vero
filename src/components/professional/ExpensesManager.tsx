"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProfessionalExpense } from "@/lib/professional-expenses";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

function todayIsoDate() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function ExpensesManager({ expenses }: { expenses: ProfessionalExpense[] }) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(todayIsoDate());
  const [category, setCategory] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function addExpense() {
    const amountCents = Math.round(parseFloat(amount.replace(",", ".")) * 100);
    if (!description.trim()) {
      setError("Informe uma descrição.");
      return;
    }
    if (!Number.isFinite(amountCents) || amountCents < 0) {
      setError("Informe um valor válido.");
      return;
    }

    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/professional/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          amountCents,
          expenseDate,
          category: category.trim() || undefined,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível salvar agora.");
      }
      setDescription("");
      setAmount("");
      setCategory("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setPending(false);
    }
  }

  async function removeExpense(expenseId: string) {
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/professional/expenses/${expenseId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível remover agora.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-40 flex-1">
          <label className="mb-1.5 block text-xs font-medium text-ink" htmlFor="expense-description">
            Descrição
          </label>
          <input
            id="expense-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Aluguel do consultório"
            className="w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink" htmlFor="expense-amount">
            Valor (R$)
          </label>
          <input
            id="expense-amount"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="150"
            className="w-28 rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink" htmlFor="expense-date">
            Data
          </label>
          <input
            id="expense-date"
            type="date"
            value={expenseDate}
            onChange={(event) => setExpenseDate(event.target.value)}
            className="rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink" htmlFor="expense-category">
            Categoria (opcional)
          </label>
          <input
            id="expense-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Plataforma, marketing..."
            className="w-40 rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
          />
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={addExpense}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
        >
          Adicionar
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-accent-dark">
          {error}
        </p>
      )}

      <ul className="mt-5 space-y-2">
        {expenses.length === 0 && (
          <li className="text-sm text-ink-soft">Nenhuma despesa registrada ainda.</li>
        )}
        {expenses.map((expense) => (
          <li
            key={expense.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-paper px-4 py-2.5 text-sm"
          >
            <div>
              <span className="text-ink">{expense.description}</span>
              {expense.category && (
                <span className="ml-2 rounded-full bg-paper-alt px-2 py-0.5 text-xs text-ink-soft">
                  {expense.category}
                </span>
              )}
              <span className="ml-2 text-xs text-ink-soft">
                {dateFormatter.format(new Date(`${expense.expenseDate}T00:00:00`))}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-ink">{formatPrice(expense.amountCents)}</span>
              <button
                type="button"
                disabled={pending}
                onClick={() => removeExpense(expense.id)}
                className="text-xs font-medium text-ink-soft hover:text-accent-dark disabled:opacity-60"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
