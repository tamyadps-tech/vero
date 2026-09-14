-- Controle de liberação das autoavaliações: o cliente só pode fazer um
-- teste (PHQ-9, GAD-7, Roda da Vida) depois que o profissional libera
-- especificamente aquele teste pra ele. Antes disso o teste nem aparece
-- disponível no painel do cliente.

create table assessment_releases (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  template_slug text not null,
  released_at timestamptz not null default now(),
  unique (professional_id, client_id, template_slug)
);

create index assessment_releases_client_idx on assessment_releases (client_id);
create index assessment_releases_professional_idx on assessment_releases (professional_id);

alter table assessment_releases enable row level security;
-- Sem policy pública: só a service role (backend) grava e lê — mesmo
-- padrão de assessment_responses.
