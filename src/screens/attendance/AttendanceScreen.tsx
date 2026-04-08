import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { PageHeader } from '@/components/common/PageHeader';
import { DayNavigator } from '@/components/calendar/DayNavigator';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useDayLessons, useProfessor, useQuickAttendance } from '@/hooks';
import { shiftDate, toISODate } from '@/utils/date';
import type { DayLessonView } from '@/types';

interface AttendanceClassGroup {
  turmaId: string;
  turmaNome: string;
  turmaCor?: string;
  lessons: DayLessonView[];
  completedLessons: number;
}

const nameCollator = new Intl.Collator('pt-BR', { sensitivity: 'base' });

function getProgressTone(completed: number, total: number) {
  if (!total || completed === 0) {
    return 'neutral' as const;
  }

  if (completed === total) {
    return 'success' as const;
  }

  return 'warning' as const;
}

function getAttendanceButtonStyle(isPresent: boolean): CSSProperties {
  return {
    width: 56,
    height: 40,
    borderRadius: 12,
    border: isPresent ? '1px solid rgba(34, 197, 94, 0.34)' : '1px solid rgba(248, 113, 113, 0.34)',
    background: isPresent ? 'rgba(34, 197, 94, 0.14)' : 'rgba(248, 113, 113, 0.14)',
    color: isPresent ? '#bbf7d0' : '#fecaca',
    fontWeight: 800,
    fontSize: '0.95rem'
  };
}

