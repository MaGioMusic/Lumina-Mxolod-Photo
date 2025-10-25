"use client";

import { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface GlowingShadowProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
}

export function GlowingShadow({ children, className, contentClassName, style }: GlowingShadowProps) {
  return (
    <>
      <style jsx>{`
        @property --hue { syntax: "<number>"; inherits: true; initial-value: 0; }
        @property --rotate { syntax: "<number>"; inherits: true; initial-value: 0; }
        @property --bg-y { syntax: "<number>"; inherits: true; initial-value: 0; }
        @property --bg-x { syntax: "<number>"; inherits: true; initial-value: 0; }
        @property --glow-translate-y { syntax: "<number>"; inherits: true; initial-value: 0; }
        @property --bg-size { syntax: "<number>"; inherits: true; initial-value: 1; }
        @property --glow-opacity { syntax: "<number>"; inherits: true; initial-value: 1; }
        @property --glow-blur { syntax: "<number>"; inherits: true; initial-value: 6; }
        @property --glow-scale { syntax: "<number>"; inherits: true; initial-value: 1.5; }
        @property --glow-radius { syntax: "<number>"; inherits: true; initial-value: 100; }
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
          background: hsl(0deg 0% 16%) radial-gradient(
            30% 30% at calc(var(--bg-x) * 1%) calc(var(--bg-y) * 1%),
            hsl(calc(var(--hue) * var(--hue-speed) * 1deg) 100% 90%) calc(0% * var(--bg-size)),
            hsl(calc(var(--hue) * var(--hue-speed) * 1deg) 100% 80%) calc(20% * var(--bg-size)),
            hsl(calc(var(--hue) * var(--hue-speed) * 1deg) 100% 60%) calc(40% * var(--bg-size)),
            transparent 100%
          );
          animation: hue-animation var(--animation-speed) linear infinite, rotate-bg var(--animation-speed) linear infinite;
          transition: --bg-size var(--interaction-speed) ease;
        }

        .glow { --glow-translate-y: 0; position: absolute; width: 80px; height: 80px; animation: rotate var(--animation-speed) linear infinite; transform: rotateZ(calc(var(--rotate) * var(--glow-rotate-unit))); transform-origin: center; border-radius: calc(var(--glow-radius) * 1px); inset: -20px auto auto -20px; z-index: 1; }
        .glow:after {
          content: ""; position: relative; display: block; filter: blur(calc(var(--glow-blur) * 1px)); width: 130%; height: 130%; left: -15%; top: -15%;
          background: hsl(calc(var(--hue) * var(--hue-speed) * 1deg) 100% 60%); border-radius: calc(var(--glow-radius) * 1px);
          animation: hue-animation var(--animation-speed) linear infinite;
          transform: scaleY(calc(var(--glow-scale) / 1.1)) scaleX(calc(var(--glow-scale) * 1.2)) translateY(calc(var(--glow-translate-y) * 1%));
          opacity: var(--glow-opacity);
        }

        .glow-container:hover .glow-content:before { --bg-size: 15; animation-play-state: paused; }
        .glow-container:hover .glow { --glow-blur: 1.5; --glow-opacity: 0.6; --glow-scale: 2.5; --glow-radius: 0; --rotate: 900; --glow-rotate-unit: 0; animation-play-state: paused; }
        .glow-container:hover .glow:after { --glow-translate-y: 0; }

        @keyframes rotate-bg {
          0% { --bg-x: 0; --bg-y: 0; }
          25% { --bg-x: 100; --bg-y: 0; }
          50% { --bg-x: 100; --bg-y: 100; }
          75% { --bg-x: 0; --bg-y: 100; }
          100% { --bg-x: 0; --bg-y: 0; }
        }
        @keyframes rotate { from { --rotate: -70; --glow-translate-y: -65; } 50% { --glow-translate-y: -65; } to { --rotate: calc(360 - 70); --glow-translate-y: -65; } }
        @keyframes hue-animation { 0% { --hue: 0; } 100% { --hue: 360; } }
      `}</style>

      <div className={cn("glow-container", className)} style={style}>
        <span className="glow" />
        <div className={cn("glow-content", contentClassName)}>{children}</div>
      </div>
    </>
  );
}

export default GlowingShadow;


