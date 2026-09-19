-- Modelos de campanha editáveis — o texto padrão vive no código
-- (professional-campaign-templates.ts / marketing-campaign-templates.ts),
-- e aqui só ficam as sobrescritas de quem edita. Uma linha por
-- profissional/admin, com um objeto jsonb {templateId: {emailSubject,
-- emailBodyText, whatsapp}} — só os templates editados aparecem aqui;
-- os outros continuam usando o padrão do código.

create table professional_message_templates (
  professional_id uuid primary key references professionals(id) on delete cascade,
  templates jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table professional_message_templates enable row level security;
-- Sem policy pública — só a service role, via API autenticada pelo
-- access token do profissional.

-- Singleton (uma linha só, id sempre 1) pros templates da Vero no
-- /admin/marketing.
create table admin_message_templates (
  id smallint primary key default 1 check (id = 1),
  templates jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table admin_message_templates enable row level security;
-- Sem policy pública — só a service role, atrás do Basic Auth do /admin.
