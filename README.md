# Vero

Marketplace de terapeutas, psicólogos, coaches, consultores, mentores e
palestrantes — com vetting de credenciais, avaliações públicas, login de
verdade (email+senha) pra profissional e cliente, e progresso visual. Ver
[`BRANDING.md`](./BRANDING.md) para nome, cores e tom de voz, e
[`docs/planning/`](./docs/planning) para o PRD original.

**Estágio atual**: pré-lançamento, já publicado num domínio da Vercel
(`vero-rose.vercel.app`) mas ainda bloqueado pra buscadores (`robots.ts`)
enquanto revisamos tudo — não é pra divulgar esse link publicamente
ainda. Conectado a serviços reais (Supabase, Resend, Stripe em modo
teste). Já existem cadastro/vetting de profissional com login de
verdade, foto de perfil e edição de perfil no próprio painel (bio, preço,
especialidades, redes sociais — Instagram/WhatsApp/site), busca/perfil
público, agendamento de sessão (exige cliente logado), prontuário
compartilhado, progresso acompanhado no painel, autoavaliações (PHQ-9,
GAD-7, Roda da Vida) — liberadas teste a teste pelo profissional, o
cliente só vê depois que o profissional libera —, avaliações públicas,
email transacional e cobrança via Stripe — todos com fallback gracioso:
sem alguma chave configurada, essa parte específica cai pro "modo
grátis/sem email" em vez de quebrar.

O painel do profissional (`/p/dashboard`) é dividido em abas — Dashboard
(KPIs reais: recebido, ticket médio, recompra, taxas de conclusão/
cancelamento, lucro líquido, faturamento por mês e sessões por status),
Marketing (divulgação + mensagens), Financeiro, Agenda e Clientes (CRM)
—, com a edição de perfil sempre visível no topo. A Agenda tem
calendário com visão dia/semana/mês (clicando num dia no mês você cai na
visão do dia) e um botão pra reenviar a confirmação por email de
qualquer sessão — além do email automático que já sai sozinho quando o
cliente agenda. O Financeiro tem registro de custos/despesas (descrição,
valor, data, categoria opcional) e calcula o lucro líquido (recebido −
despesas) — imposto fica de fora por enquanto, depende do regime
tributário de cada profissional e entra numa fase futura, decisão
deliberada.

## Stack

Abordagem **híbrida**, escolhida para manter custo próximo de zero
enquanto o projeto valida demanda:

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4** — código
  próprio para o núcleo do produto (marketplace, perfis, dashboard)
- **Supabase** (Postgres) para dados — schema em [`supabase/migrations`](./supabase/migrations),
  já aplicado no projeto real (organização "tamyadps-tech's Projects" na
  Supabase)
- Serviços prontos só onde é essencial e barato: **Stripe Checkout** para
  pagamento (sem Stripe Connect ainda — o repasse ao profissional é manual)
  e **Resend** para email transacional (camada gratuita, 100/dia)

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000).

Copie `.env.example` para `.env.local` e preencha (ver o arquivo pra
instruções detalhadas de cada uma):

- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY` —
  **já configurados e testados** no projeto real (peça as credenciais
  salvas, não estão no repo). A `ANON_KEY` é usada só pro login de
  profissional/cliente (Supabase Auth) — sem ela essa parte responde 503,
  o resto do app segue normal. Sem `SERVICE_ROLE_KEY`, a lista de espera e
  o cadastro de profissional respondem 503 em vez de gravar.
- `ADMIN_USER` / `ADMIN_PASSWORD` — credenciais de HTTP Basic Auth pra
  acessar `/admin`. **Já configurado** — pedir a senha salva. Proteção
  mínima pra "só vocês dois" — trocar por login de verdade (Supabase Auth)
  antes de dar acesso a mais gente.
- `RESEND_API_KEY` / `RESEND_FROM` — **já configurado** (chave real, ainda
  usando o domínio de teste da Resend — só entrega pro próprio email
  cadastrado lá até verificar um domínio próprio). Sem isso, o app só
  loga um aviso e segue — ninguém recebe email, mas nada quebra.
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — **já configurados**
  (chaves de **teste**, `sk_test_...`/`pk_test_...`). Sem isso, o
  agendamento continua de graça (não cobra nada).
- `STRIPE_WEBHOOK_SECRET` — **ainda pendente**: precisa de uma URL pública
  (Developers → Webhooks no painel Stripe, apontando pra
  `<seu-domínio>/api/stripe/webhook`) — só dá pra configurar depois do
  deploy.

As contas (Supabase, Resend, Stripe) foram criadas por vocês — eu não
crio contas de terceiros. O código já está plugado e testado (o Supabase
foi validado com insert/delete reais via MCP); só falta publicar em
algum lugar pra testar o fluxo completo clicando no site.

## Testes

```bash
npm run test       # unitários (Vitest + Testing Library)
npm run test:watch # unitários em watch mode
npm run test:e2e   # smoke test end-to-end (Playwright)
npm run build      # build de produção + checagem de tipos
```

## Estrutura

```
src/
  app/
    (landing, /termos, /privacidade)
    profissionais/            # busca (/profissionais) e perfil público (/profissionais/[id])
                              # com o widget de agendamento
    profissionais/cadastro/   # formulário público de candidatura (com senha)
    admin/                    # visão geral (BI), fila de vetting,
                              # detalhe do profissional (referência/suporte),
                              # assinaturas (placeholder)
    p/entrar/                 # login do profissional (email+senha)
    p/dashboard/               # painel do profissional (protegido por sessão):
                              # agenda, prontuário, CRM de clientes,
                              # financeiro, mensagens e divulgação
    c/entrar/                 # login do cliente (email+senha)
    c/cadastrar/               # criar conta de cliente
    c/dashboard/                # progresso do cliente (protegido por sessão)
    p/[token]/, c/[token]/     # links antigos por token — redirecionam pro
                              # login (substituídos por Supabase Auth)
    api/
      waitlist/                    # POST lista de espera
      professionals/apply/         # POST candidatura de profissional (cria a conta)
      auth/professional/login/     # POST login do profissional
      auth/professional/logout/    # POST logout do profissional
      auth/client/signup/          # POST criar conta de cliente
      auth/client/login/           # POST login do cliente
      auth/client/logout/          # POST logout do cliente
      sessions/book/                # POST agendar sessão (exige cliente logado)
      admin/professionals/[id]/     # PATCH aprovar/rejeitar
      admin/.../availability/       # POST/DELETE horários (protegido pelo proxy)
      admin/sessions/[id]/          # PATCH tópicos/tarefa/status da sessão
      professional/availability/    # POST/DELETE horários (sessão do profissional)
      professional/sessions/[id]/   # PATCH tópicos/tarefa/status (sessão do profissional)
      professional/messages/send/   # POST mensagem em massa pros próprios clientes
      reviews/                      # POST avaliação (sessão do cliente)
      assessments/submit/           # POST autoavaliação (sessão do cliente)
      stripe/webhook/               # confirma pagamento (checkout.session.completed)
  components/       # UI da landing page + admin/ (painel) + professional/
                     # (painel do profissional) + auth/ (login/cadastro)
  lib/              # markdown renderer, cliente Supabase admin e anon
                     # (server-only), métricas de BI, categorias/formatos
                     # compartilhados, cálculo de horários disponíveis
                     # (availability.ts, puro e testado isoladamente),
                     # email.ts (Resend), email-templates.ts, stripe.ts,
                     # assessments.ts (PHQ-9/GAD-7/Roda da Vida, scoring
                     # puro e testado), client-engagement.ts (regra de
                     # churn, pura e testada), professional-session.ts /
                     # client-session.ts (resolvem a sessão logada — nunca
                     # confiam em id vindo do corpo da requisição),
                     # auth-session.ts (cookies httpOnly de sessão),
                     # professional-clients.ts (CRM), professional-finance.ts
  proxy.ts          # HTTP Basic Auth em /admin; valida/renova a sessão
                     # (Supabase Auth) em /p/dashboard e /c/dashboard
                     # (Next 16 "proxy")
docs/
  legal/          # Termo de Uso e Política de Privacidade (fonte .md)
  email-templates/ # template original (referência) — o de verdade que o
                    # app usa é src/lib/email-templates.ts
  planning/       # PRD original (sumário executivo, resumo do projeto)
supabase/
  migrations/     # schema SQL: waitlist + entidades do marketplace + pagamentos
                  # + autoavaliações + auth_user_id (login de profissional
                  # e cliente) — já aplicado no projeto real
