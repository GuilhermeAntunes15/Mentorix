import type { CSSProperties, HTMLAttributes, PropsWithChildren, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  style?: CSSProperties;
}

export function Card({ title, subtitle, actions, style, children, ...props }: PropsWithChildren<CardProps>) {
  return (
    <section
      {...props}
      className="glass-panel"
      style={{
        borderRadius: 28,
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        ...style
      }}
    >
      {(title || subtitle || actions) && (
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            alignItems: 'flex-start'
          }}
        >
          <div>
            {title && <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{title}</h3>}
            {subtitle && <p style={{ margin: '0.3rem 0 0', color: '#94a3b8' }}>{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
