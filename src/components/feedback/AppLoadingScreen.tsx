export function AppLoadingScreen({ label = 'Carregando Mentorix...' }: { label?: string }) {
  return (
    <div className="app-loading-screen">
      <div className="glass-panel app-loading-card">
        <div className="app-loading-brand">MENTORIX</div>
        <div className="app-loading-spinner" aria-hidden="true" />
        <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 5vw, 2.4rem)' }}>Preparando seu painel</h1>
        <p style={{ margin: 0, color: '#94a3b8', textAlign: 'center', maxWidth: 420 }}>{label}</p>
      </div>
    </div>
  );
}
