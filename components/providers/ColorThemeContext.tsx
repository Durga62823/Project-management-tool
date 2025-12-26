"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ColorTheme = 'yellow' | 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'pink' | 'cyan';

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

// Color configurations for each theme
const colorConfigs: Record<ColorTheme, {
  light: { primary: string; primaryForeground: string; ring: string; };
  dark: { primary: string; primaryForeground: string; ring: string; };
}> = {
  yellow: {
    light: {
      primary: 'oklch(0.852 0.199 91.936)',
      primaryForeground: 'oklch(0.421 0.095 57.708)',
      ring: 'oklch(0.852 0.199 91.936)',
    },
    dark: {
      primary: 'oklch(0.795 0.184 86.047)',
      primaryForeground: 'oklch(0.421 0.095 57.708)',
      ring: 'oklch(0.421 0.095 57.708)',
    },
  },
  blue: {
    light: {
      primary: 'oklch(0.546 0.245 262)',
      primaryForeground: 'oklch(0.98 0.02 262)',
      ring: 'oklch(0.546 0.245 262)',
    },
    dark: {
      primary: 'oklch(0.546 0.245 262)',
      primaryForeground: 'oklch(0.98 0.02 262)',
      ring: 'oklch(0.47 0.22 262)',
    },
  },
  red: {
    light: {
      primary: 'oklch(0.577 0.245 27.325)',
      primaryForeground: 'oklch(0.98 0.02 27)',
      ring: 'oklch(0.577 0.245 27.325)',
    },
    dark: {
      primary: 'oklch(0.577 0.245 27.325)',
      primaryForeground: 'oklch(0.98 0.02 27)',
      ring: 'oklch(0.5 0.22 27)',
    },
  },
  green: {
    light: {
      primary: 'oklch(0.648 0.2 145)',
      primaryForeground: 'oklch(0.98 0.02 145)',
      ring: 'oklch(0.648 0.2 145)',
    },
    dark: {
      primary: 'oklch(0.648 0.2 145)',
      primaryForeground: 'oklch(0.15 0.03 145)',
      ring: 'oklch(0.55 0.18 145)',
    },
  },
  purple: {
    light: {
      primary: 'oklch(0.558 0.288 302)',
      primaryForeground: 'oklch(0.98 0.02 302)',
      ring: 'oklch(0.558 0.288 302)',
    },
    dark: {
      primary: 'oklch(0.558 0.288 302)',
      primaryForeground: 'oklch(0.98 0.02 302)',
      ring: 'oklch(0.48 0.25 302)',
    },
  },
  orange: {
    light: {
      primary: 'oklch(0.705 0.213 47.604)',
      primaryForeground: 'oklch(0.21 0.034 45)',
      ring: 'oklch(0.705 0.213 47.604)',
    },
    dark: {
      primary: 'oklch(0.75 0.183 55.934)',
      primaryForeground: 'oklch(0.21 0.034 50)',
      ring: 'oklch(0.5 0.17 50)',
    },
  },
  pink: {
    light: {
      primary: 'oklch(0.592 0.249 0)',
      primaryForeground: 'oklch(0.98 0.02 0)',
      ring: 'oklch(0.592 0.249 0)',
    },
    dark: {
      primary: 'oklch(0.592 0.249 0)',
      primaryForeground: 'oklch(0.98 0.02 0)',
      ring: 'oklch(0.5 0.23 0)',
    },
  },
  cyan: {
    light: {
      primary: 'oklch(0.628 0.185 205)',
      primaryForeground: 'oklch(0.15 0.03 205)',
      ring: 'oklch(0.628 0.185 205)',
    },
    dark: {
      primary: 'oklch(0.628 0.185 205)',
      primaryForeground: 'oklch(0.15 0.03 205)',
      ring: 'oklch(0.54 0.17 205)',
    },
  },
};

export const colorThemeLabels: Record<ColorTheme, string> = {
  yellow: 'Yellow',
  blue: 'Blue',
  red: 'Red',
  green: 'Green',
  purple: 'Purple',
  orange: 'Orange',
  pink: 'Pink',
  cyan: 'Cyan',
};

export const colorThemeColors: Record<ColorTheme, string> = {
  yellow: '#f59e0b',
  blue: '#3b82f6',
  red: '#ef4444',
  green: '#22c55e',
  purple: '#a855f7',
  orange: '#f97316',
  pink: '#ec4899',
  cyan: '#06b6d4',
};

const getInitialColorTheme = (): ColorTheme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('color-theme') as ColorTheme | null;
    if (saved && colorConfigs[saved]) {
      return saved;
    }
  }
  return 'yellow';
};

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(getInitialColorTheme);
  const [mounted, setMounted] = useState(false);

  const applyColorTheme = useCallback((theme: ColorTheme, isDark: boolean) => {
    const config = colorConfigs[theme];
    const colors = isDark ? config.dark : config.light;
    const root = document.documentElement;

    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-foreground', colors.primaryForeground);
    root.style.setProperty('--ring', colors.ring);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const applyCurrentTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      applyColorTheme(colorTheme, isDark);
    };

    applyCurrentTheme();

    // Watch for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          applyCurrentTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [colorTheme, mounted, applyColorTheme]);

  const setColorTheme = useCallback((theme: ColorTheme) => {
    setColorThemeState(theme);
    localStorage.setItem('color-theme', theme);
  }, []);

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider');
  }
  return context;
}
