import { Layers3, Newspaper, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { classesRepository, usersRepository } from '@/services/repositories';
import type { UserEntity } from '@/types';

export function AdminDashboardScreen() {
  const [users, setUsers] = useState<UserEntity[]>([]);
  const [sharedClassesCount, setSharedClassesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [usersList, sharedClasses] = await Promise.all([
          usersRepository.listAll(),
          classesRepository.listSharedDrafts()
        ]);
        setUsers(usersList);
        setSharedClassesCount(sharedClasses.length);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Nao foi possivel carregar o painel administrativo.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const summary = useMemo(() => {
    const admins = users.filter((user) => user.role === 'admin').length;
    const professors = users.filter((user) => user.role === 'professor').length;
    const students = users.filter((user) => user.role === 'aluno').length;

    return {
      admins,
      professors,
      students
    };
  }, [users]);

  return (
    <>
      <PageHeader
        eyebrow="Administracao central"
        title="Painel do administrador"
        description="Acompanhe a estrutura do sistema e entre nas areas principais para gerenciar usuarios, materias e comunicados."
      />

      {loading && <LoadingState label="Carregando dashboard administrativo..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <>
          <div className="responsive-grid">
            <StatCard label="Admins" value={summary.admins} helper="Contas com controle total" />
            <StatCard label="Professores" value={summary.professors} helper="Contas docentes ativas" />
            <StatCard label="Alunos" value={summary.students} helper="Acessos vinculados" />
            <StatCard label="Turmas compartilhadas" value={sharedClassesCount} helper="Base sincronizada do admin" />
          </div>

          <section className="responsive-grid" style={{ alignItems: 'stretch' }}>
            <Card title="Usuarios" subtitle="Crie e ajuste acessos de professores e alunos.">
              <p style={{ margin: 0, color: '#94a3b8' }}>
                Gerencie contas, redefina a organizacao de acessos e revise o cadastro geral do sistema.
              </p>
              <Link
                to="/usuarios"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: 999,
                  padding: '0.85rem 1.1rem',
                  minHeight: 48,
                  fontWeight: 700,
                  color: '#e2e8f0',
                  background: 'rgba(15, 23, 42, 0.72)',
                  border: '1px solid rgba(148, 163, 184, 0.18)'
                }}
              >
                <UsersRound size={18} /> Abrir usuarios
              </Link>
            </Card>

            <Card title="Materias" subtitle="Organize as materias por professor e turma.">
              <p style={{ margin: 0, color: '#94a3b8' }}>
                Esta area e exclusiva do admin e controla a distribuicao correta das materias na grade.
              </p>
              <Link
                to="/materias"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: 999,
                  padding: '0.85rem 1.1rem',
                  minHeight: 48,
                  fontWeight: 700,
                  color: '#e2e8f0',
                  background: 'rgba(15, 23, 42, 0.72)',
                  border: '1px solid rgba(148, 163, 184, 0.18)'
                }}
              >
                <Layers3 size={18} /> Abrir materias
              </Link>
            </Card>

            <Card title="Mural" subtitle="Publique comunicados gerais e avisos direcionados.">
              <p style={{ margin: 0, color: '#94a3b8' }}>
                Envie avisos importantes para professores e turmas sem sair do fluxo administrativo.
              </p>
              <Link
                to="/mural"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: 999,
                  padding: '0.85rem 1.1rem',
                  minHeight: 48,
                  fontWeight: 700,
                  color: '#e2e8f0',
                  background: 'rgba(15, 23, 42, 0.72)',
                  border: '1px solid rgba(148, 163, 184, 0.18)'
                }}
              >
                <Newspaper size={18} /> Abrir mural
              </Link>
            </Card>
          </section>
        </>
      )}
    </>
  );
}
