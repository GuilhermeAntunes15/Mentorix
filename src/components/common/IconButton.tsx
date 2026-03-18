import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export function IconButton({ children, style, ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      {...props}
      style={{
        border: '1px solid rgba(148, 163, 184, 0.16)',
        background: 'rgba(15, 23, 42, 0.62)',
        color: '#e2e8f0',
        borderRadius: 999,
        padding: '0.8rem 1rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        ...style
      }}
    >
      {children}
    </button>
  );
}
