import { useSession } from '@/hooks';
import { AdminUsersScreen } from '@/screens/admin-users/AdminUsersScreen';
import { CalendarScreen } from '@/screens/calendar/CalendarScreen';
import { StudentPlannerScreen } from '@/screens/student-planner/StudentPlannerScreen';

export function RoleHomeScreen() {
  const { session } = useSession();

  if (session?.role === 'admin') {
    return <AdminUsersScreen />;
  }

  if (session?.role === 'aluno') {
    return <StudentPlannerScreen />;
  }

  return <CalendarScreen />;
}
