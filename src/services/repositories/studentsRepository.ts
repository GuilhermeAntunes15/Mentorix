import { where } from 'firebase/firestore';
import { BaseRepository } from '@/services/repositories/baseRepository';
import type { AlunoEntity, AlunoTurmaEntity } from '@/types';
import { COLLECTIONS } from '@/database/collections';

class StudentsRepository extends BaseRepository<AlunoEntity> {
  constructor() {
    super(COLLECTIONS.alunos);
  }

  async listOrdered(professorId: string) {
    const items = await this.listByProfessor(professorId);
    return items.sort((left, right) => left.nome.localeCompare(right.nome));
  }
}

class StudentClassRepository extends BaseRepository<AlunoTurmaEntity> {
  constructor() {
    super(COLLECTIONS.alunoTurma);
  }

  listByClass(professorId: string, turmaId: string) {
    return this.listByProfessor(professorId, [where('turmaId', '==', turmaId)]);
  }

  listByStudent(professorId: string, alunoId: string) {
    return this.listByProfessor(professorId, [where('alunoId', '==', alunoId)]);
  }
}

export const studentsRepository = new StudentsRepository();
export const studentClassRepository = new StudentClassRepository();
