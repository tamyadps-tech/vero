import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { SubscriptionPlanId, SubscriptionStatus } from "@/lib/subscription-plans";

export interface AdminProfessionalAccount {
  id: string;
  fullName: string;
  email: string;
  category: string;
  vettingStatus: "pendente" | "aprovado" | "rejeitado";
  subscriptionPlan: SubscriptionPlanId | null;
  subscriptionStatus: SubscriptionStatus | null;
  tags: string[];
  notesCount: number;
  lastNoteAt: string | null;
}

export interface AdminProfessionalNoteEntry {
  id: string;
  body: string;
  createdAt: string;
}

export interface AdminProfessionalAccountDetail extends AdminProfessionalAccount {
  notes: AdminProfessionalNoteEntry[];
}

/**
 * Profissionais como "contas" gerenciadas pelo admin — junta o que já
 * existe (vetting, plano) com notas/tags do CRM. Retorna null quando o
 * Supabase ainda não está configurado.
 */
export async function listAdminProfessionalAccounts(): Promise<AdminProfessionalAccount[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const [{ data: professionalRows, error }, { data: noteRows }] = await Promise.all([
    supabase
      .from("professionals")
      .select(
        "id, full_name, email, category, vetting_status, subscription_plan, subscription_status, crm_tags"
      )
      .order("full_name", { ascending: true }),
    supabase
      .from("admin_professional_notes")
      .select("professional_id, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (error) {
    console.error("[admin-professional-crm] Failed to list accounts:", error.message);
    return [];
  }

  const notesByProfessional = new Map<string, { count: number; lastAt: string }>();
  for (const row of (noteRows ?? []) as Array<{ professional_id: string; created_at: string }>) {
    const existing = notesByProfessional.get(row.professional_id);
    if (existing) {
      existing.count += 1;
    } else {
      notesByProfessional.set(row.professional_id, { count: 1, lastAt: row.created_at });
    }
  }

  return (professionalRows ?? []).map((row) => {
    const noteInfo = notesByProfessional.get(row.id);
    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      category: row.category,
      vettingStatus: row.vetting_status,
      subscriptionPlan: row.subscription_plan,
      subscriptionStatus: row.subscription_status,
      tags: row.crm_tags ?? [],
      notesCount: noteInfo?.count ?? 0,
      lastNoteAt: noteInfo?.lastAt ?? null,
    };
  });
}

export async function getAdminProfessionalAccountDetail(
  professionalId: string
): Promise<AdminProfessionalAccountDetail | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const [{ data: professional }, { data: notes }] = await Promise.all([
    supabase
      .from("professionals")
      .select(
        "id, full_name, email, category, vetting_status, subscription_plan, subscription_status, crm_tags"
      )
      .eq("id", professionalId)
      .maybeSingle(),
    supabase
      .from("admin_professional_notes")
      .select("id, body, created_at")
      .eq("professional_id", professionalId)
      .order("created_at", { ascending: false }),
  ]);

  if (!professional) return null;

  const noteList = (notes ?? []).map((n) => ({ id: n.id, body: n.body, createdAt: n.created_at }));

  return {
    id: professional.id,
    fullName: professional.full_name,
    email: professional.email,
    category: professional.category,
    vettingStatus: professional.vetting_status,
    subscriptionPlan: professional.subscription_plan,
    subscriptionStatus: professional.subscription_status,
    tags: professional.crm_tags ?? [],
    notesCount: noteList.length,
    lastNoteAt: noteList[0]?.createdAt ?? null,
    notes: noteList,
  };
}

export async function addAdminProfessionalNote(professionalId: string, body: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase.from("admin_professional_notes").insert({
    professional_id: professionalId,
    body,
  });

  if (error) {
    console.error("[admin-professional-crm] Failed to add note:", error.message);
    return false;
  }
  return true;
}

export async function updateAdminProfessionalTags(
  professionalId: string,
  tags: string[]
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase
    .from("professionals")
    .update({ crm_tags: tags })
    .eq("id", professionalId);

  if (error) {
    console.error("[admin-professional-crm] Failed to update tags:", error.message);
    return false;
  }
  return true;
}
