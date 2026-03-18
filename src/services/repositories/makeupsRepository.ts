import { where } from 'firebase/firestore';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { COLLECTIONS } from '@/database/collections';
import type { EntregaReposicaoEntity, ReposicaoEntity } from '@/types';

class MakeupsRepository extends BaseRepository<ReposicaoEntity> {
  constructor() {
    super(COLLECTIONS.reposicoes);
  }

  listByClass(professorId: string, turmaId: string) {
    return this.listByProfessor(professorId, [where('turmaId', '==', turmaId)]);
  }
}

class MakeupDeliveriesRepository extends BaseRepository<EntregaReposicaoEntity> {
  constructor() {
    super(COLLECTIONS.entregasReposicao);
  }

  listByStudent(professorId: string, alunoId: string) {
    return this.listByProfessor(professorId, [where('alunoId', '==', alunoId)]);
  }
}

export const makeupsRepository = new MakeupsRepository();
export const makeupDeliveriesRepository = new MakeupDeliveriesRepository();
