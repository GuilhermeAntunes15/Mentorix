import type { PropsWithChildren } from 'react';

type BadgeTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

const tones: Record<BadgeTone, React.CSSProperties> = {
  info: { background: 'rgba(96, 165, 250, 0.16)', color: '#bfdbfe' },
  success: { background: 'rgba(52, 211, 153, 0.18)', color: '#bbf7d0' },
  warning: { background: 'rgba(251, 191, 36, 0.18)', color: '#fde68a' },
  danger: { background: 'rgba(251, 113, 133, 0.18)', color: '#fecdd3' },
  neutral: { background: 'rgba(148, 163, 184, 0.14)', color: '#cbd5e1' }
};

export function Badge({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: BadgeTone }>) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        borderRadius: 999,
        padding: '0.25rem 0.75rem',
        fontSize: '0.8rem',
        fontWeight: 700,
        ...tones[tone]
      }}
    >
      {children}
    </span>
  );
}
