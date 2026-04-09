import { supabase } from '@/services/supabase/client';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { TABLES } from '@/database/collections';
import type { TurmaEntity } from '@/types';

function normalizeToken(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

class ClassesRepository extends BaseRepository<TurmaEntity> {
  constructor() {
    super(TABLES.TURMAS);
  }

  async listOrdered(professorId: string) {
    const items = await this.listByProfessor(professorId);
    return items.sort((left, right) => left.nome.localeCompare(right.nome));
  }

  async listAll(): Promise<TurmaEntity[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*');

    if (error) throw new Error(error.message);
    return this.mapRows((data ?? []) as Record<string, unknown>[]);
  }

  async listSharedDrafts() {
    const items = await this.listAll();
    const drafts = new Map<string, Omit<TurmaEntity, 'id' | 'professorId' | 'createdAt' | 'updatedAt'>>();

    items.forEach((item) => {
      const identity = item.syncKey || `${normalizeToken(item.codigo)}::${normalizeToken(item.nome)}`;

      if (!drafts.has(identity)) {
        drafts.set(identity, {
          nome: item.nome,
          codigo: item.codigo,
          periodo: item.periodo,
          cor: item.cor,
          descricao: item.descricao,
          syncKey: item.syncKey ?? identity,
          managedByAdmin: item.managedByAdmin ?? false
        });
      }
    });

    return [...drafts.values()].sort((left, right) => left.nome.localeCompare(right.nome));
  }
}

export const classesRepository = new ClassesRepository();
