import { CalendarDays, ClipboardCheck, GraduationCap, Layers3, LayoutDashboard, Menu, Newspaper, Repeat2, School2, Trophy, UserCircle2, UserSquare2, UsersRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigation } from 'react-router-dom';
import { AppLoadingScreen } from '@/components/feedback/AppLoadingScreen';
import { Button } from '@/components/common/Button';
import { useSession } from '@/hooks';

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigation = useNavigation();
  const { session, logout } = useSession();

  const navItems =
    session?.role === 'admin'
      ? [
          { label: 'Painel', to: '/', icon: LayoutDashboard },
          { label: 'Usuarios', to: '/usuarios', icon: UsersRound },
          { label: 'Materias', to: '/admin/materias', icon: Layers3 },
          { label: 'Mural', to: '/mural', icon: Newspaper },
          { label: 'Perfil', to: '/perfil', icon: UserCircle2 }
        ]
      : session?.role === 'aluno'
        ? [
            { label: 'Meu calendario', to: '/', icon: CalendarDays },
            { label: 'Competicao', to: '/competicao', icon: Trophy },
            { label: 'Mural', to: '/mural', icon: Newspaper },
            { label: 'Perfil', to: '/perfil', icon: UserCircle2 }
          ]
        : [
            { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
            { label: 'Calendario', to: '/', icon: CalendarDays },
            { label: 'Turmas', to: '/turmas', icon: School2 },
            { label: 'Alunos', to: '/alunos', icon: GraduationCap },
            { label: 'Materias', to: '/materias', icon: Layers3 },
            { label: 'Chamada rapida', to: '/chamada', icon: ClipboardCheck },
            { label: 'Competicao', to: '/competicao', icon: Trophy },
            { label: 'Avaliacoes', to: '/avaliacoes', icon: UserSquare2 },
            { label: 'Reposicoes', to: '/reposicoes', icon: Repeat2 },
            { label: 'Mural', to: '/mural', icon: Newspaper },
            { label: 'Perfil', to: '/perfil', icon: UserCircle2 }
          ];

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isNavigating = navigation.state !== 'idle';

  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <div
          className="glass-panel"
          style={{
            borderRadius: 30,
            padding: '1.2rem',
            marginBottom: '1rem'
          }}
        >
          <span style={{ color: '#7dd3fc', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.84rem' }}>
            MENTORIX
          </span>
          <h2 className="gradient-text" style={{ margin: '0.4rem 0 0' }}>
            {session?.role === 'admin' ? 'Painel administrativo' : session?.role === 'aluno' ? 'Painel do aluno' : 'Painel do professor'}
          </h2>
        </div>

        <nav style={{ display: 'grid', gap: '0.6rem' }}>
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderRadius: 20,
                padding: '0.95rem 1rem',
                background: isActive ? 'rgba(125, 211, 252, 0.12)' : 'transparent',
                color: isActive ? '#f8fafc' : '#94a3b8',
                border: `1px solid ${isActive ? 'rgba(125, 211, 252, 0.18)' : 'transparent'}`
              })}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <Button variant="ghost" onClick={() => void logout()} style={{ marginTop: '1rem', width: '100%' }}>
          Sair
        </Button>
      </aside>

      <main className="page-content">
        <Outlet />
      </main>

      <button
        type="button"
        className="mobile-fab-button"
        aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        onClick={() => setMobileMenuOpen((current) => !current)}
      >
        {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {mobileMenuOpen && <button type="button" className="mobile-nav-backdrop" aria-label="Fechar menu" onClick={() => setMobileMenuOpen(false)} />}

      <div className={`mobile-nav-panel${mobileMenuOpen ? ' open' : ''}`}>
        <div className="glass-panel" style={{ borderRadius: 28, padding: '1rem', display: 'grid', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ color: '#7dd3fc', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.8rem' }}>MENTORIX</div>
              <strong style={{ display: 'block', marginTop: '0.25rem' }}>Navegacao rapida</strong>
            </div>
            <Button variant="ghost" onClick={() => setMobileMenuOpen(false)}>Fechar</Button>
          </div>

          <nav className="mobile-nav-list">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className="mobile-nav-link"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  borderRadius: 18,
                  padding: '0.95rem 1rem',
                  background: isActive ? 'rgba(125, 211, 252, 0.14)' : 'rgba(15, 23, 42, 0.58)',
                  color: '#f8fafc',
                  border: `1px solid ${isActive ? 'rgba(125, 211, 252, 0.2)' : 'rgba(148, 163, 184, 0.12)'}`
                })}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <Button variant="ghost" onClick={() => void logout()}>
            Sair
          </Button>
        </div>
      </div>

      {isNavigating && <AppLoadingScreen label="Atualizando informacoes..." />}
    </div>
  );
}
