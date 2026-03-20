export const theme = {
  colors: {
    bg: '#060912',
    bgSoft: '#0b1220',
    surface: 'rgba(10, 16, 30, 0.66)',
    surfaceStrong: 'rgba(12, 20, 36, 0.84)',
    line: 'rgba(173, 188, 213, 0.14)',
    text: '#edf2ff',
    textMuted: '#a0aec8',
    accent: '#63f2de',
    accentStrong: '#ffd174',
    success: '#4ade80',
    warning: '#fbbf24',
    danger: '#fb7185',
    info: '#38bdf8'
  },
  radii: {
    sm: '14px',
    md: '20px',
    lg: '28px',
    pill: '999px'
  },
  shadows: {
    glass: '0 18px 80px rgba(2, 8, 20, 0.42)'
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  }
} as const;
