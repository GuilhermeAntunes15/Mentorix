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
  atas: 'atas',
  assinaturasAta: 'assinaturasAta',
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

// Mapeamento de tabelas Supabase (PostgreSQL)
export const TABLES = {
  USERS: 'profiles',
  TURMAS: 'mtx_turmas',
  ALUNOS: 'mtx_alunos',
  ALUNO_TURMA: 'mtx_aluno_turma',
  MATERIAS: 'mtx_materias',
  MATERIAS_PESSOAIS: 'mtx_materias_pessoais',
  AULAS: 'mtx_aulas',
  AGENDA_PESSOAL: 'mtx_agenda_pessoal',
  ANOTACOES_AULA: 'mtx_anotacoes_aula',
  AVISOS_MURAL: 'mtx_avisos_mural',
  CURTIDAS_AVISO_MURAL: 'mtx_curtidas_aviso_mural',
  ATAS: 'mtx_atas',
  ASSINATURAS_ATA: 'mtx_assinaturas_ata',
  EMPRESAS_COMPETICAO: 'mtx_empresas_competicao',
  MEMBROS_EMPRESA_COMPETICAO: 'mtx_membros_empresa_competicao',
  PERFIS_ALUNO: 'mtx_perfis_aluno',
  CHAMADAS: 'mtx_chamadas',
  FREQUENCIAS: 'mtx_frequencias',
  QUIZZES: 'mtx_quizzes',
  TENTATIVAS_QUIZ: 'mtx_tentativas_quiz',
  ATIVIDADES: 'mtx_atividades',
  ENTREGAS_ATIVIDADE: 'mtx_entregas_atividade',
  REPOSICOES: 'mtx_reposicoes',
  ENTREGAS_REPOSICAO: 'mtx_entregas_reposicao',
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];
