import { GraduationCap, Pencil, Plus, Shield, UserSquare2 } from 'lucide-react';
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
import { useSession } from '@/hooks';
import { updateProfessorAccountProfile } from '@/services/admin/adminProvisioningService';
import { classesRepository, usersRepository } from '@/services/repositories';
import type { ManagedUserProvisionInput, SharedClassDraft, UserEntity, UserRole } from '@/types';

type CreateFormState =
  | Extract<ManagedUserProvisionInput, { role: 'professor' }>
  | Extract<ManagedUserProvisionInput, { role: 'aluno' }>;

const initialClassDraft: SharedClassDraft = {
  syncKey: '',
  nome: '',
  codigo: '',
  periodo: '',
  cor: '#7dd3fc',
  descricao: ''
};

function createInitialForm(role: Exclude<UserRole, 'admin'> = 'aluno'): CreateFormState {
  if (role === 'professor') {
    return {
      role: 'professor',
      displayName: '',
      email: '',
      password: ''
    };
  }

  return {
    role: 'aluno',
    displayName: '',
    email: '',
    password: '',
    classAssignment: { ...initialClassDraft }
  };
}

export function AdminUsersScreen() {
  const { createManagedUser } = useSession();
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [sharedClasses, setSharedClasses] = useState<SharedClassDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProfessorSaving, setEditingProfessorSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editProfessorModalOpen, setEditProfessorModalOpen] = useState(false);
  const [form, setForm] = useState<CreateFormState>(createInitialForm());
  const [selectedSharedClass, setSelectedSharedClass] = useState('');
  const [editingProfessor, setEditingProfessor] = useState<UserEntity | null>(null);
  const [editingProfessorName, setEditingProfessorName] = useState('');

  const professors = useMemo(
    () => users.filter((user) => user.role === 'professor').sort((a, b) => a.displayName.localeCompare(b.displayName)),
    [users]
  );

  async function reloadUsers() {
    setUsers(await usersRepository.listAll());
  }

  async function reloadSharedClasses() {
    setSharedClasses(await classesRepository.listSharedDrafts());
  }

  function resetCreateForm(nextRole: Exclude<UserRole, 'admin'> = 'aluno') {
    setForm(createInitialForm(nextRole));
    setSelectedSharedClass('');
  }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([reloadUsers(), reloadSharedClasses()]);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Nao foi possivel carregar os usuarios.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  function handleRoleChange(role: Exclude<UserRole, 'admin'>) {
    resetCreateForm(role);
  }

  function handleSelectSharedClass(syncKey: string) {
    setSelectedSharedClass(syncKey);
    const classroom = sharedClasses.find((item) => item.syncKey === syncKey);

    setForm((current) =>
      current.role === 'aluno'
        ? {
            ...current,
            classAssignment: classroom ? { ...classroom } : { ...initialClassDraft }
          }
        : current
    );
  }

  function openProfessorEditor(user: UserEntity) {
    setEditingProfessor(user);
    setEditingProfessorName(user.displayName);
    setEditProfessorModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);

      if (form.role === 'professor') {
        await createManagedUser({
          role: 'professor',
          displayName: form.displayName.trim(),
          email: form.email.trim(),
          password: form.password
        });
      } else {
        await createManagedUser({
          role: 'aluno',
          displayName: form.displayName.trim(),
          email: form.email.trim(),
          password: form.password,
          classAssignment: {
            ...form.classAssignment,
            syncKey: form.classAssignment.syncKey?.trim() || undefined,
            nome: form.classAssignment.nome.trim(),
            codigo: form.classAssignment.codigo.trim(),
            periodo: form.classAssignment.periodo.trim(),
            cor: form.classAssignment.cor,
            descricao: form.classAssignment.descricao?.trim() || undefined
          }
        });
      }

      setCreateModalOpen(false);
      resetCreateForm(form.role);
      await Promise.all([reloadUsers(), reloadSharedClasses()]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel criar o usuario.');
    } finally {
      setSaving(false);
    }
  }

  async function handleProfessorUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingProfessor) {
      return;
    }

    try {
      setEditingProfessorSaving(true);
      setError(null);
      await updateProfessorAccountProfile({
        authUid: editingProfessor.authUid,
        displayName: editingProfessorName.trim()
      });
      setEditProfessorModalOpen(false);
      setEditingProfessor(null);
      await reloadUsers();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel atualizar o professor.');
    } finally {
      setEditingProfessorSaving(false);
    }
  }

  const currentClassDraft = form.role === 'aluno' ? form.classAssignment : null;
  const canSaveStudent =
    form.role === 'aluno' &&
    form.displayName.trim() &&
    form.email.trim() &&
    form.password.trim() &&
    currentClassDraft?.nome.trim() &&
    currentClassDraft?.codigo.trim() &&
    currentClassDraft?.periodo.trim();
  const canSaveProfessor =
    form.role === 'professor' &&
    form.displayName.trim() &&
    form.email.trim() &&
    form.password.trim();

  return (
    <>
      <PageHeader
        eyebrow="Administracao"
        title="Usuarios e acessos"
        description="O admin define as turmas dos alunos aqui e organiza as materias do professor pela tela Materias."
        actions={
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus size={18} /> Novo acesso
          </Button>
        }
      />

      {loading && <LoadingState label="Carregando usuarios..." />}
      {error && <ErrorState message={error} />}
      {!loading && !users.length && (
        <EmptyState title="Nenhum usuario encontrado" description="Crie o primeiro professor ou aluno a partir desta area." />
      )}

      <section className="responsive-grid">
        {users.map((user) => (
          <Card
            key={user.id}
            title={user.displayName}
            subtitle={user.email}
            actions={
              <Badge tone={user.role === 'admin' ? 'warning' : user.role === 'professor' ? 'info' : 'success'}>
                {user.role}
              </Badge>
            }
          >
            <div style={{ display: 'grid', gap: '0.45rem', color: '#cbd5e1' }}>
              <span>Username: {user.username || user.displayName}</span>
              {user.role === 'professor' && (
                <span>Materias: gerenciadas na tela "Materias" do admin, sempre vinculadas a uma turma.</span>
              )}
              {user.linkedStudentId && <span>Aluno vinculado: {user.linkedStudentId}</span>}
              <span>Professor dono: {user.targetProfessorId ?? user.professorId}</span>
            </div>
            {user.role === 'professor' && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Button variant="secondary" onClick={() => openProfessorEditor(user)}>
                  <Pencil size={16} /> Editar professor
                </Button>
              </div>
            )}
          </Card>
        ))}
      </section>

      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Criar novo acesso">
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <Select
            label="Papel"
            value={form.role}
            onChange={(event) => handleRoleChange(event.target.value as Exclude<UserRole, 'admin'>)}
            options={[
              { value: 'professor', label: 'Professor' },
              { value: 'aluno', label: 'Aluno' }
            ]}
          />
          <Input
            label={form.role === 'professor' ? 'Nome do professor' : 'Nome do aluno'}
            value={form.displayName}
            onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
          <Input
            label="Senha"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />

          {form.role === 'professor' ? (
            <Card title="Conta de professor" subtitle="As materias agora sao vinculadas por turma na tela Materias do admin.">
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#cbd5e1' }}>
                <Shield size={18} /> Crie a conta do professor aqui e depois organize as materias em `Materias`, escolhendo professor e turma.
              </div>
            </Card>
          ) : (
            <Card title="Turma do aluno" subtitle="A turma escolhida sera replicada para todos os professores e ficara travada para edicao.">
              <div style={{ display: 'grid', gap: '1rem' }}>
                <Select
                  label="Usar turma existente"
                  value={selectedSharedClass}
                  onChange={(event) => handleSelectSharedClass(event.target.value)}
                  options={[
                    { value: '', label: 'Criar nova turma' },
                    ...sharedClasses.map((item) => ({
                      value: item.syncKey ?? '',
                      label: `${item.nome} - ${item.codigo}`
                    }))
                  ]}
                />
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Input
                    label="Nome da turma"
                    value={currentClassDraft?.nome ?? ''}
                    onChange={(event) =>
                      setForm((current) =>
                        current.role === 'aluno'
                          ? {
                              ...current,
                              classAssignment: {
                                ...current.classAssignment,
                                nome: event.target.value
                              }
                            }
                          : current
                      )
                    }
                    required
                  />
                  <Input
                    label="Codigo"
                    value={currentClassDraft?.codigo ?? ''}
                    onChange={(event) =>
                      setForm((current) =>
                        current.role === 'aluno'
                          ? {
                              ...current,
                              classAssignment: {
                                ...current.classAssignment,
                                codigo: event.target.value
                              }
                            }
                          : current
                      )
                    }
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Input
                    label="Periodo"
                    value={currentClassDraft?.periodo ?? ''}
                    onChange={(event) =>
                      setForm((current) =>
                        current.role === 'aluno'
                          ? {
                              ...current,
                              classAssignment: {
                                ...current.classAssignment,
                                periodo: event.target.value
                              }
                            }
                          : current
                      )
                    }
                    required
                  />
                  <Input
                    label="Cor"
                    type="color"
                    value={currentClassDraft?.cor ?? '#7dd3fc'}
                    onChange={(event) =>
                      setForm((current) =>
                        current.role === 'aluno'
                          ? {
                              ...current,
                              classAssignment: {
                                ...current.classAssignment,
                                cor: event.target.value
                              }
                            }
                          : current
                      )
                    }
                  />
                </div>
                <TextArea
                  label="Descricao"
                  value={currentClassDraft?.descricao ?? ''}
                  onChange={(event) =>
                    setForm((current) =>
                      current.role === 'aluno'
                        ? {
                            ...current,
                            classAssignment: {
                              ...current.classAssignment,
                              descricao: event.target.value
                            }
                          }
                        : current
                    )
                  }
                />
                {!!professors.length && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {professors.map((professor) => (
                      <Badge key={professor.id} tone="info">
                        <GraduationCap size={14} /> {professor.displayName}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          <Button type="submit" disabled={saving || !(canSaveProfessor || canSaveStudent)}>
            <UserSquare2 size={18} /> {saving ? 'Criando acesso...' : 'Criar usuario'}
          </Button>
        </form>
      </Modal>

      <Modal open={editProfessorModalOpen} onClose={() => setEditProfessorModalOpen(false)} title="Editar professor">
        <form onSubmit={handleProfessorUpdate} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <Input
            label="Nome do professor"
            value={editingProfessorName}
            onChange={(event) => setEditingProfessorName(event.target.value)}
            required
          />
          <Input label="Email da conta" value={editingProfessor?.email ?? ''} readOnly />
          <p style={{ margin: 0, color: '#94a3b8' }}>
            As materias do professor sao organizadas separadamente na tela `Materias`, sempre com professor e turma definidos.
          </p>
          <Button type="submit" disabled={editingProfessorSaving || !editingProfessorName.trim()}>
            <Pencil size={18} /> {editingProfessorSaving ? 'Salvando professor...' : 'Salvar professor'}
          </Button>
        </form>
      </Modal>
    </>
  );
}
