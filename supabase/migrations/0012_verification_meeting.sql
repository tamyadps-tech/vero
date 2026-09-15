-- Reunião de verificação de autenticidade antes da aprovação: a equipe
-- marca uma data/hora de call com o candidato e anota o que rolou nela.
-- Não bloqueia a aprovação (pode aprovar sem reunião, se fizer sentido)
-- — é um registro de apoio pro vetting, não um gate obrigatório.
alter table professionals
  add column verification_meeting_at timestamptz,
  add column verification_meeting_notes text;
