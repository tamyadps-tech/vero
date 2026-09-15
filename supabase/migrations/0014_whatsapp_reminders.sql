-- Telefone do cliente (formato E.164, ex: +5511999998888), usado pra
-- mandar confirmação/lembrete de sessão via WhatsApp. Opcional — sem
-- telefone, o cliente só recebe por email (mesmo fallback gracioso do
-- resto do app).
alter table clients
  add column phone_number text;

-- Marca quando o lembrete automático (véspera da sessão) já foi
-- mandado, pra o cron de lembretes nunca mandar duas vezes.
alter table sessions
  add column reminder_sent_at timestamptz;
