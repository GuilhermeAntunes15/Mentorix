import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User
} from 'firebase/auth';
import { auth, provisioningAuth } from '@/services/firebase/client';
import { usersRepository } from '@/services/repositories';
import type { SubjectAssignment, UserEntity, UserRole } from '@/types';

function ensureAuth() {
  if (!auth) {
    throw new Error('Firebase Auth nao configurado. Verifique o arquivo .env.');
  }

  return auth;
}

function ensureProvisioningAuth() {
  if (!provisioningAuth) {
    throw new Error('Firebase Auth nao configurado. Verifique o arquivo .env.');
  }

  return provisioningAuth;
}

export function subscribeToAuthState(listener: (user: User | null) => void) {
  return onAuthStateChanged(ensureAuth(), listener);
}

export async function loginWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(ensureAuth(), email, password);
}

export async function logout() {
  await signOut(ensureAuth());
}

export async function changeCurrentUserPassword(currentPassword: string, nextPassword: string) {
  const instance = ensureAuth();
  const currentUser = instance.currentUser;

  if (!currentUser?.email) {
    throw new Error('Nao foi possivel localizar a sessao atual para atualizar a senha.');
  }

  const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
  await reauthenticateWithCredential(currentUser, credential);
  await updatePassword(currentUser, nextPassword);
}

export async function createManagedAccount({
  email,
  password,
  role,
  displayName,
  professorId,
  linkedStudentId,
  studentSyncKey,
  assignedSubjects
}: {
  email: string;
  password: string;
  role: UserRole;
  displayName: string;
  professorId: string;
  linkedStudentId?: string;
  studentSyncKey?: string;
  assignedSubjects?: SubjectAssignment[];
}) {
  const provision = ensureProvisioningAuth();
  const credentials = await createUserWithEmailAndPassword(provision, email, password);
  const authUid = credentials.user.uid;

  const userProfile: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'> = {
    professorId: role === 'professor' ? authUid : professorId,
    authUid,
    role,
    displayName,
    email,
    username: displayName,
    profileCompleted: role !== 'aluno',
    avatarKey: role === 'aluno' ? '' : 'star',
    linkedStudentId,
    studentSyncKey,
    targetProfessorId: role === 'professor' ? authUid : professorId
  };

  if (assignedSubjects?.length) {
    userProfile.assignedSubjects = assignedSubjects;
  }

  const createdProfile = await usersRepository.createManagedUser(userProfile);
  await signOut(provision);
  return createdProfile;
}
