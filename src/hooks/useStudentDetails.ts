import { useEffect, useMemo, useState } from 'react';
import {
  activitiesRepository,
  activityDeliveriesRepository,
  attendanceRepository,
  frequencyRepository,
  lessonsRepository,
  makeupsRepository,
  makeupDeliveriesRepository,
  quizzesRepository,
  quizAttemptsRepository,
  studentClassRepository,
  studentProfilesRepository,
  studentsRepository,
  subjectsRepository,
  classesRepository
} from '@/services/repositories';
import { calculateStudentMetrics } from '@/utils/metrics';
import type { StudentDetailBundle } from '@/types';

export function useStudentDetails(
  professorId: string,
  studentId: string | undefined,
  options?: { includePrivateProfile?: boolean }
) {
  const [data, setData] = useState<StudentDetailBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const includePrivateProfile = options?.includePrivateProfile ?? true;

  useEffect(() => {
    let active = true;

    async function load() {
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [
          aluno,
          perfil,
          aulas,
          chamadas,
          frequencias,
          quizzesCatalogo,
          quizzes,
          atividades,
          reposicoesEntregas,
          vinculacoes,
          turmas,
          materias,
          atividadesCatalogo,
          reposicoesCatalogo
        ] = await Promise.all([
          studentsRepository.getById(studentId),
          includePrivateProfile
            ? studentProfilesRepository.getByStudent(professorId, studentId)
            : Promise.resolve(null),
          lessonsRepository.listByProfessor(professorId),
          attendanceRepository.listByProfessor(professorId),
          frequencyRepository.listByStudent(professorId, studentId),
          quizzesRepository.listByProfessor(professorId),
          quizAttemptsRepository.listByStudent(professorId, studentId),
          activityDeliveriesRepository.listByStudent(professorId, studentId),
          makeupDeliveriesRepository.listByStudent(professorId, studentId),
          studentClassRepository.listByStudent(professorId, studentId),
          classesRepository.listOrdered(professorId),
          subjectsRepository.listOrdered(professorId),
          activitiesRepository.listByProfessor(professorId),
          makeupsRepository.listByProfessor(professorId)
        ]);

        if (!aluno) {
          if (active) {
            setData(null);
          }
          return;
        }

        const studentClasses = turmas.filter((turma) => vinculacoes.some((vinculo) => vinculo.turmaId === turma.id));
        const studentSubjects = materias.filter((materia) => studentClasses.some((turma) => turma.id === materia.turmaId));
        const studentQuizzes = quizzesCatalogo.filter((quiz) => studentClasses.some((turma) => turma.id === quiz.turmaId));
        const pendingQuizzes = studentQuizzes
          .filter((quiz) => {
            const attempt = quizzes.find((item) => item.quizId === quiz.id);
            return !attempt || !attempt.realizado;
          })
          .map((quiz) => ({
            quiz,
            materia: studentSubjects.find((materia) => materia.id === quiz.materiaId),
            tentativa: quizzes.find((item) => item.quizId === quiz.id)
          }));
        const pendingActivities = atividadesCatalogo
          .filter((atividade) => studentClasses.some((turma) => turma.id === atividade.turmaId))
          .filter((atividade) => {
            const delivery = atividades.find((item) => item.atividadeId === atividade.id);
            return !delivery || delivery.status === 'pendente';
          })
          .map((atividade) => ({
            atividade,
            entrega: atividades.find((item) => item.atividadeId === atividade.id),
            materia: studentSubjects.find((materia) => materia.id === atividade.materiaId)
          }));
        const studentMakeups = reposicoesCatalogo.filter((reposicao) => studentClasses.some((turma) => turma.id === reposicao.turmaId));

        if (active) {
          setData({
            aluno,
            perfil: perfil ?? undefined,
            turmas: studentClasses,
            materias: studentSubjects,
            aulas,
            chamadas,
            frequencias,
            quizzesCatalogo: studentQuizzes,
            quizzes,
            quizzesPendentes: pendingQuizzes,
            atividades,
            atividadesPendentes: pendingActivities,
            reposicoes: studentMakeups,
            entregasReposicao: reposicoesEntregas
          });
        }
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'Nao foi possivel carregar o painel do aluno.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [includePrivateProfile, professorId, reloadToken, studentId]);

  const metrics = useMemo(
    () => calculateStudentMetrics(data?.quizzes ?? [], data?.atividades ?? []),
    [data?.atividades, data?.quizzes]
  );

  return {
    data,
    metrics,
    loading,
    error,
    reload: async () => {
      setReloadToken((current) => current + 1);
    }
  };
}
