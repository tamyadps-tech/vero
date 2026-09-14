import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdByToken } from "@/lib/professional-auth";
import { sendEmail } from "@/lib/email";
import { professionalMessageEmail } from "@/lib/email-templates";

const MAX_RECIPIENTS = 50;
const MAX_SUBJECT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { token, clientIds, subject, message } = (body ?? {}) as {
    token?: unknown;
    clientIds?: unknown;
    subject?: unknown;
    message?: unknown;
  };

  if (
    !Array.isArray(clientIds) ||
    clientIds.length === 0 ||
    clientIds.some((id) => typeof id !== "string")
  ) {
    return NextResponse.json(
      { error: "Selecione pelo menos um cliente." },
      { status: 400 }
    );
  }
  if (clientIds.length > MAX_RECIPIENTS) {
    return NextResponse.json(
      { error: `No máximo ${MAX_RECIPIENTS} clientes por envio.` },
      { status: 400 }
    );
  }
  if (typeof subject !== "string" || !subject.trim() || subject.length > MAX_SUBJECT_LENGTH) {
    return NextResponse.json({ error: "Assunto inválido." }, { status: 400 });
  }
  if (typeof message !== "string" || !message.trim() || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Mensagem inválida." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase ainda não está configurado." },
      { status: 503 }
    );
  }

  const professionalId = await getProfessionalIdByToken(supabase, token);
  if (!professionalId) {
    return NextResponse.json({ error: "Link inválido." }, { status: 404 });
  }

  const { data: professional } = await supabase
    .from("professionals")
    .select("full_name")
    .eq("id", professionalId)
    .single();

  // Só manda pra clientes que de fato já tiveram sessão com esse
  // profissional — nunca confia nos clientIds vindos do corpo sozinhos.
  const { data: ownedSessions, error: ownedError } = await supabase
    .from("sessions")
    .select("client:clients(id, full_name, email)")
    .eq("professional_id", professionalId)
    .in("client_id", clientIds);

  if (ownedError) {
    console.error("[professional/messages] failed to verify clients:", ownedError.message);
    return NextResponse.json({ error: "Não foi possível enviar agora." }, { status: 500 });
  }

  const recipients = new Map<string, { full_name: string; email: string }>();
  for (const row of (ownedSessions ?? []) as unknown as Array<{
    client: { id: string; full_name: string; email: string } | null;
  }>) {
    if (row.client) recipients.set(row.client.id, row.client);
  }

  if (recipients.size === 0) {
    return NextResponse.json(
      { error: "Nenhum dos clientes selecionados pertence a você." },
      { status: 403 }
    );
  }

  const professionalName = professional?.full_name ?? "Seu profissional na Vero";
  let sent = 0;
  for (const client of recipients.values()) {
    const { subject: emailSubject, html } = professionalMessageEmail({
      clientName: client.full_name,
      professionalName,
      subject,
      message,
    });
    const result = await sendEmail({ to: client.email, subject: emailSubject, html });
    if (result.sent) sent += 1;
  }

  return NextResponse.json({ ok: true, sent, total: recipients.size });
}
