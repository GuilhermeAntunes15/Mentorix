export const COLLECTIONS = {
  users: 'users',
  avisosMural: 'avisosMural',
  curtidasAvisoMural: 'curtidasAvisoMural',
  turmas: 'turmas',
  alunos: 'alunos',
  alunoTurma: 'alunoTurma',
  materias: 'materias',
  materiasPessoais: 'materiasPessoais',
  aulas: 'aulas',
  agendaPessoal: 'agendaPessoal',
  anotacoesAula: 'anotacoesAula',
  empresasCompeticao: 'empresasCompeticao',
  membrosEmpresaCompeticao: 'membrosEmpresaCompeticao',
  perfisAluno: 'perfisAluno',
  chamadas: 'chamadas',
  frequencias: 'frequencias',
  quizzes: 'quizzes',
  tentativasQuiz: 'tentativasQuiz',
  atividades: 'atividades',
  entregasAtividade: 'entregasAtividade',
  reposicoes: 'reposicoes',
  entregasReposicao: 'entregasReposicao'
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
