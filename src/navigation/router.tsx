import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { AppLoadingScreen } from '@/components/feedback/AppLoadingScreen';
import { AppShell } from '@/components/layout/AppShell';

const AttendanceScreen = lazy(() => import('@/screens/attendance/AttendanceScreen').then((module) => ({ default: module.AttendanceScreen })));
const AdminUsersScreen = lazy(() => import('@/screens/admin-users/AdminUsersScreen').then((module) => ({ default: module.AdminUsersScreen })));
const AdminSubjectsScreen = lazy(() => import('@/screens/admin-subjects/AdminSubjectsScreen').then((module) => ({ default: module.AdminSubjectsScreen })));
const ClassesScreen = lazy(() => import('@/screens/classes/ClassesScreen').then((module) => ({ default: module.ClassesScreen })));
const CompetitionScreen = lazy(() => import('@/screens/competition/CompetitionScreen').then((module) => ({ default: module.CompetitionScreen })));
const DashboardScreen = lazy(() => import('@/screens/dashboard/DashboardScreen').then((module) => ({ default: module.DashboardScreen })));
const MakeupsScreen = lazy(() => import('@/screens/makeups/MakeupsScreen').then((module) => ({ default: module.MakeupsScreen })));
const MinutesScreen = lazy(() => import('@/screens/atas/MinutesScreen').then((module) => ({ default: module.MinutesScreen })));
const NoticeBoardScreen = lazy(() => import('@/screens/notice-board/NoticeBoardScreen').then((module) => ({ default: module.NoticeBoardScreen })));
const AssessmentsScreen = lazy(() => import('@/screens/quizzes/QuizzesScreen').then((module) => ({ default: module.QuizzesScreen })));
const ProfileScreen = lazy(() => import('@/screens/profile/ProfileScreen').then((module) => ({ default: module.ProfileScreen })));
const RoleHomeScreen = lazy(() => import('@/screens/home/RoleHomeScreen').then((module) => ({ default: module.RoleHomeScreen })));
const StudentDetailsScreen = lazy(() => import('@/screens/student-details/StudentDetailsScreen').then((module) => ({ default: module.StudentDetailsScreen })));
const StudentPlannerScreen = lazy(() => import('@/screens/student-planner/StudentPlannerScreen').then((module) => ({ default: module.StudentPlannerScreen })));
const StudentsScreen = lazy(() => import('@/screens/students/StudentsScreen').then((module) => ({ default: module.StudentsScreen })));
const SubjectsScreen = lazy(() => import('@/screens/subjects/SubjectsScreen').then((module) => ({ default: module.SubjectsScreen })));

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<AppLoadingScreen label="Abrindo modulo..." />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: withSuspense(<RoleHomeScreen />) },
      { path: 'perfil', element: withSuspense(<ProfileScreen />) },
      { path: 'mural', element: withSuspense(<NoticeBoardScreen />) },
      { path: 'usuarios', element: withSuspense(<RoleGuard allow={['admin']}><AdminUsersScreen /></RoleGuard>) },
      { path: 'admin/materias', element: withSuspense(<RoleGuard allow={['admin']}><AdminSubjectsScreen /></RoleGuard>) },
      { path: 'meu-calendario', element: withSuspense(<RoleGuard allow={['aluno']}><StudentPlannerScreen /></RoleGuard>) },
      { path: 'dashboard', element: withSuspense(<RoleGuard allow={['professor']}><DashboardScreen /></RoleGuard>) },
      { path: 'atas', element: withSuspense(<RoleGuard allow={['professor']}><MinutesScreen /></RoleGuard>) },
      { path: 'turmas', element: withSuspense(<RoleGuard allow={['professor']}><ClassesScreen /></RoleGuard>) },
      { path: 'alunos', element: withSuspense(<RoleGuard allow={['professor']}><StudentsScreen /></RoleGuard>) },
      { path: 'alunos/:studentId', element: withSuspense(<RoleGuard allow={['professor']}><StudentDetailsScreen /></RoleGuard>) },
      { path: 'materias', element: withSuspense(<RoleGuard allow={['professor']}><SubjectsScreen /></RoleGuard>) },
      { path: 'chamada', element: withSuspense(<RoleGuard allow={['professor']}><AttendanceScreen /></RoleGuard>) },
      { path: 'competicao', element: withSuspense(<RoleGuard allow={['professor', 'aluno']}><CompetitionScreen /></RoleGuard>) },
      { path: 'avaliacoes', element: withSuspense(<RoleGuard allow={['professor']}><AssessmentsScreen /></RoleGuard>) },
      { path: 'reposicoes', element: withSuspense(<RoleGuard allow={['professor']}><MakeupsScreen /></RoleGuard>) }
    ]
  }
]);
