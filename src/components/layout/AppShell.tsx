import { CalendarDays, FileText, GraduationCap, LayoutDashboard, Menu, Newspaper, Repeat2, Trophy, UserCircle2, UserSquare2, UsersRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigation } from 'react-router-dom';
import { AppLoadingScreen } from '@/components/feedback/AppLoadingScreen';
import { Button } from '@/components/common/Button';
import { useSession } from '@/hooks';

function BrandGlyph() {
  return (
    <svg className="app-brand-glyph" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="46" height="46" rx="15" fill="rgba(255, 255, 255, 0.02)" stroke="var(--line-strong)" />
      <circle cx="24" cy="24" r="13" fill="none" stroke="var(--brand-secondary)" strokeWidth="6" />
      <rect x="21" y="9" width="6" height="30" rx="3" fill="rgba(8, 12, 20, 0.9)" transform="rotate(28 24 24)" />
      <circle cx="29" cy="15" r="3" fill="var(--brand-primary)" />
    </svg>
  );
}

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
          { label: 'Materias', to: '/materias', icon: FileText },
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
            { label: 'Alunos', to: '/alunos', icon: GraduationCap },
            { label: 'Competicao', to: '/competicao', icon: Trophy },
            { label: 'Avaliacoes', to: '/avaliacoes', icon: UserSquare2 },
            { label: 'ATAs', to: '/atas', icon: FileText },
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
          <div className="app-brand-block">
            <BrandGlyph />
            <div>
              <span className="app-brand-wordmark">MENTORIX</span>
              <span className="app-mode-badge">WPA</span>
            </div>
          </div>
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
                background: isActive ? 'var(--nav-active-bg)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'var(--nav-active-border)' : 'transparent'}`
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
              <div className="app-brand-block app-brand-block-compact">
                <BrandGlyph />
                <div>
                  <div className="app-brand-wordmark app-brand-wordmark-compact">MENTORIX</div>
                  <span className="app-mode-badge">WPA</span>
                </div>
              </div>
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
                  background: isActive ? 'var(--mobile-nav-active-bg)' : 'var(--mobile-nav-bg)',
                  color: 'var(--text-primary)',
                  border: `1px solid ${isActive ? 'var(--mobile-nav-active-border)' : 'var(--mobile-nav-border)'}`
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
