export const theme = {
  colors: {
    bg: '#07111f',
    bgSoft: '#0b1020',
    surface: 'rgba(11, 16, 32, 0.62)',
    surfaceStrong: 'rgba(12, 22, 41, 0.82)',
    line: 'rgba(148, 163, 184, 0.16)',
    text: '#e2e8f0',
    textMuted: '#94a3b8',
    accent: '#7dd3fc',
    accentStrong: '#22d3ee',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#fb7185',
    info: '#60a5fa'
  },
  radii: {
    sm: '14px',
    md: '20px',
    lg: '28px',
    pill: '999px'
  },
  shadows: {
    glass: '0 18px 80px rgba(8, 15, 31, 0.28)'
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  }
} as const;
