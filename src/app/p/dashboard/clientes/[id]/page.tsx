import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getProfessionalFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import {
  getContactDetail,
  parseContactLinkId,
  CRM_STAGE_LABELS,
} from "@/lib/professional-crm";
import { ENGAGEMENT_STATUS_LABELS } from "@/lib/client-engagement";
import { ContactDetailHeader } from "@/components/professional/ContactDetailHeader";
import { ContactNotes } from "@/components/professional/ContactNotes";
import { ContactTasks } from "@/components/professional/ContactTasks";
import { DeleteLeadButton } from "@/components/professional/DeleteLeadButton";
import { TestListItem } from "@/components/professional/TestListItem";
import { ExerciseListItem } from "@/components/professional/ExerciseListItem";
import { ASSESSMENT_TEMPLATES } from "@/lib/assessments";
import { EXERCISES } from "@/lib/exercises";

export const metadata: Metadata = {
  title: "Contato — Vero",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

const CHANNEL_LABELS: Record<string, string> = { email: "Email", whatsapp: "WhatsApp" };

function EmptyShell({ message }: { message: string }) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <p className="font-medium text-ink">{message}</p>
          <Link href="/p/dashboard" className="mt-3 inline-block text-sm text-primary hover:underline">
            Voltar pro painel
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accessToken = await readAccessToken("professional");
  const professional = await getProfessionalFromAccessToken(accessToken);

  if (!professional) {
    return <EmptyShell message="Sessão inválida. Faça login novamente em /p/entrar." />;
  }

  const parsed = parseContactLinkId(id);
  if (!parsed) {
    return <EmptyShell message="Contato não encontrado." />;
  }

  const detail = await getContactDetail(professional.id, parsed);
  if (!detail) {
    return <EmptyShell message="Contato não encontrado." />;
  }

  const linkId = detail.clientId ? `c-${detail.clientId}` : `l-${detail.id}`;

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <Link href="/p/dashboard" className="text-sm text-primary hover:underline">
            ← Voltar pro painel
          </Link>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-ink">{detail.fullName}</h1>
              <p className="mt-1 text-sm text-ink-soft">{detail.email}</p>
            </div>
            {detail.isLead && detail.id && (
              <DeleteLeadButton contactId={detail.id} />
            )}
          </div>

          {!detail.isLead && (
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-ink-soft">
              <span>
                {detail.sessionCount} sessõe{detail.sessionCount === 1 ? "" : "s"} · LTV{" "}
                {formatPrice(detail.totalPaidCents)}
              </span>
              {detail.engagementStatus && (
                <span>Engajamento: {ENGAGEMENT_STATUS_LABELS[detail.engagementStatus]}</span>
              )}
              {detail.lastSessionAt && (
                <span>Última sessão: {dateFormatter.format(new Date(detail.lastSessionAt))}</span>
              )}
            </div>
          )}

          <div className="mt-6">
            <ContactDetailHeader
              linkId={linkId}
              fullName={detail.fullName}
              phone={detail.phone}
              stage={detail.stage}
              tags={detail.tags}
              editableName={detail.isLead}
            />
          </div>

          <div className="mt-8 space-y-8">
            <ContactTasks linkId={linkId} tasks={detail.tasks} />
            <ContactNotes linkId={linkId} notes={detail.notes} />

            {detail.client && (
              <>
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                    Testes
                  </h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Envie só os que fizerem sentido pra esse cliente agora — nada aparece
                    pra ele até você clicar em &quot;Enviar&quot;.
                  </p>
                  <div className="mt-3 space-y-2">
                    {ASSESSMENT_TEMPLATES.map((template) => (
                      <TestListItem
                        key={template.slug}
                        clientId={detail.client!.id}
                        template={template}
                        initialReleased={detail.client!.releasedAssessmentSlugs.includes(
                          template.slug
                        )}
                        latest={detail.client!.latestAssessments.find(
                          (a) => a.templateSlug === template.slug
                        )}
                      />
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                    Exercícios
                  </h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Mesma lógica: só quem você enviar fica disponível pro cliente responder.
                  </p>
                  <div className="mt-3 space-y-2">
                    {EXERCISES.map((exercise) => (
                      <ExerciseListItem
                        key={exercise.slug}
                        clientId={detail.client!.id}
                        exercise={exercise}
                        initialReleased={detail.client!.releasedExerciseSlugs.includes(
                          exercise.slug
                        )}
                        latest={detail.client!.latestExercises.find(
                          (e) => e.templateSlug === exercise.slug
                        )}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                Mensagens enviadas
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Campanhas de marketing (aba Marketing) enviadas pra esse cliente.
              </p>
              <div className="mt-3 space-y-2">
                {detail.messages.length === 0 ? (
                  <p className="text-sm text-ink-soft">Nenhuma mensagem enviada ainda.</p>
                ) : (
                  detail.messages.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-paper-alt/40 px-3 py-2 text-sm"
                    >
                      <span className="text-ink">
                        {CHANNEL_LABELS[m.channel]} · {m.templateId}
                      </span>
                      <span className="text-xs text-ink-soft">
                        {dateFormatter.format(new Date(m.sentAt))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <p className="mt-8 text-xs text-ink-soft">
            Estágio atual: {CRM_STAGE_LABELS[detail.stage]}
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
