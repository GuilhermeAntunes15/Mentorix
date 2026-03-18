import { collection, getDocs } from 'firebase/firestore';
import { BaseRepository } from '@/services/repositories/baseRepository';
import type { TurmaEntity } from '@/types';
import { COLLECTIONS } from '@/database/collections';

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
    super(COLLECTIONS.turmas);
  }

  async listOrdered(professorId: string) {
    const items = await this.listByProfessor(professorId);
    return items.sort((left, right) => left.nome.localeCompare(right.nome));
  }

  async listAll() {
    const instance = this.ensureDb();
    const snapshot = await getDocs(collection(instance, COLLECTIONS.turmas));
    return snapshot.docs.map((item) => this.mapSnapshot(item));
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
