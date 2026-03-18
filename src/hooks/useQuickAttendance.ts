import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  attendanceCommands,
  attendanceRepository,
  frequencyRepository,
  studentClassRepository,
  studentsRepository
} from '@/services/repositories';
import { isPastDate } from '@/utils/date';
import type { ChamadaEntity, PresenceStatus } from '@/types';

interface QuickAttendanceRow {
  alunoId: string;
  nome: string;
  status: PresenceStatus;
}

export function useQuickAttendance(professorId: string, lessonId: string | undefined, turmaId: string | undefined, date: string) {
  const [attendance, setAttendance] = useState<ChamadaEntity | null>(null);
  const [rows, setRows] = useState<QuickAttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retroativa = useMemo(() => isPastDate(date), [date]);

  const load = useCallback(async () => {
    if (!lessonId || !turmaId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [existingAttendance, relations, students] = await Promise.all([
        attendanceRepository.getByLessonAndDate(professorId, lessonId, date),
        studentClassRepository.listByClass(professorId, turmaId),
        studentsRepository.listOrdered(professorId)
      ]);

      const frequencyRows = existingAttendance
        ? await frequencyRepository.listByAttendance(professorId, existingAttendance.id)
        : [];

      setAttendance(existingAttendance);
      setRows(
        relations
          .filter((relation) => relation.ativo)
          .map((relation) => {
            const student = students.find((item) => item.id === relation.alunoId);
            const frequency = frequencyRows.find((item) => item.alunoId === relation.alunoId);
            return {
              alunoId: relation.alunoId,
              nome: student?.nome ?? 'Aluno',
              status: frequency?.status ?? 'presente'
            };
          })
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel preparar a chamada.');
    } finally {
      setLoading(false);
    }
  }, [date, lessonId, professorId, turmaId]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatusForStudent = useCallback((alunoId: string, status: PresenceStatus) => {
    setRows((currentRows) =>
      currentRows.map((row) => (row.alunoId === alunoId ? { ...row, status } : row))
    );
  }, []);

  const markAll = useCallback((status: PresenceStatus) => {
    setRows((currentRows) => currentRows.map((row) => ({ ...row, status })));
  }, []);

  const save = useCallback(async () => {
    if (!lessonId) {
      return;
    }

    let effectiveAttendance = attendance;
    if (!effectiveAttendance) {
      effectiveAttendance = await attendanceCommands.createAttendance(professorId, lessonId, date, retroativa);
      setAttendance(effectiveAttendance);
    }

    await frequencyRepository.upsertMany(
      professorId,
      effectiveAttendance.id,
      lessonId,
      rows.map((row) => ({
        alunoId: row.alunoId,
        status: row.status
      }))
    );

    await attendanceCommands.updateAttendanceStatus(effectiveAttendance.id, 'concluida');
    await load();
  }, [attendance, date, lessonId, load, professorId, retroativa, rows]);

  const saveDraft = useCallback(async () => {
    if (!lessonId) {
      return;
    }

    let effectiveAttendance = attendance;
    if (!effectiveAttendance) {
      effectiveAttendance = await attendanceCommands.createAttendance(professorId, lessonId, date, retroativa);
      setAttendance(effectiveAttendance);
    }

    await frequencyRepository.upsertMany(
      professorId,
      effectiveAttendance.id,
      lessonId,
      rows.map((row) => ({
        alunoId: row.alunoId,
        status: row.status
      }))
    );

    await attendanceCommands.updateAttendanceStatus(effectiveAttendance.id, 'em_andamento');
    await load();
  }, [attendance, date, lessonId, load, professorId, retroativa, rows]);

  return {
    attendance,
    rows,
    loading,
    error,
    retroativa,
    setStatusForStudent,
    markAll,
    save,
    saveDraft,
    reload: load
  };
}
