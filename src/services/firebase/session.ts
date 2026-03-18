export function getProfessorId() {
  return import.meta.env.VITE_DEFAULT_PROFESSOR_ID ?? 'mentor-demo-professor';
}
