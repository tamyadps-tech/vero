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
    "É comum evitar contato com tudo que lembra a pessoa que se foi — é uma defesa normal, mas viver em negação por muito tempo pode alongar o sofrimento. Escrever uma carta pra essa pessoa é uma forma de colocar em palavras o que ficou represado, mesmo sabendo que ela nunca vai ler.\n\nNão existe um jeito certo de escrever. Algumas ideias, se ajudarem a começar: algo que você nunca teve chance de dizer; uma lembrança específica que você queria contar pra ela; um pedido de perdão, seu ou dela; um agradecimento; ou simplesmente como está sendo a vida sem ela. Pode ser formal ou uma conversa solta, como se ela estivesse ali ouvindo.\n\nDepois de escrever, você decide o que fazer com a carta — guardar, ler em voz alta sozinho(a), deixar num lugar que tenha significado (o túmulo, um lugar querido), prender numa carta amarrada a um balão, colocar numa garrafa, ou até destruir simbolicamente (queimar, rasgar). Nenhuma dessas opções é mais \"certa\" que outra — o que importa é o processo de escrever, não o que acontece com o papel depois.",
  prompts: [
    {
      id: "carta",
      label: "Sua carta",
      placeholder: "Comece do jeito que quiser — não existe forma certa.",
    },
    {
      id: "depois",
      label: "O que você pretende fazer com essa carta, e o que espera sentir depois de escrevê-la?",
    },
  ],
  professionalNote:
    "Objetivo: ajudar o cliente a colocar em palavras sentimentos não elaborados em relação à perda, usando a carta como um continente simbólico pra conteúdos difíceis de verbalizar diretamente em sessão. Aplicação: explique o exercício e ofereça como atividade em sessão ou tarefa pra casa, sem pressa de compartilhar o conteúdo se o cliente preferir manter em sigilo — o valor terapêutico está no ato de escrever, não na leitura compartilhada. Vale perguntar na sessão seguinte como foi a experiência de escrever, mesmo sem ler o conteúdo.",
};

const ACCEPTANCE_EXERCISE: Exercise = {
  slug: "exercicio-da-aceitacao",
  name: "Exercício da Aceitação",
  description:
    "Um espaço pra reconhecer e nomear as emoções ligadas à perda, em vez de evitá-las.",
  category: "clinico",
  instructions:
    "Negar uma emoção por ela ser desconfortável é comum, mas não ajuda a elaborar o luto — só adia o encontro com ela. Sentir as emoções, todas elas, é o caminho pra aprender a conviver com elas sem ser dominado por elas.\n\nEvitar costuma aparecer de formas sutis: mudar de assunto quando alguém fala da pessoa que você perdeu, se manter ocupado(a) o tempo todo pra não pensar, evitar lugares ou objetos que lembrem a perda, ou até minimizar o quanto isso te afeta quando alguém pergunta como você está. Nada disso é errado — são formas naturais de se proteger — mas, mantidas por muito tempo, podem prolongar o sofrimento em vez de aliviá-lo.\n\n\"Aceitar\" aqui não significa concordar com a perda, gostar dela, ou parar de sentir saudade. Significa parar de gastar energia lutando contra o fato de que ela aconteceu, pra poder usar essa energia em viver.",
  prompts: [
    { id: "emocoes", label: "Que emoções aparecem quando você pensa na sua perda?" },
    {
      id: "corpo",
      label: "Onde no corpo você sente essas emoções? (aperto no peito, nó na garganta, cansaço...)",
    },
    {
      id: "evitacao",
      label: "Existe algo que você evita fazer, ver, ou falar sobre por causa dessa perda?",
    },
    {
      id: "custo",
      label: "O que essa evitação custa pra você hoje — o que ela te impede de fazer ou sentir?",
    },
    {
      id: "aceitacao",
      label: "O que mudaria se você permitisse sentir essas emoções sem julgá-las?",
    },
  ],
  professionalNote:
    "Objetivo: favorecer o contato com emoções e comportamentos de evitação relacionados à perda, como primeiro passo pra aceitação. A pergunta sobre o \"custo\" da evitação ajuda o cliente a enxergar concretamente o preço de continuar evitando, o que costuma aumentar a motivação pra mudança. Aplicação: use em sessão ou como tarefa, sempre validando que não existe emoção errada — o objetivo não é sentir menos, é parar de lutar contra o que já se sente.",
};

