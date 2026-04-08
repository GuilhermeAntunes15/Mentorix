export type EntityId = string;
export type ISODateString = string;

export type AttendanceStatus = 'nao_iniciada' | 'em_andamento' | 'concluida';
export type PresenceStatus = 'presente' | 'ausente' | 'justificado';
export type LessonType = 'regular' | 'reposicao' | 'quiz' | 'atividade';
export type LessonCategory = 'aula' | 'gestao';
export type ManagementTaskType = 'PAEET' | 'ATPC' | 'GESTAO';
export type DeliveryStatus = 'pendente' | 'entregue' | 'corrigido';
export type MakeupStatus = 'pendente' | 'feito' | 'cancelado';
export type CompetitionViewMode = 'professor' | 'aluno';
export type UserRole = 'admin' | 'professor' | 'aluno';
export type NoticeType = 'importante' | 'aviso' | 'evento';
export type NoticeAudience = 'todas_turmas' | 'turma' | 'professor';
export type AtaStatus = 'rascunho' | 'aguardando_assinaturas' | 'assinada_parcialmente' | 'concluida';

export interface SubjectAssignment {
  key: string;
  nome: string;
  codigo: string;
  cor: string;
  descricao?: string;
}

export interface SharedClassDraft {
  syncKey?: string;
  nome: string;
  codigo: string;
  periodo: string;
  cor: string;
  descricao?: string;
}

export type ManagedUserProvisionInput =
  | {
      role: 'professor';
      displayName: string;
      email: string;
      password: string;
    }
  | {
      role: 'aluno';
      displayName: string;
      email: string;
      password: string;
      classAssignment: SharedClassDraft;
    };

