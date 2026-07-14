import { Check } from 'lucide-react';
import React from 'react';

interface CustomCheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string | React.ReactNode;
}

export default function CustomCheckbox({ id, checked, onChange, label }: CustomCheckboxProps) {
  return (
    <div 
      style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
      onClick={() => onChange(!checked)}
    >
      <div 
        style={{
          width: 18,
          height: 18,
          borderRadius: 3,
          border: checked ? '2px solid var(--color-border)' : '1px solid var(--color-border)',
          background: checked ? 'var(--color-text-primary)' : 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.1s ease-in-out'
        }}
      >
        {checked && <Check size={14} style={{ color: 'var(--color-bg-primary)', strokeWidth: 4 }} />}
      </div>
      {label && (
        <label id={id} style={{ fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
          {label}
        </label>
      )}
    </div>
  );
}
