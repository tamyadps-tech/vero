import { getSubscriptionPlan, type SubscriptionPlanId } from "@/lib/subscription-plans";
import { SubscriptionCheckoutButton } from "@/components/professional/SubscriptionCheckoutButton";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PlanLockedPanel({
  requiredPlan,
  featureName,
}: {
  requiredPlan: SubscriptionPlanId;
  featureName: string;
}) {
  const plan = getSubscriptionPlan(requiredPlan);

  return (
    <div className="rounded-2xl border border-dashed border-border bg-paper-alt/40 p-8 text-center">
      <p className="font-medium text-ink">
        {featureName} é uma funcionalidade do plano {plan.name}.
      </p>
      <p className="mt-1 text-sm text-ink-soft">
        Assine o {plan.name} por {formatPrice(plan.priceCents)}/mês pra desbloquear, ou veja
        todos os planos na aba Assinatura.
      </p>
      <div className="mt-4 flex justify-center">
        <SubscriptionCheckoutButton
          plan={requiredPlan}
          label={`Assinar o ${plan.name}`}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-primary-dark disabled:opacity-60"
        />
      </div>
    </div>
  );
}
