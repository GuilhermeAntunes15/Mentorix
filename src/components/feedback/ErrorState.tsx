import { Button } from '@/components/common/Button';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: 24,
        padding: '1.5rem',
        border: '1px solid rgba(251, 113, 133, 0.24)',
        color: '#fecdd3',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}
    >
      <span
        style={{
          minWidth: 0,
          flex: '1 1 280px',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
          whiteSpace: 'normal'
        }}
      >
        {message}
      </span>
      {onRetry && (
        <Button variant="danger" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