export interface BaseEntity {
  id: EntityId;
  professorId: EntityId;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface UserEntity extends BaseEntity {
  authUid: string;
  role: UserRole;
  displayName: string;
  email: string;
  username?: string;
  avatarKey?: string;
  linkedStudentId?: string;
  studentSyncKey?: string;
  targetProfessorId?: string;
  profileCompleted?: boolean;
  avatarUrl?: string;
  assignedSubjects?: SubjectAssignment[];
}

export interface TurmaEntity extends BaseEntity {
  nome: string;
  codigo: string;
  periodo: string;
  cor: string;
  descricao?: string;
  managedByAdmin?: boolean;
  syncKey?: string;
}

export interface AlunoEntity extends BaseEntity {
  nome: string;
  email?: string;
  telefone?: string;
  avatarUrl?: string;
  responsavel?: string;
  observacoes?: string;
  managedByAdmin?: boolean;
  syncKey?: string;
}

export interface AlunoTurmaEntity extends BaseEntity {
  alunoId: EntityId;
  turmaId: EntityId;
  ativo: boolean;
  entrouEm: ISODateString;
  managedByAdmin?: boolean;
}

export interface MateriaEntity extends BaseEntity {
  turmaId: EntityId;
  nome: string;
  codigo: string;
  cor: string;
  descricao?: string;
  managedByAdmin?: boolean;
  templateKey?: string;
}

export interface MateriaPessoalEntity extends BaseEntity {
  userId: EntityId;
  nome: string;
  cor: string;
  descricao?: string;
}

export interface AulaEntity extends BaseEntity {
  turmaId?: EntityId;
  materiaId?: EntityId;
  titulo: string;
  descricao?: string;
  escola?: string;
  data: ISODateString;
  datasIgnoradas?: ISODateString[];
  diaSemana: number;
  recorrente: boolean;
  horaInicio: string;
  horaFim: string;
  sala?: string;
  categoria: LessonCategory;
  gestaoTipo?: ManagementTaskType;
  tipo: LessonType;
  gradePersonalizada: boolean;
}

export interface AgendaPessoalEntity extends BaseEntity {
  userId: EntityId;
  materiaPessoalId?: EntityId;
  titulo: string;
  descricao?: string;
  data: ISODateString;
  horaInicio?: string;
  horaFim?: string;
}

export interface AnotacaoAulaEntity extends BaseEntity {
  aulaId: EntityId;
  dataReferencia: ISODateString;
  conteudoHtml: string;
}

export interface AtaEntity extends BaseEntity {
  titulo: string;
  conteudoHtml: string;
  criadoPorUserId: EntityId;
  criadoPorNome: string;
  destinatarioUserIds: EntityId[];
  participantUserIds: EntityId[];
  contentHash: string;
  lockedAt?: ISODateString;
}

export interface AtaAssinaturaEntity extends BaseEntity {
  ataId: EntityId;
  ownerProfessorId: EntityId;
  signedByUserId: EntityId;
  signedByName: string;
  signedByEmail?: string;
  signedAt: ISODateString;
  contentHashAtSignature: string;
  proofHash: string;
  signatureHash: string;
}

export interface EmpresaCompeticaoEntity extends BaseEntity {
  turmaId: EntityId;
  nome: string;
  cor: string;
  liderAlunoId?: EntityId;
  pontosComportamento: number;
  pontosExtras: number;
  observacoes?: string;
}

export interface MembroEmpresaCompeticaoEntity extends BaseEntity {
  empresaId: EntityId;
  turmaId: EntityId;
  alunoId: EntityId;
}

export interface PerfilAlunoEntity extends BaseEntity {
  alunoId: EntityId;
  perfilTexto: string;
}

export interface AvisoMuralEntity extends BaseEntity {
  criadoPorUserId: EntityId;
  criadoPorNome: string;
  criadoPorRole: UserRole;
  tipo: NoticeType;
  audiencia: NoticeAudience;
  targetProfessorId?: EntityId;
  turmaId?: EntityId;
  titulo: string;
  mensagem: string;
}

export interface CurtidaAvisoMuralEntity extends BaseEntity {
  avisoId: EntityId;
  userId: EntityId;
  username: string;
}

export interface ChamadaEntity extends BaseEntity {
  aulaId: EntityId;
  dataReferencia: ISODateString;
  retroativa: boolean;
  status: AttendanceStatus;
  observacoes?: string;
}

export interface FrequenciaEntity extends BaseEntity {
  chamadaId: EntityId;
  aulaId: EntityId;
  alunoId: EntityId;
  status: PresenceStatus;
}

export interface QuizEntity extends BaseEntity {
  turmaId: EntityId;
  materiaId: EntityId;
  titulo: string;
  data: ISODateString;
  totalQuestoes: number;
}

export interface TentativaQuizEntity extends BaseEntity {
  quizId: EntityId;
  alunoId: EntityId;
  turmaId: EntityId;
  realizado: boolean;
  acertouDePrimeira: boolean;
  acertos: number;
  tentativas: number;
}

export interface AtividadeEntity extends BaseEntity {
  turmaId: EntityId;
  materiaId: EntityId;
  titulo: string;
  dataEntrega: ISODateString;
  notaMaxima?: number;
}

export interface EntregaAtividadeEntity extends BaseEntity {
  atividadeId: EntityId;
  alunoId: EntityId;
  status: DeliveryStatus;
  nota?: number;
  entregueEm?: ISODateString;
}

export interface ReposicaoEntity extends BaseEntity {
  turmaId: EntityId;
  materiaId: EntityId;
  aulaOriginalId?: EntityId;
  titulo: string;
  data: ISODateString;
  status: MakeupStatus;
}

export interface EntregaReposicaoEntity extends BaseEntity {
  reposicaoId: EntityId;
  alunoId: EntityId;
  status: DeliveryStatus;
  entregueEm?: ISODateString;
}

export interface DayLessonView {
  dataReferencia: ISODateString;
  aula: AulaEntity;
  turma?: TurmaEntity;
  materia?: MateriaEntity;
  chamada?: ChamadaEntity;
}

export interface StudentDashboardMetrics {
  totalQuizzesFeitos: number;
  acertouDePrimeira: number;
  percentualAcertoPrimeira: number;
  mediaQuizzesTurma: number;
  totalAtividadesEsperadas: number;
  totalAtividadesEntregues: number;
  totalAtividadesPendentes: number;
  mediaAtividades: number;
}

export interface StudentDetailBundle {
  aluno: AlunoEntity;
  perfil?: PerfilAlunoEntity;
  turmas: TurmaEntity[];
  materias: MateriaEntity[];
  aulas: AulaEntity[];
  chamadas: ChamadaEntity[];
  frequencias: FrequenciaEntity[];
  quizzesCatalogo: QuizEntity[];
  quizzes: TentativaQuizEntity[];
  quizzesPendentes: Array<{ quiz: QuizEntity; materia?: MateriaEntity; tentativa?: TentativaQuizEntity }>;
  atividades: EntregaAtividadeEntity[];
  atividadesPendentes: Array<{ atividade: AtividadeEntity; entrega?: EntregaAtividadeEntity; materia?: MateriaEntity }>;
  reposicoes: ReposicaoEntity[];
  entregasReposicao: EntregaReposicaoEntity[];
}

export interface CompetitionScoreBreakdown {
  atividadesEquipe: number;
  mediaAtividades: number;
  quizzesFeitos: number;
  quizzesCorretos: number;
  comportamento: number;
  extras: number;
  total: number;
  mediaNotasAtividades: number;
  taxaAtividadesEquipe: number;
  taxaQuizzesFeitos: number;
  taxaQuizzesCorretos: number;
}

export interface CompetitionCompanyStanding {
  empresa: EmpresaCompeticaoEntity;
  membros: MembroEmpresaCompeticaoEntity[];
  alunos: AlunoEntity[];
  lider?: AlunoEntity;
  pontuacao: CompetitionScoreBreakdown;
}

export interface AppSession {
  authUid: string;
  role: UserRole;
  profile: UserEntity;
  professorId: string;
  alunoId?: string;
  displayName: string;
  username: string;
}
