import { LogOut, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
import { useProfessor, useSession, useStudentDetails } from '@/hooks';
import { getAuthErrorMessage } from '@/services/auth/authErrorMessages';
import { studentProfilesRepository } from '@/services/repositories';
import { avatarOptions, getAvatarOption } from '@/utils/avatars';
import { calculateAttendancePercentage, summarizeMakeups } from '@/utils/metrics';

export function ProfileScreen() {
  const { session, updateProfile, logout, changePassword } = useSession();
  const { professorId } = useProfessor();
  const { data, loading, error, metrics } = useStudentDetails(professorId, session?.alunoId);
  const [username, setUsername] = useState(session?.profile.username ?? '');
  const [avatarKey, setAvatarKey] = useState(session?.profile.avatarKey ?? avatarOptions[0].key);
  const [saving, setSaving] = useState(false);
  const [profileText, setProfileText] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    nextPassword: '',
    confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    setUsername(session?.profile.username ?? '');
    setAvatarKey(session?.profile.avatarKey ?? avatarOptions[0].key);
  }, [session?.profile.avatarKey, session?.profile.username]);

  useEffect(() => {
    setProfileText(data?.perfil?.perfilTexto ?? '');
  }, [data?.perfil?.perfilTexto]);

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

  async function handleSaveIdentity() {
    setSaving(true);
    try {
      await updateProfile({
        username,
        avatarKey,
        profileCompleted: true
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveProfileText() {
    if (!session?.alunoId) {
      return;
    }

    if (data?.perfil) {
      await studentProfilesRepository.update(data.perfil.id, { perfilTexto: profileText });
      return;
    }

    await studentProfilesRepository.create(professorId, {
      alunoId: session.alunoId,
      perfilTexto: profileText
    });
  }

  async function handleChangePassword() {
    if (!passwordForm.currentPassword || !passwordForm.nextPassword) {
      setPasswordError('Preencha a senha atual e a nova senha.');
      setPasswordSuccess(null);
      return;
    }

    if (passwordForm.nextPassword !== passwordForm.confirmPassword) {
      setPasswordError('A confirmacao da nova senha nao confere.');
      setPasswordSuccess(null);
      return;
    }

    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.nextPassword);
      setPasswordSuccess('Senha atualizada com sucesso.');
      setPasswordForm({
        currentPassword: '',
        nextPassword: '',
        confirmPassword: ''
      });
    } catch (cause) {
      setPasswordError(getAuthErrorMessage(cause));
    } finally {
      setPasswordSaving(false);
    }
  }

  const passwordCard = (
    <Card title="Senha de acesso" subtitle="Troque sua senha diretamente pelo app.">
      <div style={{ display: 'grid', gap: '1rem' }}>
        <Input
          label="Senha atual"
          type="password"
          value={passwordForm.currentPassword}
          onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
        />
        <Input
          label="Nova senha"
          type="password"
          value={passwordForm.nextPassword}
          onChange={(event) => setPasswordForm((current) => ({ ...current, nextPassword: event.target.value }))}
        />
        <Input
          label="Confirmar nova senha"
          type="password"
          value={passwordForm.confirmPassword}
          onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
        />
        {passwordError && <p style={{ margin: 0, color: '#fda4af' }}>{passwordError}</p>}
        {passwordSuccess && <p style={{ margin: 0, color: '#86efac' }}>{passwordSuccess}</p>}
        <Button onClick={() => void handleChangePassword()} disabled={passwordSaving}>
          <Save size={18} /> {passwordSaving ? 'Atualizando senha...' : 'Atualizar senha'}
        </Button>
      </div>
    </Card>
  );

  if (!session) {
    return null;
  }

  if (session.role !== 'aluno') {
    return (
      <>
        <PageHeader
          eyebrow="Perfil"
          title={session.displayName}
          description="Dados da conta e encerramento de sessao."
          actions={<Badge tone="info">{session.role}</Badge>}
        />

        <Card title="Conta atual" subtitle="Informacoes basicas da conta autenticada.">
          <div style={{ display: 'grid', gap: '0.65rem', color: '#cbd5e1' }}>
            <span>Nome: {session.displayName}</span>
            <span>Email: {session.profile.email}</span>
            <span>Usuario: {session.username}</span>
          </div>
          <Button variant="danger" onClick={() => void logout()}>
            <LogOut size={18} /> Sair
          </Button>
        </Card>

        {passwordCard}
      </>
    );
  }

  const avatar = getAvatarOption(avatarKey);

  return (
    <>
      <PageHeader
        eyebrow="Perfil do aluno"
        title={session.username}
        description="Escolha seu nome de usuario e avatar, depois acompanhe seus dados pessoais, entregas e desempenho."
        actions={<Badge tone="info">{avatar.emoji} {avatar.label}</Badge>}
      />

      <div className="responsive-grid" style={{ alignItems: 'start' }}>
        <Card title="Identidade do aluno" subtitle="Defina como seu nome e avatar aparecem no app.">
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="profile-avatar-preview">{avatar.emoji}</div>
            <label style={{ display: 'grid', gap: '0.5rem' }}>
              <span style={{ color: '#cbd5e1', fontSize: '0.92rem' }}>Nome de usuario</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                style={{
                  padding: '0.9rem 1rem',
                  borderRadius: 18,
                  border: '1px solid rgba(148, 163, 184, 0.14)',
                  background: 'rgba(15, 23, 42, 0.5)',
                  color: '#e2e8f0'
                }}
              />
            </label>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <span style={{ color: '#cbd5e1', fontSize: '0.92rem' }}>Escolha um avatar</span>
              <div className="avatar-grid">
                {avatarOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className={`avatar-option${avatarKey === option.key ? ' active' : ''}`}
                    onClick={() => setAvatarKey(option.key)}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{option.emoji}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button onClick={() => void handleSaveIdentity()} disabled={saving || !username.trim()}>
                <Save size={18} /> {saving ? 'Salvando...' : 'Salvar identidade'}
              </Button>
              <Button variant="danger" onClick={() => void logout()}>
                <LogOut size={18} /> Sair
              </Button>
            </div>
          </div>
        </Card>

        {loading && <LoadingState label="Carregando seu perfil academico..." />}
        {error && <ErrorState message={error} />}
        {!loading && !error && !data && (
          <EmptyState title="Perfil academico indisponivel" description="Seu usuario ainda nao foi vinculado a um cadastro de aluno." />
        )}
        {!loading && !error && data && (
          <Card title="Resumo pessoal" subtitle="Visao rapida do seu desempenho atual.">
            <div className="responsive-grid">
              <StatCard label="Quizzes feitos" value={metrics.totalQuizzesFeitos} />
              <StatCard label="Acertos de primeira" value={metrics.acertouDePrimeira} />
              <StatCard label="Media de quizzes" value={metrics.mediaQuizzesTurma} />
              <StatCard label="Media de atividades" value={metrics.mediaAtividades} />
            </div>
          </Card>
        )}

        {passwordCard}
      </div>

      {!loading && !error && data && (
        <>
          <div className="responsive-grid" style={{ alignItems: 'start' }}>
            <Card title="Seu perfil" subtitle="Texto livre para acompanhar seu desenvolvimento.">
              <TextArea label="Perfil" value={profileText} onChange={(event) => setProfileText(event.target.value)} />
              <Button onClick={() => void handleSaveProfileText()}>Salvar texto do perfil</Button>
            </Card>

            <Card title="Atividades e reposicoes" subtitle="Consolidado da sua trilha pessoal.">
              <div style={{ display: 'grid', gap: '0.55rem' }}>
                <span>Total esperado: {metrics.totalAtividadesEsperadas}</span>
                <span>Total entregue: {metrics.totalAtividadesEntregues}</span>
                <span>Total pendente: {metrics.totalAtividadesPendentes}</span>
                <span>Reposicoes passadas: {makeupSummary.passadas}</span>
                <span>Reposicoes pendentes: {makeupSummary.pendentes}</span>
                <span>Reposicoes entregues: {makeupSummary.entregues}</span>
              </div>
            </Card>
          </div>

          <Card title="Frequencia por materia" subtitle="Baseada nas chamadas registradas pelo professor.">
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {attendanceBySubject.map((item) => (
                <div key={item.materiaId} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', paddingBottom: '0.65rem', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                  <span>{item.nome}</span>
                  <Badge tone={item.percentual >= 75 ? 'success' : item.percentual >= 50 ? 'warning' : 'danger'}>
                    {item.percentual}%
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </>
  );
}
