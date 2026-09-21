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
GAD-7, Roda da Vida, Crenças Limitantes sobre Dinheiro, Estilos de
Liderança, Autodiagnóstico de Vendas, Autodiagnóstico de Gestão de
Vendas, Autodiagnóstico de Engajamento) — liberadas teste a teste pelo profissional, o cliente só
vê depois que o profissional libera —, cada teste com badge de
categoria (Clínico/Coaching) e barra de progresso no formulário. O
Estilos de Liderança é o primeiro teste de "múltiplas escalas" (18
perguntas em 6 estilos, resultado é o estilo de maior soma, com
gráfico de barras por estilo na visão detalhada) — suporte reaproveitado
pelo Autodiagnóstico de Gestão de Vendas (30 perguntas sim/não em 6
frentes de gestão) e reaproveitável pros próximos (ex: Múltiplas
Inteligências). Todo resultado de teste (pro cliente e pro
profissional) mostra também uma orientação prática de "o que fazer
com esse resultado", por faixa de severidade ou por dimensão
dominante. No painel do profissional, o catálogo de testes deixa o
próprio profissional responder o teste ali mesmo (prévia local, sem
salvar nada) pra entender como funciona antes de enviar pro cliente.

Nova aba "Exercícios": biblioteca de reflexões em texto livre (sem
pontuação) — `src/lib/exercises.ts` —, mesmo fluxo de liberação dos
testes (o profissional libera, o cliente responde), mas guardadas em
`exercise_responses`/`exercise_releases` (migration 0016). Primeiro
conjunto é sobre luto (Carta de Despedida, Exercício da Aceitação,
Boas Recordações, Metáforas, Habilidades de Enfrentamento — com base
no modelo do processo dual de Stroebe & Schut —, Lidando com a
Culpa, Minha Rede de Apoio, Psicoeducação do Luto), todo escrito
originalmente pela equipe Vero e com contexto psicoeducativo
robusto (ex: os 5 estágios de Kübler-Ross explicados um a um, o
mapeamento de rede de apoio quebrado nas 8 áreas da vida, 5 pares de
pensamento/conselho em Lidando com a Culpa). Cada exercício também
carrega uma nota "pra você, profissional" (objetivo + aplicação)
visível só no catálogo do profissional.

Nova aba "Método" no painel do profissional: uma biblioteca em
formato de blog (sem accordion) com guias práticos citando a
pesquisa por trás de cada técnica (Ekman, Beck, Krippendorff,
Fairclough, Pennebaker, Rogers) — `src/lib/method-articles.ts`. Além
dos artigos, tem "fichas de condução de sessão" (`kind: "ficha"`):
roteiros de perguntas abertas pro profissional usar ao vivo,
renderizados como checklist numerado em vez de texto corrido —
primeira sessão, sessão de luto e fechamento de sessão.

Identidade visual por área: fundo verde-claro (`primary-light`) e
títulos em negrito na cor verde da marca na área do profissional
(`/p`), fundo laranja-claro (`accent-light`) e títulos em negrito na
cor laranja da marca na área do cliente (`/c`) — via
`src/app/p/layout.tsx` / `src/app/c/layout.tsx` + classes
`.area-profissional`/`.area-cliente` em `globals.css`.

Também tem avaliações públicas,
email transacional e cobrança via Stripe — todos com fallback gracioso:
sem alguma chave configurada, essa parte específica cai pro "modo
grátis/sem email" em vez de quebrar.

