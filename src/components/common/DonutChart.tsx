import type { CSSProperties } from 'react';

interface DonutChartSegment {
  color: string;
  value: number;
  label: string;
}

function buildConicGradient(segments: DonutChartSegment[]) {
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0);

  if (!total) {
    return 'conic-gradient(rgba(148, 163, 184, 0.18) 0deg 360deg)';
  }

  let cursor = 0;
  const stops = segments.map((segment) => {
    const percentage = Math.max(0, segment.value) / total;
    const start = cursor;
    const end = cursor + percentage * 360;
    cursor = end;
    return `${segment.color} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${stops.join(', ')})`;
}

export function DonutChart({
  value,
  total,
  label,
  helper,
  segments,
  size = 168
}: {
  value: number | string;
  total?: string;
  label: string;
  helper?: string;
  segments: DonutChartSegment[];
  size?: number;
}) {
  const style = {
    '--donut-size': `${size}px`,
    '--donut-background': buildConicGradient(segments)
  } as CSSProperties;

  return (
    <div className="donut-chart-shell" style={style}>
      <div className="donut-chart-track">
        <div className="donut-chart-core">
          <strong>{value}</strong>
          {total && <span>{total}</span>}
        </div>
      </div>
      <div style={{ display: 'grid', gap: '0.25rem' }}>
        <strong>{label}</strong>
        {helper && <span style={{ color: '#94a3b8', fontSize: '0.92rem' }}>{helper}</span>}
      </div>
    </div>
  );
}
