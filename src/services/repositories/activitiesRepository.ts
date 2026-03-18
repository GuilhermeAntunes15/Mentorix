import { collection, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { COLLECTIONS } from '@/database/collections';
import { db } from '@/services/firebase/client';
import { createEntityPayload } from '@/utils/firestore';
import type { AtividadeEntity, EntregaAtividadeEntity } from '@/types';

function ensureDb() {
  if (!db) {
    throw new Error('Firebase nao configurado. Preencha o arquivo .env para habilitar persistencia.');
  }

  return db;
}

class ActivitiesRepository extends BaseRepository<AtividadeEntity> {
  constructor() {
    super(COLLECTIONS.atividades);
  }

  listByClass(professorId: string, turmaId: string) {
    return this.listByProfessor(professorId, [where('turmaId', '==', turmaId)]);
  }
}

class ActivityDeliveriesRepository extends BaseRepository<EntregaAtividadeEntity> {
  constructor() {
    super(COLLECTIONS.entregasAtividade);
  }

  listByActivity(professorId: string, atividadeId: string) {
    return this.listByProfessor(professorId, [where('atividadeId', '==', atividadeId)]);
  }

  listByStudent(professorId: string, alunoId: string) {
    return this.listByProfessor(professorId, [where('alunoId', '==', alunoId)]);
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
    const instance = ensureDb();

    const snapshot = await getDocs(
      query(
        collection(instance, COLLECTIONS.entregasAtividade),
        where('professorId', '==', professorId),
        where('atividadeId', '==', atividadeId)
      )
    );

    const existingByStudent = new Map(snapshot.docs.map((item) => [item.data().alunoId as string, item]));
    const batch = writeBatch(instance);
    const timestamp = new Date().toISOString();

    rows.forEach((row) => {
      const existing = existingByStudent.get(row.alunoId);

      if (existing) {
        batch.update(existing.ref, {
          ...row,
          updatedAt: timestamp
        });
        return;
      }

      const reference = doc(collection(instance, COLLECTIONS.entregasAtividade));
      batch.set(
        reference,
        createEntityPayload({
          professorId,
          atividadeId,
          alunoId: row.alunoId,
          status: row.status,
          nota: row.nota,
          entregueEm: row.entregueEm,
          createdAt: timestamp,
          updatedAt: timestamp
        })
      );
    });

    await batch.commit();
  }
}

export const activitiesRepository = new ActivitiesRepository();
export const activityDeliveriesRepository = new ActivityDeliveriesRepository();
