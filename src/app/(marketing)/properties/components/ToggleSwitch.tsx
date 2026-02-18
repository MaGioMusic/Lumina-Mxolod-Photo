'use client';

import React from 'react';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

const TOGGLE_SWITCH_COLORS = {
  uncheckedBackground: 'var(--properties-toggle-bg-off)',
  thumb: '#ffffff',
  shadow: 'var(--properties-toggle-shadow)',
  text: 'var(--properties-toggle-text)',
} as const;

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label }) => {
  const colors = TOGGLE_SWITCH_COLORS;
  const backgroundColor = checked ? '#f97316' : colors.uncheckedBackground;

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
            backgroundColor,
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