O painel do profissional (`/p/dashboard`) é dividido em abas — Dashboard
(KPIs reais: recebido, ticket médio, recompra, taxas de conclusão/
cancelamento, lucro líquido, faturamento por mês e sessões por status),
Marketing (divulgação + mensagens), Financeiro, Agenda, Clientes (CRM) e
Testes (lista por cliente de cada autoavaliação, com o botão de
enviar/revogar, o resultado mais recente e as respostas completas de
quem já respondeu) —, com a
edição de perfil sempre visível no topo — inclui foto de perfil, redes
sociais e um portfólio de fotos (até 10, upload múltiplo, exibido em
carrossel no perfil público). A Agenda tem
calendário com visão dia/semana/mês (clicando num dia no mês você cai na
visão do dia) e um botão pra reenviar a confirmação por email de
qualquer sessão — além do email automático que já sai sozinho quando o
cliente agenda. O Financeiro tem registro de custos/despesas (descrição,
valor, data, categoria opcional) e calcula o lucro líquido (recebido −
despesas) — imposto fica de fora por enquanto, depende do regime
tributário de cada profissional e entra numa fase futura, decisão
deliberada. Na Agenda também dá pra **conectar o Google Calendar**: uma
vez conectado, o Vero bloqueia horários que já estão ocupados lá e cria
um evento automaticamente sempre que alguém agenda uma sessão — precisa
de `GOOGLE_CALENDAR_CLIENT_ID`/`GOOGLE_CALENDAR_CLIENT_SECRET` (ver
`.env.example`, inclui o aviso de que esse escopo do Google pode
precisar de verificação antes de funcionar pra qualquer profissional);
sem isso, o botão só avisa que ainda não está disponível.

Cliente também pode entrar com **login do Google**, além de email/senha
(`/c/entrar` e `/c/cadastrar`) — precisa configurar o provedor Google no
painel do Supabase (ver `.env.example`); sem isso o botão só avisa que
ainda não está disponível, sem quebrar o resto do login. O painel do
cliente (`/c/dashboard`) também tem edição de perfil — nome, telefone
(WhatsApp) e troca de senha (a troca exige a senha atual).

