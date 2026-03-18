import { where } from 'firebase/firestore';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { COLLECTIONS } from '@/database/collections';
import type { AgendaPessoalEntity, MateriaPessoalEntity } from '@/types';

class PersonalSubjectsRepository extends BaseRepository<MateriaPessoalEntity> {
  constructor() {
    super(COLLECTIONS.materiasPessoais);
  }

  listByUser(professorId: string, userId: string) {
    return this.listByProfessor(professorId, [where('userId', '==', userId)]);
  }
}

class PersonalAgendaRepository extends BaseRepository<AgendaPessoalEntity> {
  constructor() {
    super(COLLECTIONS.agendaPessoal);
  }

  listByUser(professorId: string, userId: string) {
    return this.listByProfessor(professorId, [where('userId', '==', userId)]);
  }
}

export const personalSubjectsRepository = new PersonalSubjectsRepository();
export const personalAgendaRepository = new PersonalAgendaRepository();
