-- Galeria de fotos (portfólio) do profissional, exibida em carrossel no
-- perfil público. Reaproveita o bucket "professional-photos" (já público),
-- só guarda a lista ordenada de URLs.
alter table professionals
  add column portfolio_photo_urls text[] not null default '{}';
