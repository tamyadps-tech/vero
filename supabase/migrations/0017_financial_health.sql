-- Painel financeiro completo: margem, ponto de equilíbrio e preço
-- sugerido precisam saber separar custo FIXO (mensal, não depende de
-- quantas sessões você faz) de custo VARIÁVEL (por sessão/atendimento).
-- "kind" faz isso; default 'fixo' preserva as despesas já cadastradas
-- (não muda o comportamento de ninguém, só adiciona a dimensão nova).
--
-- amount_cents muda de sentido conforme "kind":
--   'fixo'     -> valor mensal (ex: aluguel, assinatura de ferramenta)
--   'variavel' -> valor por sessão/atendimento (ex: material, taxa de
--                 processamento de pagamento)

alter table professional_expenses
  add column kind text not null default 'fixo' check (kind in ('fixo', 'variavel'));

-- Mesma ideia, só que pro lado da Vero (custo operacional da
-- plataforma: Supabase, Vercel, Resend, Twilio, domínio etc.) — não
-- existia nenhuma tabela de custo do admin até aqui.
create table admin_expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  kind text not null check (kind in ('fixo', 'variavel')),
  amount_cents integer not null check (amount_cents >= 0),
  category text,
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table admin_expenses enable row level security;
-- Sem policy pública — só a service role, atrás do Basic Auth do /admin.
