import { supabase } from '@/services/supabase/client';
import { usersRepository } from '@/services/repositories';
import { sha256Text } from '@/utils/crypto';
import type { SubjectAssignment, UserEntity, UserRole } from '@/types';

export function subscribeToAuthState(listener: (user: { id: string } | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    listener(session?.user ?? null);
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function loginWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function changeCurrentUserPassword(currentPassword: string, nextPassword: string) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    throw new Error('Nao foi possivel localizar a sessao atual para atualizar a senha.');
  }

  const { error: reAuthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  });

  if (reAuthError) {
    throw reAuthError;
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: nextPassword });

  if (updateError) {
    throw updateError;
  }
}

export async function createCurrentUserSignatureProof(password: string) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    throw new Error('Nao foi possivel validar a sessao atual para assinar o documento.');
  }

  const { error: reAuthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password
  });

  if (reAuthError) {
    throw reAuthError;
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Nao foi possivel obter o token de sessao para assinatura.');
  }

  return {
    authUid: user.id,
    email: user.email,
    proofHash: await sha256Text(session.access_token)
  };
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
  // Salvar sessao atual do admin antes de criar o novo usuario
  const { data: { session: adminSession } } = await supabase.auth.getSession();

  // Criar usuario via signUp (isso muda a sessao ativa)
  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome: displayName, role }
    }
  });

  if (error) {
    throw new Error(error.message || 'Falha ao criar conta de usuario.');
  }

  const authUid = signUpData.user?.id;

  if (!authUid) {
    throw new Error('Nao foi possivel obter o uid do usuario criado.');
  }

  // Restaurar sessao do admin
  if (adminSession?.refresh_token) {
    await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token
    });
  }

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
  return createdProfile;
}
