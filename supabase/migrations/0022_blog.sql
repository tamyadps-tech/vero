-- Blog institucional — conteúdo (dados, estudos, motivação) que sustenta
-- o argumento de vendas da landing: por que cuidar da saúde mental e do
-- desenvolvimento pessoal agora, escrito e publicado pelo admin.
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  tags text[] not null default '{}',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_published_idx on blog_posts (published, published_at desc);

alter table blog_posts enable row level security;
-- Sem policy de leitura pública: a listagem/página pública lê via
-- service role no server (mesmo padrão do resto do app), não client-side.
