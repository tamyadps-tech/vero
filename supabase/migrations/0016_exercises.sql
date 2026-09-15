-- Exercícios de texto livre (carta de despedida, boas recordações,
-- etc. — ver src/lib/exercises.ts). Mesmo padrão de liberação dos
-- testes de autoavaliação (0005/0009), mas sem pontuação: o
-- "resultado" aqui é o texto que o cliente escreveu, não um score.

create table exercise_responses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  template_slug text not null,
  answers text[] not null,
  created_at timestamptz not null default now()
);

create index exercise_responses_client_idx on exercise_responses (client_id);

alter table exercise_responses enable row level security;
-- Sem policy pública: só a service role (backend) grava e lê, mesmo
-- padrão de assessment_responses.

create table exercise_releases (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  template_slug text not null,
  released_at timestamptz not null default now(),
  unique (professional_id, client_id, template_slug)
);

create index exercise_releases_client_idx on exercise_releases (client_id);
create index exercise_releases_professional_idx on exercise_releases (professional_id);

alter table exercise_releases enable row level security;
-- Sem policy pública: só a service role (backend) grava e lê, mesmo
-- padrão de assessment_releases.
