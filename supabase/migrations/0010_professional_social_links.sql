-- Redes sociais opcionais no perfil do profissional, editáveis por ele
-- mesmo (junto com o resto do perfil) no painel.
alter table professionals
  add column instagram_url text,
  add column whatsapp_url text,
  add column website_url text;
