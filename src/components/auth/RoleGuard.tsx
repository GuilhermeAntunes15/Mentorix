import { Navigate } from 'react-router-dom';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useSession } from '@/hooks';
import type { UserRole } from '@/types';

export function RoleGuard({
  allow,
  children,
  redirectTo = '/'
}: {
  allow: UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { session } = useSession();

  if (!session) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!allow.includes(session.role)) {
    return (
      <EmptyState
        title="Acesso nao permitido"
        description="Sua conta nao possui permissao para visualizar esta area."
      />
    );
  }

  return <>{children}</>;
}
