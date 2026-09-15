export type ExerciseCategory = "clinico" | "coaching";

export interface ExercisePrompt {
  id: string;
  label: string;
  placeholder?: string;
}

export interface Exercise {
  slug: string;
  name: string;
  description: string;
  category: ExerciseCategory;
  /** Contexto/psicoeducação mostrado antes dos campos de resposta. */
  instructions: string;
  prompts: ExercisePrompt[];
  /** Objetivo e aplicação — só mostrado pro profissional, nunca pro cliente. */
  professionalNote: string;
}

const FAREWELL_LETTER: Exercise = {
  slug: "carta-de-despedida",
  name: "Carta de Despedida",
  description:
    "Escreva uma carta pra pessoa que você perdeu — um espaço pra colocar em palavras o que ficou sem dizer.",
  category: "clinico",
  instructions:
    "É comum evitar contato com tudo que lembra a pessoa que se foi — é uma defesa normal, mas viver em negação por muito tempo pode alongar o sofrimento. Escrever uma carta pra essa pessoa é uma forma de liberar o que ficou represado. Depois de escrever, você decide o que fazer com ela: guardar, deixar num lugar que tenha significado, ou até destruir simbolicamente — o que fizer mais sentido pra você.",
  prompts: [
    {
      id: "carta",
      label: "Sua carta",
      placeholder: "Comece do jeito que quiser — não existe forma certa.",
    },
  ],
  professionalNote:
    "Objetivo: ajudar o cliente a colocar em palavras sentimentos não elaborados em relação à perda. Aplicação: explique o exercício e ofereça como atividade em sessão ou tarefa pra casa, sem pressa de compartilhar o conteúdo se o cliente preferir manter em sigilo.",
};

const ACCEPTANCE_EXERCISE: Exercise = {
  slug: "exercicio-da-aceitacao",
  name: "Exercício da Aceitação",
  description:
    "Um espaço pra reconhecer e nomear as emoções ligadas à perda, em vez de evitá-las.",
  category: "clinico",
  instructions:
    "Negar uma emoção por ela ser desconfortável é comum, mas não ajuda a elaborar o luto. Sentir as emoções — todas elas — é o caminho pra aprender a conviver com elas sem ser dominado por elas. Perdas fazem parte da vida; muitas vezes nem percebemos que estamos evitando certos pensamentos e sentimentos. Use o espaço abaixo pra observar o que vem à tona quando você pensa na sua perda.",
  prompts: [
    { id: "emocoes", label: "Que emoções aparecem quando você pensa na sua perda?" },
    {
      id: "evitacao",
      label: "Existe algo que você evita fazer, ver ou lembrar por causa dessa perda?",
    },
    {
      id: "aceitacao",
      label: "O que mudaria se você permitisse sentir essas emoções sem julgá-las?",
    },
  ],
  professionalNote:
    "Objetivo: favorecer o contato com emoções evitadas, como primeiro passo pra aceitação da perda. Aplicação: use em sessão ou como tarefa, sempre validando que não existe emoção errada.",
};

const GOOD_MEMORIES: Exercise = {
  slug: "boas-recordacoes",
  name: "Exercício das Boas Recordações",
  description: "Reúna boas lembranças da pessoa que você perdeu.",
  category: "clinico",
  instructions:
    "Uma foto ou objeto que lembre a pessoa pode ajudar a ancorar essa reflexão. Liste boas recordações — grandes ou pequenas — que vêm à mente quando você pensa nela.",
  prompts: [
    { id: "recordacao1", label: "Recordação 1" },
    { id: "recordacao2", label: "Recordação 2" },
    { id: "recordacao3", label: "Recordação 3" },
    { id: "recordacao4", label: "Recordação 4" },
    { id: "recordacao5", label: "Recordação 5" },
    { id: "recordacao6", label: "Recordação 6" },
  ],
  professionalNote:
    "Objetivo: favorecer o contato com a realidade da perda de um jeito menos ressentido, reconectando com aspectos positivos da relação. Aplicação: pode ser usado em sessão ou como atividade pra casa.",
};

