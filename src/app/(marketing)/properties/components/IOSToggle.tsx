'use client';

import { useId } from 'react';
import { GridFour, MapTrifold } from '@phosphor-icons/react';

interface IOSToggleProps {
  isGrid: boolean;
  onToggle: (view: 'grid' | 'map') => void;
}

export default function IOSToggle({ isGrid, onToggle }: IOSToggleProps) {
  const inputId = useId();

  const handleToggle = () => {
    onToggle(isGrid ? 'map' : 'grid');
  };

  return (
    <div className="toggle-shell">
      <style jsx>{`
        .toggle-shell {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .toggle {
          position: relative;
          width: 86px;
          height: 28px;
          border-radius: 9999px;
          background: #e5e7eb;
          border: 1px solid #cbd5e1;
          overflow: hidden;
        }

        .toggle input {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 3;
          margin: 0;
        }

        .thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 40px;
          height: 22px;
          border-radius: 9999px;
          background: #e0743a;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.2);
          transition: transform 120ms linear, background-color 120ms linear;
          z-index: 1;
        }

        .toggle input:checked ~ .thumb {
          transform: translateX(42px);
          background: #e0743a;
        }

        .icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          color: #111827;
          transition: color 120ms linear;
          pointer-events: none;
        }

        .icon-left {
          left: 10px;
        }

        .icon-right {
          right: 10px;
          color: #6b7280;
        }

        .toggle input:checked ~ .icon-right {
          color: #f8fafc;
        }

        .toggle input:checked ~ .icon-left {
          color: #9ca3af;
        }

        .toggle input:checked + .track {
          background: #e5e7eb;
          border-color: #cbd5e1;
        }

        .track {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: #e5e7eb;
          border: 1px solid #cbd5e1;
          transition: background-color 120ms linear, border-color 120ms linear;
        }
      `}</style>

      <div className="toggle">
        <input
          id={inputId}
          type="checkbox"
          checked={!isGrid}
          onChange={handleToggle}
          aria-label={isGrid ? 'Switch to map view' : 'Switch to grid view'}
        />
        <div className="track" aria-hidden="true" />
        <div className="thumb" aria-hidden="true" />
        <span className="icon icon-left" aria-hidden="true">
          <GridFour size={14} weight="bold" />
        </span>
        <span className="icon icon-right" aria-hidden="true">
          <MapTrifold size={14} weight="bold" />
        </span>
      </div>
    </div>
  );
}
