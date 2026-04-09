import type {
  AgendaPessoalEntity,
  AlunoEntity,
  AulaEntity,
  AtividadeEntity,
  ChamadaEntity,
  AvisoMuralEntity,
  EmpresaCompeticaoEntity,
  MateriaPessoalEntity,
  MateriaEntity,
  PerfilAlunoEntity,
  PontuacaoAlunoEntity,
  QuizEntity,
  ReposicaoEntity,
  TurmaEntity
} from '@/types/entities';

export type TurmaFormValues = Pick<TurmaEntity, 'nome' | 'codigo' | 'periodo' | 'cor' | 'descricao'>;

export type AlunoFormValues = Pick<
  AlunoEntity,
  'nome' | 'email' | 'telefone' | 'responsavel' | 'avatarUrl' | 'observacoes'
>;

export type MateriaFormValues = Pick<MateriaEntity, 'turmaId' | 'nome' | 'codigo' | 'cor' | 'descricao'>;

export type AulaFormValues = Pick<
  AulaEntity,
  'turmaId' | 'materiaId' | 'titulo' | 'descricao' | 'escola' | 'data' | 'diaSemana' | 'recorrente' | 'horaInicio' | 'horaFim' | 'sala' | 'tipo' | 'categoria' | 'gestaoTipo'
> & {
  gradePersonalizada?: boolean;
};

export type ChamadaFormValues = Pick<ChamadaEntity, 'aulaId' | 'dataReferencia' | 'observacoes'>;

export type PerfilAlunoFormValues = Pick<PerfilAlunoEntity, 'perfilTexto'>;

export type QuizFormValues = Pick<QuizEntity, 'turmaId' | 'materiaId' | 'titulo' | 'data' | 'totalQuestoes'>;

export type AtividadeFormValues = Pick<
  AtividadeEntity,
  'turmaId' | 'materiaId' | 'titulo' | 'dataEntrega' | 'notaMaxima'
>;

export type ReposicaoFormValues = Pick<
  ReposicaoEntity,
  'turmaId' | 'materiaId' | 'aulaOriginalId' | 'titulo' | 'data' | 'status'
>;

export type EmpresaCompeticaoFormValues = Pick<
  EmpresaCompeticaoEntity,
  'turmaId' | 'nome' | 'cor' | 'liderAlunoId' | 'pontosComportamento' | 'pontosExtras' | 'observacoes'
>;

export type MateriaPessoalFormValues = Pick<MateriaPessoalEntity, 'userId' | 'nome' | 'cor' | 'descricao'>;

export type AgendaPessoalFormValues = Pick<
  AgendaPessoalEntity,
  'userId' | 'materiaPessoalId' | 'titulo' | 'descricao' | 'data' | 'horaInicio' | 'horaFim'
>;

export type AvisoMuralFormValues = Pick<
  AvisoMuralEntity,
  'tipo' | 'audiencia' | 'targetProfessorId' | 'turmaId' | 'titulo' | 'mensagem'
>;

export type PontuacaoAlunoFormValues = Pick<
  PontuacaoAlunoEntity,
  'alunoId' | 'turmaId' | 'descricao' | 'pontos' | 'data'
>;

export type AvaliacaoAlunoFormValues = {
  alunoId: string;
  turmaId: string;
  notaProvaPaulista: number;
  notaProva: number;
};
