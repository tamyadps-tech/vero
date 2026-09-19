import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getProfessionalIdFromAccessToken } from "@/lib/professional-session";
import { readAccessToken } from "@/lib/read-session-token";
import { isProfessionalCampaignTemplateId } from "@/lib/professional-campaign-templates";
import {
  saveProfessionalTemplateOverride,
  resetProfessionalTemplateOverride,
} from "@/lib/professional-message-templates";

const MAX_SUBJECT_LENGTH = 200;
const MAX_TEXT_LENGTH = 4000;

async function requireProfessionalId(): Promise<string | null> {
  const accessToken = await readAccessToken("professional");
  return getProfessionalIdFromAccessToken(accessToken);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params;
  if (!isProfessionalCampaignTemplateId(templateId)) {
    return NextResponse.json({ error: "Modelo de campanha inválido." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { emailSubject, emailBodyText, whatsapp } = (body ?? {}) as {
    emailSubject?: unknown;
    emailBodyText?: unknown;
    whatsapp?: unknown;
  };

  const trimmedSubject = typeof emailSubject === "string" ? emailSubject.trim() : "";
  const trimmedBody = typeof emailBodyText === "string" ? emailBodyText.trim() : "";
  const trimmedWhatsapp = typeof whatsapp === "string" ? whatsapp.trim() : "";

  if (!trimmedSubject || trimmedSubject.length > MAX_SUBJECT_LENGTH) {
    return NextResponse.json({ error: "Informe um assunto válido." }, { status: 400 });
  }
  if (!trimmedBody || trimmedBody.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: "Informe o texto do email." }, { status: 400 });
  }
  if (!trimmedWhatsapp || trimmedWhatsapp.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: "Informe o texto do WhatsApp." }, { status: 400 });
  }

  if (!getSupabaseAdmin()) {
    return NextResponse.json({ error: "Supabase ainda não está configurado." }, { status: 503 });
  }

  const professionalId = await requireProfessionalId();
  if (!professionalId) {
    return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
  }

  const result = await saveProfessionalTemplateOverride(professionalId, templateId, {
    emailSubject: trimmedSubject,
    emailBodyText: trimmedBody,
    whatsapp: trimmedWhatsapp,
  });

  if (!result.ok) {
    return NextResponse.json({ error: "Não foi possível salvar agora." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params;
  if (!isProfessionalCampaignTemplateId(templateId)) {
    return NextResponse.json({ error: "Modelo de campanha inválido." }, { status: 400 });
  }

  if (!getSupabaseAdmin()) {
    return NextResponse.json({ error: "Supabase ainda não está configurado." }, { status: 503 });
  }

  const professionalId = await requireProfessionalId();
  if (!professionalId) {
    return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
  }

  const result = await resetProfessionalTemplateOverride(professionalId, templateId);
  if (!result.ok) {
    return NextResponse.json({ error: "Não foi possível restaurar agora." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
