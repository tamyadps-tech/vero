import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ExpenseKind } from "@/lib/professional-expenses";

export interface AdminExpense {
  id: string;
  description: string;
  amountCents: number;
  /** 'fixo' = valor mensal (Supabase, Vercel...); 'variavel' = valor por sessão processada. */
  kind: ExpenseKind;
  expenseDate: string;
  category: string | null;
}

/** Retorna null quando o Supabase ainda não está configurado. */
export async function listAdminExpenses(): Promise<AdminExpense[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("admin_expenses")
    .select("id, description, amount_cents, kind, expense_date, category")
    .order("expense_date", { ascending: false });

  if (error) {
    console.error("[admin-expenses] Failed to list expenses:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    description: row.description,
    amountCents: row.amount_cents,
    kind: row.kind as ExpenseKind,
    expenseDate: row.expense_date,
    category: row.category,
  }));
}
