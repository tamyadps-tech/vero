"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const fieldClass =
  "w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-primary focus:outline-none";

export function AddLeadForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/professional/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone: phone || undefined }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível criar o contato agora.");
      }
      router.refresh();
      onDone();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Não foi possível criar o contato agora.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 space-y-2 rounded-xl border border-border bg-paper-alt/40 p-4"
    >
      <div className="grid gap-2 sm:grid-cols-3">
        <input
          required
          minLength={2}
          placeholder="Nome"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={fieldClass}
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
        />
        <input
          type="tel"
          placeholder="Telefone (opcional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={fieldClass}
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
        >
          {status === "loading" ? "Salvando…" : "Salvar contato"}
        </button>
        <button type="button" onClick={onDone} className="text-sm text-ink-soft hover:text-ink">
          Cancelar
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="text-sm text-accent-dark">
          {message}
        </p>
      )}
    </form>
  );
}
