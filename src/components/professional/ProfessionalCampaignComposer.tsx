"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ResolvedProfessionalCampaignTemplate } from "@/lib/professional-campaign-templates";

type ClientOption = { id: string; full_name: string; email: string; phone_number: string | null };

type SendState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "done"; recipientCount: number; sent: number; failed: number; reasons: string[] }
  | { status: "error"; message: string };

export function ProfessionalCampaignComposer({
  templates,
  clients,
}: {
  templates: ResolvedProfessionalCampaignTemplate[];
  clients: ClientOption[];
}) {
  const router = useRouter();
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  const [templateId, setTemplateId] = useState<string>(templates[0]?.id ?? "");
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [manualPhones, setManualPhones] = useState("");
  const [state, setState] = useState<SendState>({ status: "idle" });

  const [editing, setEditing] = useState(false);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editPending, setEditPending] = useState(false);
  const [editError, setEditError] = useState("");

  const template = templates.find((t) => t.id === templateId) ?? templates[0];
  const clientsWithPhone = clients.filter((c) => c.phone_number);

  function toggleClient(id: string) {
    setSelectedClientIds((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
    );
  }

  function toggleAllClients(pool: ClientOption[]) {
    setSelectedClientIds((current) =>
      pool.every((c) => current.includes(c.id))
        ? current.filter((id) => !pool.some((c) => c.id === id))
        : [...new Set([...current, ...pool.map((c) => c.id)])]
    );
  }

  function startEditing() {
    if (!template) return;
    setEditSubject(template.content.emailSubject);
    setEditBody(template.content.emailBodyText);
    setEditWhatsapp(template.content.whatsapp);
    setEditError("");
    setEditing(true);
  }

  async function saveTemplate() {
    if (!editSubject.trim() || !editBody.trim() || !editWhatsapp.trim()) {
      setEditError("Preencha assunto, texto do email e texto do WhatsApp.");
      return;
    }
    setEditPending(true);
    setEditError("");
    try {
      const response = await fetch(`/api/professional/marketing/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailSubject: editSubject.trim(),
          emailBodyText: editBody.trim(),
          whatsapp: editWhatsapp.trim(),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível salvar agora.");
      }
      setEditing(false);
      router.refresh();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setEditPending(false);
    }
  }

  async function resetTemplate() {
    setEditPending(true);
    setEditError("");
    try {
      const response = await fetch(`/api/professional/marketing/templates/${templateId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível restaurar agora.");
      }
      setEditing(false);
      router.refresh();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setEditPending(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setState({ status: "sending" });

    const url =
      channel === "email"
        ? "/api/professional/marketing/send-email"
        : "/api/professional/marketing/send-whatsapp";
    const body =
      channel === "email"
        ? { templateId, clientIds: selectedClientIds }
        : {
            templateId,
            clientIds: selectedClientIds,
            manualPhones: manualPhones
              .split(/[\n,]/)
              .map((phone) => phone.trim())
              .filter(Boolean),
          };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await response.json();

      if (!response.ok) {
        setState({ status: "error", message: json.error ?? "Não foi possível enviar." });
        return;
      }

      setState({
        status: "done",
        recipientCount: json.recipientCount,
        sent: json.sent,
        failed: json.failed,
        reasons: json.reasons ?? [],
      });
    } catch {
      setState({ status: "error", message: "Falha de rede ao enviar." });
    }
  }

  if (templates.length === 0) return null;

  const clientPool = channel === "email" ? clients : clientsWithPhone;

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-paper-alt/40 p-5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setChannel("email");
            setSelectedClientIds([]);
          }}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            channel === "email" ? "bg-primary text-paper" : "bg-paper text-ink-soft"
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => {
            setChannel("whatsapp");
            setSelectedClientIds([]);
          }}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            channel === "whatsapp" ? "bg-primary text-paper" : "bg-paper text-ink-soft"
          }`}
        >
          WhatsApp
        </button>
      </div>

      <label className="mt-4 block text-xs font-medium text-ink-soft">
        Modelo de mensagem
        <select
          value={templateId}
          onChange={(event) => {
            setTemplateId(event.target.value);
            setEditing(false);
          }}
          className="mt-1 w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        {template && <p className="mt-1 text-xs text-ink-soft">{template.goal}</p>}
      </label>

      {template && !editing && (
        <div className="mt-3 rounded-xl border border-border bg-paper p-3 text-xs text-ink-soft">
          <div className="flex items-center justify-between">
            <p className="font-medium uppercase tracking-wide">Prévia</p>
            <button
              type="button"
              onClick={startEditing}
              className="text-xs font-medium text-primary hover:underline"
            >
              Editar este modelo
            </button>
          </div>
          {channel === "email" ? (
            <>
              <p className="mt-1 font-medium text-ink">{template.email.subject}</p>
              <p className="mt-1 whitespace-pre-wrap text-ink-soft">{template.content.emailBodyText}</p>
            </>
          ) : (
            <p className="mt-1 text-ink">{template.whatsapp}</p>
          )}
        </div>
      )}

      {template && editing && (
        <div className="mt-3 rounded-xl border border-primary bg-paper p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
            Editando &quot;{template.label}&quot;
          </p>
          <label className="mt-2 block text-xs font-medium text-ink-soft">
            Assunto do email
            <input
              value={editSubject}
              onChange={(event) => setEditSubject(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="mt-2 block text-xs font-medium text-ink-soft">
            Texto do email (o link do seu perfil é adicionado automaticamente no fim)
            <textarea
              value={editBody}
              onChange={(event) => setEditBody(event.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink"
            />
          </label>
          <label className="mt-2 block text-xs font-medium text-ink-soft">
            Texto do WhatsApp (o link do seu perfil é adicionado automaticamente no fim)
            <textarea
              value={editWhatsapp}
              onChange={(event) => setEditWhatsapp(event.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink"
            />
          </label>
          {editError && (
            <p role="alert" className="mt-2 text-xs text-accent-dark">
              {editError}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={editPending}
              onClick={saveTemplate}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
            >
              Salvar
            </button>
            <button
              type="button"
              disabled={editPending}
              onClick={resetTemplate}
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
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-ink-soft">
            Destinatários {channel === "whatsapp" && "(clientes com telefone cadastrado)"}
          </p>
          {clientPool.length > 0 && (
            <button
              type="button"
              onClick={() => toggleAllClients(clientPool)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {clientPool.every((c) => selectedClientIds.includes(c.id))
                ? "Desmarcar todos"
                : "Selecionar todos"}
            </button>
          )}
        </div>
        {clientPool.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">
            {channel === "email"
              ? "Você ainda não tem clientes cadastrados pra mandar campanha de email."
              : "Nenhum cliente seu tem telefone cadastrado ainda — use o campo de números manuais abaixo."}
          </p>
        ) : (
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-border bg-paper p-2">
            {clientPool.map((client) => (
              <label
                key={client.id}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink hover:bg-paper-alt/60"
              >
                <input
                  type="checkbox"
                  checked={selectedClientIds.includes(client.id)}
                  onChange={() => toggleClient(client.id)}
                />
                {client.full_name}{" "}
                <span className="text-xs text-ink-soft">
                  ({channel === "email" ? client.email : client.phone_number})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {channel === "whatsapp" && (
        <label className="mt-4 block text-xs font-medium text-ink-soft">
          Outros números (formato +5511999999999) — pra quem ainda não está no seu CRM
          <textarea
            value={manualPhones}
            onChange={(event) => setManualPhones(event.target.value)}
            rows={2}
            placeholder="+5511999999999, +5511988888888"
            className="mt-1 w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm text-ink"
          />
        </label>
      )}

      <button
        type="submit"
        disabled={state.status === "sending"}
        className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
      >
        {state.status === "sending" ? "Enviando..." : "Enviar campanha"}
      </button>

      {state.status === "done" && (
        <p className="mt-3 text-xs text-ink-soft">
          {state.recipientCount} destinatário(s) — {state.sent} enviado(s), {state.failed} não
          enviado(s)
          {state.reasons.length > 0 && ` (motivo: ${state.reasons.join(", ")})`}.
        </p>
      )}
      {state.status === "error" && <p className="mt-3 text-xs text-red-600">{state.message}</p>}
    </form>
  );
}
