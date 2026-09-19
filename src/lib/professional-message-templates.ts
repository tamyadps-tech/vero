import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  isProfessionalCampaignTemplateId,
  type ProfessionalCampaignTemplateId,
  type CampaignTemplateContent,
} from "@/lib/professional-campaign-templates";

export type ProfessionalTemplateOverrides = Partial<
  Record<ProfessionalCampaignTemplateId, CampaignTemplateContent>
>;

function isValidContent(value: unknown): value is CampaignTemplateContent {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.emailSubject === "string" &&
    typeof v.emailBodyText === "string" &&
    typeof v.whatsapp === "string"
  );
}

function parseOverrides(raw: unknown): ProfessionalTemplateOverrides {
  if (typeof raw !== "object" || raw === null) return {};
  const result: ProfessionalTemplateOverrides = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (isProfessionalCampaignTemplateId(key) && isValidContent(value)) {
      result[key] = value;
    }
  }
  return result;
}

/** {} quando o Supabase ainda não está configurado, ou não há edições salvas. */
export async function getProfessionalTemplateOverrides(
  professionalId: string
): Promise<ProfessionalTemplateOverrides> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("professional_message_templates")
    .select("templates")
    .eq("professional_id", professionalId)
    .maybeSingle();

  if (error) {
    console.error("[professional-message-templates] Failed to load:", error.message);
    return {};
  }

  return parseOverrides(data?.templates);
}

export async function saveProfessionalTemplateOverride(
  professionalId: string,
  templateId: ProfessionalCampaignTemplateId,
  content: CampaignTemplateContent
): Promise<{ ok: true } | { ok: false }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false };

  const existing = await getProfessionalTemplateOverrides(professionalId);
  const next = { ...existing, [templateId]: content };

  const { error } = await supabase.from("professional_message_templates").upsert({
    professional_id: professionalId,
    templates: next,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[professional-message-templates] Failed to save:", error.message);
    return { ok: false };
  }
  return { ok: true };
}

export async function resetProfessionalTemplateOverride(
  professionalId: string,
  templateId: ProfessionalCampaignTemplateId
): Promise<{ ok: true } | { ok: false }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false };

  const existing = await getProfessionalTemplateOverrides(professionalId);
  const next = { ...existing };
  delete next[templateId];

  const { error } = await supabase.from("professional_message_templates").upsert({
    professional_id: professionalId,
    templates: next,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[professional-message-templates] Failed to reset:", error.message);
    return { ok: false };
  }
  return { ok: true };
}
