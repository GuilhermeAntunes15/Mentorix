import { Heart, Plus } from 'lucide-react';
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
import { useCollectionResource, useSession } from '@/hooks';
import {
  classesRepository,
  noticeBoardRepository,
  noticeLikesRepository,
  studentClassRepository,
  usersRepository
} from '@/services/repositories';
import type { AvisoMuralEntity, CurtidaAvisoMuralEntity, NoticeAudience, NoticeType, UserEntity } from '@/types';

const initialForm = {
  tipo: 'aviso' as NoticeType,
  audiencia: 'todas_turmas' as NoticeAudience,
  targetProfessorId: '',
  turmaId: '',
  titulo: '',
  mensagem: ''
};

export function NoticeBoardScreen() {
  const { session } = useSession();
  const classes = useCollectionResource(session?.professorId ?? '', classesRepository);
  const relations = useCollectionResource(session?.professorId ?? '', studentClassRepository);
  const [notices, setNotices] = useState<AvisoMuralEntity[]>([]);
  const [likes, setLikes] = useState<CurtidaAvisoMuralEntity[]>([]);
  const [allUsers, setAllUsers] = useState<UserEntity[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [adminClasses, setAdminClasses] = useState<Array<{ id: string; nome: string }>>([]);

  async function reloadBoard() {
    if (!session) {
      return;
    }

    setLoading(true);
    try {
      if (session.role === 'admin') {
        const [allNotices, allLikes] = await Promise.all([
          noticeBoardRepository.listAll(),
          noticeLikesRepository.listAll()
        ]);
        setNotices(allNotices);
        setLikes(allLikes);
      } else {
        const [ownedNotices, ownedLikes] = await Promise.all([
          noticeBoardRepository.listByProfessor(session.professorId),
          noticeLikesRepository.listByProfessor(session.professorId)
        ]);
        setNotices(ownedNotices);
        setLikes(ownedLikes);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reloadBoard();
  }, [session?.authUid, session?.professorId, session?.role]);

  useEffect(() => {
    if (session?.role !== 'admin') {
      return;
    }

    async function loadUsers() {
      setLoadingUsers(true);
      try {
        setAllUsers(await usersRepository.listAll());
      } finally {
        setLoadingUsers(false);
      }
    }

    void loadUsers();
  }, [session?.role]);

  useEffect(() => {
    async function loadAdminClasses() {
      if (session?.role !== 'admin' || !form.targetProfessorId) {
        setAdminClasses([]);
        return;
      }

      const items = await classesRepository.listOrdered(form.targetProfessorId);
      setAdminClasses(items.map((item) => ({ id: item.id, nome: item.nome })));
    }

    void loadAdminClasses();
  }, [form.targetProfessorId, session?.role]);

  const classIdsForStudent = useMemo(
    () =>
      relations.items
        .filter((relation) => relation.alunoId === session?.alunoId && relation.ativo)
        .map((relation) => relation.turmaId),
    [relations.items, session?.alunoId]
  );
  const scopedNotices = useMemo(() => {
    if (!session) {
      return [];
    }

    return notices
      .filter((notice) => {
        if (session.role === 'admin') {
          return true;
        }

        if (session.role === 'professor') {
          if (notice.audiencia === 'professor') {
            return notice.targetProfessorId === session.authUid;
          }

          return notice.professorId === session.professorId;
        }

        if (notice.audiencia === 'professor') {
          return false;
        }

        if (notice.audiencia === 'todas_turmas') {
          return notice.professorId === session.professorId;
        }

        return notice.professorId === session.professorId && classIdsForStudent.includes(notice.turmaId ?? '');
      })
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }, [classIdsForStudent, notices, session]);
  const professorOptions = useMemo(
    () => allUsers.filter((item) => item.role === 'professor').map((item) => ({ value: item.authUid, label: item.displayName })),
    [allUsers]
  );
  const noticeClassOptions = session?.role === 'admin' ? adminClasses : classes.items.map((item) => ({ id: item.id, nome: item.nome }));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) {
      return;
    }

    try {
      setError(null);
      const professorOwnerId = session.role === 'admin'
        ? form.targetProfessorId
        : session.professorId;

      await noticeBoardRepository.create(professorOwnerId, {
        criadoPorUserId: session.authUid,
        criadoPorNome: session.username,
        criadoPorRole: session.role,
        tipo: form.tipo,
        audiencia: form.audiencia,
        targetProfessorId:
          form.audiencia === 'professor'
            ? form.targetProfessorId
            : session.role === 'professor'
              ? session.authUid
              : form.targetProfessorId,
        turmaId: form.audiencia === 'turma' ? form.turmaId : '',
        titulo: form.titulo,
        mensagem: form.mensagem
      });

      setOpen(false);
      setForm(initialForm);
      await reloadBoard();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel publicar o aviso.');
    }
  }

  async function toggleLike(notice: AvisoMuralEntity) {
    if (!session) {
      return;
    }

    const currentLike = likes.find((like) => like.avisoId === notice.id && like.userId === session.authUid);
    if (currentLike) {
      await noticeLikesRepository.remove(currentLike.id);
      await reloadBoard();
      return;
    }

    await noticeLikesRepository.create(notice.professorId, {
      avisoId: notice.id,
      userId: session.authUid,
      username: session.username
    });
    await reloadBoard();
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <PageHeader
        eyebrow="Mural de avisos"
        title="Comunicados da turma e da equipe"
        description="Professores e administradores publicam avisos; alunos acompanham e curtem de forma visivel para todos."
        actions={session.role !== 'aluno' ? <Button onClick={() => setOpen(true)}><Plus size={18} /> Novo aviso</Button> : undefined}
      />

      {(classes.loading || loading || loadingUsers) && <LoadingState label="Carregando mural..." />}
      {(classes.error || error) && <ErrorState message={classes.error || error || 'Nao foi possivel carregar o mural.'} />}
      {!scopedNotices.length && !loading && (
        <EmptyState title="Nenhum aviso publicado" description="Quando houver um comunicado novo, ele aparecera aqui." />
      )}

      <section style={{ display: 'grid', gap: '1rem' }}>
        {scopedNotices.map((notice) => {
          const noticeLikes = likes.filter((like) => like.avisoId === notice.id);
          const liked = noticeLikes.some((like) => like.userId === session.authUid);
          const targetClass = noticeClassOptions.find((item) => item.id === notice.turmaId);
          return (
            <Card key={notice.id} title={notice.titulo} subtitle={`${notice.criadoPorNome} • ${new Date(notice.createdAt).toLocaleString('pt-BR')}`} actions={<Badge tone={notice.tipo === 'importante' ? 'danger' : notice.tipo === 'evento' ? 'warning' : 'info'}>{notice.tipo}</Badge>}>
              <p style={{ margin: 0, color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>{notice.mensagem}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Badge>{notice.audiencia === 'todas_turmas' ? 'Todas as turmas' : notice.audiencia === 'turma' ? targetClass?.nome ?? 'Turma' : 'Professor'}</Badge>
                {noticeLikes.map((like) => (
                  <Badge key={like.id} tone="info">{like.username}</Badge>
                ))}
              </div>
              <Button variant={liked ? 'secondary' : 'ghost'} onClick={() => void toggleLike(notice)}>
                <Heart size={18} /> {liked ? 'Curtido' : 'Curtir'} ({noticeLikes.length})
              </Button>
            </Card>
          );
        })}
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo aviso">
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          {session.role === 'admin' && (
            <Select
              label="Professor responsavel"
              value={form.targetProfessorId}
              onChange={(event) => setForm({ ...form, targetProfessorId: event.target.value })}
              options={[{ value: '', label: 'Selecione um professor' }, ...professorOptions]}
            />
          )}
          <Select
            label="Tipo"
            value={form.tipo}
            onChange={(event) => setForm({ ...form, tipo: event.target.value as NoticeType })}
            options={[
              { value: 'importante', label: 'Importante' },
              { value: 'aviso', label: 'Aviso' },
              { value: 'evento', label: 'Evento' }
            ]}
          />
          <Select
            label="Destino"
            value={form.audiencia}
            onChange={(event) => setForm({ ...form, audiencia: event.target.value as NoticeAudience, turmaId: '' })}
            options={[
              { value: 'todas_turmas', label: 'Todas as turmas' },
              { value: 'turma', label: 'Turma especifica' },
              ...(session.role === 'admin' ? [{ value: 'professor', label: 'Professor' }] : [])
            ]}
          />
          {form.audiencia === 'turma' && (
            <Select
              label="Turma"
              value={form.turmaId}
              onChange={(event) => setForm({ ...form, turmaId: event.target.value })}
              options={[{ value: '', label: 'Selecione uma turma' }, ...noticeClassOptions.map((item) => ({ value: item.id, label: item.nome }))]}
            />
          )}
          <Input label="Titulo" value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} required />
          <TextArea label="Mensagem" value={form.mensagem} onChange={(event) => setForm({ ...form, mensagem: event.target.value })} required />
          <Button type="submit">Publicar aviso</Button>
        </form>
      </Modal>
    </>
  );
}
