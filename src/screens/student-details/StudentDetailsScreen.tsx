import { CheckCircle2, Download, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { TextArea } from '@/components/common/TextArea';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useProfessor, useStudentDetails } from '@/hooks';
import { activityDeliveriesRepository, quizAttemptsRepository, studentProfilesRepository } from '@/services/repositories';
import { calculateAttendancePercentage, summarizeMakeups } from '@/utils/metrics';
import { openStudentReportPrintWindow } from '@/utils/studentReport';

export function StudentDetailsScreen() {
  const { professorId } = useProfessor();
  const { studentId } = useParams();
  const { data, loading, error, metrics, reload } = useStudentDetails(professorId, studentId);
  const [profileText, setProfileText] = useState('');
  const [savingPendingId, setSavingPendingId] = useState<string | null>(null);
  const [activityScores, setActivityScores] = useState<Record<string, string>>({});

  useEffect(() => {
    setProfileText(data?.perfil?.perfilTexto ?? '');
  }, [data?.perfil?.perfilTexto]);

  useEffect(() => {
    if (!data) {
      setActivityScores({});
      return;
    }

    setActivityScores(
      Object.fromEntries(
        data.atividadesPendentes.map((item) => [
          item.atividade.id,
          String(item.entrega?.nota ?? item.atividade.notaMaxima ?? '')
        ])
      )
    );
  }, [data]);

  const attendanceBySubject = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.materias.map((materia) => {
      const lessonIds = data.aulas.filter((aula) => aula.materiaId === materia.id).map((aula) => aula.id);
      const relevantCalls = data.chamadas.filter((chamada) => lessonIds.includes(chamada.aulaId));
      const relevantFrequency = data.frequencias.filter((frequencia) => lessonIds.includes(frequencia.aulaId));
      return {
        materiaId: materia.id,
        nome: materia.nome,
        percentual: calculateAttendancePercentage(relevantFrequency, relevantCalls)
      };
    });
  }, [data]);

  const makeupSummary = useMemo(() => summarizeMakeups(data?.reposicoes ?? [], data?.entregasReposicao ?? []), [data?.entregasReposicao, data?.reposicoes]);

  async function saveProfile() {
    if (!data || !studentId) {
      return;
    }

    if (data.perfil) {
      await studentProfilesRepository.update(data.perfil.id, { perfilTexto: profileText });
      return;
    }

    await studentProfilesRepository.create(professorId, {
      alunoId: studentId,
      perfilTexto: profileText
    });
  }

  async function registerQuizResult(quizId: string, turmaId: string, acertou: boolean) {
    if (!studentId) {
      return;
    }

    try {
      setSavingPendingId(quizId);
      await quizAttemptsRepository.upsertMany(professorId, quizId, turmaId, [
        {
          alunoId: studentId,
          realizado: true,
          acertouDePrimeira: acertou,
          acertos: acertou ? 1 : 0,
          tentativas: 1
        }
      ]);
      await reload();
    } finally {
      setSavingPendingId(null);
    }
  }

  async function savePendingActivity(atividadeId: string) {
    if (!studentId) {
      return;
    }

    try {
      setSavingPendingId(atividadeId);
      const score = Number(activityScores[atividadeId] ?? 0);
      await activityDeliveriesRepository.upsertMany(professorId, atividadeId, [
        {
          alunoId: studentId,
          status: 'corrigido',
          nota: Number.isFinite(score) ? score : 0,
          entregueEm: new Date().toISOString()
        }
      ]);
      await reload();
    } finally {
      setSavingPendingId(null);
    }
  }

  function handleGenerateReport() {
    if (!data) {
      return;
    }

    try {
      openStudentReportPrintWindow({
        alunoNome: data.aluno.nome,
        profileText,
        data,
        metrics,
        attendanceBySubject,
        makeupSummary
      });
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : 'Nao foi possivel gerar o relatorio.');
    }
  }

  if (loading) {
    return <LoadingState label="Carregando painel do aluno..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!data) {
    return <EmptyState title="Aluno nao encontrado" description="Volte para a lista de alunos e selecione um cadastro valido." />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Detalhes do aluno"
        title={data.aluno.nome}
        description="Painel individual com perfil livre, frequencia por materia, quizzes, atividades e reposicoes para uma leitura pedagogica completa."
        actions={
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Badge tone="info">{data.turmas.length} turmas</Badge>
            <Button variant="secondary" onClick={handleGenerateReport}>
              <Download size={16} /> Gerar relatorio
            </Button>
          </div>
        }
      />

      <div className="responsive-grid">
        <StatCard label="Total de quizzes" value={metrics.totalQuizzesFeitos} helper="Tentativas registradas" />
        <StatCard label="Acertos de primeira" value={metrics.acertouDePrimeira} helper={`${metrics.percentualAcertoPrimeira}% do total`} />
        <StatCard label="Media de quizzes" value={metrics.mediaQuizzesTurma} helper="Media por turma do aluno" />
        <StatCard label="Media de atividades" value={metrics.mediaAtividades} helper="Notas corrigidas" />
      </div>

      <div className="responsive-grid" style={{ alignItems: 'start' }}>
        <Card title="Perfil do aluno" subtitle="Texto livre editavel para anotar contexto, comportamento e acompanhamento.">
          <TextArea label="Perfil" value={profileText} onChange={(event) => setProfileText(event.target.value)} />
          <Button onClick={() => void saveProfile()}>Salvar perfil</Button>
        </Card>

        <Card title="Resumo de atividades" subtitle="Consolidado de entregas esperadas, entregues e pendentes.">
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <span>Total esperado: {metrics.totalAtividadesEsperadas}</span>
            <span>Total entregue: {metrics.totalAtividadesEntregues}</span>
            <span>Total pendente: {metrics.totalAtividadesPendentes}</span>
          </div>
        </Card>
      </div>

      <div className="responsive-grid" style={{ alignItems: 'start' }}>
        <Card title="Pendencias rapidas" subtitle="Resolva quizzes e atividades pendentes sem sair do detalhe do aluno.">
          <div style={{ display: 'grid', gap: '1rem' }}>
            {!!data.quizzesPendentes.length && (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <strong>Quizzes pendentes</strong>
                {data.quizzesPendentes.map((item) => (
                  <div key={item.quiz.id} style={{ display: 'grid', gap: '0.6rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <strong>{item.quiz.titulo}</strong>
                        <p style={{ margin: '0.25rem 0 0', color: '#94a3b8' }}>{item.materia?.nome ?? 'Materia'} • {item.quiz.data}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <Button variant="secondary" onClick={() => void registerQuizResult(item.quiz.id, item.quiz.turmaId, false)} disabled={savingPendingId === item.quiz.id}>
                          <XCircle size={16} /> Errou
                        </Button>
                        <Button onClick={() => void registerQuizResult(item.quiz.id, item.quiz.turmaId, true)} disabled={savingPendingId === item.quiz.id}>
                          <CheckCircle2 size={16} /> Acertou
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!!data.atividadesPendentes.length && (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <strong>Atividades pendentes</strong>
                {data.atividadesPendentes.map((item) => (
                  <div key={item.atividade.id} style={{ display: 'grid', gap: '0.75rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                    <div>
                      <strong>{item.atividade.titulo}</strong>
                      <p style={{ margin: '0.25rem 0 0', color: '#94a3b8' }}>
                        {item.materia?.nome ?? 'Materia'} • entrega {item.atividade.dataEntrega}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'end', flexWrap: 'wrap' }}>
                      <div style={{ minWidth: 140 }}>
                        <Input
                          label="Nota"
                          type="number"
                          value={activityScores[item.atividade.id] ?? ''}
                          onChange={(event) =>
                            setActivityScores((current) => ({
                              ...current,
                              [item.atividade.id]: event.target.value
                            }))
                          }
                        />
                      </div>
                      <Button onClick={() => void savePendingActivity(item.atividade.id)} disabled={savingPendingId === item.atividade.id}>
                        <CheckCircle2 size={16} /> Salvar nota
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!data.quizzesPendentes.length && !data.atividadesPendentes.length && (
              <EmptyState title="Nada pendente" description="Este aluno esta com quizzes e atividades em dia." />
            )}
          </div>
        </Card>

        <Card title="Frequencia por materia" subtitle="Presencas / total de aulas com chamada.">
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {attendanceBySubject.map((item) => (
              <div key={item.materiaId} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', paddingBottom: '0.65rem', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                <span>{item.nome}</span>
                <Badge tone={item.percentual >= 75 ? 'success' : item.percentual >= 50 ? 'warning' : 'danger'}>{item.percentual}%</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Reposicoes" subtitle="Historico geral do aluno dentro das turmas vinculadas.">
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <span>Reposicoes passadas: {makeupSummary.passadas}</span>
            <span>Reposicoes pendentes: {makeupSummary.pendentes}</span>
            <span>Entregas de reposicao: {makeupSummary.entregues}</span>
          </div>
        </Card>
      </div>

      <div className="responsive-grid" style={{ alignItems: 'start' }}>
        <Card title="Atividades nao entregues" subtitle="Lista de pendencias do aluno.">
          {data.atividadesPendentes.length ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {data.atividadesPendentes.map((item) => (
                <div key={item.atividade.id} style={{ paddingBottom: '0.65rem', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                  <strong>{item.atividade.titulo}</strong>
                  <p style={{ margin: '0.35rem 0 0', color: '#94a3b8' }}>Aluno pendente: {data.aluno.nome}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Nenhuma pendencia" description="O aluno nao possui atividades pendentes neste momento." />
          )}
        </Card>

        <Card title="Turmas vinculadas" subtitle="Participacao academica atual.">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {data.turmas.map((turma) => (
              <Badge key={turma.id}>{turma.nome}</Badge>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
