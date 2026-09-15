-- Custos/despesas do profissional, pra calcular lucro líquido (recebido
-- - despesas). Imposto fica de fora por enquanto — depende do regime
-- tributário de cada profissional (MEI/autônomo/PJ) e entra numa fase
-- futura, com mais cuidado.
create table professional_expenses (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references professionals(id) on delete cascade,
  description text not null,
  amount_cents integer not null check (amount_cents >= 0),
  expense_date date not null default current_date,
  category text,
  created_at timestamptz not null default now()
);

create index professional_expenses_professional_idx on professional_expenses (professional_id);

alter table professional_expenses enable row level security;
-- Sem policy pública: só a service role (backend) grava e lê — mesmo
-- padrão das outras tabelas do profissional.
