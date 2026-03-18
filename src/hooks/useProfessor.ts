import { useSession } from '@/hooks/useSession';

export function useProfessor() {
  const { session } = useSession();

  return {
    professorId: session?.professorId ?? ''
  };
}
