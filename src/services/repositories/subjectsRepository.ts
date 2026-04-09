import { BaseRepository } from '@/services/repositories/baseRepository';
import { TABLES } from '@/database/collections';
import type { MateriaEntity } from '@/types';

class SubjectsRepository extends BaseRepository<MateriaEntity> {
  constructor() {
    super(TABLES.MATERIAS);
  }

  async listOrdered(professorId: string) {
    const items = await this.listByProfessor(professorId);
    return items.sort((left, right) => left.nome.localeCompare(right.nome));
  }

  async listByClass(professorId: string, turmaId: string) {
    const items = await this.listByProfessor(professorId);
    return items
      .filter((item) => item.turmaId === turmaId)
      .sort((left, right) => left.nome.localeCompare(right.nome));
  }
}

export const subjectsRepository = new SubjectsRepository();
