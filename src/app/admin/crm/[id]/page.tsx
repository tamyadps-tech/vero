import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminTagsEditor } from "@/components/admin/AdminTagsEditor";
import { AdminNotesPanel } from "@/components/admin/AdminNotesPanel";
import { getAdminProfessionalAccountDetail } from "@/lib/admin-professional-crm";
import { getSubscriptionPlan } from "@/lib/subscription-plans";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const VETTING_LABELS: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  ativa: "Ativa",
  inadimplente: "Inadimplente",
  cancelada: "Cancelada",
};

export default async function AdminCrmAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isConfigured = Boolean(getSupabaseAdmin());
  const account = await getAdminProfessionalAccountDetail(id);

  return (
    <>
      <AdminNav active="/admin/crm" />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/admin/crm" className="text-sm text-primary hover:underline">
          ← Voltar pro CRM
        </Link>

        {!account ? (
          <p className="mt-6 text-sm text-ink-soft">
            {isConfigured ? "Profissional não encontrado." : "Supabase ainda não está configurado."}
          </p>
        ) : (
          <>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
              {account.fullName}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">{account.email}</p>

            <div className="mt-3 flex flex-wrap gap-3 text-sm text-ink-soft">
              <span>Vetting: {VETTING_LABELS[account.vettingStatus]}</span>
              <span>
                Plano:{" "}
                {account.subscriptionPlan
                  ? `${getSubscriptionPlan(account.subscriptionPlan).name} (${
                      SUBSCRIPTION_STATUS_LABELS[account.subscriptionStatus ?? ""] ?? "—"
                    })`
                  : "Sem plano"}
              </span>
              <Link
                href={`/admin/profissionais/${account.id}`}
                className="text-primary hover:underline"
              >
                Ver ficha de vetting →
              </Link>
            </div>

            <div className="mt-6">
              <AdminTagsEditor professionalId={account.id} tags={account.tags} />
            </div>

            <div className="mt-8">
              <AdminNotesPanel professionalId={account.id} notes={account.notes} />
            </div>
          </>
        )}
      </main>
    </>
  );
}
