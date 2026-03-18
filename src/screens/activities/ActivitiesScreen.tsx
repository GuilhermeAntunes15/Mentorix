import { useMemo, useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { PageHeader } from '@/components/common/PageHeader';
import { Select } from '@/components/common/Select';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useCollectionResource, useProfessor } from '@/hooks';
import { activitiesRepository, classesRepository, subjectsRepository } from '@/services/repositories';
import { toISODate } from '@/utils/date';
import type { AtividadeEntity, AtividadeFormValues } from '@/types';

const initialForm: AtividadeFormValues = {
  turmaId: '',
  materiaId: '',
  titulo: '',
  dataEntrega: toISODate(new Date()),
  notaMaxima: 10
};

export function ActivitiesScreen() {
  const { professorId } = useProfessor();
  const activities = useCollectionResource(professorId, activitiesRepository);
  const classes = useCollectionResource(professorId, classesRepository);
  const subjects = useCollectionResource(professorId, subjectsRepository);
  const [form, setForm] = useState<AtividadeFormValues>(initialForm);
  const [editing, setEditing] = useState<AtividadeEntity | null>(null);

  const filteredSubjects = useMemo(() => subjects.items.filter((item) => !form.turmaId || item.turmaId === form.turmaId), [form.turmaId, subjects.items]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { ...form, notaMaxima: Number(form.notaMaxima) };

    if (editing) {
      await activities.updateItem(editing.id, payload);
    } else {
      await activities.createItem(payload);
    }

    setEditing(null);
    setForm(initialForm);
  }

  return (
    <>
      <PageHeader
        eyebrow="Atividades"
        title="Atividades, entregas e media"
        description="Cadastre atividades por turma e materia. As entregas e notas alimentam o painel do aluno e a media academica."
      />

      <div className="responsive-grid" style={{ alignItems: 'start' }}>
        <Card title={editing ? 'Editar atividade' : 'Nova atividade'} subtitle="Preparado para evoluir com correcoes e dashboards.">
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <Select
              label="Turma"
              value={form.turmaId}
              onChange={(event) => setForm({ ...form, turmaId: event.target.value, materiaId: '' })}
              options={[{ value: '', label: 'Selecione uma turma' }, ...classes.items.map((item) => ({ value: item.id, label: item.nome }))]}
              required
            />
            <Select
              label="Materia"
              value={form.materiaId}
              onChange={(event) => setForm({ ...form, materiaId: event.target.value })}
              options={[{ value: '', label: 'Selecione uma materia' }, ...filteredSubjects.map((item) => ({ value: item.id, label: item.nome }))]}
              required
            />
            <Input label="Titulo" value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} required />
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Input label="Data de entrega" type="date" value={form.dataEntrega} onChange={(event) => setForm({ ...form, dataEntrega: event.target.value })} />
              <Input label="Nota maxima" type="number" value={String(form.notaMaxima ?? 10)} onChange={(event) => setForm({ ...form, notaMaxima: Number(event.target.value) })} />
            </div>
            <Button type="submit">{editing ? 'Salvar atividade' : 'Criar atividade'}</Button>
          </form>
        </Card>

        <section style={{ display: 'grid', gap: '1rem' }}>
          {activities.loading && <LoadingState label="Carregando atividades..." />}
          {activities.error && <ErrorState message={activities.error} />}
          {!activities.loading && !activities.items.length && (
            <EmptyState title="Nenhuma atividade cadastrada" description="As atividades ajudam a medir media, entregas, pendencias e desempenho continuo." />
          )}
          {activities.items.map((activity) => {
            const turma = classes.items.find((item) => item.id === activity.turmaId);
            const materia = subjects.items.find((item) => item.id === activity.materiaId);
            return (
              <Card key={activity.id} title={activity.titulo} subtitle={`${materia?.nome ?? 'Materia'} • ${turma?.nome ?? 'Turma'}`} actions={<Badge>{activity.notaMaxima ?? '-'} pts</Badge>}>
                <p style={{ margin: 0, color: '#94a3b8' }}>Entrega: {activity.dataEntrega}</p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Button variant="secondary" onClick={() => {
                    setEditing(activity);
                    setForm({
                      turmaId: activity.turmaId,
                      materiaId: activity.materiaId,
                      titulo: activity.titulo,
                      dataEntrega: activity.dataEntrega,
                      notaMaxima: activity.notaMaxima
                    });
                  }}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => void activities.removeItem(activity.id)}>
                    Excluir
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>
      </div>
    </>
  );
}
