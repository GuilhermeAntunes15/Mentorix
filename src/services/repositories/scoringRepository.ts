import { BaseRepository } from '@/services/repositories/baseRepository';
import { TABLES } from '@/database/collections';
import { supabase } from '@/services/supabase/client';
import { toCamelCase, toSnakeCase } from '@/utils/caseConverter';
import type { PontuacaoAlunoEntity, AvaliacaoAlunoEntity } from '@/types';

class StudentScoresRepository extends BaseRepository<PontuacaoAlunoEntity> {
  constructor() {
    super(TABLES.PONTUACOES_ALUNO);
  }

  async listByClass(professorId: string, turmaId: string) {
    return this.listByProfessor(professorId, [
      { column: 'turma_id', operator: 'eq', value: turmaId }
    ]);
  }

  async listByStudent(professorId: string, alunoId: string) {
    return this.listByProfessor(professorId, [
      { column: 'aluno_id', operator: 'eq', value: alunoId }
    ]);
  }
}

class StudentEvaluationsRepository extends BaseRepository<AvaliacaoAlunoEntity> {
  constructor() {
    super(TABLES.AVALIACOES_ALUNO);
  }

  async listByClass(professorId: string, turmaId: string) {
    return this.listByProfessor(professorId, [
      { column: 'turma_id', operator: 'eq', value: turmaId }
    ]);
  }

  async upsertEvaluation(professorId: string, data: Omit<AvaliacaoAlunoEntity, 'id' | 'professorId' | 'createdAt' | 'updatedAt'>) {
    const payload = toSnakeCase(data as unknown as Record<string, unknown>);
    const { data: result, error } = await supabase
      .from(this.tableName)
      .upsert(
        { ...payload, professor_id: professorId },
        { onConflict: 'aluno_id,turma_id,professor_id' }
      )
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toCamelCase<AvaliacaoAlunoEntity>(result as Record<string, unknown>);
  }
}

export const studentScoresRepository = new StudentScoresRepository();
export const studentEvaluationsRepository = new StudentEvaluationsRepository();
