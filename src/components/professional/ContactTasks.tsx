"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { CrmTask } from "@/lib/professional-crm";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

function isOverdue(task: CrmTask) {
  if (task.done || !task.dueDate) return false;
  return new Date(task.dueDate) < new Date(new Date().toDateString());
}

export function ContactTasks({ linkId, tasks }: { linkId: string; tasks: CrmTask[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch("/api/professional/crm/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(linkId.startsWith("c-") ? { clientId: linkId.slice(2) } : { contactId: linkId.slice(2) }),
          title,
          dueDate: dueDate || undefined,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Não foi possível criar a tarefa agora.");
      setTitle("");
      setDueDate("");
      setStatus("idle");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Não foi possível criar a tarefa agora.");
    }
  }

  async function toggleDone(taskId: string, done: boolean) {
    await fetch(`/api/professional/crm/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    router.refresh();
  }

  async function removeTask(taskId: string) {
    await fetch(`/api/professional/crm/tasks/${taskId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
        Tarefas de follow-up
      </h2>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap gap-2">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex: ligar pra remarcar"
          className="min-w-[180px] flex-1 rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-primary focus:outline-none"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
        >
          {status === "saving" ? "Salvando…" : "Adicionar"}
        </button>
      </form>
      {status === "error" && (
        <p role="alert" className="mt-1 text-xs text-accent-dark">
          {message}
        </p>
      )}
      <div className="mt-4 space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhuma tarefa ainda.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm ${
                isOverdue(task) ? "border-accent-dark/40 bg-accent-light/40" : "border-border bg-paper"
              }`}
            >
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={(e) => toggleDone(task.id, e.target.checked)}
                  className="h-4 w-4"
                />
                <span className={task.done ? "text-ink-soft line-through" : "text-ink"}>
                  {task.title}
                </span>
                {task.dueDate && (
                  <span className="text-xs text-ink-soft">
                    · {dateFormatter.format(new Date(task.dueDate))}
                    {isOverdue(task) ? " (atrasada)" : ""}
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={() => removeTask(task.id)}
                className="text-xs text-ink-soft hover:text-accent-dark"
              >
                Remover
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
