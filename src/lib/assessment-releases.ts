import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isAssessmentTemplateSlug } from "@/lib/assessments";

/**
 * Slugs de teste liberados pro cliente, por qualquer profissional que já
 * tenha liberado. Usado no painel do cliente pra decidir o que ele pode
 * fazer agora.
 */
export async function listReleasedTemplateSlugsForClient(
  clientId: string
): Promise<Set<string>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return new Set();

  const { data, error } = await supabase
    .from("assessment_releases")
    .select("template_slug")
    .eq("client_id", clientId);

  if (error) {
    console.error("[assessment-releases] Failed to list releases:", error.message);
    return new Set();
  }

  return new Set((data ?? []).map((row) => row.template_slug as string));
}

export async function isAssessmentReleasedForClient(
  clientId: string,
  templateSlug: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("assessment_releases")
    .select("id")
    .eq("client_id", clientId)
    .eq("template_slug", templateSlug)
    .limit(1);

  if (error) {
    console.error("[assessment-releases] Failed to check release:", error.message);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

/**
 * Slugs que ESTE profissional liberou pra cada cliente — pra refletir o
 * estado do toggle no CRM dele (não mistura com liberações de outro
 * profissional do mesmo cliente).
 */
export async function fetchReleasedSlugsByClient(
  professionalId: string,
  clientIds: string[]
): Promise<Map<string, Set<string>>> {
  const byClient = new Map<string, Set<string>>();
  const supabase = getSupabaseAdmin();
  if (!supabase || clientIds.length === 0) return byClient;

  const { data, error } = await supabase
    .from("assessment_releases")
    .select("client_id, template_slug")
    .eq("professional_id", professionalId)
    .in("client_id", clientIds);

  if (error) {
    console.error("[assessment-releases] Failed to load releases:", error.message);
    return byClient;
  }

  for (const row of data ?? []) {
    const set = byClient.get(row.client_id) ?? new Set<string>();
    set.add(row.template_slug);
    byClient.set(row.client_id, set);
  }

  return byClient;
}

/** Confere se o profissional já teve ao menos uma sessão com o cliente — evita liberar teste pra um cliente que não é dele. */
export async function professionalHasClient(
  professionalId: string,
  clientId: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("sessions")
    .select("id")
    .eq("professional_id", professionalId)
    .eq("client_id", clientId)
    .limit(1);

  if (error) {
    console.error("[assessment-releases] Failed to check ownership:", error.message);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

export async function setAssessmentRelease(
  professionalId: string,
  clientId: string,
  templateSlug: string,
  released: boolean
): Promise<{ error?: string }> {
  if (!isAssessmentTemplateSlug(templateSlug)) {
    return { error: "Teste inválido." };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "Supabase ainda não está configurado." };

  const hasClient = await professionalHasClient(professionalId, clientId);
  if (!hasClient) return { error: "Cliente não encontrado." };

  if (released) {
    const { error } = await supabase.from("assessment_releases").upsert(
      { professional_id: professionalId, client_id: clientId, template_slug: templateSlug },
      { onConflict: "professional_id,client_id,template_slug", ignoreDuplicates: true }
    );
    if (error) {
      console.error("[assessment-releases] Failed to release:", error.message);
      return { error: "Não foi possível liberar agora." };
    }
  } else {
    const { error } = await supabase
      .from("assessment_releases")
      .delete()
      .match({ professional_id: professionalId, client_id: clientId, template_slug: templateSlug });
    if (error) {
      console.error("[assessment-releases] Failed to revoke:", error.message);
      return { error: "Não foi possível revogar agora." };
    }
  }

  return {};
}
