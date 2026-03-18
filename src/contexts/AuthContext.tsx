import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppLoadingScreen } from '@/components/feedback/AppLoadingScreen';
import { changeCurrentUserPassword, loginWithEmail, logout, subscribeToAuthState } from '@/services/auth/authService';
import { provisionProfessorAccount, provisionStudentAccount } from '@/services/admin/adminProvisioningService';
import { usersRepository } from '@/services/repositories';
import type { AppSession, ManagedUserProvisionInput, UserEntity } from '@/types';

interface AuthContextValue {
  session: AppSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, nextPassword: string) => Promise<void>;
  createManagedUser: (payload: ManagedUserProvisionInput) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: Partial<Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function buildSession(profile: UserEntity): AppSession {
  return {
    authUid: profile.authUid,
    role: profile.role,
    profile,
    professorId: profile.role === 'professor' ? profile.authUid : profile.professorId,
    alunoId: profile.linkedStudentId,
    displayName: profile.displayName,
    username: profile.username || profile.displayName
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);

  async function syncProfile(authUid: string | null) {
    if (!authUid) {
      setSession(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await usersRepository.getByAuthUid(authUid);
      setSession(profile ? buildSession(profile) : null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      setLoading(true);
      void syncProfile(user?.uid ?? null);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      login: loginWithEmail,
      logout,
      changePassword: changeCurrentUserPassword,
      createManagedUser: async (payload) => {
        if (payload.role === 'professor') {
          await provisionProfessorAccount(payload);
          return;
        }

        await provisionStudentAccount(payload);
      },
      refreshProfile: async () => {
        if (!session?.authUid) {
          return;
        }

        await syncProfile(session.authUid);
      },
      updateProfile: async (patch) => {
        if (!session?.authUid) {
          return;
        }

        await usersRepository.updateByAuthUid(session.authUid, patch);
        await syncProfile(session.authUid);
      }
    }),
    [loading, session]
  );

  if (loading) {
    return <AppLoadingScreen label="Validando sessao..." />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
