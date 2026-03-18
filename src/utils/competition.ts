import type {
  AlunoEntity,
  AtividadeEntity,
  CompetitionCompanyStanding,
  CompetitionScoreBreakdown,
  EmpresaCompeticaoEntity,
  EntregaAtividadeEntity,
  MembroEmpresaCompeticaoEntity,
  QuizEntity,
  TentativaQuizEntity
} from '@/types';

function clampScore(value: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(value)));
}

function calculateAverage(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateScoreBreakdown({
  empresa,
  membros,
  alunos,
  atividades,
  entregas,
  quizzes,
  tentativas
}: {
  empresa: EmpresaCompeticaoEntity;
  membros: MembroEmpresaCompeticaoEntity[];
  alunos: AlunoEntity[];
  atividades: AtividadeEntity[];
  entregas: EntregaAtividadeEntity[];
  quizzes: QuizEntity[];
  tentativas: TentativaQuizEntity[];
}): CompetitionScoreBreakdown {
  const memberIds = membros.map((membro) => membro.alunoId);
  const atividadeIds = new Set(atividades.map((atividade) => atividade.id));
  const quizIds = new Set(quizzes.map((quiz) => quiz.id));
  const relevantEntregas = entregas.filter(
    (entrega) => memberIds.includes(entrega.alunoId) && atividadeIds.has(entrega.atividadeId)
  );
  const relevantTentativas = tentativas.filter(
    (tentativa) => memberIds.includes(tentativa.alunoId) && quizIds.has(tentativa.quizId)
  );

  const totalAtividadesEsperadas = atividades.length * memberIds.length;
  const totalAtividadesEntregues = relevantEntregas.filter((entrega) => entrega.status !== 'pendente').length;
  const taxaAtividadesEquipe = totalAtividadesEsperadas
    ? totalAtividadesEntregues / totalAtividadesEsperadas
    : 0;
  const atividadesEquipe = clampScore(taxaAtividadesEquipe * 10, 10);

  const mediaNotasAtividades = calculateAverage(
    relevantEntregas
      .map((entrega) => entrega.nota)
      .filter((nota): nota is number => typeof nota === 'number')
  );
  const mediaAtividades = mediaNotasAtividades >= 8 ? 10 : mediaNotasAtividades >= 6 ? 5 : 0;

  const totalQuizzesEsperados = quizzes.length * memberIds.length;
  const totalQuizzesFeitos = relevantTentativas.filter((tentativa) => tentativa.realizado).length;
  const taxaQuizzesFeitos = totalQuizzesEsperados ? totalQuizzesFeitos / totalQuizzesEsperados : 0;
  const quizzesFeitos = clampScore(taxaQuizzesFeitos * 10, 10);

  const totalQuizzesCorretos = relevantTentativas.filter(
    (tentativa) => tentativa.realizado && (tentativa.acertouDePrimeira || tentativa.acertos > 0)
  ).length;
  const taxaQuizzesCorretos = totalQuizzesEsperados ? totalQuizzesCorretos / totalQuizzesEsperados : 0;
  const quizzesCorretos = clampScore(taxaQuizzesCorretos * 15, 15);

  const comportamento = empresa.pontosComportamento;
  const extras = empresa.pontosExtras;
  const total =
    atividadesEquipe + mediaAtividades + quizzesFeitos + quizzesCorretos + comportamento + extras;

  return {
    atividadesEquipe,
    mediaAtividades,
    quizzesFeitos,
    quizzesCorretos,
    comportamento,
    extras,
    total,
    mediaNotasAtividades,
    taxaAtividadesEquipe,
    taxaQuizzesFeitos,
    taxaQuizzesCorretos
  };
}

export function buildCompetitionStandings({
  empresas,
  membros,
  alunos,
  atividades,
  entregas,
  quizzes,
  tentativas
}: {
  empresas: EmpresaCompeticaoEntity[];
  membros: MembroEmpresaCompeticaoEntity[];
  alunos: AlunoEntity[];
  atividades: AtividadeEntity[];
  entregas: EntregaAtividadeEntity[];
  quizzes: QuizEntity[];
  tentativas: TentativaQuizEntity[];
}) {
  const standings: CompetitionCompanyStanding[] = empresas.map((empresa) => {
    const companyMembers = membros.filter((membro) => membro.empresaId === empresa.id);
    const companyStudents = alunos.filter((aluno) =>
      companyMembers.some((membro) => membro.alunoId === aluno.id)
    );

    return {
      empresa,
      membros: companyMembers,
      alunos: companyStudents,
      lider: companyStudents.find((aluno) => aluno.id === empresa.liderAlunoId),
      pontuacao: calculateScoreBreakdown({
        empresa,
        membros: companyMembers,
        alunos: companyStudents,
        atividades,
        entregas,
        quizzes,
        tentativas
      })
    };
  });

  return standings.sort((left, right) => right.pontuacao.total - left.pontuacao.total);
}
