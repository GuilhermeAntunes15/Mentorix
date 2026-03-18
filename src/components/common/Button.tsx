import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #7dd3fc 0%, #34d399 100%)',
    color: '#08111f'
  },
  secondary: {
    background: 'rgba(15, 23, 42, 0.72)',
    color: '#e2e8f0',
    border: '1px solid rgba(148, 163, 184, 0.18)'
  },
  ghost: {
    background: 'transparent',
    color: '#cbd5e1',
    border: '1px solid rgba(148, 163, 184, 0.14)'
  },
  danger: {
    background: 'rgba(251, 113, 133, 0.18)',
    color: '#fecdd3',
    border: '1px solid rgba(251, 113, 133, 0.28)'
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
        border: 'none',
        borderRadius: 999,
        padding: '0.85rem 1.1rem',
        fontWeight: 700,
        minHeight: 48,
        transition: 'transform 160ms ease, opacity 160ms ease',
        width: fullWidth ? '100%' : undefined,
        ...variantStyles[variant],
        ...style
      }}
    >
      {children}
    </button>
  );
}
