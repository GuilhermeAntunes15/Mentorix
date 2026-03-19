import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { IconButton } from '@/components/common/IconButton';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { Select } from '@/components/common/Select';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useCollectionResource, useProfessor } from '@/hooks';
import {
  activitiesRepository,
  activityDeliveriesRepository,
  classesRepository,
  quizAttemptsRepository,
  quizzesRepository,
  studentClassRepository,
  studentsRepository,
  subjectsRepository
} from '@/services/repositories';
import { toISODate } from '@/utils/date';
import type { AtividadeEntity, QuizEntity } from '@/types';

type AssessmentMode = 'quiz' | 'atividade';

interface FastFillRow {
  alunoId: string;
  nome: string;
  realizado: boolean;
  acertouDePrimeira: boolean;
  nota: number;
}

interface QuizDraft {
  id: string;
  titulo: string;
}

const nameCollator = new Intl.Collator('pt-BR', {
  sensitivity: 'base'
});

function createQuizDraft(): QuizDraft {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `quiz-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    titulo: ''
  };
}

function CompactChoice({
  active,
  label,
  tone = 'default',
  onClick
}: {
  active: boolean;
  label: string;
  tone?: 'default' | 'success' | 'danger';
  onClick: () => void;
}) {
  const background =
    tone === 'success'
      ? active
        ? 'linear-gradient(135deg, #7dd3fc 0%, #34d399 100%)'
        : 'rgba(15, 23, 42, 0.56)'
      : tone === 'danger'
        ? active
          ? 'rgba(251, 113, 133, 0.22)'
          : 'rgba(15, 23, 42, 0.56)'
        : active
          ? 'rgba(125, 211, 252, 0.18)'
          : 'rgba(15, 23, 42, 0.56)';

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1px solid ${active ? 'rgba(125, 211, 252, 0.35)' : 'rgba(148, 163, 184, 0.14)'}`,
        background,
        color: active && tone === 'success' ? '#08111f' : '#e2e8f0',
        borderRadius: 999,
        padding: '0.55rem 0.9rem',
        fontWeight: 700
      }}
    >
      {label}
    </button>
  );
}

