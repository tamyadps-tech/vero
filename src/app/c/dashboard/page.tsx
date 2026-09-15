import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getClientFromAccessToken } from "@/lib/client-session";
import { readAccessToken } from "@/lib/read-session-token";
import { getClientProgress } from "@/lib/client-progress";
import { listReleasedTemplateSlugsForClient } from "@/lib/assessment-releases";
import { ReviewForm } from "@/components/ReviewForm";
import { AssessmentsSection } from "@/components/AssessmentsSection";
import { ClientProfileSection } from "@/components/client/ClientProfileSection";

export const metadata: Metadata = {
  title: "Seu progresso — Vero",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

const STATUS_LABELS: Record<string, string> = {
  agendada: "Agendada",
  concluida: "Concluída",
  cancelada_cliente: "Cancelada por você",
  cancelada_profissional: "Cancelada pelo profissional",
};

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { pago } = await searchParams;
  const accessToken = await readAccessToken("client");
  const client = await getClientFromAccessToken(accessToken);

  if (!client) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-2xl px-6 py-20 text-center">
            <p className="font-medium text-ink">Sessão inválida.</p>
            <p className="mt-1 text-sm text-ink-soft">
              Faça login novamente em{" "}
              <Link href="/c/entrar" className="text-primary hover:underline">
                /c/entrar
              </Link>
              .
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const [progress, releasedSlugs] = await Promise.all([
    getClientProgress(client.id),
    listReleasedTemplateSlugsForClient(client.id),
  ]);

  if (!progress) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-2xl px-6 py-20 text-center">
            <p className="font-medium text-ink">Essa área ainda não está disponível.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // eslint-disable-next-line react-hooks/purity -- Server Component: precisa do horário real do request pra separar passado/futuro.
  const now = Date.now();
  const upcoming = progress.sessions
    .filter((s) => s.status === "agendada" && new Date(s.scheduled_at).getTime() > now)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const nextSession = upcoming[0] ?? null;
  const past = progress.sessions.filter((s) => s !== nextSession);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-6 py-16">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-paper-alt px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
              Seu progresso
            </span>
            <LogoutButton role="client" redirectTo="/c/entrar" />
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
            Olá, {progress.full_name.split(" ")[0]}
          </h1>

          <div className="mt-6">
            <ClientProfileSection
              fullName={client.full_name}
              email={client.email}
              phoneNumber={client.phone_number}
            />
          </div>

          {pago === "1" && (
            <div className="mt-4 rounded-xl border border-primary/30 bg-primary-light px-4 py-3">
              <p className="text-sm font-medium text-primary-dark">
                Pagamento confirmado! Sua sessão está garantida.
              </p>
            </div>
          )}

          {nextSession && (
            <div className="mt-8 rounded-2xl border border-primary/30 bg-primary-light p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                Próxima sessão
              </p>
              <p className="mt-1 text-lg font-semibold text-ink">
                {dateFormatter.format(new Date(nextSession.scheduled_at))}
              </p>
              {nextSession.professional && (
                <p className="text-sm text-ink-soft">
                  com {nextSession.professional.full_name}
                </p>
              )}
            </div>
          )}

          <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Autoavaliações
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Cada teste só fica disponível depois que seu profissional
            libera — combina com ele se e quando fizer sentido.
          </p>
          <div className="mt-4">
            <AssessmentsSection
              responses={progress.assessmentResponses}
              releasedSlugs={Array.from(releasedSlugs)}
            />
          </div>

          <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Histórico de sessões
          </h2>

          {past.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">
              Nenhuma sessão registrada ainda.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {past.map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-border bg-paper-alt/40 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-ink">
                      {dateFormatter.format(new Date(session.scheduled_at))}
                    </p>
                    <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs text-ink-soft">
                      {STATUS_LABELS[session.status] ?? session.status}
                    </span>
                  </div>
                  {session.professional && (
                    <p className="text-sm text-ink-soft">
                      com {session.professional.full_name}
                    </p>
                  )}

                  {session.topics && session.topics.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                        Tópicos abordados
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {session.topics.map((topic) => (
                          <span
                            key={topic}
                            className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs text-primary-dark"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {session.homework && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                        Tarefa
                      </p>
                      <p className="mt-1 text-sm text-ink">{session.homework}</p>
                    </div>
                  )}

                  {session.status === "concluida" &&
                    (session.review ? (
                      <p className="mt-3 text-sm text-ink-soft">
                        Sua avaliação:{" "}
                        <span className="text-accent">
                          {"★".repeat(session.review.rating)}
                          {"☆".repeat(5 - session.review.rating)}
                        </span>
                        {session.review.comment && ` — "${session.review.comment}"`}
                      </p>
                    ) : (
                      <ReviewForm sessionId={session.id} />
                    ))}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
