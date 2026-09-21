import { AdminNav } from "@/components/admin/AdminNav";
import { AdminProfessionalAccountsTable } from "@/components/admin/AdminProfessionalAccountsTable";
import { AdminClientDirectory } from "@/components/admin/AdminClientDirectory";
import { listAdminProfessionalAccounts } from "@/lib/admin-professional-crm";
import { listAllClientsDirectory } from "@/lib/admin-clients";

export const dynamic = "force-dynamic";

export default async function AdminCrmPage() {
  const [accounts, clients] = await Promise.all([
    listAdminProfessionalAccounts(),
    listAllClientsDirectory(),
  ]);

  return (
    <>
      <AdminNav active="/admin/crm" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">CRM</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Profissionais como conta da Vero (notas, tags, segmentação) e um diretório
          read-only de todos os clientes da plataforma, pra suporte.
        </p>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Profissionais
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Clique num profissional pra ver/adicionar notas e editar tags.
          </p>
          <div className="mt-4">
            {accounts === null ? (
              <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
            ) : (
              <AdminProfessionalAccountsTable accounts={accounts} />
            )}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Todos os clientes da plataforma
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Read-only — cada cliente pertence a um ou mais profissionais; notas e tags de
            cliente ficam no CRM do profissional dono da relação, não aqui.
          </p>
          <div className="mt-4">
            {clients === null ? (
              <p className="text-sm text-ink-soft">Supabase ainda não está configurado.</p>
            ) : (
              <AdminClientDirectory rows={clients} />
            )}
          </div>
        </section>
      </main>
    </>
  );
}
