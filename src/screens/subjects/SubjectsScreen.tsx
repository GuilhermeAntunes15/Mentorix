import { useMemo } from 'react';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useCollectionResource, useProfessor } from '@/hooks';
import { classesRepository, subjectsRepository } from '@/services/repositories';

export function SubjectsScreen() {
  const { professorId } = useProfessor();
  const classes = useCollectionResource(professorId, classesRepository);
  const subjects = useCollectionResource(professorId, subjectsRepository);

  const orderedSubjects = useMemo(
    () => [...subjects.items].sort((left, right) => left.nome.localeCompare(right.nome)),
    [subjects.items]
  );

  return (
    <>
      <PageHeader
        eyebrow="Materias sincronizadas"
        title="Materias autorizadas para a sua grade"
        description="Essas materias agora sao organizadas pelo admin com professor e turma definidos."
      />

      <section style={{ display: 'grid', gap: '1rem' }}>
        {subjects.loading && <LoadingState label="Carregando materias..." />}
        {subjects.error && <ErrorState message={subjects.error} />}
        {!subjects.loading && !orderedSubjects.length && (
          <EmptyState
            title="Nenhuma materia vinculada"
            description="O admin precisa cadastrar materias na tela `Materias`, escolhendo primeiro o professor e a turma."
          />
        )}
        {orderedSubjects.map((item) => {
          const turma = classes.items.find((classItem) => classItem.id === item.turmaId);
          return (
            <Card key={item.id} title={item.nome} subtitle={turma?.nome ?? 'Turma nao encontrada'} actions={<Badge>{item.codigo}</Badge>}>
              <p style={{ margin: 0, color: '#94a3b8' }}>{item.descricao || 'Sem descricao.'}</p>
              <p style={{ margin: 0, color: '#7dd3fc' }}>Materia vinculada pelo admin para uso na grade semanal.</p>
            </Card>
          );
        })}
      </section>
    </>
  );
}
