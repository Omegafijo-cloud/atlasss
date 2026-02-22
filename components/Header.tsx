
'use client';

import React, { useContext } from 'react';
import { Button } from './Button';
import { ThemeContext } from './ClientProviders';
import { THEMES } from '../constants';
import { ThemeKey } from '../types';

interface HeaderProps {
  onAdminClick: () => void;
  isAdmin: boolean;
  onLogout: () => void;
  onLogoClick: () => void;
  notificationCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onAdminClick, isAdmin, onLogout, onLogoClick }) => {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <header className="bg-[var(--color-card)] border-b border-[var(--color-border)] sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center cursor-pointer" onClick={onLogoClick}>
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center mr-2">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold text-[var(--color-text-main)]">Atlass</span>
        </div>

        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 bg-[var(--color-bg)] rounded-full p-1 border border-[var(--color-border)]">
              {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    theme === key ? 'border-[var(--color-text-main)] scale-110 shadow-sm' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: THEMES[key].colors.primary }}
                  title={`Tema: ${THEMES[key].name}`}
                />
              ))}
            </div>

            {isAdmin ? (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="text-sm font-medium text-[var(--color-text-main)] bg-[var(--color-hover)] px-3 py-1 rounded-full border border-[var(--color-border)]">
                    Modo Admin
                  </span>
                </div>
                <button 
                  onClick={onLogout}
                  className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="relative">
                <Button variant="secondary" onClick={onAdminClick} className="text-sm py-1.5">
                  Admin
                </Button>
              </div>
            )}
        </div>
      </div>
    </header>
  );
};
