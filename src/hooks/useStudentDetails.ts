import { useEffect, useMemo, useState } from 'react';
import {
  activitiesRepository,
  activityDeliveriesRepository,
  attendanceRepository,
  frequencyRepository,
  lessonsRepository,
  makeupsRepository,
  makeupDeliveriesRepository,
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
  const includePrivateProfile = options?.includePrivateProfile ?? true;

  useEffect(() => {
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
          setData(null);
          return;
        }

        const studentClasses = turmas.filter((turma) => vinculacoes.some((vinculo) => vinculo.turmaId === turma.id));
        const studentSubjects = materias.filter((materia) => studentClasses.some((turma) => turma.id === materia.turmaId));
        const pendingActivities = atividades
          .filter((entrega) => entrega.status === 'pendente')
          .map((entrega) => ({
            ...entrega,
            atividade: atividadesCatalogo.find((atividade) => atividade.id === entrega.atividadeId)
          }));
        const studentMakeups = reposicoesCatalogo.filter((reposicao) => studentClasses.some((turma) => turma.id === reposicao.turmaId));

        setData({
          aluno,
          perfil: perfil ?? undefined,
          turmas: studentClasses,
          materias: studentSubjects,
          aulas,
          chamadas,
          frequencias,
          quizzes,
          atividades,
          atividadesPendentes: pendingActivities,
          reposicoes: studentMakeups,
          entregasReposicao: reposicoesEntregas
        });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Nao foi possivel carregar o painel do aluno.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [includePrivateProfile, professorId, studentId]);

  const metrics = useMemo(
    () => calculateStudentMetrics(data?.quizzes ?? [], data?.atividades ?? []),
    [data?.atividades, data?.quizzes]
  );

  return {
    data,
    metrics,
    loading,
    error
  };
}
