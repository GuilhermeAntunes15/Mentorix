import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header
      className="glass-panel"
      style={{
        borderRadius: 22,
        padding: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ maxWidth: 760 }}>
        {eyebrow && (
          <span style={{ color: '#86efac', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {eyebrow}
          </span>
        )}
        <h1 style={{ margin: '0.35rem 0 0.5rem', fontSize: 'clamp(1.7rem, 4vw, 2.35rem)', lineHeight: 1.05 }}>{title}</h1>
        <p style={{ margin: 0, color: '#94a3b8', maxWidth: 720 }}>{description}</p>
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}