const GOOD_MEMORIES: Exercise = {
  slug: "boas-recordacoes",
  name: "Exercício das Boas Recordações",
  description: "Reúna boas lembranças da pessoa que você perdeu.",
  category: "clinico",
  instructions:
    "É comum que, logo após uma perda, as lembranças mais presentes sejam as últimas — a doença, a despedida, os detalhes difíceis. Esse exercício convida a abrir espaço pra outras lembranças, que também são verdadeiras e fazem parte da história.\n\nSe tiver uma foto ou objeto que lembre a pessoa, pode ajudar a ancorar essa reflexão — separe ele por perto antes de começar. Depois, liste boas recordações que vêm à mente: podem ser grandes marcos (uma viagem, uma comemoração) ou pequenos detalhes do dia a dia (um jeito de rir, uma frase que ela sempre dizia, um cheiro, uma comida). Não precisa ser em ordem cronológica nem seguir um critério — só o que surgir.",
  prompts: [
    { id: "recordacao1", label: "Recordação 1" },
    { id: "recordacao2", label: "Recordação 2" },
    { id: "recordacao3", label: "Recordação 3" },
    { id: "recordacao4", label: "Recordação 4" },
    { id: "recordacao5", label: "Recordação 5" },
    { id: "recordacao6", label: "Recordação 6" },
    {
      id: "padrao",
      label:
        "Olhando pras suas recordações, existe algo em comum entre elas — o que elas dizem sobre o que você mais valorizava nessa relação?",
    },
  ],
  professionalNote:
    "Objetivo: favorecer o contato com a realidade da perda de um jeito menos ressentido, reconectando com aspectos positivos da relação em vez de fixar só nos momentos finais/difíceis. A pergunta de fechamento sobre o padrão comum entre as recordações costuma revelar o que especificamente está sendo elaborado no luto (companheirismo, cuidado, humor, segurança). Aplicação: pode ser usado em sessão ou como atividade pra casa; se o cliente travar, sugerir categorias (uma lembrança engraçada, um conselho que ela deu, um momento de cuidado) costuma destravar.",
};

const METAPHORS_EXERCISE: Exercise = {
  slug: "exercicio-das-metaforas",
  name: "Exercício das Metáforas",
  description: "Três metáforas pra pensar a dor de outros ângulos.",
  category: "clinico",
  instructions:
    'Metáforas ajudam a olhar pra experiências difíceis de um jeito diferente, criando a distância necessária pra enxergar o que estava difícil de ver de perto — às vezes uma imagem explica o que palavras diretas não conseguem. Leia as três abaixo e reflita sobre como cada uma se conecta (ou não) com o que você está vivendo.\n\n"O rio e as pedras" — imagine um rio correndo. As pedras no leito do rio são os pensamentos e lembranças difíceis: elas não vão embora, mas a água segue fluindo ao redor delas, seguindo seu curso. Tentar remover cada pedra do caminho consome uma energia que poderia ir pra seguir fluindo. Com o tempo, a água também molda as pedras — não as destrói, mas as suaviza.\n\n"A mala pesada" — imagine que a dor da perda é uma mala pesada que você carrega. No início, é natural segurá-la com as duas mãos, parado, sem conseguir fazer mais nada. Com o tempo, a mala não fica mais leve de uma vez — mas você aprende a carregá-la de um jeito que deixa uma mão livre pra seguir vivendo, sem soltar o que importa e sem fingir que ela não pesa.\n\n"A maré" — o luto, no início, parece uma onda gigante que engole tudo, sem pausa. Com o tempo, ele não desaparece, mas passa a vir e ir como a maré: períodos de calmaria intercalados com ondas que voltam, às vezes sem aviso — um cheiro, uma data, uma música. As ondas de dor não significam que você não avançou; elas fazem parte do mesmo mar.',
  prompts: [
    {
      id: "conexao",
      label:
        "Qual das três metáforas mais se parece com o que você está sentindo agora? Por quê?",
    },
    {
      id: "momento-atual",
      label:
        "Em que momento dessa metáfora você diria que está hoje — segurando a mala parado(a), aprendendo a carregá-la, sentindo a maré alta ou baixa?",
    },
    {
      id: "propria-metafora",
      label: "Se quiser, crie sua própria metáfora pra descrever como está essa dor hoje.",
    },
  ],
  professionalNote:
    "Objetivo: usar linguagem metafórica pra ajudar o cliente a relativizar e verbalizar uma experiência difícil de nomear diretamente, e a normalizar a natureza não-linear do luto (a metáfora da maré é especialmente útil pra clientes angustiados por \"terem piorado\" depois de um período de melhora). Aplicação: apresente as metáforas em sessão e explore qual ressoa mais — a metáfora que o próprio cliente cria costuma ser a mais reveladora e vale explorar em profundidade.",
};

