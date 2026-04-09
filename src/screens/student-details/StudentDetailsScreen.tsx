import { CheckCircle2, Download, Plus, Star, Trash2, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { TextArea } from '@/components/common/TextArea';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useProfessor, useStudentDetails } from '@/hooks';
import { activityDeliveriesRepository, quizAttemptsRepository, studentProfilesRepository, studentScoresRepository } from '@/services/repositories';
import { calculateAttendancePercentage, summarizeMakeups } from '@/utils/metrics';
import { openStudentReportPrintWindow } from '@/utils/studentReport';
import type { PontuacaoAlunoEntity } from '@/types';

export function StudentDetailsScreen() {
  const { professorId } = useProfessor();
  const { studentId } = useParams();
  const { data, loading, error, metrics, reload } = useStudentDetails(professorId, studentId);
  const [profileText, setProfileText] = useState('');
  const [savingPendingId, setSavingPendingId] = useState<string | null>(null);
  const [activityScores, setActivityScores] = useState<Record<string, string>>({});

  // Pontuacao individual
  const [scores, setScores] = useState<PontuacaoAlunoEntity[]>([]);
  const [scoresLoading, setScoresLoading] = useState(true);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [scoreForm, setScoreForm] = useState({ descricao: '', pontos: 0, data: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    setProfileText(data?.perfil?.perfilTexto ?? '');
  }, [data?.perfil?.perfilTexto]);

  useEffect(() => {
    if (!studentId) return;
    setScoresLoading(true);
    studentScoresRepository.listByStudent(professorId, studentId)
      .then(setScores)
      .catch(() => setScores([]))
      .finally(() => setScoresLoading(false));
  }, [professorId, studentId]);

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

  const totalPontos = useMemo(() => scores.reduce((sum, s) => sum + s.pontos, 0), [scores]);

  async function reloadScores() {
    if (!studentId) return;
    const result = await studentScoresRepository.listByStudent(professorId, studentId);
    setScores(result);
  }

  async function handleAddScore(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studentId || !data?.turmas.length) return;
    await studentScoresRepository.create(professorId, {
      alunoId: studentId,
      turmaId: data.turmas[0].id,
      descricao: scoreForm.descricao,
      pontos: scoreForm.pontos,
      data: scoreForm.data
    });
    setScoreForm({ descricao: '', pontos: 0, data: new Date().toISOString().split('T')[0] });
    setScoreModalOpen(false);
    await reloadScores();
  }

  async function handleRemoveScore(scoreId: string) {
    await studentScoresRepository.remove(scoreId);
    await reloadScores();
  }

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
        <StatCard label="Pontuacao individual" value={totalPontos} helper="Pontos acumulados" />
      </div>

      <Card
        title="Pontuacao individual"
        subtitle="Registre pontos por participacao, apresentacoes, comportamento e outras contribuicoes."
        actions={
          <Button onClick={() => setScoreModalOpen(true)}>
            <Plus size={16} /> Dar pontos
          </Button>
        }
      >
        {scoresLoading ? (
          <p style={{ color: '#94a3b8' }}>Carregando pontos...</p>
        ) : scores.length ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {[...scores].sort((a, b) => b.data.localeCompare(a.data)).map((score) => (
              <div
                key={score.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: 12,
                  background: 'rgba(15, 23, 42, 0.56)',
                  border: '1px solid rgba(148, 163, 184, 0.1)'
                }}
              >
                <div style={{ display: 'grid', gap: '0.2rem' }}>
                  <strong>{score.descricao}</strong>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{score.data}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Badge tone={score.pontos >= 0 ? 'success' : 'danger'}>
                    <Star size={14} /> {score.pontos > 0 ? '+' : ''}{score.pontos} pts
                  </Badge>
                  <Button variant="danger" onClick={() => void handleRemoveScore(score.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Sem pontos registrados" description="Use o botao acima para dar pontos a este aluno." />
        )}
      </Card>

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

      <Modal
        open={scoreModalOpen}
        onClose={() => setScoreModalOpen(false)}
        title="Dar pontos"
        subtitle={`Registrar pontos para ${data.aluno.nome}`}
      >
        <form onSubmit={handleAddScore} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <Input
            label="Descricao"
            value={scoreForm.descricao}
            onChange={(event) => setScoreForm({ ...scoreForm, descricao: event.target.value })}
            required
          />
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Input
              label="Pontos"
              type="number"
              value={scoreForm.pontos}
              onChange={(event) => setScoreForm({ ...scoreForm, pontos: Number(event.target.value) })}
              required
            />
            <Input
              label="Data"
              type="date"
              value={scoreForm.data}
              onChange={(event) => setScoreForm({ ...scoreForm, data: event.target.value })}
            />
          </div>
          <Button type="submit">
            <Star size={16} /> Registrar pontos
          </Button>
        </form>
      </Modal>
    </>
  );
}
