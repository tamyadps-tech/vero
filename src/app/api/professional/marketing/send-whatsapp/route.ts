import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import {
  getProfessionalCampaignTemplateMeta,
  DEFAULT_PROFESSIONAL_TEMPLATE_CONTENT,
  renderProfessionalTemplate,
} from "@/lib/professional-campaign-templates";
import { getProfessionalTemplateOverrides } from "@/lib/professional-message-templates";
import { sendBulkWhatsAppMessages } from "@/lib/marketing-integrations";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { templateId, clientIds, manualPhones } = (body ?? {}) as {
    templateId?: unknown;
    clientIds?: unknown;
    manualPhones?: unknown;
  };

  const templateMeta =
    typeof templateId === "string" ? getProfessionalCampaignTemplateMeta(templateId) : undefined;
  if (!templateMeta) {
    return NextResponse.json({ error: "Modelo de campanha inválido." }, { status: 400 });
  }

  const cleanedClientIds = Array.isArray(clientIds)
    ? clientIds.filter((id): id is string => typeof id === "string")
    : [];
  const cleanedManualPhones = Array.isArray(manualPhones)
    ? manualPhones
        .filter((phone): phone is string => typeof phone === "string" && phone.trim().length > 0)
        .map((phone) => phone.trim())
    : [];

  if (cleanedClientIds.length === 0 && cleanedManualPhones.length === 0) {
    return NextResponse.json(
      { error: "Selecione ao menos um cliente ou informe um número." },
      { status: 400 }
    );
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

  const recipientPhones = new Set<string>(cleanedManualPhones);

  if (cleanedClientIds.length > 0) {
    // Nunca confia no telefone vindo do corpo pra clientes selecionados —
    // busca o telefone de verdade, só de quem já teve sessão com esse
    // profissional (mesma checagem do envio de email).
    const { data: ownedSessions, error: ownedError } = await supabase
      .from("sessions")
      .select("client:clients(id, phone_number)")
      .eq("professional_id", professionalId)
      .in("client_id", cleanedClientIds);

    if (ownedError) {
      console.error("[professional/marketing] failed to verify clients:", ownedError.message);
      return NextResponse.json({ error: "Não foi possível enviar agora." }, { status: 500 });
    }

    for (const row of (ownedSessions ?? []) as unknown as Array<{
      client: { id: string; phone_number: string | null } | null;
    }>) {
      if (row.client?.phone_number) recipientPhones.add(row.client.phone_number);
    }
  }

  if (recipientPhones.size === 0) {
    return NextResponse.json(
      { error: "Nenhum dos clientes selecionados tem telefone cadastrado, e nenhum número manual foi informado." },
      { status: 400 }
    );
  }

  const origin = new URL(request.url).origin;
  const profileUrl = `${origin}/profissionais/${professionalId}`;
  const overrides = await getProfessionalTemplateOverrides(professionalId);
  const content = overrides[templateMeta.id] ?? DEFAULT_PROFESSIONAL_TEMPLATE_CONTENT[templateMeta.id];
  const { whatsapp } = renderProfessionalTemplate(templateMeta, content, profileUrl);

  const result = await sendBulkWhatsAppMessages(Array.from(recipientPhones), whatsapp);

  return NextResponse.json({ ok: true, recipientCount: recipientPhones.size, ...result });
}
