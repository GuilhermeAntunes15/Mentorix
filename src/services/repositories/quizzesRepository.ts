import { collection, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { BaseRepository } from '@/services/repositories/baseRepository';
import { COLLECTIONS } from '@/database/collections';
import { db } from '@/services/firebase/client';
import { createEntityPayload } from '@/utils/firestore';
import type { QuizEntity, TentativaQuizEntity } from '@/types';

function ensureDb() {
  if (!db) {
    throw new Error('Firebase nao configurado. Preencha o arquivo .env para habilitar persistencia.');
  }

  return db;
}

class QuizzesRepository extends BaseRepository<QuizEntity> {
  constructor() {
    super(COLLECTIONS.quizzes);
  }

  listByClass(professorId: string, turmaId: string) {
    return this.listByProfessor(professorId, [where('turmaId', '==', turmaId)]);
  }
}

class QuizAttemptsRepository extends BaseRepository<TentativaQuizEntity> {
  constructor() {
    super(COLLECTIONS.tentativasQuiz);
  }

  listByQuiz(professorId: string, quizId: string) {
    return this.listByProfessor(professorId, [where('quizId', '==', quizId)]);
  }

  listByStudent(professorId: string, alunoId: string) {
    return this.listByProfessor(professorId, [where('alunoId', '==', alunoId)]);
  }

  async upsertMany(
    professorId: string,
    quizId: string,
    turmaId: string,
    rows: Array<{
      alunoId: string;
      realizado: boolean;
      acertouDePrimeira: boolean;
      acertos: number;
      tentativas: number;
    }>
  ) {
    const instance = ensureDb();

    const snapshot = await getDocs(
      query(
        collection(instance, COLLECTIONS.tentativasQuiz),
        where('professorId', '==', professorId),
        where('quizId', '==', quizId)
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

      const reference = doc(collection(instance, COLLECTIONS.tentativasQuiz));
      batch.set(
        reference,
        createEntityPayload({
          professorId,
          quizId,
          alunoId: row.alunoId,
          turmaId,
          realizado: row.realizado,
          acertouDePrimeira: row.acertouDePrimeira,
          acertos: row.acertos,
          tentativas: row.tentativas,
          createdAt: timestamp,
          updatedAt: timestamp
        })
      );
    });

    await batch.commit();
  }
}

export const quizzesRepository = new QuizzesRepository();
export const quizAttemptsRepository = new QuizAttemptsRepository();
