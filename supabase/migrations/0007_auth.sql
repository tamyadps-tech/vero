-- Login de verdade via Supabase Auth (email+senha), substituindo o
-- acesso por link com token pra profissionais e clientes.

alter table professionals
  add column auth_user_id uuid unique references auth.users(id) on delete set null;

alter table clients
  add column auth_user_id uuid unique references auth.users(id) on delete set null;
