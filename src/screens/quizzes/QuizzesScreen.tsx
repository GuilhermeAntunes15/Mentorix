import { Plus } from 'lucide-react';
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

export function QuizzesScreen() {
  const { professorId } = useProfessor();
  const classes = useCollectionResource(professorId, classesRepository);
  const subjects = useCollectionResource(professorId, subjectsRepository);
  const quizzes = useCollectionResource(professorId, quizzesRepository);
  const activities = useCollectionResource(professorId, activitiesRepository);
  const [mode, setMode] = useState<AssessmentMode>('quiz');
  const [createOpen, setCreateOpen] = useState(false);
  const [fillOpen, setFillOpen] = useState(false);
  const [form, setForm] = useState({
    turmaId: '',
    materiaId: '',
    titulo: '',
    data: toISODate(new Date()),
    totalQuestoes: 10,
    notaMaxima: 10
  });
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
    ].sort((left, right) => {
      const leftDate = 'data' in left ? left.data : left.dataEntrega;
      const rightDate = 'data' in right ? right.data : right.dataEntrega;
      return `${rightDate}`.localeCompare(`${leftDate}`);
    }),
    [activities.items, quizzes.items]
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
        }));

      if (!itemId) {
        setRows(
          classStudents.map((student) => ({
            alunoId: student.alunoId,
            nome: student.nome,
            realizado: true,
            acertouDePrimeira: true,
            nota: maxValue ?? 10
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
              nota: attempt?.acertos ?? (maxValue ?? 10)
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

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === 'quiz') {
      const created = await quizzes.createItem({
        turmaId: form.turmaId,
        materiaId: form.materiaId,
        titulo: form.titulo,
        data: form.data,
        totalQuestoes: Number(form.totalQuestoes)
      });
      setSelectedItem({ id: created.id, tipo: 'quiz', turmaId: created.turmaId, titulo: created.titulo, maxValue: created.totalQuestoes });
      await buildRows(created.turmaId, 'quiz', created.id, created.totalQuestoes);
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
  }

  async function openItem(item: (QuizEntity | AtividadeEntity) & { tipo: AssessmentMode }) {
    const maxValue = item.tipo === 'quiz' ? Number((item as QuizEntity).totalQuestoes) : Number((item as AtividadeEntity).notaMaxima ?? 10);
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
            acertouDePrimeira: row.realizado ? row.acertouDePrimeira : false,
            acertos: row.realizado ? Math.max(0, Math.min(selectedItem.maxValue, row.nota)) : 0,
            tentativas: row.realizado ? (row.acertouDePrimeira ? 1 : 2) : 0
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

  return (
    <>
      <PageHeader
        eyebrow="Avaliacoes"
        title="Quizzes e atividades em um lugar so"
        description="Crie e lance a turma inteira via modal, com preenchimento rapido e default positivo."
        actions={<IconButton onClick={() => setCreateOpen(true)}><Plus size={18} /> Novo lancamento</IconButton>}
      />

      <section style={{ display: 'grid', gap: '1rem' }}>
        {(quizzes.loading || activities.loading) && <LoadingState label="Carregando avaliacoes..." />}
        {(quizzes.error || activities.error) && <ErrorState message={quizzes.error ?? activities.error ?? 'Erro ao carregar avaliacoes.'} />}
        {!quizzes.loading && !activities.loading && !combinedItems.length && (
          <EmptyState title="Nenhum quiz ou atividade" description="Crie o primeiro item e lance rapidamente a turma completa." />
        )}
        {combinedItems.map((item) => {
          const turma = classes.items.find((entry) => entry.id === item.turmaId);
          const materia = subjects.items.find((entry) => entry.id === item.materiaId);
          const dateLabel = item.tipo === 'quiz' ? (item as QuizEntity).data : (item as AtividadeEntity).dataEntrega;
          const helper = item.tipo === 'quiz' ? `${(item as QuizEntity).totalQuestoes} questoes` : `${(item as AtividadeEntity).notaMaxima ?? '-'} pts`;

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
          <Select label="Tipo" value={mode} onChange={(event) => setMode(event.target.value as AssessmentMode)} options={[{ value: 'quiz', label: 'Quiz' }, { value: 'atividade', label: 'Atividade' }]} />
          <Select label="Turma" value={form.turmaId} onChange={(event) => setForm({ ...form, turmaId: event.target.value, materiaId: '' })} options={[{ value: '', label: 'Selecione uma turma' }, ...classes.items.map((item) => ({ value: item.id, label: item.nome }))]} required />
          <Select label="Materia" value={form.materiaId} onChange={(event) => setForm({ ...form, materiaId: event.target.value })} options={[{ value: '', label: 'Selecione uma materia' }, ...filteredSubjects.map((item) => ({ value: item.id, label: item.nome }))]} required />
          <Input label="Titulo" value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} required />
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Input label={mode === 'quiz' ? 'Data do quiz' : 'Data de entrega'} type="date" value={form.data} onChange={(event) => setForm({ ...form, data: event.target.value })} />
            {mode === 'quiz' ? (
              <Input label="Total de questoes" type="number" value={String(form.totalQuestoes)} onChange={(event) => setForm({ ...form, totalQuestoes: Number(event.target.value) })} />
            ) : (
              <Input label="Nota maxima" type="number" value={String(form.notaMaxima)} onChange={(event) => setForm({ ...form, notaMaxima: Number(event.target.value) })} />
            )}
          </div>
          <Button type="submit">Criar e abrir preenchimento</Button>
        </form>
      </Modal>

      <Modal open={fillOpen} onClose={() => setFillOpen(false)} title={selectedItem?.titulo ?? 'Preenchimento rapido'}>
        {panelLoading && <LoadingState label="Montando turma..." />}
        {!panelLoading && selectedItem && (
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {rows.map((row) => (
              <Card key={row.alunoId} title={row.nome} actions={<Badge tone={row.realizado ? 'success' : 'warning'}>{row.realizado ? 'ok' : 'pendente'}</Badge>}>
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Button variant={row.realizado ? 'primary' : 'secondary'} onClick={() => setRows((current) => current.map((item) => item.alunoId === row.alunoId ? { ...item, realizado: true } : item))}>
                      {selectedItem.tipo === 'quiz' ? 'Fez' : 'Entregou'}
                    </Button>
                    <Button variant={!row.realizado ? 'danger' : 'secondary'} onClick={() => setRows((current) => current.map((item) => item.alunoId === row.alunoId ? { ...item, realizado: false, acertouDePrimeira: false } : item))}>
                      {selectedItem.tipo === 'quiz' ? 'Nao fez' : 'Nao entregou'}
                    </Button>
                    {selectedItem.tipo === 'quiz' && (
                      <Button variant={row.acertouDePrimeira ? 'secondary' : 'ghost'} onClick={() => setRows((current) => current.map((item) => item.alunoId === row.alunoId ? { ...item, acertouDePrimeira: !item.acertouDePrimeira } : item))}>
                        {row.acertouDePrimeira ? 'Acertou de primeira' : 'Nao acertou de primeira'}
                      </Button>
                    )}
                  </div>
                  <Input label={selectedItem.tipo === 'quiz' ? 'Acertos' : 'Nota'} type="number" value={String(row.nota)} onChange={(event) => setRows((current) => current.map((item) => item.alunoId === row.alunoId ? { ...item, nota: Number(event.target.value) } : item))} />
                </div>
              </Card>
            ))}
            <Button onClick={() => void saveFastFill()} disabled={savingRows}>{savingRows ? 'Salvando...' : 'Salvar lancamento'}</Button>
          </div>
        )}
      </Modal>
    </>
  );
}
