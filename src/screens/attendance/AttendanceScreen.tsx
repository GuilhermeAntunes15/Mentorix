import { CalendarRange } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { Select } from '@/components/common/Select';
import { DayNavigator } from '@/components/calendar/DayNavigator';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useDayLessons, useProfessor, useQuickAttendance } from '@/hooks';
import { attendanceCommands, attendanceRepository, classesRepository, frequencyRepository, lessonsRepository, studentClassRepository, studentsRepository, subjectsRepository } from '@/services/repositories';
import { hexToRgba } from '@/utils/color';
import { formatShortDate, listDatesForWeekdayInMonth, shiftDate, toISODate, toISOMonth } from '@/utils/date';
import type { PresenceStatus } from '@/types';

interface MonthlyAttendanceRow {
  alunoId: string;
  nome: string;
  statuses: Record<string, PresenceStatus>;
}

const nameCollator = new Intl.Collator('pt-BR', { sensitivity: 'base' });

export function AttendanceScreen() {
  const { professorId } = useProfessor();
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState(searchParams.get('date') ?? toISODate(new Date()));
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [monthlyOpen, setMonthlyOpen] = useState(false);
  const [monthlyMonth, setMonthlyMonth] = useState(toISOMonth(new Date()));
  const [monthlyClassId, setMonthlyClassId] = useState('');
  const [monthlyLessonId, setMonthlyLessonId] = useState('');
  const [monthlyRows, setMonthlyRows] = useState<MonthlyAttendanceRow[]>([]);
  const [monthlyDates, setMonthlyDates] = useState<string[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlySaving, setMonthlySaving] = useState(false);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);
  const dayLessons = useDayLessons(professorId, date);
  const attendanceLessons = useMemo(
    () => dayLessons.items.filter((item) => item.aula.categoria !== 'gestao' && item.aula.turmaId),
    [dayLessons.items]
  );
  const selectedLesson = useMemo(
    () => attendanceLessons.find((item) => item.aula.id === selectedLessonId) ?? null,
    [attendanceLessons, selectedLessonId]
  );
  const attendance = useQuickAttendance(professorId, selectedLesson?.aula.id, selectedLesson?.aula.turmaId, date);
  const summary = useMemo(() => {
    const completed = attendanceLessons.filter((item) => item.chamada?.status === 'concluida').length;
    return {
      completed,
      total: attendanceLessons.length
    };
  }, [attendanceLessons]);
  const [allLessons, setAllLessons] = useState<typeof dayLessons.items extends Array<infer _T> ? any[] : never>([]);
  const [allClasses, setAllClasses] = useState<Array<{ id: string; nome: string }>>([]);
  const [allSubjects, setAllSubjects] = useState<Array<{ id: string; nome: string }>>([]);

  useEffect(() => {
    async function loadReference() {
      const [lessons, classes, subjects] = await Promise.all([
        lessonsRepository.listOrdered(professorId),
        classesRepository.listOrdered(professorId),
        subjectsRepository.listOrdered(professorId)
      ]);
      setAllLessons(lessons);
      setAllClasses(classes);
      setAllSubjects(subjects);
    }

    void loadReference();
  }, [professorId]);

  useEffect(() => {
    if (!attendanceLessons.length) {
      setSelectedLessonId(null);
      return;
    }

    const selectionStillExists = selectedLessonId
      ? attendanceLessons.some((item) => item.aula.id === selectedLessonId)
      : false;

    if (selectionStillExists) {
      return;
    }

    const nextLesson =
      attendanceLessons.find((item) => item.chamada?.status !== 'concluida') ?? attendanceLessons[0];

    setSelectedLessonId(nextLesson.aula.id);
  }, [attendanceLessons, selectedLessonId]);

  function updateDate(nextDate: string) {
    setDate(nextDate);
    setSelectedLessonId(null);
    setSearchParams((current) => {
      const params = new URLSearchParams(current);
      params.set('date', nextDate);
      params.delete('lessonId');
      return params;
    });
  }

  const monthlyLessonOptions = useMemo(() => {
    return allLessons
      .filter((lesson) => lesson.categoria !== 'gestao' && lesson.turmaId === monthlyClassId)
      .sort((left, right) => `${left.diaSemana}-${left.horaInicio}`.localeCompare(`${right.diaSemana}-${right.horaInicio}`))
      .map((lesson) => {
        const subject = allSubjects.find((item) => item.id === lesson.materiaId);
        return {
          value: lesson.id,
          label: `${subject?.nome ?? lesson.titulo} • ${lesson.horaInicio}-${lesson.horaFim}`
        };
      });
  }, [allLessons, allSubjects, monthlyClassId]);

  async function loadMonthlyAttendance() {
    if (!monthlyClassId || !monthlyLessonId) {
      setMonthlyRows([]);
      setMonthlyDates([]);
      return;
    }

    try {
      setMonthlyLoading(true);
      setMonthlyError(null);

      const lesson = allLessons.find((item) => item.id === monthlyLessonId);
      if (!lesson || !lesson.turmaId) {
        setMonthlyRows([]);
        setMonthlyDates([]);
        return;
      }

      const dates = lesson.recorrente
        ? listDatesForWeekdayInMonth(monthlyMonth, lesson.diaSemana).filter((item) => item >= lesson.data)
        : lesson.data.startsWith(monthlyMonth)
          ? [lesson.data]
          : [];

      const [relations, students] = await Promise.all([
        studentClassRepository.listByClass(professorId, monthlyClassId),
        studentsRepository.listOrdered(professorId)
      ]);

      const activeStudents = relations
        .filter((relation) => relation.ativo)
        .map((relation) => ({
          alunoId: relation.alunoId,
          nome: students.find((item) => item.id === relation.alunoId)?.nome ?? 'Aluno'
        }))
        .sort((left, right) => nameCollator.compare(left.nome, right.nome));

      const attendanceByDate = await Promise.all(
        dates.map(async (currentDate) => {
          const attendance = await attendanceRepository.getByLessonAndDate(professorId, lesson.id, currentDate);
          if (!attendance) {
            return { date: currentDate, rows: [] };
          }

          const frequencies = await frequencyRepository.listByAttendance(professorId, attendance.id);
          return { date: currentDate, rows: frequencies };
        })
      );

      setMonthlyDates(dates);
      setMonthlyRows(
        activeStudents.map((student) => ({
          alunoId: student.alunoId,
          nome: student.nome,
          statuses: Object.fromEntries(
            dates.map((currentDate) => {
              const frequency = attendanceByDate
                .find((item) => item.date === currentDate)
                ?.rows.find((item) => item.alunoId === student.alunoId);
              return [currentDate, frequency?.status ?? 'presente'];
            })
          )
        }))
      );
    } catch (cause) {
      setMonthlyError(cause instanceof Error ? cause.message : 'Nao foi possivel montar o lancamento mensal.');
    } finally {
      setMonthlyLoading(false);
    }
  }

  useEffect(() => {
    if (!monthlyOpen) {
      return;
    }

    void loadMonthlyAttendance();
  }, [monthlyClassId, monthlyLessonId, monthlyMonth, monthlyOpen]);

  async function saveMonthlyAttendance(mode: 'draft' | 'done') {
    const lesson = allLessons.find((item) => item.id === monthlyLessonId);
    if (!lesson) {
      return;
    }

    try {
      setMonthlySaving(true);
      for (const currentDate of monthlyDates) {
        let attendance = await attendanceRepository.getByLessonAndDate(professorId, lesson.id, currentDate);
        if (!attendance) {
          attendance = await attendanceCommands.createAttendance(professorId, lesson.id, currentDate, currentDate < toISODate(new Date()));
        }

        await frequencyRepository.upsertMany(
          professorId,
          attendance.id,
          lesson.id,
          monthlyRows.map((row) => ({
            alunoId: row.alunoId,
            status: row.statuses[currentDate] ?? 'presente'
          }))
        );

        await attendanceCommands.updateAttendanceStatus(attendance.id, mode === 'done' ? 'concluida' : 'em_andamento');
      }

      setMonthlyOpen(false);
      await dayLessons.reload();
    } finally {
      setMonthlySaving(false);
    }
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
        eyebrow="Chamada rapida"
        title="Chamada do dia"
        description="Abra a data, veja todas as aulas programadas e preencha a frequencia de cada turma no mesmo fluxo. Dias passados continuam liberados e ficam marcados como retroativos."
        actions={
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Badge tone={attendance.retroativa ? 'warning' : 'success'}>{attendance.retroativa ? 'Retroativa' : 'Dia atual'}</Badge>
            <Button variant="secondary" onClick={() => setMonthlyOpen(true)}>
              <CalendarRange size={16} /> Lancamento mensal
            </Button>
          </div>
        }
      />

      <DayNavigator date={date} onPrevious={() => updateDate(shiftDate(date, -1))} onNext={() => updateDate(shiftDate(date, 1))} onToday={() => updateDate(toISODate(new Date()))} />

      <Card title="Selecionar data" subtitle="Voce pode chamar datas anteriores sem bloqueio.">
        <Input label="Data" type="date" value={date} onChange={(event) => updateDate(event.target.value)} />
      </Card>

      <section style={{ display: 'grid', gap: '1rem' }}>
        {dayLessons.loading && <LoadingState label="Carregando aulas para chamada..." />}
        {dayLessons.error && <ErrorState message={dayLessons.error} onRetry={() => void dayLessons.reload()} />}
        {!dayLessons.loading && !attendanceLessons.length && (
          <EmptyState title="Sem aulas nesta data" description="Volte ao calendario ou monte sua grade semanal para liberar a chamada do dia." />
        )}

        {!!attendanceLessons.length && (
          <Card title="Fluxo do dia" subtitle={`Voce concluiu ${summary.completed} de ${summary.total} chamadas previstas para esta data.`}>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {attendanceLessons.map((item) => {
                const isActive = item.aula.id === selectedLessonId;
                const status = item.chamada?.status ?? 'nao_iniciada';
                const subjectColor = item.materia?.cor;
                const background = subjectColor
                  ? `linear-gradient(135deg, ${hexToRgba(subjectColor, isActive ? 0.26 : 0.18)} 0%, rgba(15, 23, 42, 0.88) 100%)`
                  : isActive
                    ? 'rgba(15, 23, 42, 0.88)'
                    : 'rgba(15, 23, 42, 0.62)';

                return (
                  <button
                    key={item.aula.id}
                    type="button"
                    onClick={() => setSelectedLessonId(item.aula.id)}
                    style={{
                      display: 'grid',
                      gap: '0.35rem',
                      textAlign: 'left',
                      padding: '1rem',
                      borderRadius: 22,
                      border: `1px solid ${subjectColor ? hexToRgba(subjectColor, isActive ? 0.42 : 0.24) : isActive ? 'rgba(125, 211, 252, 0.24)' : 'rgba(148, 163, 184, 0.12)'}`,
                      color: '#e2e8f0',
                      background,
                      transform: isActive ? 'translateY(-1px)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <strong>{item.materia?.nome ?? item.aula.titulo}</strong>
                      <Badge tone={status === 'concluida' ? 'success' : status === 'em_andamento' ? 'warning' : 'neutral'}>
                        {status.replaceAll('_', ' ')}
                      </Badge>
                    </div>
                    <span style={{ color: '#cbd5e1' }}>
                      {item.aula.horaInicio} - {item.aula.horaFim} • {item.turma?.nome ?? 'Turma'}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.92rem' }}>{item.aula.escola ?? 'Escola nao definida'}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {selectedLesson && (
          <>
            <Card
              style={{
                background: selectedLesson.materia?.cor
                  ? `linear-gradient(135deg, ${hexToRgba(selectedLesson.materia.cor, 0.24)} 0%, rgba(11, 16, 32, 0.88) 50%, rgba(11, 16, 32, 0.74) 100%)`
                  : undefined,
                border: selectedLesson.materia?.cor
                  ? `1px solid ${hexToRgba(selectedLesson.materia.cor, 0.32)}`
                  : undefined
              }}
              title={selectedLesson.aula.titulo}
              subtitle={`${selectedLesson.materia?.nome ?? 'Materia'} - ${selectedLesson.turma?.nome ?? 'Turma'}`}
              actions={
                <Badge tone={attendance.attendance?.status === 'concluida' ? 'success' : attendance.attendance?.status === 'em_andamento' ? 'warning' : 'neutral'}>
                  {attendance.attendance?.status?.replaceAll('_', ' ') ?? 'nao iniciada'}
                </Badge>
              }
            >
              <p style={{ margin: 0, color: '#cbd5e1' }}>
                {selectedLesson.aula.horaInicio} - {selectedLesson.aula.horaFim} • {selectedLesson.aula.escola || 'Escola'}
              </p>
              {selectedLesson.aula.descricao && <p style={{ margin: 0, color: '#94a3b8' }}>{selectedLesson.aula.descricao}</p>}
            </Card>

            {attendance.loading && <LoadingState label="Montando chamada..." />}
            {attendance.error && <ErrorState message={attendance.error} onRetry={() => void attendance.reload()} />}
            {!attendance.loading && !attendance.rows.length && (
              <EmptyState title="Turma sem alunos vinculados" description="Vincule alunos a turma para que a chamada seja preenchida automaticamente." />
            )}

            {attendance.rows.length > 0 && (
              <>
                <Card title="Acao rapida" subtitle="Todos presentes por padrao, com ajuste individual quando necessario.">
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Button variant="secondary" onClick={() => attendance.markAll('presente')}>Marcar todos presentes</Button>
                    <Button variant="ghost" onClick={() => attendance.markAll('ausente')}>Marcar todos ausentes</Button>
                    <Button variant="ghost" onClick={() => attendance.markAll('justificado')}>Marcar todos justificados</Button>
                  </div>
                </Card>

                {attendance.rows.map((row) => (
                  <Card key={row.alunoId} title={row.nome} actions={<Badge>{row.status}</Badge>}>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <Button variant={row.status === 'presente' ? 'primary' : 'secondary'} onClick={() => attendance.setStatusForStudent(row.alunoId, 'presente')}>Presente</Button>
                      <Button variant={row.status === 'ausente' ? 'danger' : 'secondary'} onClick={() => attendance.setStatusForStudent(row.alunoId, 'ausente')}>Ausente</Button>
                      <Button variant={row.status === 'justificado' ? 'ghost' : 'secondary'} onClick={() => attendance.setStatusForStudent(row.alunoId, 'justificado')}>Justificado</Button>
                    </div>
                  </Card>
                ))}

                <Card title="Salvar chamada" subtitle="Voce pode guardar em andamento ou concluir esta turma e seguir para a proxima do dia.">
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

      <Modal
        open={monthlyOpen}
        onClose={() => setMonthlyOpen(false)}
        title="Lancamento mensal de frequencia"
        subtitle="Escolha a turma, a aula recorrente e preencha o mes inteiro em uma grade unica."
        fullScreen
      >
        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <Card title="Contexto" subtitle="A mesma aula sera aplicada a todas as datas recorrentes do mes selecionado.">
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <Input label="Mes" type="month" value={monthlyMonth} onChange={(event) => setMonthlyMonth(event.target.value)} />
              <Select
                label="Turma"
                value={monthlyClassId}
                onChange={(event) => {
                  setMonthlyClassId(event.target.value);
                  setMonthlyLessonId('');
                }}
                options={[{ value: '', label: 'Selecione uma turma' }, ...allClasses.map((item) => ({ value: item.id, label: item.nome }))]}
              />
              <Select
                label="Aula"
                value={monthlyLessonId}
                onChange={(event) => setMonthlyLessonId(event.target.value)}
                options={[{ value: '', label: 'Selecione uma aula' }, ...monthlyLessonOptions]}
              />
            </div>
          </Card>

          {monthlyLoading && <LoadingState label="Montando grade mensal..." />}
          {monthlyError && <ErrorState message={monthlyError} onRetry={() => void loadMonthlyAttendance()} />}
          {!monthlyLoading && !monthlyError && !!monthlyLessonId && !monthlyDates.length && (
            <EmptyState title="Nenhuma data encontrada" description="Essa aula nao possui ocorrencias no mes selecionado." />
          )}

          {!monthlyLoading && !monthlyError && !!monthlyDates.length && (
            <>
              <Card title="Atalhos do mes" subtitle="Use os atalhos para preencher rapidamente as datas antes de revisar aluno por aluno.">
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {monthlyDates.map((currentDate) => (
                    <Button
                      key={currentDate}
                      variant="ghost"
                      onClick={() =>
                        setMonthlyRows((current) =>
                          current.map((row) => ({
                            ...row,
                            statuses: {
                              ...row.statuses,
                              [currentDate]: 'presente'
                            }
                          }))
                        )
                      }
                    >
                      {formatShortDate(currentDate)} todos presentes
                    </Button>
                  ))}
                </div>
              </Card>

              <Card title="Grade mensal" subtitle="Cada coluna representa uma data da mesma aula ao longo do mes.">
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: `${220 + monthlyDates.length * 190}px`, display: 'grid', gap: '0.85rem' }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `220px repeat(${monthlyDates.length}, minmax(180px, 1fr))`,
                        gap: '0.75rem',
                        alignItems: 'end'
                      }}
                    >
                      <strong>Aluno</strong>
                      {monthlyDates.map((currentDate) => (
                        <div key={currentDate} style={{ display: 'grid', gap: '0.35rem' }}>
                          <strong>{formatShortDate(currentDate)}</strong>
                          <span style={{ color: '#94a3b8', fontSize: '0.86rem' }}>mesma aula</span>
                        </div>
                      ))}
                    </div>

                    {monthlyRows.map((row) => (
                      <div
                        key={row.alunoId}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: `220px repeat(${monthlyDates.length}, minmax(180px, 1fr))`,
                          gap: '0.75rem',
                          alignItems: 'start',
                          paddingBottom: '0.8rem',
                          borderBottom: '1px solid rgba(148, 163, 184, 0.08)'
                        }}
                      >
                        <strong style={{ alignSelf: 'center' }}>{row.nome}</strong>
                        {monthlyDates.map((currentDate) => (
                          <div key={`${row.alunoId}-${currentDate}`} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <Button
                              variant={row.statuses[currentDate] === 'presente' ? 'primary' : 'secondary'}
                              onClick={() =>
                                setMonthlyRows((current) =>
                                  current.map((item) =>
                                    item.alunoId === row.alunoId
                                      ? {
                                          ...item,
                                          statuses: { ...item.statuses, [currentDate]: 'presente' }
                                        }
                                      : item
                                  )
                                )
                              }
                            >
                              Presente
                            </Button>
                            <Button
                              variant={row.statuses[currentDate] === 'ausente' ? 'danger' : 'secondary'}
                              onClick={() =>
                                setMonthlyRows((current) =>
                                  current.map((item) =>
                                    item.alunoId === row.alunoId
                                      ? {
                                          ...item,
                                          statuses: { ...item.statuses, [currentDate]: 'ausente' }
                                        }
                                      : item
                                  )
                                )
                              }
                            >
                              Ausente
                            </Button>
                            <Button
                              variant={row.statuses[currentDate] === 'justificado' ? 'ghost' : 'secondary'}
                              onClick={() =>
                                setMonthlyRows((current) =>
                                  current.map((item) =>
                                    item.alunoId === row.alunoId
                                      ? {
                                          ...item,
                                          statuses: { ...item.statuses, [currentDate]: 'justificado' }
                                        }
                                      : item
                                  )
                                )
                              }
                            >
                              Justificado
                            </Button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card title="Salvar mes" subtitle="Voce pode deixar em andamento ou concluir todas as chamadas deste bloco mensal.">
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Button variant="secondary" onClick={() => void saveMonthlyAttendance('draft')} disabled={monthlySaving}>
                    Salvar em andamento
                  </Button>
                  <Button onClick={() => void saveMonthlyAttendance('done')} disabled={monthlySaving}>
                    {monthlySaving ? 'Salvando...' : 'Concluir mes'}
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
