-- Meta de receita mensal do profissional, pra comparar orçado x
-- realizado x projeção no painel financeiro. Nullable: sem meta
-- definida, o painel só mostra realizado/projeção, sem comparação.
alter table professionals
  add column monthly_revenue_goal_cents integer
    check (monthly_revenue_goal_cents is null or monthly_revenue_goal_cents >= 0);
