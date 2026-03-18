import { Layers3, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/common/PageHeader';
import { Select } from '@/components/common/Select';
import { TextArea } from '@/components/common/TextArea';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { classesRepository, subjectsRepository, usersRepository } from '@/services/repositories';
import type { MateriaEntity, MateriaFormValues, TurmaEntity, UserEntity } from '@/types';

const initialForm: MateriaFormValues = {
  turmaId: '',
  nome: '',
  codigo: '',
  cor: '#34d399',
  descricao: ''
};

function normalizeToken(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

export function AdminSubjectsScreen() {
  const [professors, setProfessors] = useState<UserEntity[]>([]);
  const [classes, setClasses] = useState<TurmaEntity[]>([]);
  const [subjects, setSubjects] = useState<MateriaEntity[]>([]);
  const [selectedProfessorId, setSelectedProfessorId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MateriaEntity | null>(null);
  const [form, setForm] = useState<MateriaFormValues>(initialForm);

  const selectedProfessor = professors.find((item) => item.authUid === selectedProfessorId);
  const selectedClass = classes.find((item) => item.id === selectedClassId);

  async function reloadProfessors() {
    const items = await usersRepository.listByRole('professor');
    const ordered = items.sort((left, right) => left.displayName.localeCompare(right.displayName));
    setProfessors(ordered);
    return ordered;
  }

  async function reloadClasses(professorId: string) {
    if (!professorId) {
      setClasses([]);
      return [];
    }

    const items = await classesRepository.listOrdered(professorId);
    setClasses(items);
    return items;
  }

  async function reloadSubjects(professorId: string, classId: string) {
    if (!professorId || !classId) {
      setSubjects([]);
      return [];
    }

    const items = await subjectsRepository.listByClass(professorId, classId);
    setSubjects(items);
    return items;
  }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const professorItems = await reloadProfessors();

        if (!selectedProfessorId && professorItems.length) {
          setSelectedProfessorId(professorItems[0].authUid);
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Nao foi possivel carregar a gestao de materias.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  useEffect(() => {
    async function loadClassesForProfessor() {
      if (!selectedProfessorId) {
        setClasses([]);
        setSelectedClassId('');
        setSubjects([]);
        return;
      }

      try {
        const classItems = await reloadClasses(selectedProfessorId);
        setSelectedClassId((current) => {
          if (current && classItems.some((item) => item.id === current)) {
            return current;
          }

          return classItems[0]?.id ?? '';
        });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Nao foi possivel carregar as turmas do professor.');
      }
    }

    void loadClassesForProfessor();
  }, [selectedProfessorId]);

  useEffect(() => {
    async function loadSubjectsForClass() {
      try {
        await reloadSubjects(selectedProfessorId, selectedClassId);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Nao foi possivel carregar as materias da turma.');
      }
    }

    void loadSubjectsForClass();
  }, [selectedProfessorId, selectedClassId]);

  function openCreateModal() {
    setEditing(null);
    setForm({
      ...initialForm,
      turmaId: selectedClassId
    });
    setModalOpen(true);
  }

  function openEditModal(subject: MateriaEntity) {
    setEditing(subject);
    setForm({
      turmaId: subject.turmaId,
      nome: subject.nome,
      codigo: subject.codigo,
      cor: subject.cor,
      descricao: subject.descricao ?? ''
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProfessorId || !form.turmaId) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editing) {
        await subjectsRepository.update(editing.id, {
          turmaId: form.turmaId,
          nome: form.nome.trim(),
          codigo: form.codigo.trim(),
          cor: form.cor,
          descricao: form.descricao?.trim() || undefined,
          managedByAdmin: true,
          templateKey: editing.templateKey || `${normalizeToken(form.codigo)}::${normalizeToken(form.nome)}`
        });
      } else {
        await subjectsRepository.create(selectedProfessorId, {
          turmaId: form.turmaId,
          nome: form.nome.trim(),
          codigo: form.codigo.trim(),
          cor: form.cor,
          descricao: form.descricao?.trim() || undefined,
          managedByAdmin: true,
          templateKey: `${normalizeToken(form.codigo)}::${normalizeToken(form.nome)}`
        });
      }

      setModalOpen(false);
      setForm({ ...initialForm, turmaId: selectedClassId });
      setEditing(null);
      await reloadSubjects(selectedProfessorId, selectedClassId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel salvar a materia.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(subjectId: string) {
    try {
      setError(null);
      await subjectsRepository.remove(subjectId);
      await reloadSubjects(selectedProfessorId, selectedClassId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel remover a materia.');
    }
  }

  const duplicateMap = useMemo(() => {
    const map = new Map<string, number>();

    subjects.forEach((subject) => {
      const key = `${normalizeToken(subject.codigo)}::${normalizeToken(subject.nome)}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    });

    return map;
  }, [subjects]);

  return (
    <>
      <PageHeader
        eyebrow="Administracao"
        title="Materias por professor e turma"
        description="Organize as materias manualmente por professor e turma para manter a grade semanal limpa e sem duplicacoes."
        actions={
          <Button onClick={openCreateModal} disabled={!selectedProfessorId || !selectedClassId}>
            <Plus size={18} /> Nova materia
          </Button>
        }
      />

      {loading && <LoadingState label="Carregando gestao de materias..." />}
      {error && <ErrorState message={error} />}

      {!loading && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Card title="Contexto da organizacao" subtitle="Escolha o professor e a turma antes de cadastrar ou revisar materias.">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Select
                label="Professor"
                value={selectedProfessorId}
                onChange={(event) => setSelectedProfessorId(event.target.value)}
                options={[
                  { value: '', label: 'Selecione um professor' },
                  ...professors.map((professor) => ({
                    value: professor.authUid,
                    label: professor.displayName
                  }))
                ]}
              />
              <Select
                label="Turma"
                value={selectedClassId}
                onChange={(event) => setSelectedClassId(event.target.value)}
                options={[
                  { value: '', label: selectedProfessorId ? 'Selecione uma turma' : 'Escolha primeiro um professor' },
                  ...classes.map((item) => ({ value: item.id, label: `${item.nome} - ${item.codigo}` }))
                ]}
              />
            </div>
          </Card>

          {!selectedProfessorId && (
            <EmptyState
              title="Selecione um professor"
              description="A gestao de materias fica organizada por professor, para depois ser vinculada corretamente a cada turma."
            />
          )}

          {!!selectedProfessorId && !selectedClassId && (
            <EmptyState
              title="Nenhuma turma disponivel"
              description="Esse professor ainda nao possui turmas sincronizadas. Cadastre alunos com turma para gerar as turmas primeiro."
            />
          )}

          {!!selectedProfessorId && !!selectedClassId && !subjects.length && (
            <EmptyState
              title="Nenhuma materia nesta turma"
              description={`Cadastre as materias de ${selectedProfessor?.displayName ?? 'este professor'} para ${selectedClass?.nome ?? 'esta turma'}.`}
            />
          )}

          {!!subjects.length && (
            <div className="responsive-grid">
              {subjects.map((subject) => {
                const duplicationKey = `${normalizeToken(subject.codigo)}::${normalizeToken(subject.nome)}`;
                const isDuplicated = (duplicateMap.get(duplicationKey) ?? 0) > 1;

                return (
                  <Card
                    key={subject.id}
                    title={subject.nome}
                    subtitle={selectedClass?.nome ?? 'Turma selecionada'}
                    actions={<Badge>{subject.codigo}</Badge>}
                  >
                    <div style={{ display: 'grid', gap: '0.65rem' }}>
                      <p style={{ margin: 0, color: '#94a3b8' }}>{subject.descricao || 'Sem descricao.'}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <Badge tone="info">{selectedProfessor?.displayName ?? 'Professor'}</Badge>
                        {isDuplicated && <Badge tone="warning">Possivel duplicada</Badge>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <Button variant="secondary" onClick={() => openEditModal(subject)}>
                          <Pencil size={16} /> Editar
                        </Button>
                        <Button variant="danger" onClick={() => void handleDelete(subject.id)}>
                          <Trash2 size={16} /> Excluir
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar materia' : 'Nova materia'}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <Select
            label="Turma"
            value={form.turmaId}
            onChange={(event) => setForm((current) => ({ ...current, turmaId: event.target.value }))}
            options={[
              { value: '', label: 'Selecione uma turma' },
              ...classes.map((item) => ({ value: item.id, label: `${item.nome} - ${item.codigo}` }))
            ]}
            required
          />
          <Input
            label="Nome"
            value={form.nome}
            onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
            required
          />
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Input
              label="Codigo"
              value={form.codigo}
              onChange={(event) => setForm((current) => ({ ...current, codigo: event.target.value }))}
              required
            />
            <Input
              label="Cor"
              type="color"
              value={form.cor}
              onChange={(event) => setForm((current) => ({ ...current, cor: event.target.value }))}
            />
          </div>
          <TextArea
            label="Descricao"
            value={form.descricao}
            onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))}
          />
          <Button type="submit" disabled={saving}>
            <Layers3 size={18} /> {saving ? 'Salvando materia...' : editing ? 'Salvar materia' : 'Criar materia'}
          </Button>
        </form>
      </Modal>
    </>
  );
}
