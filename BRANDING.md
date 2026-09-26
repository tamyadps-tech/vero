# Vero — Guia de Marca

## O nome

**Vero**, do latim *verus* (verdadeiro). Curto, fácil de falar em português e
inglês, e carrega o diferencial central do produto: profissionais
**verificados** e progresso que **se vê**, não algo que se promete. Também
soa natural em domínios (`vero.app`), redes sociais e como nome de empresa.

**Tagline**: *Profissionais verificados. Progresso que se vê.*

**Tom de voz**: direto, acolhedor, sem jargão clínico. Fala com quem busca
ajuda séria (cliente) e com quem presta esse serviço (profissional) — nunca
com linguagem de "growth hacker" nem excesso de formalidade jurídica fora
dos documentos legais.

---

## Paleta de cores — "Ameixa & Coral" (+ Gold & Sage)

Fugimos do roxo-gradiente genérico de SaaS e do verde-petróleo genérico de
plataforma de bem-estar. A Vero usa uma ameixa profunda (autoridade,
sofisticação, um pouco de drama editorial) combinada com coral vibrante
(energia, calor humano) sobre um fundo creme rosado — mais marcante que
"seguro", sem perder acolhimento. Gold e sage entram como terceira e quarta
cor de apoio, pra dar variedade em pontos com vários itens paralelos sem
descaracterizar a dupla principal.

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#6C2F63` | Ações primárias, links, ícones de destaque, texto de marca |
| `--color-primary-dark` | `#4A1F43` | Hover/active de botões primários |
| `--color-primary-light` | `#F3E6F1` | Fundos suaves (badges, cards de destaque) |
| `--color-accent` | `#FF6B4A` | CTA secundário (ex. "Entrar na lista"), alertas de atenção |
| `--color-accent-dark` | `#D8492A` | Hover do accent |
| `--color-accent-light` | `#FFE4DA` | Fundos suaves com accent |
| `--color-gold` | `#C68A2E` | Terceira cor de apoio — variedade em conjuntos de 3–4 itens (ícones, estatísticas) |
| `--color-gold-dark` | `#96661E` | Texto/hover sobre gold |
| `--color-gold-light` | `#F5E6C8` | Fundos suaves com gold |
| `--color-sage` | `#3E6E5E` | Quarta cor de apoio — contraponto frio ao par ameixa/coral |
| `--color-sage-dark` | `#2A4C40` | Texto/hover sobre sage |
| `--color-sage-light` | `#DCEAE4` | Fundos suaves com sage |
| `--color-paper` | `#FAF7F5` | Fundo principal (creme rosado, não branco puro) |
| `--color-paper-alt` | `#F2E9E6` | Fundo de seções alternadas, cards |
| `--color-ink` | `#201720` | Texto principal |
| `--color-ink-soft` | `#675863` | Texto secundário, legendas |
| `--color-border` | `#E8DBE1` | Bordas e divisores |

**Regra de uso do gold/sage**: nunca em CTA principal, botão de ação ou link —
esses continuam `primary`/`accent`. Gold e sage existem só pra dar variedade
visual em conjuntos paralelos de 3–4 itens (os 4 cards de estatística da
landing, os 3 ícones de feature, um terceiro blob de fundo no Hero) — cor por
identidade do item, nunca decoração aleatória solta na página.

Definidos como CSS custom properties em `src/app/globals.css` e expostos ao
Tailwind via `@theme inline` — usar como `bg-primary`, `text-ink-soft`,
`border-border`, etc.

**Regra de contraste**: texto sobre `primary`/`accent` é sempre `paper`
(branco-creme), nunca preto puro. Texto de corpo é sempre `ink` ou
`ink-soft` sobre `paper`/`paper-alt`, nunca cor pura da marca (falha de
acessibilidade e de legibilidade).

---

## Tipografia

Par editorial: **Instrument Serif** para títulos (`font-display`) + **Manrope**
para corpo/UI (`font-sans`), self-hosted via `next/font/google` em
`src/app/layout.tsx` — sem chamada de rede em produção, sem flash de fonte.
Instrument Serif só existe no peso 400 (normal/itálico); Manrope cobre 200–800.

Hierarquia:
- **H1** (hero): `font-display`, `text-4xl`/`text-5xl`, `font-medium`, `tracking-tight`
- **H2** (seção): `font-display`, `text-3xl`, `font-medium`, `tracking-tight`
- **H3** (card): `font-display`, `text-lg`, `font-medium`
- **Corpo**: `font-sans` (padrão), `text-base`/`text-sm`, `leading-relaxed`, cor `ink-soft`

---

## Logo

`src/components/Logo.tsx` (wordmark completo) e `src/app/icon.svg`
(favicon/ícone). O símbolo é um "V" estilizado dentro de um quadrado
arredondado na cor primária, com um ponto terracota no canto — lembra um
ícone de "verificado" (check/seal) sem copiar literalmente um selo de
verificação de rede social.

**Uso**:
- Sempre com espaçamento mínimo equivalente à altura do ícone ao redor
- Nunca esticar, rotacionar ou recolorir fora da paleta acima
- Em fundos escuros (ainda não definidos formalmente): usar a versão com
  `--color-paper` como fundo do ícone, mantendo o "V" em `--color-primary`
  invertido — a definir quando houver necessidade real de dark mode

---

## Próximos passos de marca (quando o orçamento permitir)

1. Ilustrações/fotografia de estilo consistente para perfis de profissionais
2. Variação do logo para redes sociais (avatar quadrado)
3. Modo escuro, se a base de usuários pedir
