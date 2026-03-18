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
        borderRadius: 30,
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ maxWidth: 760 }}>
        {eyebrow && (
          <span style={{ color: '#7dd3fc', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em' }}>
            {eyebrow}
          </span>
        )}
        <h1 style={{ margin: '0.35rem 0 0.65rem', fontSize: 'clamp(1.8rem, 4vw, 2.7rem)' }}>{title}</h1>
        <p style={{ margin: 0, color: '#94a3b8', maxWidth: 720 }}>{description}</p>
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}
