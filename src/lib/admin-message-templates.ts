import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isCampaignTemplateId, type CampaignTemplateId } from "@/lib/marketing-campaign-templates";
import type { CampaignTemplateContent } from "@/lib/professional-campaign-templates";

export type CampaignTemplateOverrides = Partial<Record<CampaignTemplateId, CampaignTemplateContent>>;

function isValidContent(value: unknown): value is CampaignTemplateContent {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.emailSubject === "string" &&
    typeof v.emailBodyText === "string" &&
    typeof v.whatsapp === "string"
  );
}

function parseOverrides(raw: unknown): CampaignTemplateOverrides {
  if (typeof raw !== "object" || raw === null) return {};
  const result: CampaignTemplateOverrides = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (isCampaignTemplateId(key) && isValidContent(value)) {
      result[key] = value;
    }
  }
  return result;
}

/** {} quando o Supabase ainda não está configurado, ou não há edições salvas. */
export async function getAdminTemplateOverrides(): Promise<CampaignTemplateOverrides> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("admin_message_templates")
    .select("templates")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("[admin-message-templates] Failed to load:", error.message);
    return {};
  }

  return parseOverrides(data?.templates);
}

export async function saveAdminTemplateOverride(
  templateId: CampaignTemplateId,
  content: CampaignTemplateContent
): Promise<{ ok: true } | { ok: false }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false };

  const existing = await getAdminTemplateOverrides();
  const next = { ...existing, [templateId]: content };

  const { error } = await supabase
    .from("admin_message_templates")
    .upsert({ id: 1, templates: next, updated_at: new Date().toISOString() });

  if (error) {
    console.error("[admin-message-templates] Failed to save:", error.message);
    return { ok: false };
  }
  return { ok: true };
}

export async function resetAdminTemplateOverride(
  templateId: CampaignTemplateId
): Promise<{ ok: true } | { ok: false }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false };

  const existing = await getAdminTemplateOverrides();
  const next = { ...existing };
  delete next[templateId];

  const { error } = await supabase
    .from("admin_message_templates")
    .upsert({ id: 1, templates: next, updated_at: new Date().toISOString() });

  if (error) {
    console.error("[admin-message-templates] Failed to reset:", error.message);
    return { ok: false };
  }
  return { ok: true };
}
