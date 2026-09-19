import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { getProfessionalCampaignTemplate } from "@/lib/professional-campaign-templates";
import { sendBulkMarketingEmail } from "@/lib/marketing-integrations";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { templateId, clientIds } = (body ?? {}) as {
    templateId?: unknown;
    clientIds?: unknown;
  };

  const template = typeof templateId === "string" ? getProfessionalCampaignTemplate(templateId) : undefined;
  if (!template) {
    return NextResponse.json({ error: "Modelo de campanha inválido." }, { status: 400 });
  }

  if (
    !Array.isArray(clientIds) ||
    clientIds.length === 0 ||
    clientIds.some((id) => typeof id !== "string")
  ) {
    return NextResponse.json({ error: "Selecione pelo menos um cliente." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase ainda não está configurado." }, { status: 503 });
  }

  const accessToken = await readAccessToken("professional");
  const professionalId = await getProfessionalIdFromAccessToken(accessToken);
  if (!professionalId) {
    return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
  }

  const { data: professional } = await supabase
    .from("professionals")
    .select("full_name")
    .eq("id", professionalId)
    .single();

  // Nunca confia em email vindo do corpo — só manda pra quem de fato já
  // teve sessão com esse profissional (mesma checagem de
  // /api/professional/messages/send).
  const { data: ownedSessions, error: ownedError } = await supabase
    .from("sessions")
    .select("client:clients(id, email)")
    .eq("professional_id", professionalId)
    .in("client_id", clientIds);

  if (ownedError) {
    console.error("[professional/marketing] failed to verify clients:", ownedError.message);
    return NextResponse.json({ error: "Não foi possível enviar agora." }, { status: 500 });
  }

  const recipientEmails = new Set<string>();
  for (const row of (ownedSessions ?? []) as unknown as Array<{
    client: { id: string; email: string } | null;
  }>) {
    if (row.client) recipientEmails.add(row.client.email);
  }

  if (recipientEmails.size === 0) {
    return NextResponse.json(
      { error: "Nenhum dos clientes selecionados pertence a você." },
      { status: 403 }
    );
  }

  const origin = new URL(request.url).origin;
  const profileUrl = `${origin}/profissionais/${professionalId}`;
  const professionalName = professional?.full_name ?? "Seu profissional na Vero";
  const { subject, html } = template.email(professionalName, profileUrl);

  const result = await sendBulkMarketingEmail(Array.from(recipientEmails), { subject, html });

  return NextResponse.json({ ok: true, recipientCount: recipientEmails.size, ...result });
}
