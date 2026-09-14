-- Foto de perfil do profissional, exibida na busca e no perfil público.
alter table professionals
  add column photo_url text;

-- Bucket público: a foto precisa ser acessível sem autenticação (perfil
-- público). Upload é sempre feito pelo backend (service role), nunca
-- direto do navegador, então não precisa de policy de insert.
insert into storage.buckets (id, name, public)
values ('professional-photos', 'professional-photos', true)
on conflict (id) do nothing;
