import { useMemo } from 'react';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useCollectionResource, useProfessor } from '@/hooks';
import { classesRepository } from '@/services/repositories';

export function ClassesScreen() {
  const { professorId } = useProfessor();
  const { items, loading, error } = useCollectionResource(professorId, classesRepository);

  const orderedItems = useMemo(() => [...items].sort((left, right) => left.nome.localeCompare(right.nome)), [items]);

  return (
    <>
      <PageHeader
        eyebrow="Turmas sincronizadas"
        title="Turmas organizadas por periodo"
        description="As turmas sao definidas pelo admin e ficam disponiveis automaticamente para a sua grade."
      />

      <section style={{ display: 'grid', gap: '1rem' }}>
        {loading && <LoadingState label="Carregando turmas..." />}
        {error && <ErrorState message={error} />}
        {!loading && !orderedItems.length && (
          <EmptyState
            title="Nenhuma turma sincronizada"
            description="Assim que o admin cadastrar alunos com turma, elas aparecerao aqui automaticamente."
          />
        )}
        {orderedItems.map((item) => (
          <Card
            key={item.id}
            title={item.nome}
            subtitle={`${item.codigo} - ${item.periodo}`}
            actions={<span style={{ color: item.cor, fontWeight: 700 }}>●</span>}
          >
            <p style={{ margin: 0, color: '#94a3b8' }}>{item.descricao || 'Sem descricao.'}</p>
            <p style={{ margin: 0, color: '#7dd3fc' }}>Turma sincronizada pelo admin.</p>
          </Card>
        ))}
      </section>
    </>
  );
}
