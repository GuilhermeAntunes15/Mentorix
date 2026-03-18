import type {
  AtividadeEntity,
  ChamadaEntity,
  EntregaAtividadeEntity,
  EntregaReposicaoEntity,
  FrequenciaEntity,
  PresenceStatus,
  ReposicaoEntity,
  StudentDashboardMetrics,
  TentativaQuizEntity
} from '@/types';

function ratio(part: number, whole: number) {
  if (!whole) {
    return 0;
  }
  return Number(((part / whole) * 100).toFixed(1));
}

export function calculateAttendancePercentage(
  frequencias: FrequenciaEntity[],
  chamadas: ChamadaEntity[],
  presenceStatus: PresenceStatus = 'presente'
) {
  const validAttendanceIds = new Set(chamadas.map((chamada) => chamada.id));
  const effectiveRows = frequencias.filter((frequencia) => validAttendanceIds.has(frequencia.chamadaId));
  const presentes = effectiveRows.filter((frequencia) => frequencia.status === presenceStatus).length;
  return ratio(presentes, effectiveRows.length);
}

export function calculateFirstTryScore(tentativas: TentativaQuizEntity[]) {
  const effectiveAttempts = tentativas.filter((tentativa) => tentativa.realizado);
  const total = effectiveAttempts.length;
  const firstTry = effectiveAttempts.filter((tentativa) => tentativa.acertouDePrimeira).length;
  return {
    total,
    firstTry,
    percentage: ratio(firstTry, total)
  };
}

export function calculateActivityAverage(entregas: EntregaAtividadeEntity[]) {
  const graded = entregas.filter((entrega) => typeof entrega.nota === 'number');
  if (!graded.length) {
    return 0;
  }
  const sum = graded.reduce((accumulator, entrega) => accumulator + Number(entrega.nota ?? 0), 0);
  return Number((sum / graded.length).toFixed(1));
}

export function calculateStudentMetrics(
  tentativas: TentativaQuizEntity[],
  entregas: EntregaAtividadeEntity[]
): StudentDashboardMetrics {
  const quizScore = calculateFirstTryScore(tentativas);
  const totalEntregues = entregas.filter((entrega) => entrega.status !== 'pendente').length;
  const totalPendentes = entregas.filter((entrega) => entrega.status === 'pendente').length;

  return {
    totalQuizzesFeitos: quizScore.total,
    acertouDePrimeira: quizScore.firstTry,
    percentualAcertoPrimeira: quizScore.percentage,
    mediaQuizzesTurma: quizScore.total ? Number((quizScore.total / Math.max(1, tentativas.length)).toFixed(1)) : 0,
    totalAtividadesEsperadas: entregas.length,
    totalAtividadesEntregues: totalEntregues,
    totalAtividadesPendentes: totalPendentes,
    mediaAtividades: calculateActivityAverage(entregas)
  };
}

export function getPendingActivities(
  atividades: AtividadeEntity[],
  entregas: EntregaAtividadeEntity[]
) {
  return atividades
    .filter((atividade) => !entregas.some((entrega) => entrega.atividadeId === atividade.id && entrega.status !== 'pendente'))
    .map((atividade) => ({
      atividadeId: atividade.id,
      titulo: atividade.titulo
    }));
}

export function summarizeMakeups(reposicoes: ReposicaoEntity[], entregas: EntregaReposicaoEntity[]) {
  return {
    passadas: reposicoes.filter((reposicao) => reposicao.status === 'feito').length,
    pendentes: reposicoes.filter((reposicao) => reposicao.status === 'pendente').length,
    entregues: entregas.filter((entrega) => entrega.status !== 'pendente').length
  };
}
