import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  type QueryConstraint,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '@/services/firebase/client';
import { createEntityPayload, stripUndefined } from '@/utils/firestore';
import type { BaseEntity } from '@/types';

type EntityInput<TEntity extends BaseEntity> = Omit<TEntity, 'id' | 'professorId' | 'createdAt' | 'updatedAt'>;
type EntityPatch<TEntity extends BaseEntity> = Partial<EntityInput<TEntity>>;

export abstract class BaseRepository<TEntity extends BaseEntity> {
  protected constructor(private readonly collectionName: string) {}

  protected ensureDb() {
    if (!db) {
      throw new Error('Firebase nao configurado. Preencha o arquivo .env para habilitar persistencia.');
    }

    return db;
  }

  protected mapSnapshot(documentSnapshot: { id: string; data: () => unknown }) {
    return {
      id: documentSnapshot.id,
      ...(documentSnapshot.data() as Omit<TEntity, 'id'>)
    } as TEntity;
  }

  async listByProfessor(professorId: string, constraints: QueryConstraint[] = []) {
    const instance = this.ensureDb();
    const snapshot = await getDocs(
      query(collection(instance, this.collectionName), where('professorId', '==', professorId), ...constraints)
    );
    return snapshot.docs.map((item) => this.mapSnapshot(item));
  }

  async getById(id: string) {
    const instance = this.ensureDb();
    const snapshot = await getDoc(doc(instance, this.collectionName, id));
    return snapshot.exists() ? this.mapSnapshot(snapshot) : null;
  }

  async create(professorId: string, data: EntityInput<TEntity>) {
    const instance = this.ensureDb();
    const timestamp = new Date().toISOString();
    const payload = createEntityPayload({
      ...data,
      professorId,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    const reference = await addDoc(collection(instance, this.collectionName), payload);
    return {
      id: reference.id,
      ...(payload as Omit<TEntity, 'id'>)
    } as TEntity;
  }

  async update(id: string, data: EntityPatch<TEntity>) {
    const instance = this.ensureDb();
    const payload = stripUndefined({
      ...data,
      updatedAt: new Date().toISOString()
    });

    await updateDoc(doc(instance, this.collectionName, id), payload);
  }

  async remove(id: string) {
    const instance = this.ensureDb();
    await deleteDoc(doc(instance, this.collectionName, id));
  }
}
