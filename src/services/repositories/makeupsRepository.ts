import { BaseRepository } from '@/services/repositories/baseRepository';
import { TABLES } from '@/database/collections';
import type { EntregaReposicaoEntity, ReposicaoEntity } from '@/types';

class MakeupsRepository extends BaseRepository<ReposicaoEntity> {
  constructor() {
    super(TABLES.REPOSICOES);
  }

  listByClass(professorId: string, turmaId: string) {
    return this.listByProfessor(professorId, [
      { column: 'turma_id', operator: 'eq', value: turmaId }
    ]);
  }
}

class MakeupDeliveriesRepository extends BaseRepository<EntregaReposicaoEntity> {
  constructor() {
    super(TABLES.ENTREGAS_REPOSICAO);
  }

  listByStudent(professorId: string, alunoId: string) {
    return this.listByProfessor(professorId, [
      { column: 'aluno_id', operator: 'eq', value: alunoId }
    ]);
  }
}

export const makeupsRepository = new MakeupsRepository();
export const makeupDeliveriesRepository = new MakeupDeliveriesRepository();
