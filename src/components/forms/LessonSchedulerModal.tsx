import { Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { TextArea } from '@/components/common/TextArea';
import type { AulaEntity, LessonCategory, LessonType, ManagementTaskType, MateriaEntity, TurmaEntity } from '@/types';
import { isLessonScheduledForDate } from '@/utils/lessons';
import { getSlotById, getWeekDays, schoolOptions, schoolSlotMap, type SchoolKey } from '@/utils/schedule';

interface DraftLesson {
  id: string;
  data: string;
  diaSemana: number;
  turmaId?: string;
  materiaId?: string;
  escola: string;
  horaInicio: string;
  horaFim: string;
  descricao: string;
  categoria: LessonCategory;
  gestaoTipo?: ManagementTaskType;
  titulo?: string;
  tipo: LessonType;
}

interface LessonSchedulerModalProps {
  open: boolean;
  anchorDate: string;
  classes: TurmaEntity[];
  subjects: MateriaEntity[];
  existingLessons: AulaEntity[];
  removingLessonId?: string | null;
  onClose: () => void;
  onSave: (entries: DraftLesson[]) => Promise<void>;
  onRemoveOccurrence: (lesson: AulaEntity, date: string) => Promise<void>;
}

const initialDraftState = {
  day: '',
  schoolKey: 'antonio_pratici' as SchoolKey,
  slotId: '',
  categoria: 'aula' as LessonCategory,
  turmaId: '',
  materiaId: '',
  gestaoTipo: 'PAEET' as ManagementTaskType,
  titulo: '',
  tipo: 'regular' as LessonType,
  descricao: ''
};

export function LessonSchedulerModal({
  open,
  anchorDate,
  classes,
  subjects,
  existingLessons,
  removingLessonId,
  onClose,
  onSave,
  onRemoveOccurrence
}: LessonSchedulerModalProps) {
  const weekDays = useMemo(() => getWeekDays(anchorDate), [anchorDate]);
  const [draftState, setDraftState] = useState(initialDraftState);
  const [entries, setEntries] = useState<DraftLesson[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setDraftState(initialDraftState);
      setEntries([]);
    } else {
      setDraftState((current) => ({
        ...current,
        day: current.day || weekDays[0]?.isoDate || ''
      }));
    }
  }, [open, weekDays]);

  const filteredSubjects = useMemo(
    () => (draftState.turmaId ? subjects.filter((item) => item.turmaId === draftState.turmaId) : []),
    [draftState.turmaId, subjects]
  );

  const slotOptions = useMemo(
    () => schoolSlotMap[draftState.schoolKey].map((slot) => ({ value: slot.id, label: slot.label })),
    [draftState.schoolKey]
  );

  const weekPreview = useMemo(
    () =>
      weekDays.map((day) => ({
        ...day,
        lessons: existingLessons
          .filter((lesson) => isLessonScheduledForDate(lesson, day.isoDate))
          .sort((left, right) => left.horaInicio.localeCompare(right.horaInicio))
      })),
    [existingLessons, weekDays]
  );

  function addEntry() {
    const slot = getSlotById(draftState.schoolKey, draftState.slotId);
    if (!slot || !draftState.day) {
      return;
    }

    if (draftState.categoria === 'aula' && (!draftState.turmaId || !draftState.materiaId)) {
      return;
    }

    if (draftState.categoria === 'gestao' && !(draftState.titulo || draftState.gestaoTipo)) {
      return;
    }

    const nextEntry: DraftLesson = {
      id: `${draftState.day}-${slot.start}-${draftState.categoria}-${draftState.turmaId ?? draftState.gestaoTipo ?? 'livre'}`,
      data: draftState.day,
      diaSemana: weekDays.find((day) => day.isoDate === draftState.day)?.weekday ?? 0,
      turmaId: draftState.categoria === 'aula' ? draftState.turmaId : undefined,
      materiaId: draftState.categoria === 'aula' ? draftState.materiaId : undefined,
      escola: slot.schoolName,
      horaInicio: slot.start,
      horaFim: slot.end,
      descricao: draftState.descricao,
      categoria: draftState.categoria,
      gestaoTipo: draftState.categoria === 'gestao' ? draftState.gestaoTipo : undefined,
      titulo: draftState.categoria === 'gestao' ? draftState.titulo || draftState.gestaoTipo : undefined,
      tipo: draftState.tipo
    };

    setEntries((current) => {
      const withoutSameSlot = current.filter(
        (entry) =>
          !(
            entry.diaSemana === nextEntry.diaSemana &&
            entry.horaInicio === nextEntry.horaInicio &&
            entry.horaFim === nextEntry.horaFim &&
            entry.escola === nextEntry.escola
          )
      );
      return [...withoutSameSlot, nextEntry].sort((left, right) =>
        `${left.data}-${left.horaInicio}`.localeCompare(`${right.data}-${right.horaInicio}`)
      );
    });

    setDraftState((current) => ({
      ...current,
      slotId: '',
      materiaId: '',
      turmaId: current.categoria === 'aula' ? current.turmaId : '',
      titulo: '',
      descricao: ''
    }));
  }

  async function handleSave() {
    if (!entries.length) {
      return;
    }

    try {
      setSaving(true);
      await onSave(entries);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Planejar semana"
      subtitle="Escolha dia, escola e horario fixo. O nome da aula sera gerado automaticamente pela materia."
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={() => void handleSave()} disabled={!entries.length || saving}>
            {saving ? 'Salvando...' : `Salvar ${entries.length} aula(s)`}
          </Button>
        </>
      }
    >
      <div className="lesson-scheduler-layout">
        <section style={{ display: 'grid', gap: '1rem', minWidth: 0 }}>
          <Card title="Nova aula da semana" subtitle="Use apenas os horarios disponiveis das escolas.">
            <div style={{ display: 'grid', gap: '1rem' }}>
              <Select
                label="Categoria"
                value={draftState.categoria}
                onChange={(event) =>
                  setDraftState({
                    ...draftState,
                    categoria: event.target.value as LessonCategory,
                    turmaId: '',
                    materiaId: '',
                    titulo: '',
                    gestaoTipo: 'PAEET'
                  })
                }
                options={[
                  { value: 'aula', label: 'Aula' },
                  { value: 'gestao', label: 'Gestao' }
                ]}
              />
              <Select
                label="Dia"
                value={draftState.day}
                onChange={(event) => setDraftState({ ...draftState, day: event.target.value })}
                options={weekDays.map((day) => ({ value: day.isoDate, label: day.label }))}
              />
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Select
                  label="Escola"
                  value={draftState.schoolKey}
                  onChange={(event) =>
                    setDraftState({
                      ...draftState,
                      schoolKey: event.target.value as SchoolKey,
                      slotId: ''
                    })
                  }
                  options={schoolOptions.map((item) => ({ value: item.value, label: item.label }))}
                />
                <Select
                  label="Horario"
                  value={draftState.slotId}
                  onChange={(event) => setDraftState({ ...draftState, slotId: event.target.value })}
                  options={[{ value: '', label: 'Selecione um horario' }, ...slotOptions]}
                />
              </div>
              {draftState.categoria === 'aula' ? (
                <>
                  <Select
                    label="Turma"
                    value={draftState.turmaId}
                    onChange={(event) => setDraftState({ ...draftState, turmaId: event.target.value, materiaId: '' })}
                    options={[
                      { value: '', label: 'Selecione uma turma' },
                      ...classes.map((item) => ({ value: item.id, label: item.nome }))
                    ]}
                  />
                  <Select
                    label="Materia"
                    value={draftState.materiaId}
                    onChange={(event) => setDraftState({ ...draftState, materiaId: event.target.value })}
                    options={[
                      { value: '', label: draftState.turmaId ? 'Selecione uma materia' : 'Escolha primeiro a turma' },
                      ...filteredSubjects.map((item) => ({ value: item.id, label: item.nome }))
                    ]}
                  />
                  <Select
                    label="Tipo"
                    value={draftState.tipo}
                    onChange={(event) => setDraftState({ ...draftState, tipo: event.target.value as LessonType })}
                    options={[
                      { value: 'regular', label: 'Regular' },
                      { value: 'reposicao', label: 'Reposicao' },
                      { value: 'quiz', label: 'Quiz' },
                      { value: 'atividade', label: 'Atividade' }
                    ]}
                  />
                </>
              ) : (
                <>
                  <Select
                    label="Bloco de gestao"
                    value={draftState.gestaoTipo}
                    onChange={(event) => setDraftState({ ...draftState, gestaoTipo: event.target.value as ManagementTaskType, titulo: event.target.value })}
                    options={[
                      { value: 'PAEET', label: 'PAEET' },
                      { value: 'ATPC', label: 'ATPC' },
                      { value: 'GESTAO', label: 'Outro bloco de gestao' }
                    ]}
                  />
                  <TextArea
                    label="O que estou fazendo"
                    value={draftState.titulo}
                    onChange={(event) => setDraftState({ ...draftState, titulo: event.target.value })}
                    placeholder="Ex.: PAEET, ATPC ou outra atividade de gestao"
                  />
                </>
              )}
              <TextArea
                label={draftState.categoria === 'gestao' ? 'Nota sobre a gestao' : 'Observacoes'}
                value={draftState.descricao}
                onChange={(event) => setDraftState({ ...draftState, descricao: event.target.value })}
                placeholder="Opcional"
              />
              <Button onClick={addEntry}>Adicionar a semana</Button>
            </div>
          </Card>

          <Card title="Itens prontos para salvar" subtitle="Se repetir o mesmo slot, o ultimo rascunho substitui o anterior.">
            {entries.length ? (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {entries.map((entry) => {
                  const turma = classes.find((item) => item.id === entry.turmaId);
                  const materia = subjects.find((item) => item.id === entry.materiaId);
                  const title = entry.categoria === 'gestao' ? entry.titulo ?? entry.gestaoTipo ?? 'Gestao' : materia?.nome ?? 'Materia';
                  return (
                    <div
                      key={entry.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        paddingBottom: '0.75rem',
                        borderBottom: '1px solid rgba(148, 163, 184, 0.08)'
                      }}
                    >
                      <div>
                        <strong>{title}</strong>
                        <p style={{ margin: '0.25rem 0 0', color: '#94a3b8' }}>
                          {entry.data} - {entry.escola} - {entry.horaInicio} - {entry.horaFim}
                          {entry.categoria === 'aula' ? ` - ${turma?.nome ?? 'Turma'}` : ' - Gestao'}
                        </p>
                      </div>
                      <Button
                        variant="danger"
                        onClick={() => setEntries((current) => current.filter((item) => item.id !== entry.id))}
                      >
                        Remover
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ margin: 0, color: '#94a3b8' }}>Nenhuma aula adicionada ainda.</p>
            )}
          </Card>
        </section>

        <Card title="Semana atual" subtitle="Previa dos slots ja ocupados no calendario.">
          <div style={{ display: 'grid', gap: '1rem' }}>
            {weekPreview.map((day) => (
              <div key={day.isoDate} style={{ display: 'grid', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                  <strong>{day.label}</strong>
                  <Badge tone={day.lessons.length ? 'info' : 'neutral'}>{day.lessons.length} aula(s)</Badge>
                </div>
                {day.lessons.length ? (
                  day.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      style={{
                        padding: '0.85rem 0.9rem',
                        borderRadius: 16,
                        background: 'rgba(15, 23, 42, 0.45)',
                        border: '1px solid rgba(148, 163, 184, 0.1)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div>
                          <strong>{lesson.titulo}</strong>
                          <p style={{ margin: '0.25rem 0 0', color: '#94a3b8' }}>
                            {lesson.escola ?? 'Escola'} - {lesson.horaInicio} - {lesson.horaFim}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={removingLessonId === lesson.id}
                          onClick={() => void onRemoveOccurrence(lesson, day.isoDate)}
                          aria-label={lesson.recorrente ? 'Apagar so hoje' : 'Apagar aula'}
                          style={{
                            border: '1px solid rgba(148, 163, 184, 0.16)',
                            background: 'transparent',
                            color: removingLessonId === lesson.id ? '#cbd5e1' : '#94a3b8',
                            opacity: removingLessonId === lesson.id ? 0.7 : 1,
                            borderRadius: 999,
                            padding: '0.38rem 0.6rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.78rem'
                          }}
                        >
                          <Trash2 size={14} />
                          {removingLessonId === lesson.id ? 'Apagando...' : lesson.recorrente ? 'Apagar so hoje' : 'Apagar aula'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ margin: 0, color: '#94a3b8' }}>Sem aulas planejadas.</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Modal>
  );
}
