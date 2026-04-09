import { supabase } from '@/services/supabase/client';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { TABLES } from '@/database/collections';
import type { AvisoMuralEntity, CurtidaAvisoMuralEntity } from '@/types';

class NoticeBoardRepository extends BaseRepository<AvisoMuralEntity> {
  constructor() {
    super(TABLES.AVISOS_MURAL);
  }

  async listAll(): Promise<AvisoMuralEntity[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*');

    if (error) throw new Error(error.message);
    return this.mapRows((data ?? []) as Record<string, unknown>[]);
  }

  listByClass(professorId: string, turmaId: string) {
    return this.listByProfessor(professorId, [
      { column: 'turma_id', operator: 'eq', value: turmaId }
    ]);
  }
}

class NoticeLikesRepository extends BaseRepository<CurtidaAvisoMuralEntity> {
  constructor() {
    super(TABLES.CURTIDAS_AVISO_MURAL);
  }

  async listAll(): Promise<CurtidaAvisoMuralEntity[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*');

    if (error) throw new Error(error.message);
    return this.mapRows((data ?? []) as Record<string, unknown>[]);
  }

  listByNotice(professorId: string, avisoId: string) {
    return this.listByProfessor(professorId, [
      { column: 'aviso_id', operator: 'eq', value: avisoId }
    ]);
  }
}

export const noticeBoardRepository = new NoticeBoardRepository();
export const noticeLikesRepository = new NoticeLikesRepository();
