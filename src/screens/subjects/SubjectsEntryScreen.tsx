import { useSession } from '@/hooks';
import { AdminSubjectsScreen } from '@/screens/admin-subjects/AdminSubjectsScreen';
import { SubjectsScreen } from '@/screens/subjects/SubjectsScreen';

export function SubjectsEntryScreen() {
  const { session } = useSession();

  if (session?.role === 'admin') {
    return <AdminSubjectsScreen />;
  }

  return <SubjectsScreen />;
}
