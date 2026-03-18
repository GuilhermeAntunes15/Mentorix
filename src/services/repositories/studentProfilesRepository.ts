import { where } from 'firebase/firestore';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { COLLECTIONS } from '@/database/collections';
import type { PerfilAlunoEntity } from '@/types';

class StudentProfilesRepository extends BaseRepository<PerfilAlunoEntity> {
  constructor() {
    super(COLLECTIONS.perfisAluno);
  }

  async getByStudent(professorId: string, alunoId: string) {
    const profiles = await this.listByProfessor(professorId, [where('alunoId', '==', alunoId)]);
    return profiles[0] ?? null;
  }
}

export const studentProfilesRepository = new StudentProfilesRepository();
