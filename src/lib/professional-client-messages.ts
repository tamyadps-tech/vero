import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Log de uma campanha enviada, pra aparecer no histórico de contato do
 * CRM. Best-effort: nunca bloqueia o envio em si — se o log falhar, só
 * registra no console.
 */
export async function logClientMessages(
  professionalId: string,
  clientIds: string[],
  channel: "email" | "whatsapp",
  templateId: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase || clientIds.length === 0) return;

  const rows = clientIds.map((clientId) => ({
    professional_id: professionalId,
    client_id: clientId,
    channel,
    template_id: templateId,
  }));

  const { error } = await supabase.from("professional_client_messages").insert(rows);
  if (error) {
    console.error("[professional-client-messages] Failed to log messages:", error.message);
  }
}
