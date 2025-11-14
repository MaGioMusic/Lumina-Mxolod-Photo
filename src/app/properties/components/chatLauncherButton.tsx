import React, { type RefObject } from 'react';

interface ChatLauncherButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  buttonRef: RefObject<HTMLDivElement>;
}

export const ChatLauncherButton: React.FC<ChatLauncherButtonProps> = ({
  isOpen,
  onToggle,
  buttonRef,
}) => (
  <div className={`container-ai-input ${isOpen ? 'is-open' : ''}`}>
    {Array.from({ length: 15 }, (_, index) => (
      <div key={index} className="area" />
    ))}

    <div className="container-wrap" onClick={onToggle} ref={buttonRef}>
      <div className="card">
        <div className="background-blur-balls">
          <div className="balls">
            <div className="ball violet"></div>
            <div className="ball green"></div>
            <div className="ball rosa"></div>
            <div className="ball cyan"></div>
          </div>
        </div>

        <div className="content-card">
          <div className="background-blur-card"></div>
        </div>

        <div className="eyes">
          <div className="eye"></div>
          <div className="eye"></div>
        </div>

        <div className="eyes happy">
          <svg className="eye-arc" viewBox="0 0 24 12" fill="none" stroke="white" strokeWidth="2">
            <path d="M3 9 C7 3, 17 3, 21 9" strokeLinecap="round" />
          </svg>
          <svg className="eye-arc" viewBox="0 0 24 12" fill="none" stroke="white" strokeWidth="2">
            <path d="M3 9 C7 3, 17 3, 21 9" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  </div>
);


