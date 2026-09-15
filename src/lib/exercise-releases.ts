import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isExerciseSlug } from "@/lib/exercises";
import { professionalHasClient } from "@/lib/assessment-releases";

/**
 * Slugs de exercício liberados pro cliente, por qualquer profissional
 * que já tenha liberado. Usado no painel do cliente pra decidir o que
 * ele pode fazer agora.
 */
export async function listReleasedExerciseSlugsForClient(
  clientId: string
): Promise<Set<string>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return new Set();

  const { data, error } = await supabase
    .from("exercise_releases")
    .select("template_slug")
    .eq("client_id", clientId);

  if (error) {
    console.error("[exercise-releases] Failed to list releases:", error.message);
    return new Set();
  }

  return new Set((data ?? []).map((row) => row.template_slug as string));
}

export async function isExerciseReleasedForClient(
  clientId: string,
  templateSlug: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("exercise_releases")
    .select("id")
    .eq("client_id", clientId)
    .eq("template_slug", templateSlug)
    .limit(1);

  if (error) {
    console.error("[exercise-releases] Failed to check release:", error.message);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

/**
 * Slugs que ESTE profissional liberou pra cada cliente — pra refletir
 * o estado do toggle no painel dele.
 */
export async function fetchReleasedExerciseSlugsByClient(
  professionalId: string,
  clientIds: string[]
): Promise<Map<string, Set<string>>> {
  const byClient = new Map<string, Set<string>>();
  const supabase = getSupabaseAdmin();
  if (!supabase || clientIds.length === 0) return byClient;

  const { data, error } = await supabase
    .from("exercise_releases")
    .select("client_id, template_slug")
    .eq("professional_id", professionalId)
    .in("client_id", clientIds);

  if (error) {
    console.error("[exercise-releases] Failed to load releases:", error.message);
    return byClient;
  }

  for (const row of data ?? []) {
    const set = byClient.get(row.client_id) ?? new Set<string>();
    set.add(row.template_slug);
    byClient.set(row.client_id, set);
  }

  return byClient;
}

export async function setExerciseRelease(
  professionalId: string,
  clientId: string,
  templateSlug: string,
  released: boolean
): Promise<{ error?: string }> {
  if (!isExerciseSlug(templateSlug)) {
    return { error: "Exercício inválido." };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "Supabase ainda não está configurado." };

  const hasClient = await professionalHasClient(professionalId, clientId);
  if (!hasClient) return { error: "Cliente não encontrado." };

  if (released) {
    const { error } = await supabase.from("exercise_releases").upsert(
      { professional_id: professionalId, client_id: clientId, template_slug: templateSlug },
      { onConflict: "professional_id,client_id,template_slug", ignoreDuplicates: true }
    );
    if (error) {
      console.error("[exercise-releases] Failed to release:", error.message);
      return { error: "Não foi possível liberar agora." };
    }
  } else {
    const { error } = await supabase
      .from("exercise_releases")
      .delete()
      .match({ professional_id: professionalId, client_id: clientId, template_slug: templateSlug });
    if (error) {
      console.error("[exercise-releases] Failed to revoke:", error.message);
      return { error: "Não foi possível revogar agora." };
    }
  }

  return {};
}
