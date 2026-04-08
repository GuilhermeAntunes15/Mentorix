import type { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function TextArea({ label, style, ...props }: TextAreaProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minWidth: 0 }}>
      <span style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>{label}</span>
      <textarea
        {...props}
        style={{
          width: '100%',
          padding: '0.9rem',
          minHeight: '128px',
          borderRadius: 14,
          border: '1px solid rgba(148, 163, 184, 0.18)',
          background: 'rgba(15, 23, 42, 0.72)',
          color: '#e2e8f0',
          resize: 'vertical',
          ...style
        }}
      />
    </label>
  );
}
