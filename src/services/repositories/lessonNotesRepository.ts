import { BaseRepository } from '@/services/repositories/baseRepository';
import { COLLECTIONS } from '@/database/collections';
import type { AnotacaoAulaEntity } from '@/types';

class LessonNotesRepository extends BaseRepository<AnotacaoAulaEntity> {
  constructor() {
    super(COLLECTIONS.anotacoesAula);
  }

  async getByLessonAndDate(professorId: string, aulaId: string, dataReferencia: string) {
    const items = await this.listByProfessor(professorId);
    return (
      items.find((item) => item.aulaId === aulaId && item.dataReferencia === dataReferencia) ?? null
    );
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
