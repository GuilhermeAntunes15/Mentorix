import { supabase } from '@/services/supabase/client';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { TABLES } from '@/database/collections';
import { toCamelCase, toSnakeCase } from '@/utils/caseConverter';
import type { ChamadaEntity, FrequenciaEntity, PresenceStatus } from '@/types';

class AttendanceRepository extends BaseRepository<ChamadaEntity> {
  constructor() {
    super(TABLES.CHAMADAS);
  }

  listByLesson(professorId: string, aulaId: string) {
    return this.listByProfessor(professorId, [
      { column: 'aula_id', operator: 'eq', value: aulaId }
    ]);
  }

  async getByLessonAndDate(professorId: string, aulaId: string, date: string) {
    const list = await this.listByProfessor(professorId, [
      { column: 'aula_id', operator: 'eq', value: aulaId },
      { column: 'data_referencia', operator: 'eq', value: date }
    ]);
    return list[0] ?? null;
  }
}

class FrequencyRepository extends BaseRepository<FrequenciaEntity> {
  constructor() {
    super(TABLES.FREQUENCIAS);
  }

  listByAttendance(professorId: string, chamadaId: string) {
    return this.listByProfessor(professorId, [
      { column: 'chamada_id', operator: 'eq', value: chamadaId }
    ]);
  }

  listByStudent(professorId: string, alunoId: string) {
    return this.listByProfessor(professorId, [
      { column: 'aluno_id', operator: 'eq', value: alunoId }
    ]);
  }

  async upsertMany(
    professorId: string,
    chamadaId: string,
    aulaId: string,
    rows: Array<{ alunoId: string; status: PresenceStatus }>
  ) {
    const timestamp = new Date().toISOString();

    const payloads = rows.map((row) =>
      toSnakeCase({
        professorId,
        chamadaId,
        aulaId,
        alunoId: row.alunoId,
        status: row.status,
        updatedAt: timestamp,
      } as unknown as Record<string, unknown>)
    );

    const { error } = await supabase
      .from(this.tableName)
      .upsert(payloads, { onConflict: 'chamada_id,aluno_id' });

    if (error) throw new Error(error.message);
  }

  async markAllStatus(chamadaId: string, status: PresenceStatus) {
    const { error } = await supabase
      .from(this.tableName)
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('chamada_id', chamadaId);

    if (error) throw new Error(error.message);
  }
}

async function createAttendance(
  professorId: string,
  aulaId: string,
  date: string,
  retroativa: boolean
): Promise<ChamadaEntity> {
  const timestamp = new Date().toISOString();

  const payload = toSnakeCase({
    professorId,
    aulaId,
    dataReferencia: date,
    retroativa,
    status: 'em_andamento' as const,
    createdAt: timestamp,
    updatedAt: timestamp
  } as unknown as Record<string, unknown>);

  const { data, error } = await supabase
    .from(TABLES.CHAMADAS)
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toCamelCase<ChamadaEntity>(data as Record<string, unknown>);
}

async function updateAttendanceStatus(chamadaId: string, status: ChamadaEntity['status']) {
  const { error } = await supabase
    .from(TABLES.CHAMADAS)
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', chamadaId);

  if (error) throw new Error(error.message);
}

export const attendanceRepository = new AttendanceRepository();
export const frequencyRepository = new FrequencyRepository();
export const attendanceCommands = {
  createAttendance,
  updateAttendanceStatus
};
