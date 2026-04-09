export const MAX_PONTUACAO_INDIVIDUAL = 100;

export function calculateFinalGrade({
  notaProvaPaulista,
  notaProva,
  totalPontosIndividuais,
}: {
  notaProvaPaulista: number;
  notaProva: number;
  totalPontosIndividuais: number;
}): number {
  const pontuacaoNormalizada = Math.min(10, (totalPontosIndividuais / MAX_PONTUACAO_INDIVIDUAL) * 10);
  const nota = notaProvaPaulista * 0.3 + notaProva * 0.3 + pontuacaoNormalizada * 0.4;
  return Math.round(nota * 10) / 10;
}
