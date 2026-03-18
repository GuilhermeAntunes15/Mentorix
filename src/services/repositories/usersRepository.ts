import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { COLLECTIONS } from '@/database/collections';
import { db } from '@/services/firebase/client';
import { createEntityPayload } from '@/utils/firestore';
import type { UserEntity, UserRole } from '@/types';

function ensureDb() {
  if (!db) {
    throw new Error('Firebase nao configurado. Preencha o arquivo .env para habilitar persistencia.');
  }

  return db;
}

class UsersRepository extends BaseRepository<UserEntity> {
  constructor() {
    super(COLLECTIONS.users);
  }

  async getByAuthUid(authUid: string) {
    const snapshot = await getDoc(doc(ensureDb(), COLLECTIONS.users, authUid));
    return snapshot.exists() ? this.mapSnapshot(snapshot) : null;
  }

  async listAll() {
    const instance = ensureDb();
    const snapshot = await getDocs(collection(instance, COLLECTIONS.users));
    return snapshot.docs.map((item) => this.mapSnapshot(item));
  }

  async listByRole(role: UserRole) {
    const instance = ensureDb();
    const snapshot = await getDocs(query(collection(instance, COLLECTIONS.users), where('role', '==', role)));
    return snapshot.docs.map((item) => this.mapSnapshot(item));
  }

  async listByProfessorOwner(professorId: string) {
    return this.listByProfessor(professorId);
  }

  async createManagedUser(profile: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>) {
    const instance = ensureDb();
    const timestamp = new Date().toISOString();
    const payload = createEntityPayload({
      ...profile,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    await setDoc(doc(instance, COLLECTIONS.users, profile.authUid), payload);
    return { id: profile.authUid, ...payload } as UserEntity;
  }

  async updateByAuthUid(authUid: string, patch: Partial<Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>>) {
    await updateDoc(doc(ensureDb(), COLLECTIONS.users, authUid), {
      ...patch,
      updatedAt: new Date().toISOString()
    });
  }
}

export const usersRepository = new UsersRepository();
