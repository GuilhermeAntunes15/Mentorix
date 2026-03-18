import { COLLECTIONS } from '@/database/collections';

// Centraliza o mapeamento das colecoes para facilitar manutencao e regras.
export const firestoreSchema = [
  { collection: COLLECTIONS.users, description: 'Professores e metadados de conta' },
  { collection: COLLECTIONS.avisosMural, description: 'Avisos e comunicados segmentados por turma ou papel' },
  { collection: COLLECTIONS.curtidasAvisoMural, description: 'Curtidas publicas dos avisos do mural' },
  { collection: COLLECTIONS.turmas, description: 'Turmas gerenciadas pelo professor' },
  { collection: COLLECTIONS.alunos, description: 'Cadastro base de alunos' },
  { collection: COLLECTIONS.alunoTurma, description: 'Relacao N:N entre alunos e turmas' },
  { collection: COLLECTIONS.materias, description: 'Materias vinculadas a uma turma' },
  { collection: COLLECTIONS.materiasPessoais, description: 'Materias e disciplinas pessoais do aluno' },
  { collection: COLLECTIONS.aulas, description: 'Aulas previstas e grade personalizada por dia' },
  { collection: COLLECTIONS.agendaPessoal, description: 'Compromissos e planejamento pessoal do aluno' },
  { collection: COLLECTIONS.anotacoesAula, description: 'Planejamento e anotacoes especificas de uma aula em uma data' },
  { collection: COLLECTIONS.empresasCompeticao, description: 'Grupos da competicao organizados por turma' },
  { collection: COLLECTIONS.membrosEmpresaCompeticao, description: 'Alunos vinculados a cada empresa da competicao' },
  { collection: COLLECTIONS.perfisAluno, description: 'Perfil livre e observacoes pedagogicas do aluno' },
  { collection: COLLECTIONS.chamadas, description: 'Cabecalho de chamadas por aula e dia' },
  { collection: COLLECTIONS.frequencias, description: 'Status individual de presenca por aluno' },
  { collection: COLLECTIONS.quizzes, description: 'Avaliacao rapida por materia e turma' },
  { collection: COLLECTIONS.tentativasQuiz, description: 'Resultado individual dos quizzes' },
  { collection: COLLECTIONS.atividades, description: 'Atividades previstas' },
  { collection: COLLECTIONS.entregasAtividade, description: 'Entregas e notas de atividades' },
  { collection: COLLECTIONS.reposicoes, description: 'Aulas de reposicao e seu status' },
  { collection: COLLECTIONS.entregasReposicao, description: 'Controle de reposicoes por aluno' }
] as const;