const METAPHORS_EXERCISE: Exercise = {
  slug: "exercicio-das-metaforas",
  name: "Exercício das Metáforas",
  description: "Duas metáforas pra pensar a dor de outros ângulos.",
  category: "clinico",
  instructions:
    'Metáforas ajudam a olhar pra experiências difíceis de um jeito diferente, criando a distância necessária pra enxergar o que estava difícil de ver de perto. Leia as duas abaixo e reflita sobre como elas se conectam com o que você está vivendo.\n\n"O rio e as pedras" — imagine um rio correndo. As pedras no leito do rio são os pensamentos e lembranças difíceis: elas não vão embora, mas a água segue fluindo ao redor delas, seguindo seu curso. Tentar remover cada pedra do caminho consome uma energia que poderia ir pra seguir fluindo.\n\n"A mala pesada" — imagine que a dor da perda é uma mala pesada que você carrega. No início, é natural segurá-la com as duas mãos, parado. Com o tempo, a mala não fica mais leve de uma vez — mas você aprende a carregá-la de um jeito que deixa uma mão livre pra seguir vivendo, sem soltar o que importa.',
  prompts: [
    {
      id: "conexao",
      label: "Qual das duas metáforas mais se parece com o que você está sentindo? Por quê?",
    },
    {
      id: "propria-metafora",
      label: "Se quiser, crie sua própria metáfora pra descrever como está essa dor hoje.",
    },
  ],
  professionalNote:
    "Objetivo: usar linguagem metafórica pra ajudar o cliente a relativizar e verbalizar uma experiência difícil de nomear diretamente. Aplicação: apresente as metáforas em sessão e explore qual ressoa mais — a metáfora que o próprio cliente cria costuma ser a mais reveladora.",
};

const COPING_SKILLS: Exercise = {
  slug: "habilidades-de-enfrentamento",
  name: "Habilidades de Enfrentamento",
  description:
    "Entenda os dois jeitos mais comuns de lidar com o luto e identifique qual predomina em você agora.",
  category: "clinico",
  instructions:
    "Existem dois tipos amplos de enfrentamento do luto, descritos no modelo do processo dual de Stroebe e Schut (1999): o enfrentamento voltado à perda (focado em expressar e processar a dor emocional) e o enfrentamento voltado à restauração (focado em seguir com a vida prática — trabalho, tarefas do dia a dia). Alternar entre os dois, em vez de travar só num deles, costuma ser mais saudável do que ficar num único extremo.",
  prompts: [
    {
      id: "voltado-perda",
      label:
        "Nos últimos dias, o que você fez que foi mais voltado a sentir e expressar a dor da perda?",
    },
    {
      id: "voltado-restauracao",
      label:
        "E o que você fez que foi mais voltado a seguir com a vida prática (trabalho, tarefas, rotina)?",
    },
    {
      id: "equilibrio",
      label:
        "Olhando pras suas respostas acima, você sente que está mais travado(a) de um lado? O que ajudaria a equilibrar um pouco mais?",
    },
  ],
  professionalNote:
    "Objetivo: apresentar o modelo do processo dual (Stroebe & Schut, 1999) de forma acessível, ajudando o cliente a reconhecer seu padrão predominante de enfrentamento e a necessidade de alternância entre os dois modos. Aplicação: bom exercício pra sessões em que o cliente parece estar rígido demais num só modo (só emoção, sem funcionar no dia a dia, ou só função, sem processar a dor).",
};

const DEALING_WITH_GUILT: Exercise = {
  slug: "lidando-com-a-culpa",
  name: "Lidando com a Culpa",
  description: "Um exercício de reestruturação de pensamentos pra culpa que aparece no luto.",
  category: "clinico",
  instructions:
    "É comum sentir culpa durante o luto — por algo que não foi dito, por decisões tomadas, ou até por sentimentos de raiva ou alívio que pareceram inadequados na hora. Isso não significa que você fez algo errado: é parte normal de como a mente tenta dar sentido a uma perda. Pra cada pensamento de culpa que vier à mente, tente escrever o conselho que você daria a um amigo querido que tivesse esse mesmo pensamento.",
  prompts: [
    { id: "pensamento1", label: "Pensamento de culpa 1" },
    { id: "conselho1", label: "O que você diria a um amigo com esse pensamento?" },
    { id: "pensamento2", label: "Pensamento de culpa 2" },
    { id: "conselho2", label: "O que você diria a um amigo com esse pensamento?" },
    { id: "pensamento3", label: "Pensamento de culpa 3" },
    { id: "conselho3", label: "O que você diria a um amigo com esse pensamento?" },
  ],
  professionalNote:
    "Objetivo: reestruturar pensamentos autopunitivos usando a técnica de distanciamento (responder como se fosse a um amigo), comum em terapia cognitivo-comportamental. Aplicação: use em sessão ou como tarefa pra casa, explicando o racional da técnica antes.",
};

