"use client";

import { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface GlowingShadowProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
}

function GlowingShadow({ children, className, contentClassName, style }: GlowingShadowProps) {
  return (
    <>
      <style jsx>{`
        @property --hue { syntax: "<number>"; inherits: true; initial-value: 0; }
        @property --rotate { syntax: "<number>"; inherits: true; initial-value: 0; }
        @property --bg-y { syntax: "<number>"; inherits: true; initial-value: 0; }
        @property --bg-x { syntax: "<number>"; inherits: true; initial-value: 0; }
        @property --glow-translate-y { syntax: "<number>"; inherits: true; initial-value: 0; }
        @property --bg-size { syntax: "<number>"; inherits: true; initial-value: 1; }
        @property --glow-opacity { syntax: "<number>"; inherits: true; initial-value: 0.22; }
        @property --glow-blur { syntax: "<number>"; inherits: true; initial-value: 1; }
        @property --glow-scale { syntax: "<number>"; inherits: true; initial-value: 0.6; }
        @property --glow-radius { syntax: "<number>"; inherits: true; initial-value: 40; }
        @property --white-shadow { syntax: "<number>"; inherits: true; initial-value: 0; }

        .glow-container {
          --card-radius: 16px;
          --border-width: 3px;
          --hue: 0;
          --hue-speed: 1;
          --rotate: 0;
          --animation-speed: 4s;
          --interaction-speed: 0.55s;
          --glow-rotate-unit: 1deg;
          --brand-glow: #F59E0B; /* Amber / carrot (site accent) */
          position: relative;
          display: block;
          width: 100%;
          border-radius: var(--card-radius);
          z-index: 0;
        }
        .glow-container:before,
        .glow-container:after { content: ""; position: absolute; inset: 0; border-radius: var(--card-radius); }

        .glow-content { position: relative; border-radius: calc(var(--card-radius) * 0.98); padding: 0; background: transparent; z-index: 2; }
        .glow-content:before {
          content: ""; position: absolute; inset: calc(-1 * var(--border-width)); border-radius: inherit; box-shadow: 0 0 20px black; mix-blend-mode: color-burn; z-index: -1;
          background: radial-gradient(
            30% 30% at calc(var(--bg-x) * 1%) calc(var(--bg-y) * 1%),
            rgba(245, 158, 11, 0.55) 0%,
            rgba(245, 158, 11, 0.35) calc(35% * var(--bg-size)),
            rgba(245, 158, 11, 0.20) calc(60% * var(--bg-size)),
            transparent 100%
          );
          animation: rotate-bg var(--animation-speed) linear infinite;
          transition: --bg-size var(--interaction-speed) ease;
        }

        .glow { --glow-translate-y: 0; position: absolute; width: 28px; height: 28px; animation: rotate var(--animation-speed) linear infinite; transform: rotateZ(calc(var(--rotate) * var(--glow-rotate-unit))); transform-origin: center; border-radius: calc(var(--glow-radius) * 1px); inset: -6px auto auto -6px; z-index: 1; }
        .glow:after {
          content: ""; position: relative; display: block; filter: blur(calc(var(--glow-blur) * 1px)); width: 110%; height: 110%; left: -5%; top: -5%;
          background: rgba(245, 158, 11, 0.65); border-radius: calc(var(--glow-radius) * 1px);
          transform: scaleY(calc(var(--glow-scale) / 1.3)) scaleX(calc(var(--glow-scale) * 0.8)) translateY(calc(var(--glow-translate-y) * 1%));
          opacity: var(--glow-opacity);
        }

        .glow-container:hover .glow-content:before { --bg-size: 4; animation-play-state: paused; }
        .glow-container:hover .glow { --glow-blur: 1.3; --glow-opacity: 0.28; --glow-scale: 0.9; --glow-radius: 0; --rotate: 900; --glow-rotate-unit: 0; animation-play-state: paused; }
        .glow-container:hover .glow:after { --glow-translate-y: 0; }

        @keyframes rotate-bg {
          0% { --bg-x: 0; --bg-y: 0; }
          25% { --bg-x: 100; --bg-y: 0; }
          50% { --bg-x: 100; --bg-y: 100; }
          75% { --bg-x: 0; --bg-y: 100; }
          100% { --bg-x: 0; --bg-y: 0; }
        }
        @keyframes rotate { from { --rotate: -70; --glow-translate-y: -65; } 50% { --glow-translate-y: -65; } to { --rotate: calc(360 - 70); --glow-translate-y: -65; } }
        /* hue-animation removed; fixed brand color used */
      `}</style>

      <div className={cn("glow-container", className)} style={style}>
        <span className="glow" />
        <div className={cn("glow-content", contentClassName)}>{children}</div>
      </div>
    </>
  );
}

export default GlowingShadow;


