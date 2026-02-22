'use client';

import React, { createContext, useState, useEffect } from 'react';
import { ThemeKey } from '../types';
import { THEMES } from '../constants';

export const ThemeContext = createContext<{
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
}>({
  theme: 'atlass',
  setTheme: () => {},
});

export const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeKey>('atlass');
  const [mounted, setMounted] = useState(false);

  // Evitar hidratación incorrecta
  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = THEMES[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {mounted && (
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --color-primary: ${activeTheme.colors.primary};
            --color-bg: ${activeTheme.colors.background};
            --color-card: ${activeTheme.colors.card};
            --color-text-main: ${activeTheme.colors.textMain};
            --color-text-secondary: ${activeTheme.colors.textSecondary};
            --color-border: ${activeTheme.colors.border};
            --color-input-bg: ${activeTheme.colors.inputBg};
            --color-hover: ${activeTheme.colors.hover};
          }
          body {
            background-color: var(--color-bg);
            color: var(--color-text-main);
          }
        `}} />
      )}
      {children}
    </ThemeContext.Provider>
  );
};