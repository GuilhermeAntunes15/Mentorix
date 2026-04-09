import { BaseRepository } from '@/services/repositories/baseRepository';
import { TABLES } from '@/database/collections';
import type { AgendaPessoalEntity, MateriaPessoalEntity } from '@/types';

class PersonalSubjectsRepository extends BaseRepository<MateriaPessoalEntity> {
  constructor() {
    super(TABLES.MATERIAS_PESSOAIS);
  }

  listByUser(professorId: string, userId: string) {
    return this.listByProfessor(professorId, [
      { column: 'user_id', operator: 'eq', value: userId }
    ]);
  }
}

class PersonalAgendaRepository extends BaseRepository<AgendaPessoalEntity> {
  constructor() {
    super(TABLES.AGENDA_PESSOAL);
  }

  listByUser(professorId: string, userId: string) {
    return this.listByProfessor(professorId, [
      { column: 'user_id', operator: 'eq', value: userId }
    ]);
  }
}

export const personalSubjectsRepository = new PersonalSubjectsRepository();
export const personalAgendaRepository = new PersonalAgendaRepository();
