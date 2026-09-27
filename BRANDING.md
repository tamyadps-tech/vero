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

## Paleta de cores — "Oliva" (quiet luxury)

A partir de uma referência de 5 cores enviada por Tamy (taupe, greige,
terracota, oxblood, verde-oliva escuro) — tons terrosos e dessaturados,
com o verde-oliva como cor dominante. Território "quiet luxury": comercial
e editorial sem ser doce ou "de beleza feminina" — deliberadamente unissex,
já que a Vero atende terapeutas/coaches/consultores e seus clientes dos
dois lados. Terracota, taupe e oxblood entram como cores de apoio, cada
uma com seu próprio papel, nunca como decoração solta.

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#454A34` | Cor dominante — ações primárias, links, ícones de destaque, texto de marca |
| `--color-primary-dark` | `#2E321F` | Hover/active de botões primários |
| `--color-primary-light` | `#E3E2D3` | Fundos suaves (badges, cards de destaque) |
| `--color-accent` | `#FF6B4A` | Coral vívido — a única cor saturada da paleta, reservada pra destacar dado importante (estatística, palavra-chave no H1, CTA secundário) |
| `--color-accent-dark` | `#D8492A` | Hover do accent |
| `--color-accent-light` | `#FFE0D6` | Fundos suaves com accent |
| `--color-gold` | `#87796D` | Cor de apoio (taupe), hoje sem uso — reservada pra variedade em conjuntos de 3–4 itens |
| `--color-gold-dark` | `#5F544A` | Texto/hover sobre gold |
| `--color-gold-light` | `#ECE7DF` | Fundos suaves com gold |
| `--color-sage` | `#5C2925` | Cor de apoio (oxblood), hoje sem uso — reservada pra contraponto escuro/quente ao verde-oliva |
| `--color-sage-dark` | `#3F1B18` | Texto/hover sobre sage |
| `--color-sage-light` | `#ECDCDA` | Fundos suaves com sage |
| `--color-paper` | `#F7F4EC` | Fundo principal (creme quente, não branco puro) |
| `--color-paper-alt` | `#ECE7D9` | Fundo de seções alternadas, cards (greige) |
| `--color-ink` | `#262620` | Texto principal |
| `--color-ink-soft` | `#6B6558` | Texto secundário, legendas |
| `--color-border` | `#DDD5C3` | Bordas e divisores |

**Regra de uso do accent**: é a única cor vívida/saturada no meio de uma
paleta terrosa de propósito — por isso deve ir sempre em dado real que
precisa de destaque (a palavra-chave do H1 "se vê", os números da seção
"Por que isso importa", os números 01/02/03 de listas de passos/features),
nunca em decoração solta. **Regra de uso do gold/sage**: nunca em CTA
principal, botão de ação ou link — esses continuam `primary`/`accent`.
Hoje sem uso ativo no código; existem pra variedade visual em algum futuro
conjunto paralelo de 3–4 itens, se aparecer — cor por identidade do item,
nunca decoração aleatória solta na página.

Definidos como CSS custom properties em `src/app/globals.css` e expostos ao
Tailwind via `@theme inline` — usar como `bg-primary`, `text-ink-soft`,
`border-border`, etc.

**Regra de contraste**: texto sobre `primary`/`accent` é sempre `paper`
(branco-creme), nunca preto puro. Texto de corpo é sempre `ink` ou
`ink-soft` sobre `paper`/`paper-alt`, nunca cor pura da marca (falha de
acessibilidade e de legibilidade).

---

## Tipografia

Par editorial: **Bodoni Moda** para títulos (`font-display`) + **Inter**
para corpo/UI (`font-sans`), self-hosted via `next/font/google` em
`src/app/layout.tsx` — sem chamada de rede em produção, sem flash de fonte.
Bodoni Moda é uma fonte variável (pesos 400–900, eixo de tamanho óptico
próprio) — alto contraste entre traços finos e grossos, editorial/haute
couture. Inter é o grotesco neutro e extremamente legível usado por boa
parte dos produtos premium — cobre pesos 100–900.

Hierarquia:
- **H1** (hero): `font-display`, `text-4xl`/`text-5xl`, `font-medium`, `tracking-tight`
- **H2** (seção): `font-display`, `text-3xl`, `font-medium`, `tracking-tight`
- **H3** (card): `font-display`, `text-lg`, `font-medium`
- **Corpo**: `font-sans` (padrão), `text-base`/`text-sm`, `leading-relaxed`, cor `ink-soft`

**Wordmark**: o logotipo "Vero" (`src/components/Logo.tsx`) usa uma terceira
fonte, só ali — **Antic Didone**, também self-hosted via `next/font/google`,
mas aplicada localmente ao componente (não é uma variável global). Serifa
de contraste altíssimo com terminações em bola, mais próxima do estilo
"fashion logotype" de referências como Rachelya/Lagency do que o Bodoni
Moda usado nos títulos de conteúdo — só existe no peso 400, então nunca usar
`font-semibold`/`font-bold` nela (sem eixo variável, viraria negrito falso).

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
