import { BookPlus, CalendarPlus, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { Select } from '@/components/common/Select';
import { TextArea } from '@/components/common/TextArea';
import { DayNavigator } from '@/components/calendar/DayNavigator';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useCollectionResource, useSession } from '@/hooks';
import { personalAgendaRepository, personalSubjectsRepository } from '@/services/repositories';
import { shiftDate, toISODate } from '@/utils/date';
import type { AgendaPessoalFormValues, MateriaPessoalEntity, MateriaPessoalFormValues } from '@/types';

const initialSubjectForm: MateriaPessoalFormValues = {
  userId: '',
  nome: '',
  cor: '#7dd3fc',
  descricao: ''
};

const initialAgendaForm: AgendaPessoalFormValues = {
  userId: '',
  materiaPessoalId: '',
  titulo: '',
  descricao: '',
  data: toISODate(new Date()),
  horaInicio: '',
  horaFim: ''
};

export function StudentPlannerScreen() {
  const { session } = useSession();
  const [date, setDate] = useState(toISODate(new Date()));
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [agendaModalOpen, setAgendaModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<MateriaPessoalEntity | null>(null);
  const [subjectForm, setSubjectForm] = useState<MateriaPessoalFormValues>(initialSubjectForm);
  const [agendaForm, setAgendaForm] = useState<AgendaPessoalFormValues>(initialAgendaForm);
  const subjects = useCollectionResource(session?.authUid ?? '', personalSubjectsRepository);
  const agenda = useCollectionResource(session?.authUid ?? '', personalAgendaRepository);

  const ownSubjects = useMemo(
    () => subjects.items.filter((item) => item.userId === session?.authUid).sort((a, b) => a.nome.localeCompare(b.nome)),
    [session?.authUid, subjects.items]
  );
  const ownAgenda = useMemo(
    () =>
      agenda.items
        .filter((item) => item.userId === session?.authUid && item.data === date)
        .sort((a, b) => `${a.horaInicio ?? ''}`.localeCompare(`${b.horaInicio ?? ''}`)),
    [agenda.items, date, session?.authUid]
  );

  async function handleSaveSubject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { ...subjectForm, userId: session?.authUid ?? '' };
    if (editingSubject) {
      await subjects.updateItem(editingSubject.id, payload);
    } else {
      await subjects.createItem(payload);
    }
    setSubjectModalOpen(false);
    setEditingSubject(null);
    setSubjectForm(initialSubjectForm);
  }

  async function handleSaveAgenda(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await agenda.createItem({ ...agendaForm, userId: session?.authUid ?? '', data: date });
    setAgendaModalOpen(false);
    setAgendaForm({ ...initialAgendaForm, data: date });
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <PageHeader
        eyebrow="Meu calendario"
        title="Planejamento pessoal do aluno"
        description="Monte sua rotina pessoal, adicione materias proprias e organize tarefas do seu dia."
        actions={
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => { setEditingSubject(null); setSubjectForm({ ...initialSubjectForm, userId: session.authUid }); setSubjectModalOpen(true); }}>
              <BookPlus size={18} /> Nova materia
            </Button>
            <Button onClick={() => { setAgendaForm({ ...initialAgendaForm, userId: session.authUid, data: date }); setAgendaModalOpen(true); }}>
              <CalendarPlus size={18} /> Novo compromisso
            </Button>
          </div>
        }
      />

      <DayNavigator
        date={date}
        onPrevious={() => setDate((current) => shiftDate(current, -1))}
        onNext={() => setDate((current) => shiftDate(current, 1))}
        onToday={() => setDate(toISODate(new Date()))}
      />

      {(subjects.loading || agenda.loading) && <LoadingState label="Carregando seu planejamento..." />}
      {(subjects.error || agenda.error) && <ErrorState message={subjects.error || agenda.error || 'Erro ao carregar o planner.'} />}

      <div className="responsive-grid" style={{ alignItems: 'start' }}>
        <Card title="Minhas materias" subtitle="Disciplinas e frentes de estudo pessoais.">
          {ownSubjects.length ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {ownSubjects.map((subject) => (
                <div
                  key={subject.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    padding: '0.9rem 1rem',
                    borderRadius: 20,
                    background: `${subject.cor}22`,
                    border: `1px solid ${subject.cor}33`
                  }}
                >
                  <div>
                    <strong>{subject.nome}</strong>
                    <p style={{ margin: '0.25rem 0 0', color: '#94a3b8' }}>{subject.descricao || 'Sem descricao.'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Button variant="ghost" onClick={() => { setEditingSubject(subject); setSubjectForm(subject); setSubjectModalOpen(true); }}>
                      <Pencil size={18} /> Editar
                    </Button>
                    <Button variant="danger" onClick={() => void subjects.removeItem(subject.id)}>Excluir</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Sem materias pessoais" description="Adicione materias para organizar seu estudo fora da grade do professor." />
          )}
        </Card>

        <Card title="Compromissos do dia" subtitle="Planeje o que voce quer estudar ou fazer nesta data.">
          {ownAgenda.length ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {ownAgenda.map((item) => {
                const subject = ownSubjects.find((subjectItem) => subjectItem.id === item.materiaPessoalId);
                return (
                  <div key={item.id} style={{ padding: '0.9rem 1rem', borderRadius: 20, background: 'rgba(15, 23, 42, 0.58)', border: '1px solid rgba(148, 163, 184, 0.12)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <strong>{item.titulo}</strong>
                      <Badge tone="info">{item.horaInicio || '--:--'} {item.horaFim ? `- ${item.horaFim}` : ''}</Badge>
                    </div>
                    <p style={{ margin: '0.35rem 0 0', color: '#94a3b8' }}>{item.descricao || 'Sem descricao.'}</p>
                    {subject && <Badge>{subject.nome}</Badge>}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Dia livre" description="Adicione compromissos pessoais para esta data." />
          )}
        </Card>
      </div>

      <Modal open={subjectModalOpen} onClose={() => setSubjectModalOpen(false)} title={editingSubject ? 'Editar materia pessoal' : 'Nova materia pessoal'}>
        <form onSubmit={handleSaveSubject} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <Input label="Nome" value={subjectForm.nome} onChange={(event) => setSubjectForm({ ...subjectForm, nome: event.target.value })} required />
          <Input label="Cor" type="color" value={subjectForm.cor} onChange={(event) => setSubjectForm({ ...subjectForm, cor: event.target.value })} />
          <TextArea label="Descricao" value={subjectForm.descricao ?? ''} onChange={(event) => setSubjectForm({ ...subjectForm, descricao: event.target.value })} />
          <Button type="submit">{editingSubject ? 'Salvar materia' : 'Criar materia'}</Button>
        </form>
      </Modal>

      <Modal open={agendaModalOpen} onClose={() => setAgendaModalOpen(false)} title="Novo compromisso">
        <form onSubmit={handleSaveAgenda} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <Select
            label="Materia"
            value={agendaForm.materiaPessoalId ?? ''}
            onChange={(event) => setAgendaForm({ ...agendaForm, materiaPessoalId: event.target.value })}
            options={[
              { value: '', label: 'Sem materia vinculada' },
              ...ownSubjects.map((item) => ({ value: item.id, label: item.nome }))
            ]}
          />
          <Input label="Titulo" value={agendaForm.titulo} onChange={(event) => setAgendaForm({ ...agendaForm, titulo: event.target.value })} required />
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Input label="Hora inicio" type="time" value={agendaForm.horaInicio ?? ''} onChange={(event) => setAgendaForm({ ...agendaForm, horaInicio: event.target.value })} />
            <Input label="Hora fim" type="time" value={agendaForm.horaFim ?? ''} onChange={(event) => setAgendaForm({ ...agendaForm, horaFim: event.target.value })} />
          </div>
          <TextArea label="Descricao" value={agendaForm.descricao ?? ''} onChange={(event) => setAgendaForm({ ...agendaForm, descricao: event.target.value })} />
          <Button type="submit">Salvar compromisso</Button>
        </form>
      </Modal>
    </>
  );
}
