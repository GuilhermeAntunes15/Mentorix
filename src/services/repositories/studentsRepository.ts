import { BaseRepository, type SupabaseFilter } from '@/services/repositories/baseRepository';
import { TABLES } from '@/database/collections';
import type { AlunoEntity, AlunoTurmaEntity } from '@/types';

class StudentsRepository extends BaseRepository<AlunoEntity> {
  constructor() {
    super(TABLES.ALUNOS);
  }

  async listOrdered(professorId: string) {
    const items = await this.listByProfessor(professorId);
    return items.sort((left, right) => left.nome.localeCompare(right.nome));
  }
}

class StudentClassRepository extends BaseRepository<AlunoTurmaEntity> {
  constructor() {
    super(TABLES.ALUNO_TURMA);
  }

  listByClass(professorId: string, turmaId: string) {
    return this.listByProfessor(professorId, [
      { column: 'turma_id', operator: 'eq', value: turmaId }
    ]);
  }

  listByStudent(professorId: string, alunoId: string) {
    return this.listByProfessor(professorId, [
      { column: 'aluno_id', operator: 'eq', value: alunoId }
    ]);
  }
}

export const studentsRepository = new StudentsRepository();
export const studentClassRepository = new StudentClassRepository();