Confirmação de agendamento e lembrete de sessão (véspera) também saem
por **WhatsApp** via Twilio, além do email — precisa configurar
`TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/`TWILIO_WHATSAPP_FROM` (ver
`.env.example`) e o cliente ter cadastrado o telefone no próprio
perfil; sem isso, só o email sai, sem quebrar nada. O lembrete roda uma
vez por dia via Vercel Cron (`vercel.json` →
`/api/cron/session-reminders`, protegido por `CRON_SECRET`).

No admin (`/admin/profissionais`), cada candidato pendente tem um campo
pra marcar data/hora de uma reunião de verificação (com notas), além do
aprovar/rejeitar de sempre — não é obrigatório antes de aprovar, é só
um registro de apoio pro vetting. Todo profissional aprovado ganha um
selo "Verificado" visível no card de busca e no perfil público.

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
  (ativo/em risco/inativo), manda mensagem livre ou campanha com modelo
  pronto e editável (convite, reengajamento, cuidado) por email ou
  WhatsApp pros próprios clientes — pra WhatsApp, seleciona quem já tem
  telefone no CRM (sem precisar copiar número) e ainda dá pra colar
  contato avulso; tudo de dentro da Vero, sem precisar abrir conta em
  outra plataforma — acompanha o financeiro completo (recebido/pendente,
  custos fixos e variáveis, margem de contribuição, ponto de equilíbrio e
  preço sugerido, com manual explicando cada termo) e tem o link do
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
- Em `/admin/marketing`, o admin divulga a própria Vero (não o negócio de
  um profissional) com os mesmos modelos de campanha, editáveis
  (convite, acompanhamento, pós-venda) por email ou WhatsApp —
  reaproveitando o Resend e o Twilio já conectados, sem plataforma nova.
  O texto de cada modelo (assunto, corpo, WhatsApp) pode ser editado e
  fica salvo — o link (do perfil ou da Vero) é sempre adicionado
  automaticamente no fim, quem edita não precisa se preocupar com isso
- Em `/admin/financeiro`, o admin acompanha a saúde financeira da própria
  Vero: custos operacionais fixos/variáveis, margem de contribuição e uma
  calculadora de comissão — a Vero ainda não cobra comissão por sessão,
  então a tela é honesta sobre isso (mostra o volume processado como
  "repassado ao profissional", não receita própria) e serve pra decidir
  que comissão cobraria pra cobrir os custos. Também mostra orçado ×
  realizado × projeção do custo do mês (custo fixo cadastrado vs.
  despesas já lançadas esse mês vs. projeção linear até o fim do mês)
- Assinatura do profissional (Básico R$99, Pro R$179, Premium R$299/mês),
  cobrada via Stripe Checkout em modo assinatura. Básico é o essencial
  (agenda, prontuário, CRM automático, dashboard); Pro adiciona a aba
  Marketing (campanhas de email/WhatsApp); Premium adiciona a aba
  Financeiro completa (calculadora de margem/preço sugerido, orçado ×
  realizado × projeção). Sem assinatura ativa no plano certo, a aba
  correspondente mostra um convite pra assinar em vez do conteúdo. O
  profissional assina/troca de plano e cancela pela aba "Assinatura" no
  próprio painel (`/p/dashboard`), com um botão "Gerenciar assinatura"
  que abre o Customer Portal da própria Stripe. O admin acompanha tudo
  em `/admin/assinaturas`: lista de assinantes, status (ativa/
  inadimplente/cancelada) e MRR calculado automaticamente
- No painel do profissional, a aba Financeiro agora também calcula margem
  de contribuição, ponto de equilíbrio e preço sugerido (a partir dos
  custos fixos/variáveis cadastrados), com uma calculadora interativa e
  um manual explicando cada termo (margem, custo fixo/variável, ponto de
  equilíbrio...) e cuidados práticos (não subprecificar, separar % pro
  imposto, revisar o preço periodicamente). Também tem meta de receita
  mensal editável (orçado), o quanto já foi recebido no mês corrente
  (realizado) e uma projeção linear de onde o mês termina no ritmo atual
- Rastreamento de conversão pra tráfego pago (Meta Pixel + Conversions
  API, e Google Ads via gtag): dispara automaticamente quando alguém
  entra na lista de espera, cria conta, se candidata como profissional,
  agenda uma sessão ou paga (esse último via webhook do servidor, não
  depende do navegador do cliente no momento do pagamento). Isso não cria
  nem gerencia anúncio nenhum — você continua criando e rodando a
  campanha direto no Gerenciador de Anúncios da Meta e no Google Ads;
  isso só avisa as duas plataformas quando alguém converteu de verdade,
  pra elas otimizarem quem vê o anúncio com base em resultado real. Sem
  as chaves configuradas (`NEXT_PUBLIC_META_PIXEL_ID`,
  `META_CONVERSIONS_API_TOKEN`, `NEXT_PUBLIC_GOOGLE_ADS_ID` e os 4
  rótulos de conversão), nenhum script de terceiro carrega — ver
  `.env.example` pro passo a passo
- CRM completo, pros dois lados. Pro profissional, a aba Clientes agora é
  um funil de verdade (lead → contatado → agendado → cliente ativo →
  inativo), não só a lista automática de quem já teve sessão: dá pra
  cadastrar um contato manualmente (antes de agendar), editar telefone,
  marcar tags livres, filtrar por estágio/tag, e cada contato tem uma
  página de detalhe própria (`/p/dashboard/clientes/[id]`) com notas
  datadas, tarefas de follow-up (com data e status atrasada/feita) e o
  histórico de campanhas de email/WhatsApp já enviadas pra aquele
  cliente. Pro admin, `/admin/crm` traz duas visões: profissionais como
  "conta" da Vero (notas de interação, tags, segmentação por plano e
  status de vetting) e um diretório read-only de todos os clientes da
  plataforma (busca por nome/email/profissional), pra suporte — sem
  edição ali, porque notas/tags de cliente pertencem ao CRM do
  profissional dono da relação
- CRM: lembrete diário por email (cron `/api/cron/task-reminders`, todo
  dia às 8h BRT) resumindo tarefas atrasadas e de hoje pra cada
  profissional — sem isso, tarefa vencida só aparecia se alguém abrisse
  o painel por conta própria
- CRM: quando um lead cadastrado manualmente agenda a 1ª sessão de
  verdade, o contato é promovido pra "cliente ativo" automaticamente —
  antes continuava marcado como lead até trocar na mão
- CRM: filtrar por estágio/tag na aba Clientes e mandar campanha de
  email/WhatsApp direto pros filtrados — abre a aba Marketing já com
  esses clientes pré-selecionados, sem re-selecionar um por um
- Assinatura: trocar de plano agora atualiza a mesma assinatura na
  Stripe com proração automática, sem precisar cancelar antes (limite
  que existia até aqui)
- CRM: botão "Exportar CSV" na aba Clientes, com todo o funil (nome,
  email, telefone, estágio, tags, sessões, LTV) — pra quem já usa outra
  ferramenta (Excel, Notion) puxar os dados pra fora

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
