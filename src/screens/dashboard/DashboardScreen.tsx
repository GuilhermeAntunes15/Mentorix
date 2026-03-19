import { BarChart3, ChartNoAxesColumn, ShieldAlert } from 'lucide-react';
import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { DonutChart } from '@/components/common/DonutChart';
import { PageHeader } from '@/components/common/PageHeader';
import { SegmentedBar } from '@/components/common/SegmentedBar';
import { Select } from '@/components/common/Select';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useProfessor, useTeacherDashboard } from '@/hooks';

export function DashboardScreen() {
  const { professorId } = useProfessor();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const { classes, snapshot, loading, error } = useTeacherDashboard(professorId, selectedClassId, selectedStudentId || undefined);

  useEffect(() => {
    if (!selectedClassId && classes.length) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  useEffect(() => {
    setSelectedStudentId('');
  }, [selectedClassId]);

  const orderedClasses = useMemo(
    () => [...classes].sort((left, right) => left.nome.localeCompare(right.nome)),
    [classes]
  );

  return (
    <>
      <PageHeader
        eyebrow="Dashboard academico"
        title="Panorama preciso das suas turmas"
        description="Acompanhe quizzes, frequencia, atividades e os alunos que merecem atencao, tudo a partir de uma mesma turma."
        actions={<Badge tone="info"><BarChart3 size={14} /> Analise em tempo real</Badge>}
      />

      <Card title="Filtros do dashboard" subtitle="Escolha a turma e, se quiser aprofundar, um aluno especifico.">
        <div className="responsive-grid">
          <Select
            label="Turma"
            value={selectedClassId}
            onChange={(event) => setSelectedClassId(event.target.value)}
            options={[
              { value: '', label: 'Selecione uma turma' },
              ...orderedClasses.map((item) => ({ value: item.id, label: item.nome }))
            ]}
          />
          <Select
            label="Aluno"
            value={selectedStudentId}
            onChange={(event) => setSelectedStudentId(event.target.value)}
            disabled={!snapshot?.alunos.length}
            options={[
              { value: '', label: 'Visao geral da turma' },
              ...(snapshot?.alunos ?? []).map((student) => ({ value: student.id, label: student.nome }))
            ]}
          />
        </div>
      </Card>

      {loading && <LoadingState label="Carregando dashboard da turma..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !selectedClassId && (
        <EmptyState title="Selecione uma turma" description="Escolha uma turma para abrir os indicadores detalhados." />
      )}
      {!loading && !error && snapshot && (
        <>
          <div className="responsive-grid">
            <StatCard
              label="Alunos vinculados"
              value={snapshot.summary.totalStudents}
              helper={snapshot.turma?.nome ?? 'Turma atual'}
            />
            <StatCard
              label="Quizzes lancados"
              value={snapshot.summary.totalQuizzes}
              helper={selectedStudentId ? 'Plano do aluno filtrado' : 'Total da turma'}
            />
            <StatCard
              label="Atividades lancadas"
              value={snapshot.summary.totalActivities}
              helper={`${snapshot.summary.studentsWithPendingActivities} com pendencias`}
            />
            <StatCard
              label="Frequencia em alerta"
              value={snapshot.summary.studentsWithLowAttendance}
              helper="Abaixo de 75% de presenca"
            />
          </div>

          <section className="responsive-grid" style={{ alignItems: 'stretch' }}>
            <Card
              title={selectedStudentId ? 'Quizzes do aluno' : 'Quizzes da turma'}
              subtitle={
                selectedStudentId
                  ? 'Veja o quanto ja foi respondido por este aluno e o que ainda falta.'
                  : 'Cobertura geral dos quizzes lancados para a turma.'
              }
            >
              <div className="dashboard-chart-grid">
                <DonutChart
                  value={`${snapshot.quizCoverage.completionRate}%`}
                  total={`${snapshot.quizCoverage.responded}/${snapshot.quizCoverage.totalExpected}`}
                  label="Cobertura de quizzes"
                  helper={selectedStudentId ? 'Respondidos pelo aluno filtrado' : 'Respondidos pela turma'}
                  segments={[
                    { label: 'Respondidos', value: snapshot.quizCoverage.responded, color: '#34d399' },
                    { label: 'Pendentes', value: snapshot.quizCoverage.pending, color: '#fb7185' }
                  ]}
                />
                <SegmentedBar
                  helper={
                    selectedStudentId
                      ? 'Ao filtrar um aluno, o dashboard tambem lista quais quizzes ele respondeu por materia.'
                      : 'A comparacao considera quizzes respondidos versus o total esperado para a turma.'
                  }
                  segments={[
                    { label: 'Respondidos', value: snapshot.quizCoverage.responded, color: '#34d399' },
                    { label: 'Pendentes', value: snapshot.quizCoverage.pending, color: '#fb7185' }
                  ]}
                />
              </div>
            </Card>

            <Card
              title={selectedStudentId ? 'Frequencia do aluno' : 'Frequencia da turma'}
              subtitle={
                selectedStudentId
                  ? 'Percentual de presenca e faltas deste aluno nas suas aulas.'
                  : 'Leitura consolidada das chamadas registradas nesta turma.'
              }
            >
              <div className="dashboard-chart-grid">
                <DonutChart
                  value={`${snapshot.attendance.presencePercentage}%`}
                  total={`${snapshot.attendance.present}/${snapshot.attendance.totalCalls}`}
                  label="Presenca registrada"
                  helper={
                    snapshot.attendance.justified
                      ? `${snapshot.attendance.justified} registro(s) justificado(s)`
                      : 'Sem registros justificados'
                  }
                  segments={[
                    { label: 'Presenca', value: snapshot.attendance.present, color: '#7dd3fc' },
                    { label: 'Falta', value: snapshot.attendance.absent, color: '#f97316' }
                  ]}
                />
                <SegmentedBar
                  helper="A falta considera todo registro sem presenca na chamada daquela aula."
                  segments={[
                    { label: 'Presenca', value: snapshot.attendance.present, color: '#7dd3fc' },
                    { label: 'Falta', value: snapshot.attendance.absent, color: '#f97316' }
                  ]}
                />
              </div>
            </Card>
          </section>

          <section className="responsive-grid" style={{ alignItems: 'start' }}>
            <Card
              title={selectedStudentId ? 'Quizzes por materia' : 'Cobertura por materia'}
              subtitle={
                selectedStudentId
                  ? 'Quais quizzes o aluno ja respondeu e quais ainda faltam em cada materia.'
                  : 'Cada barra mostra a cobertura de quizzes por materia dentro da turma.'
              }
            >
              <div style={{ display: 'grid', gap: '0.9rem' }}>
                {selectedStudentId
                  ? snapshot.subjectQuizDetails.map((item) => (
                      <div
                        key={item.materiaId}
                        className="dashboard-subject-card"
                        style={{ '--subject-color': item.cor } as CSSProperties}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                          <strong>{item.materiaNome}</strong>
                          <Badge tone={item.pendingCount === 0 ? 'success' : 'warning'}>
                            {item.respondedCount}/{item.respondedCount + item.pendingCount}
                          </Badge>
                        </div>
                        <div className="dashboard-subject-columns">
                          <div>
                            <span className="dashboard-list-heading">Respondidos</span>
                            {item.respondedTitles.length ? (
                              <div className="dashboard-tag-list">
                                {item.respondedTitles.map((title) => (
                                  <span key={title} className="dashboard-inline-tag success">{title}</span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>Nenhum quiz respondido.</span>
                            )}
                          </div>
                          <div>
                            <span className="dashboard-list-heading">Pendentes</span>
                            {item.pendingTitles.length ? (
                              <div className="dashboard-tag-list">
                                {item.pendingTitles.map((title) => (
                                  <span key={title} className="dashboard-inline-tag danger">{title}</span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: '#86efac' }}>Tudo respondido nesta materia.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  : snapshot.subjectQuizCoverage.map((item) => (
                      <div
                        key={item.materiaId}
                        className="dashboard-subject-card"
                        style={{ '--subject-color': item.cor } as CSSProperties}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                          <strong>{item.materiaNome}</strong>
                          <Badge tone={item.completionRate >= 70 ? 'success' : item.completionRate >= 45 ? 'warning' : 'danger'}>
                            {item.completionRate}%
                          </Badge>
                        </div>
                        <SegmentedBar
                          segments={[
                            { label: 'Respondidos', value: item.responded, color: item.cor },
                            { label: 'Pendentes', value: item.pending, color: 'rgba(248, 113, 113, 0.95)' }
                          ]}
                        />
                      </div>
                    ))}
              </div>
            </Card>

            <Card
              title={selectedStudentId ? 'Atividades do aluno' : 'Atividades e alunos'}
              subtitle={
                selectedStudentId
                  ? 'Entregas, media e pendencias do aluno filtrado.'
                  : 'Leitura rapida das entregas da turma e de quais alunos merecem mais atencao.'
              }
            >
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="responsive-grid">
                  <StatCard label="Entregas" value={snapshot.activitySummary.delivered} helper={`${snapshot.activitySummary.completionRate}% concluidas`} />
                  <StatCard label="Pendencias" value={snapshot.activitySummary.pending} helper="Itens ainda nao entregues" />
                  <StatCard label="Media" value={snapshot.activitySummary.averageGrade || '0.0'} helper="Notas registradas" />
                </div>

                {selectedStudentId ? (
                  <div style={{ display: 'grid', gap: '0.8rem' }}>
                    <span className="dashboard-list-heading">Atividades pendentes</span>
                    {snapshot.activitySummary.pendingTitles.length ? (
                      <div className="dashboard-tag-list">
                        {snapshot.activitySummary.pendingTitles.map((title) => (
                          <span key={title} className="dashboard-inline-tag danger">{title}</span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#86efac' }}>Nenhuma atividade pendente para este aluno.</span>
                    )}
                  </div>
                ) : (
                  <div className="dashboard-insight-grid">
                    <div className="dashboard-insight-column">
                      <span className="dashboard-list-heading"><ChartNoAxesColumn size={16} /> Alunos com melhor ritmo</span>
                      {snapshot.topStudents.length ? (
                        snapshot.topStudents.map((item, index) => (
                          <div key={item.aluno.id} className="dashboard-student-row">
                            <strong>{index + 1}. {item.aluno.nome}</strong>
                            <span>{item.attendancePercentage}% presenca</span>
                          </div>
                        ))
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Sem dados suficientes.</span>
                      )}
                    </div>
                    <div className="dashboard-insight-column">
                      <span className="dashboard-list-heading"><ShieldAlert size={16} /> Alunos em atencao</span>
                      {snapshot.attentionStudents.length ? (
                        snapshot.attentionStudents.map((item) => (
                          <div key={item.aluno.id} className="dashboard-student-row">
                            <strong>{item.aluno.nome}</strong>
                            <span>{item.pendingActivities} atividade(s) e {item.pendingQuizzes} quiz(es) pendentes</span>
                          </div>
                        ))
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Sem alertas no momento.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </section>
        </>
      )}
    </>
  );
}
