import { useMemo, useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { Select } from '@/components/common/Select';
import { TextArea } from '@/components/common/TextArea';
import { LessonSchedulerModal } from '@/components/forms/LessonSchedulerModal';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useCollectionResource, useProfessor } from '@/hooks';
import { classesRepository, lessonsRepository, subjectsRepository } from '@/services/repositories';
import { formatShortDate, toISODate } from '@/utils/date';
import { buildLessonTitle, findRecurringLessonsBySlot, type LessonDraftInput } from '@/utils/lessons';
import type { AulaEntity } from '@/types';

export function LessonsScreen() {
  const { professorId } = useProfessor();
  const classes = useCollectionResource(professorId, classesRepository);
  const subjects = useCollectionResource(professorId, subjectsRepository);
  const lessons = useCollectionResource(professorId, lessonsRepository);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AulaEntity | null>(null);

  const orderedLessons = useMemo(
    () =>
      [...lessons.items].sort((left, right) =>
        `${left.data}-${left.horaInicio}`.localeCompare(`${right.data}-${right.horaInicio}`)
      ),
    [lessons.items]
  );

  async function handleSaveWeek(entries: LessonDraftInput[]) {
    let currentLessons = [...lessons.items];

    for (const entry of entries) {
      const turma = classes.items.find((item) => item.id === entry.turmaId);
      const materia = subjects.items.find((item) => item.id === entry.materiaId);
      const payload = {
        turmaId: entry.turmaId,
        materiaId: entry.materiaId,
        titulo: buildLessonTitle(materia, turma, entry.titulo),
        descricao: entry.descricao,
        escola: entry.escola,
        data: entry.data,
        diaSemana: entry.diaSemana,
        recorrente: true,
        horaInicio: entry.horaInicio,
        horaFim: entry.horaFim,
        sala: '',
        categoria: entry.categoria,
        gestaoTipo: entry.gestaoTipo,
        tipo: entry.tipo,
        gradePersonalizada: true
      };
      const existingMatches = findRecurringLessonsBySlot(
        currentLessons,
        entry.diaSemana,
        entry.horaInicio,
        entry.horaFim,
        entry.escola
      );
      const [primaryExisting, ...duplicates] = existingMatches;

      if (primaryExisting) {
        await lessons.updateItem(primaryExisting.id, payload);
        currentLessons = currentLessons.map((lesson) =>
          lesson.id === primaryExisting.id ? { ...lesson, ...payload } : lesson
        );

        for (const duplicate of duplicates) {
          await lessons.removeItem(duplicate.id);
          currentLessons = currentLessons.filter((lesson) => lesson.id !== duplicate.id);
        }
      } else {
        const created = await lessons.createItem(payload);
        currentLessons = [...currentLessons, created];
      }
    }
  }

  async function saveEdit() {
    if (!editing) {
      return;
    }

    await lessons.updateItem(editing.id, {
      descricao: editing.descricao,
      escola: editing.escola,
      tipo: editing.tipo
    });
    setEditing(null);
  }

  return (
    <>
      <PageHeader
        eyebrow="Grade academica"
        title="Planejamento semanal de aulas"
        description="Cadastre sua semana em um modal com horarios fixos por escola. O nome da aula e gerado automaticamente pela materia e turma."
        actions={<Button onClick={() => setModalOpen(true)}>Planejar semana</Button>}
      />

      <div className="responsive-grid" style={{ alignItems: 'start' }}>
        <Card title="Como funciona" subtitle="Fluxo mais rapido para montar a semana.">
          <p style={{ margin: 0, color: '#94a3b8' }}>
            Voce escolhe apenas dia, escola, horario, turma e materia. Se salvar no mesmo slot novamente, a aula existente e substituida.
          </p>
          <Button onClick={() => setModalOpen(true)}>Abrir modal semanal</Button>
        </Card>

        <Card title="Ajuste pontual" subtitle="Edite so o essencial quando precisar.">
          {editing ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <p style={{ margin: 0, color: '#94a3b8' }}>
                {editing.titulo} - {formatShortDate(editing.data)} - {editing.horaInicio} - {editing.horaFim}
              </p>
              <Select
                label="Tipo"
                value={editing.tipo}
                onChange={(event) => setEditing({ ...editing, tipo: event.target.value as AulaEntity['tipo'] })}
                options={[
                  { value: 'regular', label: 'Regular' },
                  { value: 'reposicao', label: 'Reposicao' },
                  { value: 'quiz', label: 'Quiz' },
                  { value: 'atividade', label: 'Atividade' }
                ]}
              />
              <Select
                label="Escola"
                value={editing.escola ?? ''}
                onChange={(event) => setEditing({ ...editing, escola: event.target.value })}
                options={[
                  { value: '', label: 'Selecione a escola' },
                  { value: 'Antonio Pratici', label: 'Antonio Pratici' },
                  { value: 'Mauricio Goulart', label: 'Mauricio Goulart' }
                ]}
              />
              <TextArea
                label="Observacoes"
                value={editing.descricao ?? ''}
                onChange={(event) => setEditing({ ...editing, descricao: event.target.value })}
              />
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Button onClick={() => void saveEdit()}>Salvar ajustes</Button>
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, color: '#94a3b8' }}>Clique em "Editar" em uma aula da lista para ajustar observacoes, tipo e escola.</p>
          )}
        </Card>

        <section style={{ display: 'grid', gap: '1rem' }}>
          {lessons.loading && <LoadingState label="Carregando aulas..." />}
          {lessons.error && <ErrorState message={lessons.error} />}
          {!lessons.loading && !orderedLessons.length && (
            <EmptyState
              title="Nenhuma aula planejada"
              description="Abra o modal semanal para preencher seus horarios das duas escolas."
            />
          )}
          {orderedLessons.map((item) => {
            const turma = classes.items.find((classItem) => classItem.id === item.turmaId);
            const materia = subjects.items.find((subjectItem) => subjectItem.id === item.materiaId);
            return (
              <Card
                key={item.id}
                title={item.titulo}
                subtitle={`${formatShortDate(item.data)} - ${item.horaInicio} - ${item.horaFim}`}
                actions={<Badge>{item.tipo}</Badge>}
              >
                <p style={{ margin: 0, color: '#94a3b8' }}>
                  {item.categoria === 'gestao'
                    ? `Gestao - ${item.gestaoTipo ?? 'Bloco'} - ${item.escola || 'Escola nao informada'}`
                    : `${turma?.nome ?? 'Turma'} - ${materia?.nome ?? 'Materia'} - ${item.escola || 'Escola nao informada'}`}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Button variant="secondary" onClick={() => setEditing(item)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => void lessons.removeItem(item.id)}>
                    Excluir
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>
      </div>

      <LessonSchedulerModal
        open={modalOpen}
        anchorDate={toISODate(new Date())}
        classes={classes.items}
        subjects={subjects.items}
        existingLessons={lessons.items}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveWeek}
      />
    </>
  );
}
