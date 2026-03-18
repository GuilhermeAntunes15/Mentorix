import { Button } from '@/components/common/Button';

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: 24,
        padding: '1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        alignItems: 'center'
      }}
    >
      <strong style={{ fontSize: '1.1rem' }}>{title}</strong>
      <p style={{ margin: 0, maxWidth: 480, color: '#94a3b8' }}>{description}</p>
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
