import { useEffect, useMemo, useState } from 'react';
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
import { hexToRgba } from '@/utils/color';
import { shiftDate, toISODate } from '@/utils/date';

export function AttendanceScreen() {
  const { professorId } = useProfessor();
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState(searchParams.get('date') ?? toISODate(new Date()));
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
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
        actions={<Badge tone={attendance.retroativa ? 'warning' : 'success'}>{attendance.retroativa ? 'Retroativa' : 'Dia atual'}</Badge>}
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
    </>
  );
}
