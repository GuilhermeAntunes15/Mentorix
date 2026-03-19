import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { COLLECTIONS } from '@/database/collections';
import { db } from '@/services/firebase/client';
import { createEntityPayload } from '@/utils/firestore';
import type { AtaAssinaturaEntity, AtaEntity } from '@/types';

function ensureDb() {
  if (!db) {
    throw new Error('Firebase nao configurado. Preencha o arquivo .env para habilitar persistencia.');
  }

  return db;
}

class AtasRepository extends BaseRepository<AtaEntity> {
  constructor() {
    super(COLLECTIONS.atas);
  }

  async listForUser(userId: string) {
    const instance = ensureDb();
    const snapshot = await getDocs(
      query(collection(instance, COLLECTIONS.atas), where('participantUserIds', 'array-contains', userId))
    );

    return snapshot.docs
      .map((item) => this.mapSnapshot(item))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async touchLock(id: string) {
    await updateDoc(doc(ensureDb(), COLLECTIONS.atas, id), {
      lockedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
}

class AtaSignaturesRepository extends BaseRepository<AtaAssinaturaEntity> {
  constructor() {
    super(COLLECTIONS.assinaturasAta);
  }

  async listByAta(ataId: string) {
    const instance = ensureDb();
    const snapshot = await getDocs(
      query(collection(instance, COLLECTIONS.assinaturasAta), where('ataId', '==', ataId))
    );

    return snapshot.docs
      .map((item) => this.mapSnapshot(item))
      .sort((left, right) => left.signedAt.localeCompare(right.signedAt));
  }

  async getByAtaAndSigner(ataId: string, signedByUserId: string) {
    const signatures = await this.listByAta(ataId);
    return signatures.find((signature) => signature.signedByUserId === signedByUserId) ?? null;
  }

  async createSignature(
    professorId: string,
    payload: Omit<AtaAssinaturaEntity, 'id' | 'professorId' | 'createdAt' | 'updatedAt'>
  ) {
    const instance = ensureDb();
    const timestamp = new Date().toISOString();
    const reference = await addDoc(
      collection(instance, COLLECTIONS.assinaturasAta),
      createEntityPayload({
        ...payload,
        professorId,
        createdAt: timestamp,
        updatedAt: timestamp
      })
    );

    return this.getById(reference.id);
  }
}

export const atasRepository = new AtasRepository();
export const ataSignaturesRepository = new AtaSignaturesRepository();
