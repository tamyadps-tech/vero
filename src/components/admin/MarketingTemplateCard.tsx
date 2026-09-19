"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResolvedCampaignTemplate } from "@/lib/marketing-campaign-templates";

const STAGE_COLOR: Record<ResolvedCampaignTemplate["stage"], string> = {
  Venda: "bg-primary/10 text-primary",
  Acompanhamento: "bg-amber-100 text-amber-800",
  "Pós-venda": "bg-emerald-100 text-emerald-800",
};

export function MarketingTemplateCard({ template }: { template: ResolvedCampaignTemplate }) {
  const router = useRouter();
  const [copied, setCopied] = useState<"assunto" | "email" | "whatsapp" | null>(null);
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(template.content.emailSubject);
  const [bodyText, setBodyText] = useState(template.content.emailBodyText);
  const [whatsapp, setWhatsapp] = useState(template.content.whatsapp);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function copy(text: string, which: "assunto" | "email" | "whatsapp") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard pode falhar — o texto continua visível pra copiar manualmente.
    }
  }

  function startEditing() {
    setSubject(template.content.emailSubject);
    setBodyText(template.content.emailBodyText);
    setWhatsapp(template.content.whatsapp);
    setError("");
    setEditing(true);
  }

  async function save() {
    if (!subject.trim() || !bodyText.trim() || !whatsapp.trim()) {
      setError("Preencha assunto, texto do email e texto do WhatsApp.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/marketing/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailSubject: subject.trim(),
          emailBodyText: bodyText.trim(),
          whatsapp: whatsapp.trim(),
        }),
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

  async function reset() {
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/marketing/templates/${template.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível restaurar agora.");
      }
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-paper p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STAGE_COLOR[template.stage]}`}
          >
            {template.stage}
          </span>
          <h3 className="text-sm font-semibold text-ink">{template.label}</h3>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            Editar
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-ink-soft">{template.description}</p>

      {editing ? (
        <div className="mt-4 rounded-xl border border-primary bg-paper-alt/40 p-3">
          <label className="block text-xs font-medium text-ink-soft">
            Assunto do email
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="mt-2 block text-xs font-medium text-ink-soft">
            Texto do email (o link da Vero é adicionado automaticamente no fim)
            <textarea
              value={bodyText}
              onChange={(event) => setBodyText(event.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="mt-2 block text-xs font-medium text-ink-soft">
            Texto do WhatsApp (o link da Vero é adicionado automaticamente no fim)
            <textarea
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink"
            />
          </label>
          {error && (
            <p role="alert" className="mt-2 text-xs text-accent-dark">
              {error}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={save}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
            >
              Salvar
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={reset}
              className="text-xs font-medium text-ink-soft hover:text-ink"
            >
              Restaurar padrão
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs font-medium text-ink-soft hover:text-ink"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-xl border border-border bg-paper-alt/40 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              Email — assunto
            </p>
            <p className="mt-1 text-sm text-ink">{template.email.subject}</p>
            <button
              type="button"
              onClick={() => copy(template.email.subject, "assunto")}
              className="mt-2 rounded-lg border border-border px-3 py-1 text-xs font-medium text-ink hover:bg-paper"
            >
              {copied === "assunto" ? "Copiado!" : "Copiar assunto"}
            </button>
          </div>

          <div className="mt-3 rounded-xl border border-border bg-paper-alt/40 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              Email — texto
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">
              {template.content.emailBodyText}
            </p>
            <button
              type="button"
              onClick={() => copy(template.email.html, "email")}
              className="mt-2 rounded-lg border border-border px-3 py-1 text-xs font-medium text-ink hover:bg-paper"
            >
              {copied === "email" ? "Copiado!" : "Copiar HTML do email"}
            </button>
          </div>

          <div className="mt-3 rounded-xl border border-border bg-paper-alt/40 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              WhatsApp
            </p>
            <p className="mt-1 text-sm text-ink">{template.whatsapp}</p>
            <button
              type="button"
              onClick={() => copy(template.whatsapp, "whatsapp")}
              className="mt-2 rounded-lg border border-border px-3 py-1 text-xs font-medium text-ink hover:bg-paper"
            >
              {copied === "whatsapp" ? "Copiado!" : "Copiar mensagem"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
