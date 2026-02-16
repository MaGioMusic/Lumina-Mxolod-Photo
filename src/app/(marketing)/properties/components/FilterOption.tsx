'use client';

import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CaretDown } from '@phosphor-icons/react';
import { AnimatePresence } from 'framer-motion';

// Base FilterOption Props
interface BaseFilterOptionProps {
  label: string;
  value?: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  className?: string;
}

// Checkbox Option
interface CheckboxOptionProps extends BaseFilterOptionProps {
  checked: boolean;
}

export const CheckboxOption: React.FC<CheckboxOptionProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <label className={`flex items-center space-x-2 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <motion.div
          className={`
            w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
            ${checked 
              ? 'bg-primary-400 border-primary-400' 
              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 group-hover:border-orange-400'
            }
          `}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence>
            {checked && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Check className="w-3 h-3 text-white" weight="bold" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 select-none">
        {label}
      </span>
    </label>
  );
};

// Range Slider Option
interface RangeSliderOptionProps extends BaseFilterOptionProps {
  min: number;
  max: number;
  step?: number;
  range: [number, number];
  formatValue?: (value: number) => string;
}

export const RangeSliderOption: React.FC<RangeSliderOptionProps> = ({
  label,
  min,
  max,
  step = 1,
  range,
  onChange,
  formatValue = (value) => value.toString(),
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const value = Math.round((min + percentage * (max - min)) / step) * step;

    if (isDragging === 'min') {
      onChange([Math.min(value, range[1]), range[1]]);
    } else {
      onChange([range[0], Math.max(value, range[0])]);
    }
  }, [isDragging, max, min, onChange, range, step]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [handleMouseMove, handleMouseUp, isDragging]);

  const minPercentage = ((range[0] - min) / (max - min)) * 100;
  const maxPercentage = ((range[1] - min) / (max - min)) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{formatValue(range[0])}</span>
          <span>—</span>
          <span>{formatValue(range[1])}</span>
        </div>
      </div>
      
      <div className="relative h-6 flex items-center px-2">
        <div 
          ref={sliderRef}
          className="absolute left-0 right-0 h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
        >
          {/* Active Track */}
          <div 
            className="absolute h-2 bg-primary-400 rounded-full"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          />
          
          {/* Min Thumb */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-primary-400 rounded-full cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
            style={{ left: `${minPercentage}%` }}
            onMouseDown={handleMouseDown('min')}
          />
          
          {/* Max Thumb */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-primary-400 rounded-full cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
            style={{ left: `${maxPercentage}%` }}
            onMouseDown={handleMouseDown('max')}
          />
        </div>
      </div>
    </div>
  );
};

// Select Option
interface SelectOptionProps extends BaseFilterOptionProps {
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const SelectOption: React.FC<SelectOptionProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "აირჩიეთ...",
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
            rounded-lg px-3 py-2 text-left text-sm
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-orange-400 focus:border-primary-400 focus:ring-1 focus:ring-primary-500'}
            transition-colors
          `}
        >
          <span className={selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
            {selectedOption?.label || placeholder}
          </span>
          <motion.div
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <CaretDown className="w-4 h-4" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// Toggle Option
interface ToggleOptionProps extends BaseFilterOptionProps {
  checked: boolean;
}

export const ToggleOption: React.FC<ToggleOptionProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${checked ? 'bg-primary-400' : 'bg-gray-200 dark:bg-gray-600'}
        `}
      >
        <motion.span
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"
          animate={{ x: checked ? 24 : 4 }}
          transition={{ duration: 0.2 }}
        />
      </button>
    </div>
  );
};

const FilterOptionComponents = {
  CheckboxOption,
  RangeSliderOption,
  SelectOption,
  ToggleOption
};

export default FilterOptionComponents;