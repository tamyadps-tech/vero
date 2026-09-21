-- CRM completo — profissional e admin.
--
-- Lado profissional: `professional_contacts` unifica dois casos numa só
-- tabela — um lead manual (contato ainda sem sessão, client_id null,
-- dados soltos em full_name/email/phone) e o "enriquecimento" CRM de um
-- cliente real (client_id preenchido; nome/email/telefone vêm de
-- `clients`, aqui só guardamos estágio do funil e tags). A linha é
-- criada sob demanda (lazy) na primeira nota/tag/estágio que o
-- profissional registrar pra aquele contato — nunca em bulk.
create type crm_stage as enum ('lead', 'contatado', 'agendado', 'cliente_ativo', 'inativo');

create table professional_contacts (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  stage crm_stage not null default 'lead',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (professional_id, email)
);

create index professional_contacts_professional_idx on professional_contacts (professional_id);
create index professional_contacts_client_idx on professional_contacts (client_id);

create table professional_contact_notes (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references professional_contacts(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index professional_contact_notes_contact_idx on professional_contact_notes (contact_id);

create table professional_contact_tasks (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references professional_contacts(id) on delete cascade,
  title text not null,
  due_date date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index professional_contact_tasks_contact_idx on professional_contact_tasks (contact_id);

-- Log de campanhas de marketing enviadas (email/WhatsApp), pra exibir
-- histórico de contato por cliente na página de detalhe do CRM.
create table professional_client_messages (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  channel text not null check (channel in ('email', 'whatsapp')),
  template_id text not null,
  sent_at timestamptz not null default now()
);

create index professional_client_messages_client_idx on professional_client_messages (client_id);

-- Lado admin: profissional como "conta" gerenciada — notas/log de
-- interação (texto livre, cada linha é uma entrada datada) e tags pra
-- segmentação, além dos filtros que já existem (plano, vetting).
create table admin_professional_notes (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index admin_professional_notes_professional_idx on admin_professional_notes (professional_id);

alter table professionals add column crm_tags text[] not null default '{}';

alter table professional_contacts enable row level security;
alter table professional_contact_notes enable row level security;
alter table professional_contact_tasks enable row level security;
alter table professional_client_messages enable row level security;
alter table admin_professional_notes enable row level security;
-- Sem policy de leitura pública em nenhuma: só a service role (backend) acessa.
