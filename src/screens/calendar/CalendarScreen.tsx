import { CalendarPlus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { LessonNotesModal } from '@/components/calendar/LessonNotesModal';
import { PageHeader } from '@/components/common/PageHeader';
import { LessonSchedulerModal } from '@/components/forms/LessonSchedulerModal';
import { DayNavigator } from '@/components/calendar/DayNavigator';
import { LessonCard } from '@/components/calendar/LessonCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useCollectionResource, useDayLessons, useProfessor } from '@/hooks';
import { classesRepository, lessonsRepository, subjectsRepository } from '@/services/repositories';
import { shiftDate, toISODate } from '@/utils/date';
import { buildLessonTitle, findRecurringLessonsBySlot, type LessonDraftInput } from '@/utils/lessons';
import type { DayLessonView } from '@/types';

export function CalendarScreen() {
  const { professorId } = useProfessor();
  const [date, setDate] = useState(toISODate(new Date()));
  const [modalOpen, setModalOpen] = useState(false);
  const [noteLesson, setNoteLesson] = useState<DayLessonView | null>(null);
  const classes = useCollectionResource(professorId, classesRepository);
  const subjects = useCollectionResource(professorId, subjectsRepository);
  const lessons = useCollectionResource(professorId, lessonsRepository);
  const dayLessons = useDayLessons(professorId, date);
  const hasAttendanceForDay = dayLessons.items.some((item) => item.aula.categoria !== 'gestao' && item.aula.turmaId);

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

  return (
    <>
      <PageHeader
        title="Calendario com aulas do dia"
        description="Veja sua rotina do dia, incluindo aulas e blocos recorrentes de gestao. Toque no botao flutuante para montar a semana."
        actions={
          hasAttendanceForDay ? (
            <Link to={`/chamada?date=${date}`}>
              <Button>Fazer chamada do dia</Button>
            </Link>
          ) : undefined
        }
      />

      <DayNavigator
        date={date}
        onPrevious={() => setDate((current) => shiftDate(current, -1))}
        onNext={() => setDate((current) => shiftDate(current, 1))}
        onToday={() => setDate(toISODate(new Date()))}
      />

      <section style={{ display: 'grid', gap: '1rem', minWidth: 0 }}>
        {dayLessons.loading && <LoadingState label="Carregando aulas do dia..." />}
        {dayLessons.error && <ErrorState message={dayLessons.error} />}
        {!dayLessons.loading && !dayLessons.items.length && (
          <EmptyState
            title="Nada programado para este dia"
            description="Abra o planejador semanal para preencher suas aulas e blocos de gestao."
          />
        )}
        {dayLessons.items.map((item) => (
          <LessonCard
            key={item.aula.id}
            item={item}
            onOpenNotes={() => {
              setNoteLesson(item);
            }}
          />
        ))}
      </section>

      <button
        type="button"
        className="floating-calendar-button"
        aria-label="Planejar grade semanal"
        onClick={() => setModalOpen(true)}
      >
        <CalendarPlus size={24} />
      </button>

      <LessonSchedulerModal
        open={modalOpen}
        anchorDate={date}
        classes={classes.items}
        subjects={subjects.items}
        existingLessons={lessons.items}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveWeek}
      />

      <LessonNotesModal
        open={!!noteLesson}
        professorId={professorId}
        lesson={noteLesson}
        onClose={() => setNoteLesson(null)}
      />
    </>
  );
}
