import { useAuth } from '@/contexts/AuthContext';

export function useSession() {
  const { session, loading, refreshProfile, updateProfile, createManagedUser, login, logout, changePassword, createSignatureProof } = useAuth();

  return {
    session,
    loading,
    refreshProfile,
    updateProfile,
    createManagedUser,
    login,
    logout,
    changePassword,
    createSignatureProof
  };
}