const COPING_SKILLS: Exercise = {
  slug: "habilidades-de-enfrentamento",
  name: "Habilidades de Enfrentamento",
  description:
    "Entenda os dois jeitos mais comuns de lidar com o luto e identifique qual predomina em você agora.",
  category: "clinico",
  instructions:
    "Existem dois tipos amplos de enfrentamento do luto, descritos no modelo do processo dual de Stroebe e Schut (1999) — uma das teorias mais usadas hoje pra entender como as pessoas se adaptam a uma perda.\n\nO enfrentamento voltado à perda é focado em expressar e processar a dor emocional: chorar, lembrar, falar sobre a pessoa que se foi, revisitar memórias, sentir a falta. O enfrentamento voltado à restauração é focado em seguir com a vida prática: trabalhar, cuidar da casa, resolver questões burocráticas, aprender novos papéis que a perda exigiu, criar uma nova rotina.\n\nA teoria propõe que o saudável não é escolher um dos dois modos e ficar nele — é oscilar entre eles. Em alguns momentos você precisa mergulhar na dor; em outros, precisa se distanciar dela pra dar conta da vida. Travar só num modo costuma trazer problemas: travar só no enfrentamento voltado à perda pode dificultar funcionar no dia a dia; travar só no enfrentamento voltado à restauração pode significar que a dor está sendo empurrada pra baixo do tapete, sem ser realmente processada.",
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
      id: "padrao-dominante",
      label:
        "Olhando pras suas respostas acima, você sente que está mais travado(a) de um lado? Como isso tem aparecido no seu dia a dia?",
    },
    {
      id: "equilibrio",
      label:
        "O que ajudaria você a se permitir mais o lado que está menos presente essa semana?",
    },
  ],
  professionalNote:
    "Objetivo: apresentar o modelo do processo dual (Stroebe & Schut, 1999) de forma acessível, ajudando o cliente a reconhecer seu padrão predominante de enfrentamento e a necessidade de oscilação entre os dois modos, em vez de buscar ficar só num deles. Aplicação: bom exercício pra sessões em que o cliente parece estar rígido demais num só modo (só emoção, sem funcionar no dia a dia, ou só função, sem processar a dor) — a pergunta de equilíbrio abre espaço pra planejar, junto com o cliente, um passo concreto pra reintroduzir o modo ausente.",
};

