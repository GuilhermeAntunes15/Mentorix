import type {
  AlunoEntity,
  AlunoTurmaEntity,
  AtividadeEntity,
  ChamadaEntity,
  FrequenciaEntity,
  MateriaEntity,
  QuizEntity,
  TentativaQuizEntity,
  TurmaEntity,
  AulaEntity,
  EntregaAtividadeEntity,
  TeacherDashboardSnapshot,
  DashboardStudentInsight
} from '@/types';

const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });

function ratio(part: number, whole: number) {
  if (!whole) {
    return 0;
  }

  return Number(((part / whole) * 100).toFixed(1));
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

function getAttemptMapByQuiz(tentativas: TentativaQuizEntity[]) {
  return new Map(tentativas.map((tentativa) => [tentativa.quizId, tentativa]));
}

function getDeliveryMapByActivity(entregas: EntregaAtividadeEntity[]) {
  return new Map(entregas.map((entrega) => [entrega.atividadeId, entrega]));
}

function createEmptySnapshot(turma?: TurmaEntity): TeacherDashboardSnapshot {
  return {
    turma,
    alunos: [],
    materias: [],
    quizCoverage: {
      responded: 0,
      pending: 0,
      totalExpected: 0,
      completionRate: 0
    },
    attendance: {
      present: 0,
      absent: 0,
      justified: 0,
      totalCalls: 0,
      presencePercentage: 0,
      absencePercentage: 0
    },
    activitySummary: {
      delivered: 0,
      pending: 0,
      totalExpected: 0,
      completionRate: 0,
      averageGrade: 0,
      pendingTitles: []
    },
    subjectQuizCoverage: [],
    subjectQuizDetails: [],
    topStudents: [],
    attentionStudents: [],
    summary: {
      totalStudents: 0,
      totalQuizzes: 0,
      totalActivities: 0,
      studentsWithPendingActivities: 0,
      studentsWithLowAttendance: 0
    }
  };
}

function buildStudentInsights({
  alunos,
  chamadasTurma,
  frequenciasTurma,
  quizzesTurma,
  tentativasTurma,
  atividadesTurma,
  entregasTurma
}: {
  alunos: AlunoEntity[];
  chamadasTurma: ChamadaEntity[];
  frequenciasTurma: FrequenciaEntity[];
  quizzesTurma: QuizEntity[];
  tentativasTurma: TentativaQuizEntity[];
  atividadesTurma: AtividadeEntity[];
  entregasTurma: EntregaAtividadeEntity[];
}) {
  const totalCalls = chamadasTurma.length;
  const totalQuizzes = quizzesTurma.length;
  const totalActivities = atividadesTurma.length;

  return alunos.map<DashboardStudentInsight>((aluno) => {
    const tentativasAluno = tentativasTurma.filter((tentativa) => tentativa.alunoId === aluno.id);
    const entregasAluno = entregasTurma.filter((entrega) => entrega.alunoId === aluno.id);
    const frequenciasAluno = frequenciasTurma.filter((frequencia) => frequencia.alunoId === aluno.id);

    const quizzesRespondidos = tentativasAluno.filter((tentativa) => tentativa.realizado).length;
    const atividadesEntregues = entregasAluno.filter((entrega) => entrega.status !== 'pendente').length;
    const presencas = frequenciasAluno.filter((frequencia) => frequencia.status === 'presente').length;

    return {
      aluno,
      quizCompletionRate: ratio(quizzesRespondidos, totalQuizzes),
      activityCompletionRate: ratio(atividadesEntregues, totalActivities),
      attendancePercentage: ratio(presencas, totalCalls),
      pendingActivities: Math.max(0, totalActivities - atividadesEntregues),
      pendingQuizzes: Math.max(0, totalQuizzes - quizzesRespondidos)
    };
  });
}

export function buildTeacherDashboardSnapshot({
  turmaId,
  alunoId,
  turmas,
  alunos,
  vinculacoes,
  materias,
  aulas,
  chamadas,
  frequencias,
  quizzes,
  tentativas,
  atividades,
  entregas
}: {
  turmaId: string;
  alunoId?: string;
  turmas: TurmaEntity[];
  alunos: AlunoEntity[];
  vinculacoes: AlunoTurmaEntity[];
  materias: MateriaEntity[];
  aulas: AulaEntity[];
  chamadas: ChamadaEntity[];
  frequencias: FrequenciaEntity[];
  quizzes: QuizEntity[];
  tentativas: TentativaQuizEntity[];
  atividades: AtividadeEntity[];
  entregas: EntregaAtividadeEntity[];
}) {
  const turma = turmas.find((item) => item.id === turmaId);

  if (!turma) {
    return createEmptySnapshot();
  }

  const vinculacoesTurma = vinculacoes.filter((vinculo) => vinculo.turmaId === turmaId && vinculo.ativo);
  const alunoIds = [...new Set(vinculacoesTurma.map((vinculo) => vinculo.alunoId))];
  const alunosTurma = alunos
    .filter((aluno) => alunoIds.includes(aluno.id))
    .sort((left, right) => collator.compare(left.nome, right.nome));
  const materiasTurma = materias
    .filter((materia) => materia.turmaId === turmaId)
    .sort((left, right) => collator.compare(left.nome, right.nome));

  const aulasTurma = aulas.filter((aula) => aula.turmaId === turmaId);
  const aulaIds = new Set(aulasTurma.map((aula) => aula.id));
  const chamadasTurma = chamadas.filter((chamada) => aulaIds.has(chamada.aulaId));
  const chamadaIds = new Set(chamadasTurma.map((chamada) => chamada.id));
  const frequenciasTurma = frequencias.filter(
    (frequencia) => chamadaIds.has(frequencia.chamadaId) && alunoIds.includes(frequencia.alunoId)
  );

  const quizzesTurma = quizzes
    .filter((quiz) => quiz.turmaId === turmaId)
    .sort((left, right) => collator.compare(left.titulo, right.titulo));
  const quizIds = new Set(quizzesTurma.map((quiz) => quiz.id));
  const tentativasTurma = tentativas.filter(
    (tentativa) => quizIds.has(tentativa.quizId) && alunoIds.includes(tentativa.alunoId)
  );

  const atividadesTurma = atividades
    .filter((atividade) => atividade.turmaId === turmaId)
    .sort((left, right) => collator.compare(left.titulo, right.titulo));
  const atividadeIds = new Set(atividadesTurma.map((atividade) => atividade.id));
  const entregasTurma = entregas.filter(
    (entrega) => atividadeIds.has(entrega.atividadeId) && alunoIds.includes(entrega.alunoId)
  );

  const studentInsights = buildStudentInsights({
    alunos: alunosTurma,
    chamadasTurma,
    frequenciasTurma,
    quizzesTurma,
    tentativasTurma,
    atividadesTurma,
    entregasTurma
  });

  const studentsWithPendingActivities = studentInsights.filter((item) => item.pendingActivities > 0).length;
  const studentsWithLowAttendance = studentInsights.filter(
    (item) => chamadasTurma.length > 0 && item.attendancePercentage < 75
  ).length;

  const topStudents = [...studentInsights]
    .sort((left, right) => {
      const rightScore = right.quizCompletionRate + right.activityCompletionRate + right.attendancePercentage;
      const leftScore = left.quizCompletionRate + left.activityCompletionRate + left.attendancePercentage;
      return rightScore - leftScore || collator.compare(left.aluno.nome, right.aluno.nome);
    })
    .slice(0, 3);

  const attentionStudents = [...studentInsights]
    .sort((left, right) => {
      const rightRisk = right.pendingActivities + right.pendingQuizzes - right.attendancePercentage / 100;
      const leftRisk = left.pendingActivities + left.pendingQuizzes - left.attendancePercentage / 100;
      return rightRisk - leftRisk || collator.compare(left.aluno.nome, right.aluno.nome);
    })
    .slice(0, 3);

  const selectedStudent = alunoId ? alunosTurma.find((aluno) => aluno.id === alunoId) : undefined;

  const materiaById = new Map(materiasTurma.map((materia) => [materia.id, materia]));
  const quizCoverageBySubject = materiasTurma.map((materia) => {
    const quizzesMateria = quizzesTurma.filter((quiz) => quiz.materiaId === materia.id);
    const quizIdsMateria = new Set(quizzesMateria.map((quiz) => quiz.id));
    const tentativasMateria = tentativasTurma.filter((tentativa) => quizIdsMateria.has(tentativa.quizId));
    const totalExpected = quizzesMateria.length * Math.max(1, alunosTurma.length);
    const responded = tentativasMateria.filter((tentativa) => tentativa.realizado).length;

    return {
      materiaId: materia.id,
      materiaNome: materia.nome,
      cor: materia.cor,
      responded,
      pending: Math.max(0, totalExpected - responded),
      totalExpected,
      completionRate: ratio(responded, totalExpected)
    };
  });

  if (!selectedStudent) {
    const totalExpectedQuizzes = quizzesTurma.length * alunosTurma.length;
    const respondedQuizzes = tentativasTurma.filter((tentativa) => tentativa.realizado).length;
    const totalExpectedActivities = atividadesTurma.length * alunosTurma.length;
    const deliveredActivities = entregasTurma.filter((entrega) => entrega.status !== 'pendente').length;
    const totalCalls = chamadasTurma.length * alunosTurma.length;
    const present = frequenciasTurma.filter((frequencia) => frequencia.status === 'presente').length;
    const justified = frequenciasTurma.filter((frequencia) => frequencia.status === 'justificado').length;
    const absent = Math.max(0, totalCalls - present);

    return {
      turma,
      alunos: alunosTurma,
      materias: materiasTurma,
      quizCoverage: {
        responded: respondedQuizzes,
        pending: Math.max(0, totalExpectedQuizzes - respondedQuizzes),
        totalExpected: totalExpectedQuizzes,
        completionRate: ratio(respondedQuizzes, totalExpectedQuizzes)
      },
      attendance: {
        present,
        absent,
        justified,
        totalCalls,
        presencePercentage: ratio(present, totalCalls),
        absencePercentage: ratio(absent, totalCalls)
      },
      activitySummary: {
        delivered: deliveredActivities,
        pending: Math.max(0, totalExpectedActivities - deliveredActivities),
        totalExpected: totalExpectedActivities,
        completionRate: ratio(deliveredActivities, totalExpectedActivities),
        averageGrade: average(
          entregasTurma.map((entrega) => entrega.nota).filter((nota): nota is number => typeof nota === 'number')
        ),
        pendingTitles: []
      },
      subjectQuizCoverage: quizCoverageBySubject,
      subjectQuizDetails: [],
      topStudents,
      attentionStudents,
      summary: {
        totalStudents: alunosTurma.length,
        totalQuizzes: quizzesTurma.length,
        totalActivities: atividadesTurma.length,
        studentsWithPendingActivities,
        studentsWithLowAttendance
      }
    };
  }

  const tentativasAluno = tentativasTurma.filter((tentativa) => tentativa.alunoId === selectedStudent.id);
  const tentativasAlunoByQuiz = getAttemptMapByQuiz(tentativasAluno);
  const entregasAluno = entregasTurma.filter((entrega) => entrega.alunoId === selectedStudent.id);
  const entregasAlunoByActivity = getDeliveryMapByActivity(entregasAluno);
  const frequenciasAluno = frequenciasTurma.filter((frequencia) => frequencia.alunoId === selectedStudent.id);

  const respondedQuizzes = quizzesTurma.filter((quiz) => tentativasAlunoByQuiz.get(quiz.id)?.realizado).length;
  const deliveredActivities = atividadesTurma.filter(
    (atividade) => entregasAlunoByActivity.get(atividade.id)?.status !== 'pendente'
  ).length;
  const present = frequenciasAluno.filter((frequencia) => frequencia.status === 'presente').length;
  const justified = frequenciasAluno.filter((frequencia) => frequencia.status === 'justificado').length;
  const totalCalls = chamadasTurma.length;
  const absent = Math.max(0, totalCalls - present);

  const subjectQuizDetails = materiasTurma.map((materia) => {
    const quizzesMateria = quizzesTurma
      .filter((quiz) => quiz.materiaId === materia.id)
      .sort((left, right) => collator.compare(left.titulo, right.titulo));

    const respondedTitles = quizzesMateria
      .filter((quiz) => tentativasAlunoByQuiz.get(quiz.id)?.realizado)
      .map((quiz) => quiz.titulo);
    const pendingTitles = quizzesMateria
      .filter((quiz) => !tentativasAlunoByQuiz.get(quiz.id)?.realizado)
      .map((quiz) => quiz.titulo);

    return {
      materiaId: materia.id,
      materiaNome: materia.nome,
      cor: materia.cor,
      respondedCount: respondedTitles.length,
      pendingCount: pendingTitles.length,
      respondedTitles,
      pendingTitles
    };
  });

  const pendingTitles = atividadesTurma
    .filter((atividade) => entregasAlunoByActivity.get(atividade.id)?.status === 'pendente' || !entregasAlunoByActivity.has(atividade.id))
    .map((atividade) => atividade.titulo);

  return {
    turma,
    alunos: alunosTurma,
    materias: materiasTurma,
    selectedStudent,
    quizCoverage: {
      responded: respondedQuizzes,
      pending: Math.max(0, quizzesTurma.length - respondedQuizzes),
      totalExpected: quizzesTurma.length,
      completionRate: ratio(respondedQuizzes, quizzesTurma.length)
    },
    attendance: {
      present,
      absent,
      justified,
      totalCalls,
      presencePercentage: ratio(present, totalCalls),
      absencePercentage: ratio(absent, totalCalls)
    },
    activitySummary: {
      delivered: deliveredActivities,
      pending: Math.max(0, atividadesTurma.length - deliveredActivities),
      totalExpected: atividadesTurma.length,
      completionRate: ratio(deliveredActivities, atividadesTurma.length),
      averageGrade: average(
        entregasAluno.map((entrega) => entrega.nota).filter((nota): nota is number => typeof nota === 'number')
      ),
      pendingTitles
    },
    subjectQuizCoverage: quizCoverageBySubject.map((item) => {
      const materia = materiaById.get(item.materiaId);
      const quizzesMateria = quizzesTurma.filter((quiz) => quiz.materiaId === item.materiaId);
      const responded = quizzesMateria.filter((quiz) => tentativasAlunoByQuiz.get(quiz.id)?.realizado).length;

      return {
        materiaId: item.materiaId,
        materiaNome: item.materiaNome,
        cor: materia?.cor ?? item.cor,
        responded,
        pending: Math.max(0, quizzesMateria.length - responded),
        totalExpected: quizzesMateria.length,
        completionRate: ratio(responded, quizzesMateria.length)
      };
    }),
    subjectQuizDetails,
    topStudents,
    attentionStudents,
    summary: {
      totalStudents: alunosTurma.length,
      totalQuizzes: quizzesTurma.length,
      totalActivities: atividadesTurma.length,
      studentsWithPendingActivities,
      studentsWithLowAttendance
    }
  };
}
