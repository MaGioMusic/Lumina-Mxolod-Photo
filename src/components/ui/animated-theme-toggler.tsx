"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";
import { useThemeToggle, useThemeValue } from "@/contexts/ThemeContext";

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
}

type ViewTransitionDocument = typeof document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
};

/**
 * Theme toggle with view-transition circle reveal animation.
 */
export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const theme = useThemeValue();
  const toggleTheme = useThemeToggle();
  const isDark = theme === "dark";
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const toggleThemeWithAnimation = React.useCallback(async () => {
    if (!buttonRef.current) return;

    const startViewTransition = (document as ViewTransitionDocument).startViewTransition;
    const applyToggle = () => {
      toggleTheme();
    };
    const applyToggleForViewTransition = () => {
      flushSync(() => {
        toggleTheme();
      });
    };

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isPropertiesRoute =
      typeof window !== "undefined" &&
      /^\/(?:ka\/|en\/|ru\/)?properties(?:\/|$|\?)/.test(window.location.pathname + window.location.search);

    // Properties grid is interaction-heavy; skip view-transition clip-path animation there
    // to avoid avoidable input/main-thread jank during perf-sensitive workflows.
    if (isPropertiesRoute) {
      applyToggle();
      return;
    }

    if (!startViewTransition || prefersReducedMotion) {
      applyToggleForViewTransition();
      return;
    }

    const transition = startViewTransition.call(document, () => {
      applyToggleForViewTransition();
    });

    await transition.ready;

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }, [duration, toggleTheme]);

  return (
    <button
      ref={buttonRef}
      onClick={toggleThemeWithAnimation}
      className={cn(className)}
      {...props}
    >
      {isDark ? <Sun /> : <Moon />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