export function QuizzesScreen() {
  const { professorId } = useProfessor();
  const classes = useCollectionResource(professorId, classesRepository);
  const subjects = useCollectionResource(professorId, subjectsRepository);
  const quizzes = useCollectionResource(professorId, quizzesRepository);
  const activities = useCollectionResource(professorId, activitiesRepository);
  const [mode, setMode] = useState<AssessmentMode>('quiz');
  const [createOpen, setCreateOpen] = useState(false);
  const [fillOpen, setFillOpen] = useState(false);
  const [subjectFilterId, setSubjectFilterId] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | AssessmentMode>('todos');
  const [sortMode, setSortMode] = useState<'data' | 'alfabetica'>('data');
  const [form, setForm] = useState({
    turmaId: '',
    materiaId: '',
    titulo: '',
    data: toISODate(new Date()),
    notaMaxima: 10
  });
  const [quizDrafts, setQuizDrafts] = useState<QuizDraft[]>([createQuizDraft()]);
  const [selectedItem, setSelectedItem] = useState<
    | { id: string; tipo: AssessmentMode; turmaId: string; titulo: string; maxValue: number }
    | null
  >(null);
  const [rows, setRows] = useState<FastFillRow[]>([]);
  const [savingRows, setSavingRows] = useState(false);
  const [panelLoading, setPanelLoading] = useState(false);

  const filteredSubjects = useMemo(
    () => subjects.items.filter((item) => !form.turmaId || item.turmaId === form.turmaId),
    [form.turmaId, subjects.items]
  );

  const combinedItems = useMemo(
    () => [
      ...quizzes.items.map((item) => ({ ...item, tipo: 'quiz' as const })),
      ...activities.items.map((item) => ({ ...item, tipo: 'atividade' as const }))
    ],
    [activities.items, quizzes.items]
  );
  const filterSubjectOptions = useMemo(
    () =>
      [...subjects.items]
        .sort((left, right) => nameCollator.compare(left.nome, right.nome))
        .map((item) => ({ value: item.id, label: item.nome })),
    [subjects.items]
  );
  const filteredItems = useMemo(
    () =>
      combinedItems.filter((item) => {
        const matchesSubject = !subjectFilterId || item.materiaId === subjectFilterId;
        const matchesType = typeFilter === 'todos' || item.tipo === typeFilter;
        return matchesSubject && matchesType;
      }),
    [combinedItems, subjectFilterId, typeFilter]
  );
  const orderedItems = useMemo(
    () =>
      [...filteredItems].sort((left, right) => {
        if (sortMode === 'alfabetica') {
          return nameCollator.compare(left.titulo, right.titulo);
        }

        const leftDate = 'data' in left ? left.data : left.dataEntrega;
        const rightDate = 'data' in right ? right.data : right.dataEntrega;
        return `${rightDate}`.localeCompare(`${leftDate}`);
      }),
    [filteredItems, sortMode]
  );

  async function buildRows(turmaId: string, tipo: AssessmentMode, itemId?: string, maxValue?: number) {
    setPanelLoading(true);
    try {
      const [relations, students] = await Promise.all([
        studentClassRepository.listByClass(professorId, turmaId),
        studentsRepository.listOrdered(professorId)
      ]);

      const classStudents = relations
        .filter((relation) => relation.ativo)
        .map((relation) => ({
          alunoId: relation.alunoId,
          nome: students.find((student) => student.id === relation.alunoId)?.nome ?? 'Aluno'
        }))
        .sort((left, right) => nameCollator.compare(left.nome, right.nome));

      if (!itemId) {
        setRows(
          classStudents.map((student) => ({
            alunoId: student.alunoId,
            nome: student.nome,
            realizado: true,
            acertouDePrimeira: true,
            nota: tipo === 'quiz' ? 1 : maxValue ?? 10
          }))
        );
        return;
      }

      if (tipo === 'quiz') {
        const attempts = await quizAttemptsRepository.listByQuiz(professorId, itemId);
        setRows(
          classStudents.map((student) => {
            const attempt = attempts.find((item) => item.alunoId === student.alunoId);
            return {
              alunoId: student.alunoId,
              nome: student.nome,
              realizado: attempt?.realizado ?? true,
              acertouDePrimeira: attempt?.acertouDePrimeira ?? true,
              nota: typeof attempt?.acertos === 'number' ? Number(attempt.acertos) : 1
            };
          })
        );
        return;
      }

      const deliveries = await activityDeliveriesRepository.listByActivity(professorId, itemId);
      setRows(
        classStudents.map((student) => {
          const delivery = deliveries.find((item) => item.alunoId === student.alunoId);
          return {
            alunoId: student.alunoId,
            nome: student.nome,
            realizado: delivery ? delivery.status !== 'pendente' : true,
            acertouDePrimeira: true,
            nota: typeof delivery?.nota === 'number' ? Number(delivery.nota) : maxValue ?? 10
          };
        })
      );
    } finally {
      setPanelLoading(false);
    }
  }

  function resetCreateState() {
    setForm({
      turmaId: '',
      materiaId: '',
      titulo: '',
      data: toISODate(new Date()),
      notaMaxima: 10
    });
    setQuizDrafts([createQuizDraft()]);
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === 'quiz') {
      const drafts = quizDrafts.map((item) => item.titulo.trim()).filter(Boolean);

      if (!drafts.length) {
        return;
      }

      const createdItems: QuizEntity[] = [];

      for (const title of drafts) {
        const created = await quizzes.createItem({
          turmaId: form.turmaId,
          materiaId: form.materiaId,
          titulo: title,
          data: form.data,
          totalQuestoes: 1
        });
        createdItems.push(created);
      }

      const firstCreated = createdItems[0];
      setSelectedItem({
        id: firstCreated.id,
        tipo: 'quiz',
        turmaId: firstCreated.turmaId,
        titulo: firstCreated.titulo,
        maxValue: 1
      });
      await buildRows(firstCreated.turmaId, 'quiz', firstCreated.id, 1);
    } else {
      const created = await activities.createItem({
        turmaId: form.turmaId,
        materiaId: form.materiaId,
        titulo: form.titulo,
        dataEntrega: form.data,
        notaMaxima: Number(form.notaMaxima)
      });
      const maxValue = Number(created.notaMaxima ?? form.notaMaxima);
      setSelectedItem({ id: created.id, tipo: 'atividade', turmaId: created.turmaId, titulo: created.titulo, maxValue });
      await buildRows(created.turmaId, 'atividade', created.id, maxValue);
    }

    setCreateOpen(false);
    setFillOpen(true);
    resetCreateState();
  }

  async function openItem(item: (QuizEntity | AtividadeEntity) & { tipo: AssessmentMode }) {
    const maxValue = item.tipo === 'quiz' ? 1 : Number((item as AtividadeEntity).notaMaxima ?? 10);
    setSelectedItem({ id: item.id, tipo: item.tipo, turmaId: item.turmaId, titulo: item.titulo, maxValue });
    await buildRows(item.turmaId, item.tipo, item.id, maxValue);
    setFillOpen(true);
  }

  async function saveFastFill() {
    if (!selectedItem) {
      return;
    }

    setSavingRows(true);
    try {
      if (selectedItem.tipo === 'quiz') {
        await quizAttemptsRepository.upsertMany(
          professorId,
          selectedItem.id,
          selectedItem.turmaId,
          rows.map((row) => ({
            alunoId: row.alunoId,
            realizado: row.realizado,
            acertouDePrimeira: row.realizado && row.nota > 0,
            acertos: row.realizado ? row.nota : 0,
            tentativas: row.realizado ? 1 : 0
          }))
        );
      } else {
        await activityDeliveriesRepository.upsertMany(
          professorId,
          selectedItem.id,
          rows.map((row) => ({
            alunoId: row.alunoId,
            status: row.realizado ? 'corrigido' : 'pendente',
            nota: row.realizado ? row.nota : undefined,
            entregueEm: row.realizado ? new Date().toISOString() : undefined
          }))
        );
      }
      setFillOpen(false);
    } finally {
      setSavingRows(false);
    }
  }

  function updateQuizRow(alunoId: string, patch: Partial<FastFillRow>) {
    setRows((current) =>
      current.map((item) =>
        item.alunoId === alunoId
          ? {
              ...item,
              ...patch
            }
          : item
      )
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Avaliacoes"
        title="Quizzes e atividades em um lugar so"
        description="Lancamento rapido, mais compacto, com quiz de 1 pergunta e criacao em lote."
        actions={<IconButton onClick={() => setCreateOpen(true)}><Plus size={18} /> Novo lancamento</IconButton>}
      />

      <section style={{ display: 'grid', gap: '1rem' }}>
        <Card title="Filtros" subtitle="Refine a listagem por materia e por tipo de avaliacao.">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Select
              label="Materia"
              value={subjectFilterId}
              onChange={(event) => setSubjectFilterId(event.target.value)}
              options={[
                { value: '', label: 'Todas as materias' },
                ...filterSubjectOptions
              ]}
            />
            <Select
              label="Tipo de avaliacao"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as 'todos' | AssessmentMode)}
              options={[
                { value: 'todos', label: 'Todos os tipos' },
                { value: 'quiz', label: 'Quiz' },
                { value: 'atividade', label: 'Atividade' }
              ]}
            />
            <Select
              label="Ordenacao"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as 'data' | 'alfabetica')}
              options={[
                { value: 'data', label: 'Mais recentes primeiro' },
                { value: 'alfabetica', label: 'Ordem alfabetica' }
              ]}
            />
          </div>
        </Card>

        {(quizzes.loading || activities.loading) && <LoadingState label="Carregando avaliacoes..." />}
        {(quizzes.error || activities.error) && <ErrorState message={quizzes.error ?? activities.error ?? 'Erro ao carregar avaliacoes.'} />}
        {!quizzes.loading && !activities.loading && !combinedItems.length && (
          <EmptyState title="Nenhum quiz ou atividade" description="Crie o primeiro item e lance rapidamente a turma completa." />
        )}
        {!quizzes.loading && !activities.loading && !!combinedItems.length && !filteredItems.length && (
          <EmptyState title="Nenhum resultado para os filtros" description="Ajuste os filtros de materia ou tipo de avaliacao para ver outros lancamentos." />
        )}
        {orderedItems.map((item) => {
          const turma = classes.items.find((entry) => entry.id === item.turmaId);
          const materia = subjects.items.find((entry) => entry.id === item.materiaId);
          const dateLabel = item.tipo === 'quiz' ? (item as QuizEntity).data : (item as AtividadeEntity).dataEntrega;
          const helper = item.tipo === 'quiz' ? '1 pergunta' : `${(item as AtividadeEntity).notaMaxima ?? '-'} pts`;

          return (
            <Card key={`${item.tipo}-${item.id}`} title={item.titulo} subtitle={`${materia?.nome ?? 'Materia'} - ${turma?.nome ?? 'Turma'} - ${dateLabel}`} actions={<Badge>{item.tipo}</Badge>}>
              <p style={{ margin: 0, color: '#94a3b8' }}>{helper}</p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Button variant="secondary" onClick={() => void openItem(item)}>Abrir preenchimento</Button>
                <Button variant="danger" onClick={() => void (item.tipo === 'quiz' ? quizzes.removeItem(item.id) : activities.removeItem(item.id))}>Excluir</Button>
              </div>
            </Card>
          );
        })}
      </section>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo lancamento">
        <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <Select
            label="Tipo"
            value={mode}
            onChange={(event) => setMode(event.target.value as AssessmentMode)}
            options={[
              { value: 'quiz', label: 'Quiz' },
              { value: 'atividade', label: 'Atividade' }
            ]}
          />
          <Select
            label="Turma"
            value={form.turmaId}
            onChange={(event) => setForm({ ...form, turmaId: event.target.value, materiaId: '' })}
            options={[{ value: '', label: 'Selecione uma turma' }, ...classes.items.map((item) => ({ value: item.id, label: item.nome }))]}
            required
          />
          <Select
            label="Materia"
            value={form.materiaId}
            onChange={(event) => setForm({ ...form, materiaId: event.target.value })}
            options={[{ value: '', label: 'Selecione uma materia' }, ...filteredSubjects.map((item) => ({ value: item.id, label: item.nome }))]}
            required
          />
          <Input
            label={mode === 'quiz' ? 'Data do lote de quizzes' : 'Data de entrega'}
            type="date"
            value={form.data}
            onChange={(event) => setForm({ ...form, data: event.target.value })}
          />

          {mode === 'quiz' ? (
            <Card title="Quizzes do dia" subtitle="Cada quiz tem 1 pergunta. Adicione quantos itens quiser e nomeie cada um.">
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                {quizDrafts.map((draft, index) => (
                  <div key={draft.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'end', flexWrap: 'wrap' }}>
                    <Input
                      label={`Quiz ${index + 1}`}
                      value={draft.titulo}
                      onChange={(event) =>
                        setQuizDrafts((current) =>
                          current.map((item) => (item.id === draft.id ? { ...item, titulo: event.target.value } : item))
                        )
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        setQuizDrafts((current) => (current.length > 1 ? current.filter((item) => item.id !== draft.id) : current))
                      }
                      disabled={quizDrafts.length === 1}
                    >
                      <Trash2 size={16} /> Remover
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => setQuizDrafts((current) => [...current, createQuizDraft()])}>
                  <Plus size={18} /> Adicionar quiz
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <Input label="Titulo" value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} required />
              <Input label="Nota maxima" type="number" value={String(form.notaMaxima)} onChange={(event) => setForm({ ...form, notaMaxima: Number(event.target.value) })} />
            </>
          )}

          <Button type="submit">Criar e abrir preenchimento</Button>
        </form>
      </Modal>

      <Modal open={fillOpen} onClose={() => setFillOpen(false)} title={selectedItem?.titulo ?? 'Preenchimento rapido'}>
        {panelLoading && <LoadingState label="Montando turma..." />}
        {!panelLoading && selectedItem && (
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <Card
              title={selectedItem.tipo === 'quiz' ? 'Lancamento rapido do quiz' : 'Lancamento rapido da atividade'}
              subtitle={selectedItem.tipo === 'quiz' ? 'Cada linha ja vem pronta para preenchimento em 1 pergunta.' : 'Entregou ou nao entregou, com nota ao lado.'}
            >
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setRows((current) =>
                      current.map((row) => ({
                        ...row,
                        realizado: true,
                        acertouDePrimeira: selectedItem.tipo === 'quiz' ? true : row.acertouDePrimeira,
                        nota: selectedItem.tipo === 'quiz' ? 1 : selectedItem.maxValue
                      }))
                    )
                  }
                >
                  {selectedItem.tipo === 'quiz' ? 'Todos fizeram e acertaram' : 'Todos entregaram'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setRows((current) =>
                      current.map((row) => ({
                        ...row,
                        realizado: false,
                        acertouDePrimeira: false,
                        nota: selectedItem.tipo === 'quiz' ? 0 : row.nota
                      }))
                    )
                  }
                >
                  {selectedItem.tipo === 'quiz' ? 'Todos nao fizeram' : 'Todos pendentes'}
                </Button>
              </div>
            </Card>

            <Card title="Turma" subtitle="Preencha linha por linha, sem repetir cabecalhos grandes.">
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                {rows.map((row) => (
                  <div
                    key={row.alunoId}
                    style={{
                      display: 'grid',
                      gap: '0.75rem',
                      paddingBottom: '0.85rem',
                      borderBottom: '1px solid rgba(148, 163, 184, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <strong>{row.nome}</strong>
                      <Badge tone={row.realizado ? 'success' : 'warning'}>{row.realizado ? 'ok' : 'pendente'}</Badge>
                    </div>

                    {selectedItem.tipo === 'quiz' ? (
                      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <CompactChoice
                          active={row.realizado}
                          label="Fez"
                          tone="success"
                          onClick={() => updateQuizRow(row.alunoId, { realizado: true, nota: row.nota > 0 ? row.nota : 1 })}
                        />
                        <CompactChoice
                          active={!row.realizado}
                          label="Nao fez"
                          tone="danger"
                          onClick={() => updateQuizRow(row.alunoId, { realizado: false, acertouDePrimeira: false, nota: 0 })}
                        />
                        <CompactChoice
                          active={row.realizado && row.nota > 0}
                          label="Acertou"
                          onClick={() => updateQuizRow(row.alunoId, { realizado: true, nota: 1, acertouDePrimeira: true })}
                        />
                        <CompactChoice
                          active={row.realizado && row.nota === 0}
                          label="Errou"
                          onClick={() => updateQuizRow(row.alunoId, { realizado: true, acertouDePrimeira: false, nota: 0 })}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <CompactChoice
                          active={row.realizado}
                          label="Entregou"
                          tone="success"
                          onClick={() => setRows((current) => current.map((item) => item.alunoId === row.alunoId ? { ...item, realizado: true } : item))}
                        />
                        <CompactChoice
                          active={!row.realizado}
                          label="Nao entregou"
                          tone="danger"
                          onClick={() => setRows((current) => current.map((item) => item.alunoId === row.alunoId ? { ...item, realizado: false } : item))}
                        />
                        <div style={{ minWidth: 120 }}>
                          <Input
                            label="Nota"
                            type="number"
                            value={String(row.nota)}
                            onChange={(event) =>
                              setRows((current) =>
                                current.map((item) =>
                                  item.alunoId === row.alunoId ? { ...item, nota: Number(event.target.value) } : item
                                )
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Button onClick={() => void saveFastFill()} disabled={savingRows}>
              {savingRows ? 'Salvando...' : 'Salvar lancamento'}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
