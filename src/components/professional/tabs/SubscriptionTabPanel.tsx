import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
  type SubscriptionStatus,
} from "@/lib/subscription-plans";
import { SubscriptionCheckoutButton } from "@/components/professional/SubscriptionCheckoutButton";
import { SubscriptionPortalButton } from "@/components/professional/SubscriptionPortalButton";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ativa: "Ativa",
  inadimplente: "Pagamento pendente",
  cancelada: "Cancelada",
};

export function SubscriptionTabPanel({
  currentPlan,
  currentStatus,
  currentPeriodEnd,
}: {
  currentPlan: SubscriptionPlanId | null;
  currentStatus: SubscriptionStatus | null;
  currentPeriodEnd: string | null;
}) {
  const hasActive = Boolean(currentPlan) && currentStatus === "ativa";

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-paper-alt/40 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Seu plano</p>
        {currentPlan && currentStatus ? (
          <>
            <p className="mt-2 text-xl font-semibold tracking-tight text-ink">
              {SUBSCRIPTION_PLANS.find((p) => p.id === currentPlan)?.name}
              <span className="ml-2 align-middle text-xs font-medium text-ink-soft">
                ({STATUS_LABELS[currentStatus]})
              </span>
            </p>
            {currentPeriodEnd && (
              <p className="mt-1 text-sm text-ink-soft">
                {currentStatus === "cancelada" ? "Válido até" : "Próxima cobrança em"}{" "}
                {formatDate(currentPeriodEnd)}
              </p>
            )}
            <div className="mt-3">
              <SubscriptionPortalButton className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-ink transition hover:border-primary" />
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">Você ainda não assina nenhum plano.</p>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">Planos</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Assinatura mensal via Stripe. Cancele quando quiser pelo botão &quot;Gerenciar
          assinatura&quot; acima.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrent = hasActive && currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-2xl border p-5 ${
                  isCurrent ? "border-primary" : "border-border"
                }`}
              >
                <p className="font-semibold text-ink">{plan.name}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                  {formatPrice(plan.priceCents)}
                  <span className="text-sm font-normal text-ink-soft">/mês</span>
                </p>
                <p className="mt-1 text-xs text-ink-soft">{plan.tagline}</p>
                <ul className="mt-3 flex-1 space-y-1.5 text-sm text-ink-soft">
                  {plan.benefits.map((benefit) => (
                    <li key={benefit}>· {benefit}</li>
                  ))}
                </ul>
                <div className="mt-4">
                  {isCurrent ? (
                    <span className="inline-block rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary-dark">
                      Plano atual
                    </span>
                  ) : hasActive ? (
                    <p className="text-xs text-ink-soft">
                      Cancele o plano atual em &quot;Gerenciar assinatura&quot; acima pra
                      assinar este.
                    </p>
                  ) : (
                    <SubscriptionCheckoutButton
                      plan={plan.id}
                      label="Assinar"
                      className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
