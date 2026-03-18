import { useCallback, useEffect, useState } from 'react';
import { attendanceRepository, classesRepository, lessonsRepository, subjectsRepository } from '@/services/repositories';
import type { DayLessonView } from '@/types';

export function useDayLessons(professorId: string, date: string) {
  const [items, setItems] = useState<DayLessonView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [lessons, classes, subjects] = await Promise.all([
        lessonsRepository.listByDate(professorId, date),
        classesRepository.listOrdered(professorId),
        subjectsRepository.listOrdered(professorId)
      ]);

      const attendanceItems = await Promise.all(
        lessons.map((lesson) => attendanceRepository.getByLessonAndDate(professorId, lesson.id, date))
      );

      setItems(
        lessons.map((lesson, index) => ({
          dataReferencia: date,
          aula: lesson,
          turma: classes.find((turma) => turma.id === lesson.turmaId),
          materia: subjects.find((materia) => materia.id === lesson.materiaId),
          chamada: attendanceItems[index] ?? undefined
        }))
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel carregar as aulas do dia.');
    } finally {
      setLoading(false);
    }
  }, [date, professorId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, loading, error, reload: load };
}
