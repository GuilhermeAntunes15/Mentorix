export function StatCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <article
      className="glass-panel"
      style={{
        borderRadius: 24,
        padding: '1.1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem'
      }}
    >
      <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>{label}</span>
      <strong style={{ fontSize: '1.7rem' }}>{value}</strong>
      {helper && <span style={{ color: '#7dd3fc', fontSize: '0.82rem' }}>{helper}</span>}
    </article>
  );
}