const DEALING_WITH_GUILT: Exercise = {
  slug: "lidando-com-a-culpa",
  name: "Lidando com a Culpa",
  description: "Um exercício de reestruturação de pensamentos pra culpa que aparece no luto.",
  category: "clinico",
  instructions:
    "É comum sentir culpa durante o luto, mesmo quando não há nada de fato errado que tenha sido feito. Algumas origens comuns: algo que não foi dito a tempo; visitas ou ligações que não foram feitas com a frequência que se gostaria; decisões tomadas durante um tratamento ou processo de doença; ou até sentimentos de raiva ou alívio que pareceram inadequados no momento (é possível sentir alívio pelo fim do sofrimento de alguém, por exemplo, e ainda assim sentir uma culpa profunda por esse alívio).\n\nNada disso significa que você fez algo errado — é parte de como a mente tenta dar sentido a uma perda, procurando algo que poderia ter sido controlado, porque isso é menos assustador do que aceitar que algumas coisas simplesmente fogem do nosso controle.\n\nPra cada pensamento de culpa que vier à mente, tente escrever o conselho que você daria a um amigo querido que tivesse contado exatamente esse mesmo pensamento pra você. Costuma ser mais fácil ter compaixão pelos outros do que por si mesmo — esse exercício empresta essa compaixão de volta pra você.",
  prompts: [
    { id: "pensamento1", label: "Pensamento de culpa 1" },
    { id: "conselho1", label: "O que você diria a um amigo com esse pensamento?" },
    { id: "pensamento2", label: "Pensamento de culpa 2" },
    { id: "conselho2", label: "O que você diria a um amigo com esse pensamento?" },
    { id: "pensamento3", label: "Pensamento de culpa 3" },
    { id: "conselho3", label: "O que você diria a um amigo com esse pensamento?" },
    { id: "pensamento4", label: "Pensamento de culpa 4" },
    { id: "conselho4", label: "O que você diria a um amigo com esse pensamento?" },
    { id: "pensamento5", label: "Pensamento de culpa 5" },
    { id: "conselho5", label: "O que você diria a um amigo com esse pensamento?" },
  ],
  professionalNote:
    "Objetivo: reestruturar pensamentos autopunitivos usando a técnica de distanciamento (responder como se fosse a um amigo), comum em terapia cognitivo-comportamental — o distanciamento reduz a carga emocional o suficiente pra permitir uma resposta mais razoável do que a autocrítica automática. Aplicação: use em sessão ou como tarefa pra casa, explicando o racional da técnica antes; se o cliente tiver dificuldade em preencher todos os 5 pares, tudo bem — mesmo 1 ou 2 já trazem material rico pra sessão. Fique atento a culpa que mascara raiva não resolvida (com a pessoa que morreu, ou com a situação) — é um padrão comum que vale explorar.",
};

const SUPPORT_NETWORK: Exercise = {
  slug: "minha-rede-de-apoio",
  name: "Minha Rede de Apoio",
  description: "Mapeie as pessoas e os espaços que podem te apoiar agora.",
  category: "clinico",
  instructions:
    "Estar perto de gente querida e falar sobre como você se sente pode ajudar bastante — não se isole nem esconda o que está sentindo. É normal ficar triste diante de uma perda, e buscar apoio não é fraqueza.\n\nO apoio pode vir de fontes bem diferentes — pense em cada uma das áreas abaixo e quem ou o quê, especificamente, poderia te apoiar em cada uma delas agora. Nem toda área vai ter alguém disponível, e tudo bem — o objetivo é mapear o que você já tem, pra usar mais ativamente, não preencher tudo a força.",
  prompts: [
    { id: "familia", label: "Família: quem você pode procurar?" },
    { id: "amigos", label: "Amigos: quem você pode procurar?" },
    { id: "trabalho-escola", label: "Trabalho ou escola: existe alguém ali que te apoiaria?" },
    {
      id: "religiao-espiritualidade",
      label: "Religião ou espiritualidade: isso é uma fonte de apoio pra você? De que forma?",
    },
    {
      id: "grupos-de-apoio",
      label: "Grupos de apoio (de luto ou outros): você conhece algum, ou vale procurar um?",
    },
    {
      id: "profissionais-de-saude",
      label: "Profissionais de saúde: além daqui, tem mais alguém acompanhando você?",
    },
    {
      id: "atividades-de-lazer",
      label: "Atividades de lazer: existe algo que te faz bem e que você pode retomar ou manter?",
    },
    {
      id: "proximo-passo",
      label: "De tudo isso, qual você consegue procurar essa semana?",
    },
  ],
  professionalNote:
    "Objetivo: tornar concreta e visível a rede de apoio disponível em cada uma das principais áreas da vida, incentivando o cliente a buscá-la ativamente em vez de se isolar — fator amplamente associado a melhor desfecho no processo de luto. Aplicação: bom exercício pra sessões iniciais ou quando o cliente relata isolamento; áreas que ficam em branco são, em si, informação útil sobre onde a rede de apoio do cliente está mais frágil e pode precisar ser construída.",
};

