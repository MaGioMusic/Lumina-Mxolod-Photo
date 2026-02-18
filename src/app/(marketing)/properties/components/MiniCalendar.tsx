'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { format, startOfToday, subDays, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeValue } from '@/contexts/ThemeContext';

interface MiniCalendarProps {
  selectedDateRange: [Date | null, Date | null];
  onDateRangeChange: (range: [Date | null, Date | null]) => void;
  className?: string;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selectedDateRange,
  onDateRangeChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const theme = useThemeValue(); // Dark mode detection

  const today = startOfToday();
  const [startDate, setStartDate] = useState<Date | null>(selectedDateRange[0]);
  const [endDate, setEndDate] = useState<Date | null>(selectedDateRange[1]);

  // Dark mode color schemes
  const getThemeColors = () => {
    if (theme === 'dark') {
      return {
        background: '#1f2937', // gray-800
        border: '#374151', // gray-700
        headerBg: '#111827', // gray-900
        text: '#f9fafb', // gray-50
        textSecondary: '#d1d5db', // gray-300
        buttonBg: '#374151', // gray-700
        buttonHover: '#4b5563', // gray-600
        calendarBg: '#111827', // gray-900
        calendarBorder: '#374151', // gray-700
        footerBg: '#1f2937', // gray-800
        iconBg: '#f97316', // orange-500
        closeButtonBg: '#374151', // gray-700
        closeButtonHover: '#4b5563', // gray-600
        shadow: '0 8px 20px rgba(0, 0, 0, 0.4), 0 3px 6px rgba(0, 0, 0, 0.2)'
      };
    } else {
      return {
        background: '#ffffff',
        border: '#e5e7eb',
        headerBg: '#fafafa',
        text: '#111827',
        textSecondary: '#6b7280',
        buttonBg: '#f9fafb',
        buttonHover: '#f97316',
        calendarBg: '#fafafa',
        calendarBorder: '#e5e7eb',
        footerBg: '#f9fafb',
        iconBg: '#f97316',
        closeButtonBg: '#f3f4f6',
        closeButtonHover: '#e5e7eb',
        shadow: '0 8px 20px rgba(0, 0, 0, 0.12), 0 3px 6px rgba(0, 0, 0, 0.04)'
      };
    }
  };

  const colors = getThemeColors();

  // Calculate popup position when opening
  const calculatePosition = () => {
    if (!inputRef.current) return;

    const inputRect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const popupHeight = 400;
    const popupWidth = 320;

    let top = inputRect.bottom + 8;
    let left = inputRect.left;

    // Check if popup would go below viewport
    if (top + popupHeight > viewportHeight) {
      top = inputRect.top - popupHeight - 8;
    }

    // Check if popup would go outside right side of viewport
    if (left + popupWidth > viewportWidth) {
      left = viewportWidth - popupWidth - 16;
    }

    // Check if popup would go outside left side of viewport
    if (left < 16) {
      left = 16;
    }

    setPosition({ top, left });
  };

  // Handle opening/closing
  const handleToggle = () => {
    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(!isOpen);
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [isOpen]);

  const getQuickFilterRange = (type: string): [Date, Date] => {
    const today = startOfToday();
    switch (type) {
      case 'today':
        return [today, today];
      case 'week':
        return [subDays(today, 7), today];
      case 'month':
        return [subMonths(today, 1), today];
      case '3months':
        return [subMonths(today, 3), today];
      default:
        return [today, today];
    }
  };

  const handleQuickFilter = (type: string) => {
    const range = getQuickFilterRange(type);
    setStartDate(range[0]);
    setEndDate(range[1]);
    onDateRangeChange(range);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setStartDate(null);
    setEndDate(null);
    onDateRangeChange([null, null]);
  };

  const formatDateRange = (start: Date | null, end: Date | null) => {
    if (!start && !end) return 'Select dates';
    if (start && !end) return format(start, 'MMM dd');
    if (start && end) {
      return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd')}`;
    }
    return 'Select dates';
  };

