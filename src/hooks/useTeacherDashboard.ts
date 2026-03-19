import { useEffect, useMemo, useState } from 'react';
import {
  activitiesRepository,
  activityDeliveriesRepository,
  attendanceRepository,
  classesRepository,
  frequencyRepository,
  lessonsRepository,
  quizAttemptsRepository,
  quizzesRepository,
  studentClassRepository,
  studentsRepository,
  subjectsRepository
} from '@/services/repositories';
import { buildTeacherDashboardSnapshot } from '@/utils/dashboard';
import type {
  AlunoEntity,
  AlunoTurmaEntity,
  AtividadeEntity,
  ChamadaEntity,
  EntregaAtividadeEntity,
  FrequenciaEntity,
  MateriaEntity,
  QuizEntity,
  TeacherDashboardSnapshot,
  TentativaQuizEntity,
  TurmaEntity,
  AulaEntity
} from '@/types';

interface TeacherDashboardState {
  classes: TurmaEntity[];
  students: AlunoEntity[];
  relations: AlunoTurmaEntity[];
  subjects: MateriaEntity[];
  lessons: AulaEntity[];
  attendances: ChamadaEntity[];
  frequencies: FrequenciaEntity[];
  quizzes: QuizEntity[];
  attempts: TentativaQuizEntity[];
  activities: AtividadeEntity[];
  deliveries: EntregaAtividadeEntity[];
}

const initialState: TeacherDashboardState = {
  classes: [],
  students: [],
  relations: [],
  subjects: [],
  lessons: [],
  attendances: [],
  frequencies: [],
  quizzes: [],
  attempts: [],
  activities: [],
  deliveries: []
};

export function useTeacherDashboard(professorId: string, turmaId: string, alunoId?: string) {
  const [state, setState] = useState<TeacherDashboardState>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!professorId) {
        setState(initialState);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [
          classes,
          students,
          relations,
          subjects,
          lessons,
          attendances,
          frequencies,
          quizzes,
          attempts,
          activities,
          deliveries
        ] = await Promise.all([
          classesRepository.listOrdered(professorId),
          studentsRepository.listOrdered(professorId),
          studentClassRepository.listByProfessor(professorId),
          subjectsRepository.listOrdered(professorId),
          lessonsRepository.listByProfessor(professorId),
          attendanceRepository.listByProfessor(professorId),
          frequencyRepository.listByProfessor(professorId),
          quizzesRepository.listByProfessor(professorId),
          quizAttemptsRepository.listByProfessor(professorId),
          activitiesRepository.listByProfessor(professorId),
          activityDeliveriesRepository.listByProfessor(professorId)
        ]);

        setState({
          classes,
          students,
          relations,
          subjects,
          lessons,
          attendances,
          frequencies,
          quizzes,
          attempts,
          activities,
          deliveries
        });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Nao foi possivel carregar o dashboard.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [professorId]);

  const snapshot = useMemo<TeacherDashboardSnapshot | null>(() => {
    if (!turmaId) {
      return null;
    }

    return buildTeacherDashboardSnapshot({
      turmaId,
      alunoId,
      turmas: state.classes,
      alunos: state.students,
      vinculacoes: state.relations,
      materias: state.subjects,
      aulas: state.lessons,
      chamadas: state.attendances,
      frequencias: state.frequencies,
      quizzes: state.quizzes,
      tentativas: state.attempts,
      atividades: state.activities,
      entregas: state.deliveries
    });
  }, [alunoId, state.activities, state.attendances, state.classes, state.deliveries, state.frequencies, state.lessons, state.quizzes, state.relations, state.students, state.subjects, state.attempts, turmaId]);

  return {
    classes: state.classes,
    snapshot,
    loading,
    error
  };
}
