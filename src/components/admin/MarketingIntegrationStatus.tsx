import type { MarketingIntegrationStatus } from "@/lib/marketing-integrations";

export function MarketingIntegrationStatusCard({
  status,
  envVarsHint,
}: {
  status: MarketingIntegrationStatus;
  envVarsHint: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${
        status.configured
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-dashed border-border bg-paper-alt/40 text-ink-soft"
      }`}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${status.configured ? "bg-emerald-500" : "bg-ink-soft/40"}`}
      />
      {status.configured ? (
        <span>
          Conectado via {status.provider} — a mesma integração que a Vero já usa em outras
          partes do app. Pronto pra disparar campanha de verdade.
        </span>
      ) : (
        <span>
          Ainda não conectado. Defina <code>{envVarsHint}</code> pra ligar o envio real (é a
          mesma chave de {status.provider} usada no resto da Vero — sem isso, a campanha só
          mostra o resultado como &quot;não enviado&quot;).
        </span>
      )}
    </div>
  );
}
