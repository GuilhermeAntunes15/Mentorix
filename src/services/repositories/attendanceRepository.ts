import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { COLLECTIONS } from '@/database/collections';
import { db } from '@/services/firebase/client';
import { createEntityPayload } from '@/utils/firestore';
import type { ChamadaEntity, FrequenciaEntity, PresenceStatus } from '@/types';

function ensureDb() {
  if (!db) {
    throw new Error('Firebase nao configurado. Preencha o arquivo .env para habilitar persistencia.');
  }

  return db;
}

class AttendanceRepository extends BaseRepository<ChamadaEntity> {
  constructor() {
    super(COLLECTIONS.chamadas);
  }

  listByLesson(professorId: string, aulaId: string) {
    return this.listByProfessor(professorId, [where('aulaId', '==', aulaId)]);
  }

  async getByLessonAndDate(professorId: string, aulaId: string, date: string) {
    const list = await this.listByProfessor(professorId, [
      where('aulaId', '==', aulaId),
      where('dataReferencia', '==', date)
    ]);
    return list[0] ?? null;
  }
}

class FrequencyRepository extends BaseRepository<FrequenciaEntity> {
  constructor() {
    super(COLLECTIONS.frequencias);
  }

  listByAttendance(professorId: string, chamadaId: string) {
    return this.listByProfessor(professorId, [where('chamadaId', '==', chamadaId)]);
  }

  listByStudent(professorId: string, alunoId: string) {
    return this.listByProfessor(professorId, [where('alunoId', '==', alunoId)]);
  }

  async upsertMany(
    professorId: string,
    chamadaId: string,
    aulaId: string,
    rows: Array<{ alunoId: string; status: PresenceStatus }>
  ) {
    const instance = ensureDb();

    const existingSnapshot = await getDocs(
      query(
        collection(instance, COLLECTIONS.frequencias),
        where('professorId', '==', professorId),
        where('chamadaId', '==', chamadaId)
      )
    );

    const existingByStudent = new Map(existingSnapshot.docs.map((item) => [item.data().alunoId as string, item]));
    const batch = writeBatch(instance);
    const timestamp = new Date().toISOString();

    rows.forEach((row) => {
      const existing = existingByStudent.get(row.alunoId);

      if (existing) {
        batch.update(existing.ref, {
          status: row.status,
          updatedAt: timestamp
        });
        return;
      }

      const reference = doc(collection(instance, COLLECTIONS.frequencias));
      batch.set(
        reference,
        createEntityPayload({
          professorId,
          chamadaId,
          aulaId,
          alunoId: row.alunoId,
          status: row.status,
          createdAt: timestamp,
          updatedAt: timestamp
        })
      );
    });

    await batch.commit();
  }

  async markAllStatus(chamadaId: string, status: PresenceStatus) {
    const instance = ensureDb();

    const snapshot = await getDocs(query(collection(instance, COLLECTIONS.frequencias), where('chamadaId', '==', chamadaId)));
    const batch = writeBatch(instance);

    snapshot.forEach((item) => {
      batch.update(item.ref, {
        status,
        updatedAt: new Date().toISOString()
      });
    });

    await batch.commit();
  }
}

async function createAttendance(
  professorId: string,
  aulaId: string,
  date: string,
  retroativa: boolean
) {
  const instance = ensureDb();

  const timestamp = new Date().toISOString();
  const payload = createEntityPayload({
    professorId,
    aulaId,
    dataReferencia: date,
    retroativa,
    status: 'em_andamento' as const,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  const reference = await addDoc(collection(instance, COLLECTIONS.chamadas), payload);
  return { id: reference.id, ...payload } as ChamadaEntity;
}

async function updateAttendanceStatus(chamadaId: string, status: ChamadaEntity['status']) {
  const instance = ensureDb();

  await updateDoc(doc(instance, COLLECTIONS.chamadas, chamadaId), {
    status,
    updatedAt: new Date().toISOString()
  });
}

export const attendanceRepository = new AttendanceRepository();
export const frequencyRepository = new FrequencyRepository();
export const attendanceCommands = {
  createAttendance,
  updateAttendanceStatus
};
