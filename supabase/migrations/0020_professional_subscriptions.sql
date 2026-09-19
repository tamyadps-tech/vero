-- Assinatura SaaS do profissional (Básico/Pro/Premium), cobrada via Stripe
-- Checkout em modo assinatura. Um profissional tem no máximo uma assinatura
-- ativa por vez — por isso os campos vivem direto em `professionals`, sem
-- tabela separada.

create type subscription_plan as enum ('basico', 'pro', 'premium');
create type subscription_status as enum ('ativa', 'inadimplente', 'cancelada');

alter table professionals
  add column subscription_plan subscription_plan,
  add column subscription_status subscription_status,
  add column stripe_customer_id text,
  add column stripe_subscription_id text unique,
  add column subscription_current_period_end timestamptz;

create index professionals_stripe_subscription_idx on professionals (stripe_subscription_id);
create index professionals_subscription_status_idx on professionals (subscription_status);
