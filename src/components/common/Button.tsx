import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'rgba(34, 197, 94, 0.14)',
    color: '#bbf7d0',
    border: '1px solid rgba(34, 197, 94, 0.28)'
  },
  secondary: {
    background: 'rgba(15, 23, 42, 0.62)',
    color: '#e2e8f0',
    border: '1px solid rgba(148, 163, 184, 0.16)'
  },
  ghost: {
    background: 'transparent',
    color: '#cbd5e1',
    border: '1px solid rgba(148, 163, 184, 0.12)'
  },
  danger: {
    background: 'rgba(248, 113, 113, 0.12)',
    color: '#fecaca',
    border: '1px solid rgba(248, 113, 113, 0.24)'
  }
};

export function Button({
  children,
  style,
  variant = 'primary',
  fullWidth = false,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      {...props}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        borderRadius: 14,
        padding: '0.78rem 1rem',
        fontWeight: 650,
        minHeight: 44,
        transition: 'transform 160ms ease, opacity 160ms ease, background 160ms ease, border-color 160ms ease, color 160ms ease',
        width: fullWidth ? '100%' : undefined,
        backdropFilter: 'blur(12px)',
        ...variantStyles[variant],
        ...style
      }}
    >
      {children}
    </button>
  );
}
