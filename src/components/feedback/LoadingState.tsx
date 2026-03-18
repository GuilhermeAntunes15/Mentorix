export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="glass-panel loading-state">
      <div className="loading-state-spinner" aria-hidden="true" />
      <div style={{ display: 'grid', gap: '0.35rem' }}>
        <strong style={{ color: '#e2e8f0' }}>Carregando dados</strong>
        <span style={{ color: '#94a3b8' }}>{label}</span>
      </div>
    </div>
  );
}
