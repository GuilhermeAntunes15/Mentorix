import { useSession } from '@/hooks';
import { AdminDashboardScreen } from '@/screens/admin-dashboard/AdminDashboardScreen';
import { CalendarScreen } from '@/screens/calendar/CalendarScreen';
import { StudentPlannerScreen } from '@/screens/student-planner/StudentPlannerScreen';

export function RoleHomeScreen() {
  const { session } = useSession();

  if (session?.role === 'admin') {
    return <AdminDashboardScreen />;
  }

  if (session?.role === 'aluno') {
    return <StudentPlannerScreen />;
  }

  return <CalendarScreen />;
}
