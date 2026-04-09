import { supabase } from '@/services/supabase/client';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { TABLES } from '@/database/collections';
import { toSnakeCase } from '@/utils/caseConverter';
import type { AtividadeEntity, EntregaAtividadeEntity } from '@/types';

class ActivitiesRepository extends BaseRepository<AtividadeEntity> {
  constructor() {
    super(TABLES.ATIVIDADES);
  }

  listByClass(professorId: string, turmaId: string) {
    return this.listByProfessor(professorId, [
      { column: 'turma_id', operator: 'eq', value: turmaId }
    ]);
  }
}

class ActivityDeliveriesRepository extends BaseRepository<EntregaAtividadeEntity> {
  constructor() {
    super(TABLES.ENTREGAS_ATIVIDADE);
  }

  listByActivity(professorId: string, atividadeId: string) {
    return this.listByProfessor(professorId, [
      { column: 'atividade_id', operator: 'eq', value: atividadeId }
    ]);
  }

  listByStudent(professorId: string, alunoId: string) {
    return this.listByProfessor(professorId, [
      { column: 'aluno_id', operator: 'eq', value: alunoId }
    ]);
  }

  async upsertMany(
    professorId: string,
    atividadeId: string,
    rows: Array<{
      alunoId: string;
      status: EntregaAtividadeEntity['status'];
      nota?: number;
      entregueEm?: string;
    }>
  ) {
    const timestamp = new Date().toISOString();

    const payloads = rows.map((row) =>
      toSnakeCase({
        professorId,
        atividadeId,
        alunoId: row.alunoId,
        status: row.status,
        nota: row.nota,
        entregueEm: row.entregueEm,
        updatedAt: timestamp,
      } as unknown as Record<string, unknown>)
    );

    const { error } = await supabase
      .from(this.tableName)
      .upsert(payloads, { onConflict: 'atividade_id,aluno_id' });

    if (error) throw new Error(error.message);
  }
}

export const activitiesRepository = new ActivitiesRepository();
export const activityDeliveriesRepository = new ActivityDeliveriesRepository();
