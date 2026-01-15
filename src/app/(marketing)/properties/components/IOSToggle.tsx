'use client';

interface IOSToggleProps {
  isGrid: boolean;
  onToggle: (view: 'grid' | 'map') => void;
}

export default function IOSToggle({ isGrid, onToggle }: IOSToggleProps) {
  const handleToggle = () => {
    onToggle(isGrid ? 'map' : 'grid');
  };

  return (
    <div className="fancy-switch-container">
      <style jsx>{`
        .fancy-switch {
          --_switch-bg-clr: #ff8c00;
          --_switch-padding: 3px;
          --_slider-bg-clr: rgba(255, 140, 0, 0.65);
          --_slider-bg-clr-on: rgba(255, 140, 0, 1);
          --_slider-txt-clr: #ffffff;
          --_label-padding: 0.25rem 0.5rem;
          --_switch-easing: cubic-bezier(0.47, 1.64, 0.41, 0.8);
          
          color: white;
          width: fit-content;
          display: flex;
          justify-content: center;
          position: relative;
          border-radius: 9999px;
          cursor: pointer;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          position: relative;
          isolation: isolate;
          min-width: 60px;
          height: 28px;
          font-size: 0.75rem;
        }

        .fancy-switch input[type="checkbox"] {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        .fancy-switch > span {
          display: grid;
          place-content: center;
          transition: opacity 300ms ease-in-out 150ms;
          padding: var(--_label-padding);
          z-index: 10;
        }

        .fancy-switch::before,
        .fancy-switch::after {
          content: "";
          position: absolute;
          border-radius: inherit;
          transition: inset 150ms ease-in-out;
        }

        /* switch slider */
        .fancy-switch::before {
          background-color: var(--_slider-bg-clr);
          inset: var(--_switch-padding) 50% var(--_switch-padding) var(--_switch-padding);
          transition: inset 500ms var(--_switch-easing), background-color 500ms ease-in-out;
          z-index: -1;
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.3), 0 1px rgba(255, 255, 255, 0.3);
        }

        /* switch bg color */
        .fancy-switch::after {
          background-color: var(--_switch-bg-clr);
          inset: 0;
          z-index: -2;
        }

        /* switch focus */
        .fancy-switch:focus-within::after {
          inset: -0.25rem;
        }

        /* switch hover effects */
        .fancy-switch:has(input:checked):hover > span:first-of-type,
        .fancy-switch:has(input:not(:checked)):hover > span:last-of-type {
          opacity: 1;
          transition-delay: 0ms;
          transition-duration: 100ms;
        }

        .fancy-switch:has(input:checked):hover::before {
          inset: var(--_switch-padding) var(--_switch-padding) var(--_switch-padding) 45%;
        }

        .fancy-switch:has(input:not(:checked)):hover::before {
          inset: var(--_switch-padding) 45% var(--_switch-padding) var(--_switch-padding);
        }

        /* checked - move slider to right */
        .fancy-switch:has(input:checked)::before {
          background-color: var(--_slider-bg-clr-on);
          inset: var(--_switch-padding) var(--_switch-padding) var(--_switch-padding) 50%;
        }

        /* opacity states */
        .fancy-switch > span:last-of-type,
        .fancy-switch > input:checked + span:first-of-type {
          opacity: 0.75;
        }

        .fancy-switch > input:checked ~ span:last-of-type {
          opacity: 1;
        }

        /* Dark mode adjustments */
        .dark .fancy-switch {
          --_switch-bg-clr: #ea580c;
          --_slider-bg-clr: rgba(234, 88, 12, 0.65);
          --_slider-bg-clr-on: rgba(234, 88, 12, 1);
        }
      `}</style>

      <label className="fancy-switch">
        <input 
          type="checkbox" 
          checked={!isGrid} 
          onChange={handleToggle}
          aria-label={isGrid ? 'Switch to map view' : 'Switch to grid view'}
        />
        <span>
          <svg 
            className="w-3 h-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </span>
        <span>
          <svg 
            className="w-3 h-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
        </span>
      </label>
    </div>
  );
} 