const GRIEF_PSYCHOEDUCATION: Exercise = {
  slug: "psicoeducacao-do-luto",
  name: "Psicoeducação do Luto",
  description:
    "Entenda melhor o que é o luto, os sintomas mais comuns e os cinco estágios de Kübler-Ross — pra dar mais clareza sobre o que você está vivendo.",
  category: "clinico",
  instructions:
    "Luto é o conjunto de sentimentos que surge depois de uma perda — seja pela morte de alguém, de um animal, o fim de um relacionamento ou a perda de um emprego. Cada pessoa lida com essa dor de um jeito diferente: algumas choram bastante, outras riem como forma de escapar da dor, outras ficam dormentes e não entendem por que não estão reagindo como esperavam. Todas essas formas são normais.\n\nSintomas comuns incluem: choque ou dormência logo após a perda; ondas de angústia intensa que costumam durar de 20 a 60 minutos e vêm acompanhadas de desconforto físico (aperto na garganta, falta de ar); dificuldade pra dormir; mudanças de apetite; inquietação; dificuldade de concentração; e tristeza profunda.\n\nUm dos modelos mais conhecidos pra entender o luto é o de Elisabeth Kübler-Ross, com cinco estágios:\n\nNegação — a dificuldade inicial de acreditar que a perda é real; um jeito da mente se proteger de um choque grande demais pra processar de uma vez.\n\nRaiva — frustração e revolta, que podem ser direcionadas a si mesmo, a outras pessoas, à pessoa que se foi, ou a uma força maior (Deus, o destino, a vida).\n\nBarganha — tentativas mentais de negociar a realidade, com pensamentos do tipo \"e se eu tivesse feito diferente\" ou \"eu faria qualquer coisa pra mudar isso\".\n\nDepressão — a tristeza profunda que aparece quando a realidade da perda começa a se assentar de verdade.\n\nAceitação — não significa \"estar bem\" com a perda ou parar de sentir saudade; significa conseguir seguir vivendo integrando essa realidade à sua vida.\n\nÉ importante saber que esses estágios não são uma linha reta: você pode passar por eles fora de ordem, voltar a um estágio anterior, sentir vários ao mesmo tempo, ou não sentir todos eles. Não existe um jeito \"certo\" ou um prazo correto de atravessar o luto.",
  prompts: [
    {
      id: "sintomas",
      label:
        "Quais desses sintomas (choque, angústia em ondas, sono, apetite, concentração, tristeza) você reconhece em você agora?",
    },
    {
      id: "estagio-presente",
      label:
        "Olhando pros cinco estágios (negação, raiva, barganha, depressão, aceitação), qual parece mais presente em você hoje?",
    },
    {
      id: "estagio-dificil",
      label: "Algum desses estágios tem sido particularmente difícil ou assustador de sentir? Por quê?",
    },
    {
      id: "duvidas",
      label:
        "Alguma dúvida ou desconforto sobre o que está sentindo que você quer trazer pra próxima sessão?",
    },
  ],
  professionalNote:
    "Objetivo: normalizar sintomas do luto e situar o cliente dentro de um modelo teórico conhecido (Kübler-Ross, 1969), sem impor uma progressão linear ou um prazo — mal-entendidos comuns sobre esse modelo (achar que os estágios são sequenciais e obrigatórios) podem gerar culpa ou confusão adicional no cliente, então vale desfazer essa expectativa explicitamente em sessão. Aplicação: bom material de abertura pra clientes recém-chegados ao processo de luto, reduzindo a sensação de estar \"enlouquecendo\" diante de reações normais; a pergunta sobre o estágio mais difícil costuma abrir a porta pra explorar o que especificamente está mais doendo agora.",
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
