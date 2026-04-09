import { BaseRepository } from '@/services/repositories/baseRepository';
import { TABLES } from '@/database/collections';
import { isLessonScheduledForDate } from '@/utils/lessons';
import type { AulaEntity } from '@/types';

class LessonsRepository extends BaseRepository<AulaEntity> {
  constructor() {
    super(TABLES.AULAS);
  }

  async listOrdered(professorId: string) {
    const items = await this.listByProfessor(professorId);
    return items.sort((left, right) =>
      `${left.diaSemana}-${left.horaInicio}-${left.data}`.localeCompare(
        `${right.diaSemana}-${right.horaInicio}-${right.data}`
      )
    );
  }

  async listByDate(professorId: string, date: string) {
    const items = await this.listByProfessor(professorId);
    return items
      .filter((item) => isLessonScheduledForDate(item, date))
      .sort((left, right) => left.horaInicio.localeCompare(right.horaInicio));
  }

  async listByClass(professorId: string, turmaId: string) {
    const items = await this.listByProfessor(professorId);
    return items
      .filter((item) => item.turmaId === turmaId)
      .sort((left, right) =>
        `${left.diaSemana}-${left.horaInicio}-${left.data}`.localeCompare(
          `${right.diaSemana}-${right.horaInicio}-${right.data}`
        )
      );
  }
}

export const lessonsRepository = new LessonsRepository();
