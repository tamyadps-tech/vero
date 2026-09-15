-- Integração com Google Calendar do profissional: guarda o refresh
-- token (pra pedir access token novo sempre que precisar, sem exigir
-- login de novo) e o email da conta conectada, só pra exibir no painel.
alter table professionals
  add column google_calendar_refresh_token text,
  add column google_calendar_email text;