e2e/              # testes Playwright
```

## O que já dá pra fazer

- Visitante entra na lista de espera (cliente ou profissional)
- Profissional se candidata em `/profissionais/cadastro`, informando
  categoria, anos de experiência, especialidades, métodos/abordagens,
  estilo de atendimento e formato (online/presencial/híbrido, com
  cidade/estado quando há ponto físico)
- Vocês dois revisam candidaturas em `/admin/profissionais` e
  aprovam/rejeitam
- `/admin` mostra métricas (lista de espera, profissionais por status e
  categoria, sessões, receita) — a base do painel de BI. Assinaturas
  (planos SaaS mensais) fica como placeholder, é diferente da comissão por
  sessão que já funciona
- Cliente busca profissionais aprovados em `/profissionais` (abas por
  especialidade, filtro de formato, texto) e vê o perfil público em
  `/profissionais/[id]`
- Ao se candidatar, o profissional já cria a própria conta (email+senha).
  Login em `/p/entrar` leva ao `/p/dashboard`, protegido por sessão
  (Supabase Auth, cookie httpOnly renovado automaticamente): cadastra a
  disponibilidade semanal recorrente, registra o prontuário de cada sessão
  (tópicos, tarefa, próxima sessão), vê a lista dos próprios clientes com
  histórico, valor vitalício (LTV) e status de engajamento
  (ativo/em risco/inativo), manda mensagem em massa pros próprios clientes,
  acompanha o financeiro (recebido/pendente por sessão) e tem o link do
  próprio perfil público pronto pra divulgar
- Cliente cria conta em `/c/cadastrar` (ou entra em `/c/entrar`) e só
  então consegue agendar — escolhe um horário no perfil público e
  confirma; o servidor sempre recalcula a disponibilidade de verdade antes
  de confirmar, pra evitar duplo agendamento
- O admin também vê disponibilidade e prontuário em
  `/admin/profissionais/[id]` (referência/suporte da equipe — o
  profissional aprovado já gerencia isso pelo próprio painel)
- Depois de agendar, o cliente acompanha tudo em `/c/dashboard`: próxima
  sessão, histórico completo com tópicos/tarefas de cada sessão passada
- Nesse mesmo painel, depois de uma sessão concluída, o cliente avalia
  (nota 1–5 + comentário opcional). A avaliação aparece pública e anônima
  no perfil do profissional e como resumo (média + contagem) na busca —
  "Novo na Vero" honestamente quando ainda não há avaliações
- Se o profissional tiver preço > 0 e o Stripe estiver configurado, o
  cliente paga no Checkout hospedado pela Stripe antes de a sessão ser
  confirmada; o email de confirmação sai só depois do pagamento (via
  webhook). Sem Stripe configurado, a sessão fica marcada na hora, de
  graça — nada trava por falta da chave
- Quando o admin marca uma sessão como concluída (com tópicos/tarefa
  preenchidos), o cliente recebe o resumo por email automaticamente
- No painel, o cliente também pode fazer autoavaliações
  (PHQ-9, GAD-7, Roda da Vida) quando quiser, e ver o histórico de scores
  ao longo do tempo — só instrumentos de domínio público ou de autoria
  própria por enquanto, os demais do PRD original (DASS-21, Rosenberg
  etc.) ficam de fora até verificar licenciamento

Tudo isso funciona sem quebrar mesmo sem alguma das chaves configurada:
as rotas respondem 503 ou seguem em modo grátis/sem email, nunca com erro.
Hoje (com Supabase, Resend e Stripe configurados) só falta mesmo o
`STRIPE_WEBHOOK_SECRET` e o deploy.

## Próximos passos

1. **Deploy**: publicar num host real (Vercel é o mais natural pro
   Next.js, tem tier gratuito) com as mesmas variáveis de ambiente do
   `.env.local`. Só depois disso dá pra testar o fluxo inteiro clicando
   no site (agendar → pagar → receber email) e configurar o
   `STRIPE_WEBHOOK_SECRET`.
2. **Revisão jurídica**: os documentos em `docs/legal/` têm campos
   `[a definir]` (razão social, CNPJ, telefone) e precisam de revisão por
   advogado especializado em LGPD antes de publicar de verdade.
3. **Login de verdade no admin**: hoje só profissional e cliente têm login
   de verdade (Supabase Auth). O `/admin` continua em HTTP Basic Auth —
   trocar por Supabase Auth assim que mais de vocês dois precisar de acesso.
4. Repasse aos profissionais ainda é manual (a Vero recebe 100% via Stripe,
   sem Stripe Connect); automatizar isso é um passo futuro, não deste MVP.
5. Lembrete de sessão 24h antes precisa de um agendador (cron) — só faz
   sentido configurar depois que o app estiver de fato no ar.
6. Domínio de email verificado na Resend (hoje usa o domínio de teste
   deles, que só entrega pro próprio email cadastrado lá).
7. Mais autoavaliações (DASS-21, Rosenberg, etc.) — verificar licenciamento
   antes de adicionar.
