import type { PropsWithChildren, ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  fullScreen?: boolean;
  onClose: () => void;
}

export function Modal({
  open,
  title,
  subtitle,
  actions,
  fullScreen = false,
  onClose,
  children
}: PropsWithChildren<ModalProps>) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <section
        className={`glass-panel modal-panel${fullScreen ? ' modal-panel-fullscreen' : ''}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{title}</h2>
            {subtitle && <p style={{ margin: '0.45rem 0 0', color: '#94a3b8' }}>{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>{actions}</div>
        </header>
        <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
      </section>
    </div>
  );
}
