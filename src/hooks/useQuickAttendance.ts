import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  attendanceCommands,
  attendanceRepository,
  frequencyRepository,
  studentClassRepository,
  studentsRepository
} from '@/services/repositories';
import { isPastDate } from '@/utils/date';
import type { ChamadaEntity, DayLessonView, PresenceStatus } from '@/types';

interface QuickAttendanceRow {
  alunoId: string;
  nome: string;
  statuses: Record<string, PresenceStatus>;
}

interface QuickAttendanceLesson {
  lessonId: string;
  title: string;
  timeLabel: string;
  status: ChamadaEntity['status'];
}

const nameCollator = new Intl.Collator('pt-BR', {
  sensitivity: 'base'
});

export function useQuickAttendance(
  professorId: string,
  lessons: DayLessonView[],
  turmaId: string | undefined,
  date: string
) {
  const [attendanceMap, setAttendanceMap] = useState<Record<string, ChamadaEntity | null>>({});
  const [rows, setRows] = useState<QuickAttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retroativa = useMemo(() => isPastDate(date), [date]);
  const lessonIdsKey = useMemo(() => lessons.map((item) => item.aula.id).join('|'), [lessons]);
  const lessonSummaries = useMemo<QuickAttendanceLesson[]>(
    () =>
      lessons.map((item) => ({
        lessonId: item.aula.id,
        title: item.materia?.nome ?? item.aula.titulo,
        timeLabel: `${item.aula.horaInicio} - ${item.aula.horaFim}`,
        status: item.chamada?.status ?? 'nao_iniciada'
      })),
    [lessons]
  );

  const load = useCallback(async () => {
    if (!lessons.length || !turmaId) {
      setAttendanceMap({});
      setRows([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [existingAttendances, relations, students] = await Promise.all([
        Promise.all(lessons.map((lesson) => attendanceRepository.getByLessonAndDate(professorId, lesson.aula.id, date))),
        studentClassRepository.listByClass(professorId, turmaId),
        studentsRepository.listOrdered(professorId)
      ]);

      const frequenciesByLesson = await Promise.all(
        existingAttendances.map(async (attendance) =>
          attendance ? frequencyRepository.listByAttendance(professorId, attendance.id) : []
        )
      );

      setAttendanceMap(
        Object.fromEntries(lessons.map((lesson, index) => [lesson.aula.id, existingAttendances[index] ?? null]))
      );
      setRows(
        relations
          .filter((relation) => relation.ativo)
          .map((relation) => {
            const student = students.find((item) => item.id === relation.alunoId);
            return {
              alunoId: relation.alunoId,
              nome: student?.nome ?? 'Aluno',
              statuses: Object.fromEntries(
                lessons.map((lesson, index) => {
                  const frequency = frequenciesByLesson[index].find((item) => item.alunoId === relation.alunoId);
                  return [lesson.aula.id, frequency?.status === 'presente' ? 'presente' : 'ausente'];
                })
              )
            };
          })
          .sort((left, right) => nameCollator.compare(left.nome, right.nome))
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel preparar a chamada.');
    } finally {
      setLoading(false);
    }
  }, [date, lessons, professorId, turmaId]);

  useEffect(() => {
    void load();
  }, [load, lessonIdsKey]);

  const setStatusForStudent = useCallback((alunoId: string, lessonId: string, status: PresenceStatus) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.alunoId === alunoId
          ? {
              ...row,
              statuses: {
                ...row.statuses,
                [lessonId]: status
              }
            }
          : row
      )
    );
  }, []);

  const toggleStatusForStudent = useCallback((alunoId: string, lessonId: string) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.alunoId === alunoId
          ? {
              ...row,
              statuses: {
                ...row.statuses,
                [lessonId]: row.statuses[lessonId] === 'presente' ? 'ausente' : 'presente'
              }
            }
          : row
      )
    );
  }, []);

  const markAll = useCallback((status: PresenceStatus) => {
    setRows((currentRows) =>
      currentRows.map((row) => ({
        ...row,
        statuses: Object.fromEntries(
          lessons.map((lesson) => [lesson.aula.id, status])
        )
      }))
    );
  }, [lessons]);

  const persist = useCallback(async (status: ChamadaEntity['status']) => {
    if (!lessons.length) {
      return;
    }

    const nextAttendanceMap = { ...attendanceMap };

    for (const lesson of lessons) {
      let effectiveAttendance = nextAttendanceMap[lesson.aula.id] ?? null;

      if (!effectiveAttendance) {
        effectiveAttendance = await attendanceCommands.createAttendance(professorId, lesson.aula.id, date, retroativa);
        nextAttendanceMap[lesson.aula.id] = effectiveAttendance;
      }

      await frequencyRepository.upsertMany(
        professorId,
        effectiveAttendance.id,
        lesson.aula.id,
        rows.map((row) => ({
          alunoId: row.alunoId,
          status: row.statuses[lesson.aula.id] ?? 'presente'
        }))
      );

      await attendanceCommands.updateAttendanceStatus(effectiveAttendance.id, status);
    }

    setAttendanceMap(nextAttendanceMap);
    await load();
  }, [attendanceMap, date, lessons, load, professorId, retroativa, rows]);

  const save = useCallback(async () => {
    await persist('concluida');
  }, [persist]);

  const saveDraft = useCallback(async () => {
    await persist('em_andamento');
  }, [persist]);

  return {
    attendanceMap,
    lessonSummaries,
    rows,
    loading,
    error,
    retroativa,
    setStatusForStudent,
    toggleStatusForStudent,
    markAll,
    save,
    saveDraft,
    reload: load
  };
}
