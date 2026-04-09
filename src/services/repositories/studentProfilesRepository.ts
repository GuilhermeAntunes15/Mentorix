import { BaseRepository } from '@/services/repositories/baseRepository';
import { TABLES } from '@/database/collections';
import type { PerfilAlunoEntity } from '@/types';

class StudentProfilesRepository extends BaseRepository<PerfilAlunoEntity> {
  constructor() {
    super(TABLES.PERFIS_ALUNO);
  }

  async getByStudent(professorId: string, alunoId: string) {
    const profiles = await this.listByProfessor(professorId, [
      { column: 'aluno_id', operator: 'eq', value: alunoId }
    ]);
    return profiles[0] ?? null;
  }
}

export const studentProfilesRepository = new StudentProfilesRepository();
