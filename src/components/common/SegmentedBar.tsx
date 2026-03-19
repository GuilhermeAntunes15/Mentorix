interface SegmentedBarSegment {
  color: string;
  value: number;
  label: string;
}

export function SegmentedBar({
  segments,
  helper
}: {
  segments: SegmentedBarSegment[];
  helper?: string;
}) {
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0);

  return (
    <div style={{ display: 'grid', gap: '0.9rem' }}>
      <div
        style={{
          display: 'flex',
          width: '100%',
          minHeight: 14,
          overflow: 'hidden',
          borderRadius: 999,
          background: 'rgba(15, 23, 42, 0.72)',
          border: '1px solid rgba(148, 163, 184, 0.1)'
        }}
      >
        {segments.map((segment) => {
          const width = total ? `${(Math.max(0, segment.value) / total) * 100}%` : '0%';
          return (
            <div
              key={segment.label}
              title={`${segment.label}: ${segment.value}`}
              style={{
                width,
                background: segment.color,
                transition: 'width 180ms ease'
              }}
            />
          );
        })}
      </div>

      <div style={{ display: 'grid', gap: '0.55rem' }}>
        {segments.map((segment) => (
          <div
            key={segment.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              alignItems: 'center',
              color: '#cbd5e1'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: segment.color
                }}
              />
              {segment.label}
            </span>
            <strong>{segment.value}</strong>
          </div>
        ))}
      </div>

      {helper && <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{helper}</span>}
    </div>
  );
}
