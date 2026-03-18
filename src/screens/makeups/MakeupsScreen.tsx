import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { IconButton } from '@/components/common/IconButton';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { Select } from '@/components/common/Select';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useCollectionResource, useProfessor } from '@/hooks';
import { classesRepository, lessonsRepository, makeupsRepository, subjectsRepository } from '@/services/repositories';
import { toISODate } from '@/utils/date';
import type { ReposicaoEntity, ReposicaoFormValues } from '@/types';

const initialForm: ReposicaoFormValues = {
  turmaId: '',
  materiaId: '',
  aulaOriginalId: '',
  titulo: '',
  data: toISODate(new Date()),
  status: 'pendente'
};

export function MakeupsScreen() {
  const { professorId } = useProfessor();
  const makeups = useCollectionResource(professorId, makeupsRepository);
  const classes = useCollectionResource(professorId, classesRepository);
  const subjects = useCollectionResource(professorId, subjectsRepository);
  const lessons = useCollectionResource(professorId, lessonsRepository);
  const [form, setForm] = useState<ReposicaoFormValues>(initialForm);
  const [editing, setEditing] = useState<ReposicaoEntity | null>(null);
  const [open, setOpen] = useState(false);

  const filteredSubjects = useMemo(() => subjects.items.filter((item) => !form.turmaId || item.turmaId === form.turmaId), [form.turmaId, subjects.items]);
  const filteredLessons = useMemo(() => lessons.items.filter((item) => !form.turmaId || item.turmaId === form.turmaId), [form.turmaId, lessons.items]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editing) {
      await makeups.updateItem(editing.id, form);
    } else {
      await makeups.createItem(form);
    }
    setEditing(null);
    setForm(initialForm);
    setOpen(false);
  }

  return (
    <>
      <PageHeader
        eyebrow="Reposicoes"
        title="Aulas de reposicao com status"
        description="Cadastre e edite reposicoes em modal para manter a visualizacao mais limpa."
        actions={<IconButton onClick={() => { setEditing(null); setForm(initialForm); setOpen(true); }}><Plus size={18} /> Nova reposicao</IconButton>}
      />

      <section style={{ display: 'grid', gap: '1rem' }}>
        {makeups.loading && <LoadingState label="Carregando reposicoes..." />}
        {makeups.error && <ErrorState message={makeups.error} />}
        {!makeups.loading && !makeups.items.length && (
          <EmptyState title="Nenhuma reposicao cadastrada" description="Cadastre reposicoes para manter o historico completo de aulas feitas e pendentes." />
        )}
        {makeups.items.map((item) => {
          const turma = classes.items.find((entry) => entry.id === item.turmaId);
          const materia = subjects.items.find((entry) => entry.id === item.materiaId);
          return (
            <Card key={item.id} title={item.titulo} subtitle={`${materia?.nome ?? 'Materia'} - ${turma?.nome ?? 'Turma'}`} actions={<Badge>{item.status}</Badge>}>
              <p style={{ margin: 0, color: '#94a3b8' }}>Data prevista: {item.data}</p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditing(item);
                    setForm({
                      turmaId: item.turmaId,
                      materiaId: item.materiaId,
                      aulaOriginalId: item.aulaOriginalId,
                      titulo: item.titulo,
                      data: item.data,
                      status: item.status
                    });
                    setOpen(true);
                  }}
                >
                  Editar
                </Button>
                <Button variant="danger" onClick={() => void makeups.removeItem(item.id)}>Excluir</Button>
              </div>
            </Card>
          );
        })}
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar reposicao' : 'Nova reposicao'}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <Select
            label="Turma"
            value={form.turmaId}
            onChange={(event) => setForm({ ...form, turmaId: event.target.value, materiaId: '', aulaOriginalId: '' })}
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
          <Select
            label="Aula original"
            value={form.aulaOriginalId ?? ''}
            onChange={(event) => setForm({ ...form, aulaOriginalId: event.target.value })}
            options={[{ value: '', label: 'Opcional' }, ...filteredLessons.map((item) => ({ value: item.id, label: `${item.titulo} - ${item.data}` }))]}
          />
          <Input label="Titulo" value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} required />
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Input label="Data" type="date" value={form.data} onChange={(event) => setForm({ ...form, data: event.target.value })} required />
            <Select
              label="Status"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as ReposicaoEntity['status'] })}
              options={[
                { value: 'pendente', label: 'Pendente' },
                { value: 'feito', label: 'Feito' },
                { value: 'cancelado', label: 'Cancelado' }
              ]}
            />
          </div>
          <Button type="submit">{editing ? 'Salvar reposicao' : 'Criar reposicao'}</Button>
        </form>
      </Modal>
    </>
  );
}