  // Simple Clean Popup - NO EFFECTS
  const FloatingCalendarPopup = () => (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Simple backdrop */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'transparent',
              zIndex: 9997,
            }}
            onClick={() => setIsOpen(false)}
          />

          {/* Simple Calendar Container */}
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              zIndex: 9999,
              width: '320px', // Increased from 260px
              backgroundColor: theme === 'dark' 
                ? 'rgba(31, 41, 55, 0.95)' // Glass effect dark
                : 'rgba(255, 255, 255, 0.95)', // Glass effect light
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)', 
              borderRadius: '12px',
              border: `1px solid ${theme === 'dark' 
                ? 'rgba(75, 85, 99, 0.3)' 
                : 'rgba(229, 231, 235, 0.3)'}`,
              boxShadow: theme === 'dark' 
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4)' 
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
              // Better font rendering
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            }}
          >
            {/* Header */}
            <div style={{ 
              padding: '16px', // Increased padding
              borderBottom: `1px solid ${theme === 'dark' 
                ? 'rgba(75, 85, 99, 0.3)' 
                : 'rgba(229, 231, 235, 0.3)'}`,
              backgroundColor: theme === 'dark' 
                ? 'rgba(17, 24, 39, 0.8)' // Glass effect header dark
                : 'rgba(250, 250, 250, 0.8)', // Glass effect header light
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: colors.iconBg,
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg style={{ width: '12px', height: '12px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: colors.text }}>Date Range</h3>
                    <p style={{ margin: '0', fontSize: '11px', color: colors.textSecondary }}>Choose dates</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: colors.closeButtonBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '5px',
                    color: colors.textSecondary,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.closeButtonHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.closeButtonBg;
                  }}
                >
                  <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '12px' }}>
              {/* Quick Filters */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <svg style={{ width: '12px', height: '12px', color: colors.textSecondary }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: colors.text }}>Quick Select</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                  {[
                    { key: 'today', label: 'Today' },
                    { key: 'week', label: '7 Days' },
                    { key: 'month', label: '1 Month' },
                    { key: '3months', label: '3 Months' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => handleQuickFilter(key)}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: colors.buttonBg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '5px',
                        color: colors.text,
                        fontSize: '11px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (theme === 'dark') {
                          e.currentTarget.style.backgroundColor = colors.buttonHover;
                          e.currentTarget.style.borderColor = colors.iconBg;
                        } else {
                          e.currentTarget.style.backgroundColor = colors.buttonHover;
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.borderColor = colors.buttonHover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.buttonBg;
                        e.currentTarget.style.color = colors.text;
                        e.currentTarget.style.borderColor = colors.border;
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar - COMPACT */}
              <div style={{
                backgroundColor: colors.calendarBg,
                border: `1px solid ${colors.calendarBorder}`,
                borderRadius: '6px',
                padding: '10px',
                marginBottom: '8px',
                width: '100%'
              }}>
                <style dangerouslySetInnerHTML={{
                  __html: `
                    /* Enhanced Calendar Layout - Fix Squished Numbers */
                    .calendar-container {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      -webkit-font-smoothing: antialiased;
                      -moz-osx-font-smoothing: grayscale;
                    }
                    
                    .calendar-container table {
                      width: 100% !important;
                      table-layout: fixed !important;
                      border-spacing: 2px !important;
                    }
                    
                    .calendar-container th,
                    .calendar-container td {
                      width: calc(100% / 7) !important;
                      text-align: center !important;
                      padding: 0 !important;
                      box-sizing: border-box !important;
                    }
                    
                    .calendar-container button {
                      width: 32px !important;
                      min-width: 32px !important;
                      height: 32px !important;
                      display: flex !important;
                      align-items: center !important;
                      justify-content: center !important;
                      margin: 0 auto !important;
                      font-size: 13px !important;
                      font-weight: 500 !important;
                      color: ${colors.text} !important;
                      border-radius: 6px !important;
                      border: none !important;
                      background: transparent !important;
                      cursor: pointer !important;
                      transition: all 0.2s ease !important;
                      line-height: 1 !important;
                    }
                    
                    .calendar-container button:hover {
                      background-color: ${theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(249, 115, 22, 0.1)'} !important;
                      transform: scale(1.05) !important;
                    }
                  `
                }} />
                <div className="calendar-container">
                  <DayPicker
                    mode="range"
                    numberOfMonths={1}
                    selected={startDate && endDate ? { from: startDate, to: endDate } : undefined}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setStartDate(range.from);
                        setEndDate(range.to);
                        onDateRangeChange([range.from, range.to]);
                        setIsOpen(false);
                      } else if (range?.from) {
                        setStartDate(range.from);
                        setEndDate(null);
                      }
                    }}
                    showOutsideDays={true}
                    fixedWeeks
                    disabled={[{ after: today }]}
                    modifiersStyles={{
                      today: {
                        backgroundColor: theme === 'dark' ? '#1e40af' : '#dbeafe',
                        color: theme === 'dark' ? '#ffffff' : '#1e40af',
                        fontWeight: '600',
                        borderRadius: '4px'
                      },
                      selected: {
                        backgroundColor: '#f97316',
                        color: 'white',
                        fontWeight: '600',
                        borderRadius: '4px'
                      },
                      range_start: {
                        backgroundColor: '#ea580c',
                        color: 'white',
                        fontWeight: '700',
                        borderRadius: '4px'
                      },
                      range_end: {
                        backgroundColor: '#ea580c',
                        color: 'white',
                        fontWeight: '700',
                        borderRadius: '4px'
                      },
                      range_middle: {
                        backgroundColor: theme === 'dark' ? '#fb923c' : '#fed7aa',
                        color: theme === 'dark' ? '#ffffff' : '#9a3412',
                        borderRadius: '4px'
                      }
                    }}
                    styles={{
                      root: { 
                        fontSize: '12px',
                        color: colors.text,
                        width: '100%',
                        fontFamily: 'system-ui, sans-serif'
                      },
                      month: { 
                        width: '100%'
                      },
                      caption: { 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '8px',
                        color: colors.text
                      },
                      caption_label: { 
                        fontSize: '13px',
                        fontWeight: '600',
                        color: colors.text
                      },
                      nav_button: {
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: theme === 'dark' ? colors.buttonBg : '#ffffff',
                        color: colors.text,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      },
                      table: { 
                        width: '100%',
                        tableLayout: 'fixed',
                        borderSpacing: '0'
                      },
                      head_row: {
                        width: '100%'
                      },
                      head_cell: { 
                        textAlign: 'center', 
                        fontSize: '10px',
                        fontWeight: '600', 
                        color: colors.textSecondary,
                        padding: '4px 2px',
                        textTransform: 'uppercase',
                        width: 'calc(100% / 7)'
                      },
                      row: {
                        width: '100%'
                      },
                      cell: { 
                        textAlign: 'center', 
                        padding: '2px',
                        width: 'calc(100% / 7)',
                        height: '30px',
                        verticalAlign: 'middle'
                      },
                      button: {
                        width: '100%',
                        height: '28px',
                        fontSize: '12px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: colors.text,
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '28px',
                        margin: '0 auto'
                      },
                      day_outside: {
                        color: theme === 'dark' ? '#6b7280' : '#d1d5db'
                      }
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              {(startDate || endDate) && (
                <div style={{
                  padding: '6px 8px',
                  backgroundColor: colors.footerBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '11px', fontWeight: '500', color: colors.text }}>
                    {formatDateRange(startDate, endDate)}
                  </span>
                  <button
                    onClick={clearSelection}
                    style={{
                      padding: '3px 6px',
                      fontSize: '10px',
                      backgroundColor: theme === 'dark' ? '#dc2626' : '#fee2e2',
                      border: `1px solid ${theme === 'dark' ? '#dc2626' : '#fecaca'}`,
                      borderRadius: '3px',
                      color: theme === 'dark' ? '#ffffff' : '#dc2626',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (theme === 'dark') {
                        e.currentTarget.style.backgroundColor = '#b91c1c';
                      } else {
                        e.currentTarget.style.backgroundColor = '#fca5a5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#dc2626' : '#fee2e2';
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Input Button - Dark Mode Compatible */}
      <div className={`relative ${className}`}>
        <button
          ref={inputRef}
          onClick={handleToggle}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
            borderRadius: '6px',
            color: theme === 'dark' ? '#f9fafb' : '#111827',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left',
            boxShadow: theme === 'dark' 
              ? '0 1px 3px rgba(0, 0, 0, 0.2)' 
              : '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            if (theme === 'dark') {
              e.currentTarget.style.backgroundColor = '#4b5563';
              e.currentTarget.style.borderColor = '#f97316';
            } else {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#f97316';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#ffffff';
            e.currentTarget.style.borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg 
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  color: theme === 'dark' ? '#d1d5db' : '#6b7280'
                }} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span style={{ 
                color: (!startDate && !endDate) 
                  ? (theme === 'dark' ? '#9ca3af' : '#6b7280') 
                  : (theme === 'dark' ? '#f9fafb' : '#111827'),
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {formatDateRange(startDate, endDate)}
              </span>
            </div>
            <svg 
              style={{ 
                width: '16px', 
                height: '16px', 
                color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'all 0.2s ease'
              }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Floating Popup */}
      {typeof window !== 'undefined' && createPortal(
        <FloatingCalendarPopup />,
        document.body
      )}
    </>
  );
};

export default MiniCalendar; 