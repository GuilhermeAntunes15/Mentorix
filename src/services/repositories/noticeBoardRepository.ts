import { collection, getDocs, where } from 'firebase/firestore';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { COLLECTIONS } from '@/database/collections';
import { db } from '@/services/firebase/client';
import type { AvisoMuralEntity, CurtidaAvisoMuralEntity } from '@/types';

function ensureDb() {
  if (!db) {
    throw new Error('Firebase nao configurado. Preencha o arquivo .env para habilitar persistencia.');
  }

  return db;
}

class NoticeBoardRepository extends BaseRepository<AvisoMuralEntity> {
  constructor() {
    super(COLLECTIONS.avisosMural);
  }

  listAll() {
    return getDocs(collection(ensureDb(), COLLECTIONS.avisosMural)).then((snapshot) =>
      snapshot.docs.map((item) => this.mapSnapshot(item))
    );
  }

  listByClass(professorId: string, turmaId: string) {
    return this.listByProfessor(professorId, [where('turmaId', '==', turmaId)]);
  }
}

class NoticeLikesRepository extends BaseRepository<CurtidaAvisoMuralEntity> {
  constructor() {
    super(COLLECTIONS.curtidasAvisoMural);
  }

  listAll() {
    return getDocs(collection(ensureDb(), COLLECTIONS.curtidasAvisoMural)).then((snapshot) =>
      snapshot.docs.map((item) => this.mapSnapshot(item))
    );
  }

  listByNotice(professorId: string, avisoId: string) {
    return this.listByProfessor(professorId, [where('avisoId', '==', avisoId)]);
  }
}

export const noticeBoardRepository = new NoticeBoardRepository();
export const noticeLikesRepository = new NoticeLikesRepository();