const SUPPORT_NETWORK: Exercise = {
  slug: "minha-rede-de-apoio",
  name: "Minha Rede de Apoio",
  description: "Mapeie as pessoas e os espaços que podem te apoiar agora.",
  category: "clinico",
  instructions:
    "Estar perto de gente querida e falar sobre como você se sente pode ajudar bastante — não se isole nem esconda o que está sentindo. É normal ficar triste diante de uma perda. Pense nas pessoas e nos espaços (família, amigos, trabalho, grupos de apoio, religião, atividades de lazer, profissionais de saúde, escola) que podem ser fontes de apoio pra você agora.",
  prompts: [
    {
      id: "pessoas-proximas",
      label: "Quais pessoas mais próximas vêm à sua cabeça quando você pensa em apoio?",
    },
    {
      id: "espacos",
      label:
        "Que outros espaços ou grupos (trabalho, religião, grupos de apoio, atividades de lazer) podem te ajudar?",
    },
    {
      id: "proximo-passo",
      label: "Qual dessas pessoas ou espaços você consegue procurar essa semana?",
    },
  ],
  professionalNote:
    "Objetivo: tornar concreta e visível a rede de apoio disponível, incentivando o cliente a buscá-la ativamente em vez de se isolar — fator amplamente associado a melhor desfecho no processo de luto. Aplicação: bom exercício pra sessões iniciais ou quando o cliente relata isolamento.",
};

const GRIEF_PSYCHOEDUCATION: Exercise = {
  slug: "psicoeducacao-do-luto",
  name: "Psicoeducação do Luto",
  description:
    "Entenda melhor o que é o luto e os sintomas mais comuns — pra dar mais clareza sobre o que você está vivendo.",
  category: "clinico",
  instructions:
    "Luto é o conjunto de sentimentos que surge depois de uma perda — seja pela morte de alguém, de um animal, o fim de um relacionamento ou a perda de um emprego. Cada pessoa lida com essa dor de um jeito diferente: algumas choram bastante, outras riem como forma de escapar da dor, outras ficam dormentes e não entendem por que não estão reagindo como esperavam. Todas essas formas são normais. Sintomas comuns incluem choque ou dormência inicial, ondas de angústia intensa, dificuldade pra dormir, mudanças de apetite, inquietação, dificuldade de concentração e tristeza profunda. Um dos modelos mais conhecidos pra entender o luto é o de Elisabeth Kübler-Ross, com cinco estágios — negação, raiva, barganha, depressão e aceitação. É importante saber que esses estágios não são uma linha reta: você pode passar por eles fora de ordem, voltar a um estágio anterior, ou não sentir todos eles.",
  prompts: [
    {
      id: "sintomas",
      label:
        "Quais desses sintomas (choque, angústia em ondas, sono, apetite, concentração, tristeza) você reconhece em você agora?",
    },
    {
      id: "estagio",
      label:
        "Olhando pros cinco estágios (negação, raiva, barganha, depressão, aceitação), qual parece mais presente em você hoje?",
    },
    {
      id: "duvidas",
      label: "Alguma dúvida ou desconforto sobre o que está sentindo que você quer trazer pra próxima sessão?",
    },
  ],
  professionalNote:
    "Objetivo: normalizar sintomas do luto e situar o cliente dentro de um modelo teórico conhecido (Kübler-Ross, 1969), sem impor uma progressão linear. Aplicação: bom material de abertura pra clientes recém-chegados ao processo de luto, reduzindo a sensação de estar \"enlouquecendo\" diante de reações normais.",
};

export const EXERCISES: Exercise[] = [
  FAREWELL_LETTER,
  ACCEPTANCE_EXERCISE,
  GOOD_MEMORIES,
  METAPHORS_EXERCISE,
  COPING_SKILLS,
  DEALING_WITH_GUILT,
  SUPPORT_NETWORK,
  GRIEF_PSYCHOEDUCATION,
];

export function getExercise(slug: string): Exercise | undefined {
  return EXERCISES.find((exercise) => exercise.slug === slug);
}

export function isExerciseSlug(value: unknown): value is string {
  return typeof value === "string" && EXERCISES.some((exercise) => exercise.slug === value);
}
