import type { AlunoEntity, MateriaEntity, TurmaEntity } from '@/types/entities';

export interface DashboardQuizCoverage {
  responded: number;
  pending: number;
  totalExpected: number;
  completionRate: number;
}

export interface DashboardAttendanceSummary {
  present: number;
  absent: number;
  justified: number;
  totalCalls: number;
  presencePercentage: number;
  absencePercentage: number;
}

export interface DashboardActivitySummary {
  delivered: number;
  pending: number;
  totalExpected: number;
  completionRate: number;
  averageGrade: number;
  pendingTitles: string[];
}

export interface DashboardSubjectQuizCoverage {
  materiaId: string;
  materiaNome: string;
  cor: string;
  responded: number;
  pending: number;
  totalExpected: number;
  completionRate: number;
}

export interface DashboardSubjectQuizDetail {
  materiaId: string;
  materiaNome: string;
  cor: string;
  respondedCount: number;
  pendingCount: number;
  respondedTitles: string[];
  pendingTitles: string[];
}

export interface DashboardStudentInsight {
  aluno: AlunoEntity;
  quizCompletionRate: number;
  activityCompletionRate: number;
  attendancePercentage: number;
  pendingActivities: number;
  pendingQuizzes: number;
}

export interface DashboardSummaryCards {
  totalStudents: number;
  totalQuizzes: number;
  totalActivities: number;
  studentsWithPendingActivities: number;
  studentsWithLowAttendance: number;
}

export interface TeacherDashboardSnapshot {
  turma?: TurmaEntity;
  alunos: AlunoEntity[];
  materias: MateriaEntity[];
  selectedStudent?: AlunoEntity;
  quizCoverage: DashboardQuizCoverage;
  attendance: DashboardAttendanceSummary;
  activitySummary: DashboardActivitySummary;
  subjectQuizCoverage: DashboardSubjectQuizCoverage[];
  subjectQuizDetails: DashboardSubjectQuizDetail[];
  topStudents: DashboardStudentInsight[];
  attentionStudents: DashboardStudentInsight[];
  summary: DashboardSummaryCards;
}
