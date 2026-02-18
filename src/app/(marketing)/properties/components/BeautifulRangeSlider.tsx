'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface BeautifulRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  label?: string;
  unit?: string;
  formatValue?: (value: number) => string;
}

const RANGE_SLIDER_COLORS = {
  track: 'var(--properties-range-track)',
  text: 'var(--properties-range-text)',
  textSecondary: 'var(--properties-range-text-secondary)',
  textLabel: 'var(--properties-range-text-label)',
  inputBg: 'var(--properties-range-input-bg)',
  inputBorder: 'var(--properties-range-input-border)',
  badge: 'var(--properties-range-badge-bg)',
  badgeText: 'var(--properties-range-badge-text)',
} as const;

const BeautifulRangeSlider: React.FC<BeautifulRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  unit = '',
  formatValue = (val) => val.toLocaleString(),
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const colors = RANGE_SLIDER_COLORS;

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const newValue = Math.round((percentage / 100) * (max - min) + min);

    if (isDragging === 'min') {
      onChange([Math.min(newValue, value[1] - step), value[1]]);
    } else {
      onChange([value[0], Math.max(newValue, value[0] + step)]);
    }
  }, [isDragging, max, min, onChange, step, value]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleInputChange = (type: 'min' | 'max', inputValue: string) => {
    const newValue = parseInt(inputValue) || 0;
    if (type === 'min') {
      onChange([Math.min(newValue, value[1] - step), value[1]]);
    } else {
      onChange([value[0], Math.max(newValue, value[0] + step)]);
    }
  };

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium" style={{ color: colors.text }}>{label}</label>
      )}
      
      {/* Slider */}
      <div className="relative">
        <div
          ref={sliderRef}
          className="relative h-2 rounded-full cursor-pointer"
          style={{ backgroundColor: colors.track }}
        >
          {/* Active Range */}
          <div
            className="absolute h-2 bg-gradient-to-r from-primary-400 to-sage-400 rounded-full transition-all duration-200"
            style={{
              left: `${getPercentage(value[0])}%`,
              width: `${getPercentage(value[1]) - getPercentage(value[0])}%`,
            }}
          />
          
          {/* Min Handle */}
          <div
            className={`absolute w-5 h-5 bg-white border-2 border-primary-400 rounded-full shadow-lg cursor-grab transform -translate-y-1.5 transition-all duration-200 hover:scale-110 ${
              isDragging === 'min' ? 'scale-110 shadow-xl border-orange-600' : ''
            }`}
            style={{ left: `${getPercentage(value[0])}%`, transform: 'translateX(-50%) translateY(-6px)' }}
            onMouseDown={handleMouseDown('min')}
          />
          
          {/* Max Handle */}
          <div
            className={`absolute w-5 h-5 bg-white border-2 border-primary-400 rounded-full shadow-lg cursor-grab transform -translate-y-1.5 transition-all duration-200 hover:scale-110 ${
              isDragging === 'max' ? 'scale-110 shadow-xl border-orange-600' : ''
            }`}
            style={{ left: `${getPercentage(value[1])}%`, transform: 'translateX(-50%) translateY(-6px)' }}
            onMouseDown={handleMouseDown('max')}
          />
        </div>
        
        {/* Value Labels */}
        <div className="flex justify-between mt-2 text-xs" style={{ color: colors.textSecondary }}>
          <span>{formatValue(min)}{unit}</span>
          <span>{formatValue(max)}{unit}</span>
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: colors.textLabel }}>
            Min {unit}
          </label>
          <div className="relative">
            <input
              type="number"
              value={value[0]}
              onChange={(e) => handleInputChange('min', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              style={{
                backgroundColor: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                color: colors.text
              }}
              min={min}
              max={value[1] - step}
              step={step}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-xs" style={{ color: colors.textSecondary }}>{unit}</span>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: colors.textLabel }}>
            Max {unit}
          </label>
          <div className="relative">
            <input
              type="number"
              value={value[1]}
              onChange={(e) => handleInputChange('max', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              style={{
                backgroundColor: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                color: colors.text
              }}
              min={value[0] + step}
              max={max}
              step={step}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-xs" style={{ color: colors.textSecondary }}>{unit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Range Display */}
      <div className="text-center">
        <span 
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: colors.badge,
            color: colors.badgeText
          }}
        >
          {formatValue(value[0])}{unit} - {formatValue(value[1])}{unit}
        </span>
      </div>
    </div>
  );
};

export default BeautifulRangeSlider; 