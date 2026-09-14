"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const fieldClass =
  "w-full rounded-xl border border-border bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-soft/70 focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";

export function LoginForm({
  role,
  redirectTo,
}: {
  role: "professional" | "client";
  redirectTo: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`/api/auth/${role}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível entrar agora.");
      }

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Não foi possível entrar agora."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="login-password">
          Senha
        </label>
        <input
          id="login-password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={fieldClass}
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
      >
        {status === "loading" ? "Entrando…" : "Entrar"}
      </button>
      {status === "error" && (
        <p role="alert" className="text-sm text-accent-dark">
          {message}
        </p>
      )}
    </form>
  );
}
