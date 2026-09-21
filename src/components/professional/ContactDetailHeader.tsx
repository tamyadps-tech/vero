"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CRM_STAGES, CRM_STAGE_LABELS, type CrmStage } from "@/lib/professional-crm";

const fieldClass =
  "rounded-lg border border-border bg-paper px-3 py-1.5 text-sm text-ink focus:border-primary focus:outline-none";

export function ContactDetailHeader({
  linkId,
  fullName,
  phone,
  stage,
  tags,
  editableName,
}: {
  linkId: string;
  fullName: string;
  phone: string | null;
  stage: CrmStage;
  tags: string[];
  /** Nome só é editável pra leads — cliente real usa o nome cadastrado na própria conta. */
  editableName: boolean;
}) {
  const router = useRouter();
  const [nameValue, setNameValue] = useState(fullName);
  const [phoneValue, setPhoneValue] = useState(phone ?? "");
  const [stageValue, setStageValue] = useState(stage);
  const [tagsValue, setTagsValue] = useState(tags.join(", "));
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function save(patch: Record<string, unknown>) {
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch("/api/professional/crm/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(linkId.startsWith("c-") ? { clientId: linkId.slice(2) } : { contactId: linkId.slice(2) }),
          ...patch,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Não foi possível salvar agora.");
      setStatus("idle");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar agora.");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-paper-alt/40 p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">
            Nome
          </label>
          {editableName ? (
            <input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={() => nameValue.trim() !== fullName && save({ fullName: nameValue.trim() })}
              className={`${fieldClass} w-full`}
            />
          ) : (
            <p className="py-1.5 text-sm text-ink">{fullName}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">
            Telefone
          </label>
          <input
            value={phoneValue}
            onChange={(e) => setPhoneValue(e.target.value)}
            onBlur={() => phoneValue.trim() !== (phone ?? "") && save({ phone: phoneValue.trim() || null })}
            placeholder="Sem telefone"
            className={`${fieldClass} w-full`}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">
            Estágio
          </label>
          <select
            value={stageValue}
            onChange={(e) => {
              const next = e.target.value as CrmStage;
              setStageValue(next);
              save({ stage: next });
            }}
            className={`${fieldClass} w-full`}
          >
            {CRM_STAGES.map((s) => (
              <option key={s} value={s}>
                {CRM_STAGE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">
            Tags (separadas por vírgula)
          </label>
          <input
            value={tagsValue}
            onChange={(e) => setTagsValue(e.target.value)}
            onBlur={() =>
              save({
                tags: tagsValue
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            placeholder="ex: prioridade, indicação"
            className={`${fieldClass} w-full`}
          />
        </div>
      </div>
      {status === "saving" && <p className="mt-2 text-xs text-ink-soft">Salvando…</p>}
      {status === "error" && (
        <p role="alert" className="mt-2 text-xs text-accent-dark">
          {message}
        </p>
      )}
    </div>
  );
}
