'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isHydrated: boolean;
}

const ThemeValueContext = createContext<Theme | undefined>(undefined);
const ThemeToggleContext = createContext<(() => void) | undefined>(undefined);
const ThemeHydrationContext = createContext<boolean | undefined>(undefined);

function setThemeCookie(value: Theme) {
  try {
    document.cookie = `lumina_theme=${value}; path=/; max-age=31536000`;
  } catch {}
}

function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {}
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function applyThemeToDocument(nextTheme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const isDark = nextTheme === 'dark';
  root.classList.toggle('dark', isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const initialTheme = readInitialTheme();
    setTheme((currentTheme) => (
      currentTheme === initialTheme ? currentTheme : initialTheme
    ));
    // Ensure cookie + DOM class are in sync after hydration.
    applyThemeToDocument(initialTheme);
    setThemeCookie(initialTheme);
    setIsHydrated(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('theme', nextTheme);
      } catch {}
      setThemeCookie(nextTheme);
      applyThemeToDocument(nextTheme);
      return nextTheme;
    });
  }, []);

  return (
    <ThemeToggleContext.Provider value={toggleTheme}>
      <ThemeValueContext.Provider value={theme}>
        <ThemeHydrationContext.Provider value={isHydrated}>
          {children}
        </ThemeHydrationContext.Provider>
      </ThemeValueContext.Provider>
    </ThemeToggleContext.Provider>
  );
}

export function useThemeValue(): Theme {
  const context = useContext(ThemeValueContext);
  if (context === undefined) {
    throw new Error('useThemeValue must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeToggle(): () => void {
  const context = useContext(ThemeToggleContext);
  if (context === undefined) {
    throw new Error('useThemeToggle must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeHydration(): boolean {
  const context = useContext(ThemeHydrationContext);
  if (context === undefined) {
    throw new Error('useThemeHydration must be used within a ThemeProvider');
  }
  return context;
}

export function useTheme(): ThemeContextType {
  const theme = useThemeValue();
  const toggleTheme = useThemeToggle();
  const isHydrated = useThemeHydration();

  return useMemo(
    () => ({ theme, toggleTheme, isHydrated }),
    [theme, toggleTheme, isHydrated]
  );
}