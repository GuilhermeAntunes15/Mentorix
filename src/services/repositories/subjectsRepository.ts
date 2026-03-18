import { BaseRepository } from '@/services/repositories/baseRepository';
import type { MateriaEntity } from '@/types';
import { COLLECTIONS } from '@/database/collections';

class SubjectsRepository extends BaseRepository<MateriaEntity> {
  constructor() {
    super(COLLECTIONS.materias);
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
