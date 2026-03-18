import { BaseRepository } from '@/services/repositories/baseRepository';
import type { AulaEntity } from '@/types';
import { COLLECTIONS } from '@/database/collections';
import { getLessonWeekday } from '@/utils/lessons';

class LessonsRepository extends BaseRepository<AulaEntity> {
  constructor() {
    super(COLLECTIONS.aulas);
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
    const weekday = getLessonWeekday(date);
    return items
      .filter((item) => (item.recorrente ? item.diaSemana === weekday : item.data === date))
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
