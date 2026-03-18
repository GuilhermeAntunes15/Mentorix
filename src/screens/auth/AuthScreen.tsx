import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useSession } from '@/hooks';
import { getAuthErrorMessage } from '@/services/auth/authErrorMessages';

export function AuthScreen() {
  const { login } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);
      await login(loginForm.email, loginForm.password);
    } catch (cause) {
      setError(getAuthErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-shell">
        <section className="glass-panel auth-brand-panel">
          <span className="auth-brand-kicker">MENTORIX</span>
          <h1 className="auth-brand-title">Gestao escolar com foco, ritmo e clareza.</h1>
          <p className="auth-brand-copy">Calendario, desempenho e rotina em um unico ambiente.</p>
          <div className="auth-brand-orbs" aria-hidden="true">
            <span className="auth-brand-orb auth-brand-orb-primary" />
            <span className="auth-brand-orb auth-brand-orb-secondary" />
          </div>
        </section>

        <section className="glass-panel auth-login-panel">
          <div style={{ display: 'grid', gap: '0.45rem' }}>
            <span className="auth-login-kicker">Acesso</span>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>Entrar</h2>
            <p style={{ margin: 0, color: '#94a3b8' }}>Use sua conta cadastrada para continuar.</p>
          </div>

          <form onSubmit={handleLogin} className="auth-login-form">
            <Input
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
              required
            />
            <Input
              label="Senha"
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
              required
            />
            {error && <p className="auth-login-error">{error}</p>}
            <Button type="submit" disabled={loading} fullWidth>
              <LogIn size={18} /> {loading ? 'Entrando...' : 'Entrar no app'}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
