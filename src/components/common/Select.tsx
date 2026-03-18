import type { SelectHTMLAttributes } from 'react';

interface Option {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
}

export function Select({ label, options, style, ...props }: SelectProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: 0 }}>
      <span style={{ color: '#cbd5e1', fontSize: '0.92rem' }}>{label}</span>
      <select
        {...props}
        style={{
          width: '100%',
          padding: '0.9rem 1rem',
          borderRadius: 18,
          border: '1px solid rgba(148, 163, 184, 0.14)',
          background: 'rgba(15, 23, 42, 0.5)',
          color: '#e2e8f0',
          ...style
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
