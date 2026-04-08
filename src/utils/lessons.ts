import type { AulaEntity, LessonCategory, LessonType, ManagementTaskType, MateriaEntity, TurmaEntity } from '@/types';
import { getDay } from 'date-fns';

export interface LessonDraftInput {
  data: string;
  diaSemana: number;
  turmaId?: string;
  materiaId?: string;
  escola: string;
  horaInicio: string;
  horaFim: string;
  descricao: string;
  categoria: LessonCategory;
  gestaoTipo?: ManagementTaskType;
  titulo?: string;
  tipo: LessonType;
}

export function buildLessonTitle(materia?: MateriaEntity, turma?: TurmaEntity, customTitle?: string) {
  if (customTitle?.trim()) {
    return customTitle.trim();
  }

  if (materia && turma) {
    return `${materia.nome} - ${turma.nome}`;
  }

  return materia?.nome ?? turma?.nome ?? 'Aula';
}

export function findLessonBySlot(lessons: AulaEntity[], data: string, horaInicio: string, horaFim: string) {
  return lessons.find(
    (lesson) => lesson.data === data && lesson.horaInicio === horaInicio && lesson.horaFim === horaFim
  );
}

export function isLessonScheduledForDate(lesson: AulaEntity, date: string) {
  if (lesson.datasIgnoradas?.includes(date)) {
    return false;
  }

  return lesson.recorrente ? lesson.diaSemana === getLessonWeekday(date) : lesson.data === date;
}

export function findRecurringLessonsBySlot(
  lessons: AulaEntity[],
  diaSemana: number,
  horaInicio: string,
  horaFim: string,
  escola: string
) {
  return lessons.filter(
    (lesson) =>
      lesson.recorrente &&
      lesson.diaSemana === diaSemana &&
      lesson.horaInicio === horaInicio &&
      lesson.horaFim === horaFim &&
      (lesson.escola ?? '') === escola
  );
}

export function getLessonWeekday(date: string) {
  return getDay(new Date(`${date}T12:00:00`));
}
