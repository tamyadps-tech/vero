import type { Metadata } from "next";
import { headers } from "next/headers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { RatingBadge } from "@/components/RatingBadge";
import { getProfessionalFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { listAvailabilitySlots } from "@/lib/booking";
import { listSessionsForProfessional } from "@/lib/admin-sessions";
import { listProfessionalClients } from "@/lib/professional-clients";
import { listProfessionalContacts } from "@/lib/professional-crm";
import { getProfessionalFinance } from "@/lib/professional-finance";
import { listProfessionalExpenses } from "@/lib/professional-expenses";
import { getProfessionalTemplateOverrides } from "@/lib/professional-message-templates";
import { getReviewSummaries } from "@/lib/reviews";
import { CATEGORY_LABELS } from "@/lib/professional-categories";
import { SESSION_FORMAT_LABELS } from "@/lib/session-format";
import { hasPlanAccess } from "@/lib/subscription-plans";
import { ProfessionalProfileSection } from "@/components/professional/ProfessionalProfileSection";
import { DashboardTabs } from "@/components/professional/DashboardTabs";
import { PlanLockedPanel } from "@/components/professional/PlanLockedPanel";
import { DashboardTabPanel } from "@/components/professional/tabs/DashboardTabPanel";
import { MarketingTabPanel } from "@/components/professional/tabs/MarketingTabPanel";
import { FinanceiroTabPanel } from "@/components/professional/tabs/FinanceiroTabPanel";
import { SubscriptionTabPanel } from "@/components/professional/tabs/SubscriptionTabPanel";
import { AgendaTabPanel } from "@/components/professional/tabs/AgendaTabPanel";
import { CrmTabPanel } from "@/components/professional/tabs/CrmTabPanel";
import { TestesTabPanel } from "@/components/professional/tabs/TestesTabPanel";
import { ExerciciosTabPanel } from "@/components/professional/tabs/ExerciciosTabPanel";
import { MetodoTabPanel } from "@/components/professional/tabs/MetodoTabPanel";

export const metadata: Metadata = {
  title: "Meu painel — Vero",
  robots: { index: false, follow: false },
};

// Sem cache estático: cada visita precisa dos dados mais recentes do
// próprio profissional (agenda, sessões, financeiro).
export const dynamic = "force-dynamic";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function EmptyShell({ message, detail }: { message: string; detail?: string }) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <p className="font-medium text-ink">{message}</p>
          {detail && <p className="mt-1 text-sm text-ink-soft">{detail}</p>}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default async function ProfessionalDashboardPage() {
  const accessToken = await readAccessToken("professional");
  const professional = await getProfessionalFromAccessToken(accessToken);

  if (!professional) {
    return (
      <EmptyShell
        message="Sessão inválida."
        detail="Faça login novamente em /p/entrar."
      />
    );
  }

  if (professional.vetting_status === "pendente") {
    return (
      <EmptyShell
        message={`Olá, ${professional.full_name.split(" ")[0]}!`}
        detail="Sua candidatura ainda está em análise. Você recebe um email assim que aprovarmos seu perfil."
      />
    );
  }

  if (professional.vetting_status === "rejeitado") {
    return (
      <EmptyShell
        message={`Olá, ${professional.full_name.split(" ")[0]}.`}
        detail={
          professional.vetting_notes
            ? `Sua candidatura não foi aprovada nesta etapa. Observação da equipe: ${professional.vetting_notes}`
            : "Sua candidatura não foi aprovada nesta etapa. Dúvidas? Escreva pra suporte@vero.app."
        }
      />
    );
  }

  const [slots, sessions, clients, contacts, finance, expenses, templateOverrides, reviewSummaries, headersList] =
    await Promise.all([
      listAvailabilitySlots(professional.id),
      listSessionsForProfessional(professional.id),
      listProfessionalClients(professional.id),
      listProfessionalContacts(professional.id),
      getProfessionalFinance(professional.id),
      listProfessionalExpenses(professional.id),
      getProfessionalTemplateOverrides(professional.id),
      getReviewSummaries([professional.id]),
      headers(),
    ]);

  const origin = `${headersList.get("x-forwarded-proto") ?? "https"}://${headersList.get("host") ?? "vero.app"}`;
  const publicProfileUrl = `${origin}/profissionais/${professional.id}`;
  const rating = reviewSummaries?.[professional.id] ?? { average: 0, count: 0 };

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-paper-alt px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
              Meu painel
            </span>
            <LogoutButton role="professional" redirectTo="/p/entrar" />
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
            Olá, {professional.full_name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {CATEGORY_LABELS[professional.category]} · {SESSION_FORMAT_LABELS[professional.session_format]} ·{" "}
            {formatPrice(professional.price_cents)}/sessão · <RatingBadge average={rating.average} count={rating.count} />
          </p>

          {/* Meu perfil */}
          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Meu perfil
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Como você aparece pra quem te encontra na busca. Mantenha bio,
              foto e redes sociais atualizadas.
            </p>
            <div className="mt-4">
              <ProfessionalProfileSection professional={professional} />
            </div>
          </section>

          <DashboardTabs
            dashboard={
              <DashboardTabPanel
                finance={finance}
                clients={clients}
                sessions={sessions}
                expenses={expenses}
              />
            }
            marketing={
              hasPlanAccess(professional.subscription_plan, professional.subscription_status, "pro") ? (
                <MarketingTabPanel
                  publicProfileUrl={publicProfileUrl}
                  clients={clients}
                  templateOverrides={templateOverrides}
                />
              ) : (
                <PlanLockedPanel requiredPlan="pro" featureName="Marketing" />
              )
            }
            financeiro={
              hasPlanAccess(professional.subscription_plan, professional.subscription_status, "premium") ? (
                <FinanceiroTabPanel
                  finance={finance}
                  expenses={expenses}
                  pricePerSessionCents={professional.price_cents}
                  monthlyRevenueGoalCents={professional.monthly_revenue_goal_cents}
                />
              ) : (
                <PlanLockedPanel requiredPlan="premium" featureName="Financeiro" />
              )
            }
            assinatura={
              <SubscriptionTabPanel
                currentPlan={professional.subscription_plan}
                currentStatus={professional.subscription_status}
                currentPeriodEnd={professional.subscription_current_period_end}
              />
            }
            agenda={
              <AgendaTabPanel
                professionalId={professional.id}
                slots={slots}
                sessions={sessions}
                googleCalendarEmail={professional.google_calendar_email}
              />
            }
            crm={<CrmTabPanel contacts={contacts} />}
            testes={<TestesTabPanel clients={clients} />}
            exercicios={<ExerciciosTabPanel clients={clients} />}
            metodo={<MetodoTabPanel />}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
