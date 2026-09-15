"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "loading" | "success" | "error";

const fieldClass =
  "w-full rounded-xl border border-border bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-soft/70 focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";

function ClientProfileEditForm({
  fullName,
  email,
  onClose,
}: {
  fullName: string;
  email: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const body: Record<string, string> = {};
    if (name.trim() !== fullName) body.fullName = name.trim();
    if (newPassword) {
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }

    try {
      const response = await fetch("/api/client/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível salvar agora.");
      }

      setStatus("success");
      setMessage("Perfil atualizado!");
      setCurrentPassword("");
      setNewPassword("");
      router.refresh();
      onClose();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar agora.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-paper-alt/40 p-5">
      <div>
        <label className={labelClass} htmlFor="client-name">
          Nome completo
        </label>
        <input
          id="client-name"
          required
          minLength={3}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Email</label>
        <p className="text-sm text-ink-soft">{email}</p>
      </div>

      <div className="rounded-xl border border-border bg-paper p-4">
        <p className={labelClass}>Trocar senha (opcional)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="client-current-password">
              Senha atual
            </label>
            <input
              id="client-current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="client-new-password">
              Nova senha
            </label>
            <input
              id="client-new-password"
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className={fieldClass}
            />
          </div>
        </div>
        <p className="mt-1.5 text-xs text-ink-soft">
          Só preencha se quiser trocar — mínimo 8 caracteres.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
        >
          {status === "loading" ? "Salvando…" : "Salvar alterações"}
        </button>
        <button type="button" onClick={onClose} className="text-sm text-ink-soft">
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

export function ClientProfileSection({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ClientProfileEditForm fullName={fullName} email={email} onClose={() => setIsEditing(false)} />
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-paper-alt/40 p-5">
      <div>
        <p className="font-medium text-ink">{fullName}</p>
        <p className="text-sm text-ink-soft">{email}</p>
      </div>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="whitespace-nowrap rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-primary-dark"
      >
        Editar perfil
      </button>
    </div>
  );
}