export function AttendanceScreen() {
  const { professorId } = useProfessor();
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState(searchParams.get('date') ?? toISODate(new Date()));
  const [selectedClassId, setSelectedClassId] = useState(searchParams.get('classId') ?? '');
  const dayLessons = useDayLessons(professorId, date);
  const attendanceLessons = useMemo(
    () => dayLessons.items.filter((item) => item.aula.categoria !== 'gestao' && item.aula.turmaId),
    [dayLessons.items]
  );
  const classGroups = useMemo<AttendanceClassGroup[]>(() => {
    const groups = new Map<string, AttendanceClassGroup>();

    attendanceLessons.forEach((item) => {
      const turmaId = item.aula.turmaId;
      if (!turmaId) {
        return;
      }

      const existing = groups.get(turmaId);
      if (existing) {
        existing.lessons.push(item);
        existing.completedLessons += item.chamada?.status === 'concluida' ? 1 : 0;
        return;
      }

      groups.set(turmaId, {
        turmaId,
        turmaNome: item.turma?.nome ?? 'Turma',
        turmaCor: item.turma?.cor,
        lessons: [item],
        completedLessons: item.chamada?.status === 'concluida' ? 1 : 0
      });
    });

    return [...groups.values()]
      .map((group) => ({
        ...group,
        lessons: [...group.lessons].sort((left, right) => left.aula.horaInicio.localeCompare(right.aula.horaInicio))
      }))
      .sort((left, right) => {
        const firstTimeCompare =
          left.lessons[0]?.aula.horaInicio.localeCompare(right.lessons[0]?.aula.horaInicio ?? '') ?? 0;
        return firstTimeCompare || nameCollator.compare(left.turmaNome, right.turmaNome);
      });
  }, [attendanceLessons]);
  const selectedGroup = useMemo(
    () => classGroups.find((group) => group.turmaId === selectedClassId) ?? null,
    [classGroups, selectedClassId]
  );
  const attendance = useQuickAttendance(professorId, selectedGroup?.lessons ?? [], selectedGroup?.turmaId, date);
  const summary = useMemo(() => {
    const completedClasses = classGroups.filter((group) => group.completedLessons === group.lessons.length).length;
    return {
      completedClasses,
      totalClasses: classGroups.length,
      completedLessons: attendanceLessons.filter((item) => item.chamada?.status === 'concluida').length,
      totalLessons: attendanceLessons.length
    };
  }, [attendanceLessons, classGroups]);
  const markedAbsences = useMemo(
    () =>
      attendance.rows.reduce(
        (total, row) =>
          total +
          attendance.lessonSummaries.filter((lesson) => row.statuses[lesson.lessonId] !== 'presente').length,
        0
      ),
    [attendance.lessonSummaries, attendance.rows]
  );

  useEffect(() => {
    if (!classGroups.length) {
      setSelectedClassId('');
      return;
    }

    if (selectedClassId && classGroups.some((group) => group.turmaId === selectedClassId)) {
      return;
    }

    const nextGroup = classGroups.find((group) => group.completedLessons !== group.lessons.length) ?? classGroups[0];
    setSelectedClassId(nextGroup.turmaId);
  }, [classGroups, selectedClassId]);

  function updateDate(nextDate: string) {
    setDate(nextDate);
    setSelectedClassId('');
    setSearchParams((current) => {
      const params = new URLSearchParams(current);
      params.set('date', nextDate);
      params.delete('classId');
      return params;
    });
  }

  function selectClass(nextClassId: string) {
    setSelectedClassId(nextClassId);
    setSearchParams((current) => {
      const params = new URLSearchParams(current);
      params.set('date', date);
      params.set('classId', nextClassId);
      return params;
    });
  }

  async function handleSave(mode: 'draft' | 'done') {
    if (mode === 'draft') {
      await attendance.saveDraft();
    } else {
      await attendance.save();
    }

    await dayLessons.reload();
  }

  return (
    <>
      <PageHeader
        eyebrow="Chamada simples"
        title="Chamada por turma"
        description="Selecione a turma do dia e marque apenas P ou F. Cada aluno recebe um botao por aula prevista hoje, sem precisar abrir aula por aula."
        actions={<Badge tone={attendance.retroativa ? 'warning' : 'success'}>{attendance.retroativa ? 'Retroativa' : 'Dia atual'}</Badge>}
      />

      <DayNavigator
        date={date}
        onPrevious={() => updateDate(shiftDate(date, -1))}
        onNext={() => updateDate(shiftDate(date, 1))}
        onToday={() => updateDate(toISODate(new Date()))}
      />

      <Card title="Data da chamada" subtitle="Voce pode preencher dias anteriores sem trocar de tela.">
        <Input label="Data" type="date" value={date} onChange={(event) => updateDate(event.target.value)} />
      </Card>

      <section style={{ display: 'grid', gap: '1rem' }}>
        {dayLessons.loading && <LoadingState label="Carregando aulas para chamada..." />}
        {dayLessons.error && <ErrorState message={dayLessons.error} onRetry={() => void dayLessons.reload()} />}
        {!dayLessons.loading && !attendanceLessons.length && (
          <EmptyState title="Sem turmas nesta data" description="Volte ao calendario ou monte sua grade semanal para liberar a chamada do dia." />
        )}

        {!!classGroups.length && (
          <Card
            title="Turmas do dia"
            subtitle={`Voce concluiu ${summary.completedClasses} de ${summary.totalClasses} turmas e ${summary.completedLessons} de ${summary.totalLessons} aulas nesta data.`}
          >
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {classGroups.map((group) => {
                const isActive = group.turmaId === selectedClassId;
                const tone = getProgressTone(group.completedLessons, group.lessons.length);

                return (
                  <button
                    key={group.turmaId}
                    type="button"
                    onClick={() => selectClass(group.turmaId)}
                    style={{
                      display: 'grid',
                      gap: '0.45rem',
                      textAlign: 'left',
                      padding: '0.95rem 1rem',
                      borderRadius: 16,
                      border: isActive
                        ? `1px solid ${group.turmaCor ?? 'rgba(34, 197, 94, 0.38)'}`
                        : '1px solid rgba(148, 163, 184, 0.12)',
                      background: isActive ? 'rgba(15, 23, 42, 0.86)' : 'rgba(15, 23, 42, 0.48)',
                      color: '#e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <strong>{group.turmaNome}</strong>
                      <Badge tone={tone}>
                        {group.completedLessons}/{group.lessons.length} aulas
                      </Badge>
                    </div>
                    <span style={{ color: '#94a3b8' }}>
                      {group.lessons.map((lesson) => `${lesson.aula.horaInicio}-${lesson.aula.horaFim}`).join(' | ')}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {selectedGroup && (
          <>
            <Card
              title={selectedGroup.turmaNome}
              subtitle={`${selectedGroup.lessons.length} aula(s) nesta data. P = presente, F = falta.`}
              actions={
                <Badge tone={getProgressTone(selectedGroup.completedLessons, selectedGroup.lessons.length)}>
                  {selectedGroup.completedLessons}/{selectedGroup.lessons.length} concluidas
                </Badge>
              }
            >
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Badge tone="info">{attendance.rows.length} alunos</Badge>
                <Badge tone={markedAbsences ? 'danger' : 'success'}>{markedAbsences} falta(s) marcada(s)</Badge>
              </div>
            </Card>

            {attendance.loading && <LoadingState label="Montando chamada da turma..." />}
            {attendance.error && <ErrorState message={attendance.error} onRetry={() => void attendance.reload()} />}
            {!attendance.loading && !attendance.rows.length && (
              <EmptyState title="Turma sem alunos vinculados" description="Vincule alunos a turma para que a chamada apareca automaticamente." />
            )}

            {attendance.rows.length > 0 && (
              <>
                <Card
                  title="Lista de presenca"
                  subtitle="Cada coluna representa uma aula do dia para essa turma."
                  actions={
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Button variant="secondary" onClick={() => attendance.markAll('presente')}>Todos P</Button>
                      <Button variant="danger" onClick={() => attendance.markAll('ausente')}>Todos F</Button>
                    </div>
                  }
                >
                  <div style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: `${240 + attendance.lessonSummaries.length * 96}px`, display: 'grid', gap: '0.65rem' }}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: `240px repeat(${attendance.lessonSummaries.length}, 88px)`,
                          gap: '0.6rem',
                          alignItems: 'end'
                        }}
                      >
                        <strong>Aluno</strong>
                        {attendance.lessonSummaries.map((lesson, index) => (
                          <div key={lesson.lessonId} style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                            <strong style={{ display: 'block', color: '#e2e8f0' }}>A{index + 1}</strong>
                            <span>{lesson.timeLabel}</span>
                          </div>
                        ))}
                      </div>

                      {attendance.rows.map((row) => (
                        <div
                          key={row.alunoId}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: `240px repeat(${attendance.lessonSummaries.length}, 88px)`,
                            gap: '0.6rem',
                            alignItems: 'center',
                            padding: '0.8rem 0',
                            borderTop: '1px solid rgba(148, 163, 184, 0.08)'
                          }}
                        >
                          <strong style={{ paddingRight: '0.75rem' }}>{row.nome}</strong>
                          {attendance.lessonSummaries.map((lesson) => {
                            const isPresent = row.statuses[lesson.lessonId] === 'presente';

                            return (
                              <div key={`${row.alunoId}-${lesson.lessonId}`} style={{ display: 'flex', justifyContent: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => attendance.toggleStatusForStudent(row.alunoId, lesson.lessonId)}
                                  aria-label={`${row.nome} - ${lesson.title} - ${isPresent ? 'Presente' : 'Falta'}`}
                                  style={getAttendanceButtonStyle(isPresent)}
                                >
                                  {isPresent ? 'P' : 'F'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card title="Salvar chamada" subtitle="Voce pode guardar em andamento ou concluir todas as aulas desta turma de uma vez.">
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Button variant="secondary" onClick={() => void handleSave('draft')}>Salvar em andamento</Button>
                    <Button onClick={() => void handleSave('done')}>Concluir chamada</Button>
                  </div>
                </Card>
              </>
            )}
          </>
        )}
      </section>
    </>
  );
}
