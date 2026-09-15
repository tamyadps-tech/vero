import { getSupabaseAdmin } from "@/lib/supabase-admin";

export interface ProfessionalExpense {
  id: string;
  description: string;
  amountCents: number;
  expenseDate: string;
  category: string | null;
}

/** Retorna null quando o Supabase ainda não está configurado. */
export async function listProfessionalExpenses(
  professionalId: string
): Promise<ProfessionalExpense[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("professional_expenses")
    .select("id, description, amount_cents, expense_date, category")
    .eq("professional_id", professionalId)
    .order("expense_date", { ascending: false });

  if (error) {
    console.error("[professional-expenses] Failed to list expenses:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    description: row.description,
    amountCents: row.amount_cents,
    expenseDate: row.expense_date,
    category: row.category,
  }));
}
