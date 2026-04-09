import { supabase } from '@/services/supabase/client';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { TABLES } from '@/database/collections';
import { toSnakeCase } from '@/utils/caseConverter';
import type { QuizEntity, TentativaQuizEntity } from '@/types';

class QuizzesRepository extends BaseRepository<QuizEntity> {
  constructor() {
    super(TABLES.QUIZZES);
  }

  listByClass(professorId: string, turmaId: string) {
    return this.listByProfessor(professorId, [
      { column: 'turma_id', operator: 'eq', value: turmaId }
    ]);
  }
}

class QuizAttemptsRepository extends BaseRepository<TentativaQuizEntity> {
  constructor() {
    super(TABLES.TENTATIVAS_QUIZ);
  }

  listByQuiz(professorId: string, quizId: string) {
    return this.listByProfessor(professorId, [
      { column: 'quiz_id', operator: 'eq', value: quizId }
    ]);
  }

  listByStudent(professorId: string, alunoId: string) {
    return this.listByProfessor(professorId, [
      { column: 'aluno_id', operator: 'eq', value: alunoId }
    ]);
  }

  async upsertMany(
    professorId: string,
    quizId: string,
    turmaId: string,
    rows: Array<{
      alunoId: string;
      realizado: boolean;
      acertouDePrimeira: boolean;
      acertos: number;
      tentativas: number;
    }>
  ) {
    const timestamp = new Date().toISOString();

    const payloads = rows.map((row) =>
      toSnakeCase({
        professorId,
        quizId,
        turmaId,
        alunoId: row.alunoId,
        realizado: row.realizado,
        acertouDePrimeira: row.acertouDePrimeira,
        acertos: row.acertos,
        tentativas: row.tentativas,
        updatedAt: timestamp,
      } as unknown as Record<string, unknown>)
    );

    const { error } = await supabase
      .from(this.tableName)
      .upsert(payloads, { onConflict: 'quiz_id,aluno_id' });

    if (error) throw new Error(error.message);
  }
}

export const quizzesRepository = new QuizzesRepository();
export const quizAttemptsRepository = new QuizAttemptsRepository();
