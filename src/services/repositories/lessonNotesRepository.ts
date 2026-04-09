import { supabase } from '@/services/supabase/client';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { TABLES } from '@/database/collections';
import type { AnotacaoAulaEntity } from '@/types';

class LessonNotesRepository extends BaseRepository<AnotacaoAulaEntity> {
  constructor() {
    super(TABLES.ANOTACOES_AULA);
  }

  async getByLessonAndDate(professorId: string, aulaId: string, dataReferencia: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('professor_id', professorId)
      .eq('aula_id', aulaId)
      .eq('data_referencia', dataReferencia)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? this.mapRow(data as Record<string, unknown>) : null;
  }

  async saveForLesson(professorId: string, aulaId: string, dataReferencia: string, conteudoHtml: string) {
    const existing = await this.getByLessonAndDate(professorId, aulaId, dataReferencia);

    if (existing) {
      await this.update(existing.id, { conteudoHtml });
      return existing.id;
    }

    const created = await this.create(professorId, {
      aulaId,
      dataReferencia,
      conteudoHtml
    });

    return created.id;
  }
}

export const lessonNotesRepository = new LessonNotesRepository();
