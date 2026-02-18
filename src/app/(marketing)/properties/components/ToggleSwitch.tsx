'use client';

import React from 'react';
import { useThemeValue } from '@/contexts/ThemeContext';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label }) => {
  const theme = useThemeValue();

  // Enhanced color scheme
  const colors = {
    background: checked 
      ? '#f97316' // orange-500 when checked
      : (theme === 'dark' ? '#4b5563' : '#d1d5db'), // gray-600 : gray-300 when unchecked
    thumb: '#ffffff',
    shadow: theme === 'dark' 
      ? 'rgba(0, 0, 0, 0.4)' 
      : 'rgba(0, 0, 0, 0.2)',
    text: theme === 'dark' ? '#f9fafb' : '#374151'
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <label 
          htmlFor={id} 
          className="cursor-pointer"
          style={{
            display: 'block',
            width: '44px',
            height: '24px',
            backgroundColor: colors.background,
            borderRadius: '12px',
            position: 'relative',
            transition: 'all 0.3s ease',
            boxShadow: `inset 0 2px 4px ${colors.shadow}`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '2px',
              left: checked ? '22px' : '2px',
              width: '20px',
              height: '20px',
              backgroundColor: colors.thumb,
              borderRadius: '50%',
              transition: 'all 0.3s ease',
              boxShadow: `0 2px 4px ${colors.shadow}`,
              transform: checked ? 'translateX(0)' : 'translateX(0)',
            }}
          />
        </label>
      </div>
      <label 
        htmlFor={id} 
        className="text-sm cursor-pointer font-medium select-none"
        style={{ color: colors.text }}
      >
        {label}
      </label>
    </div>
  );
};

export default ToggleSwitch; 