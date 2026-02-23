
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

export const Header: React.FC<HeaderProps> = ({ onAdminClick, isAdmin, onLogout, onLogoClick, notificationCount }) => {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <header className="bg-[var(--color-card)] border-b border-[var(--color-border)] sticky top-0 z-50 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onLogoClick}>
          <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center shadow-inner">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="text-2xl font-bold text-[var(--color-text-main)] tracking-tight">Atlass</span>
        </div>

        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-[var(--color-bg)] rounded-full p-1.5 border border-[var(--color-border)]">
              {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    theme === key ? 'border-[var(--color-text-main)] scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: THEMES[key].colors.primary }}
                  title={`Cambiar a tema: ${THEMES[key].name}`}
                />
              ))}
            </div>

            {isAdmin ? (
              <div className="flex items-center gap-4">
                 <Button variant='primary' onClick={() => window.location.href='/admin'}>
                    Panel de Control
                    {notificationCount > 0 && 
                      <span className='ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center'>
                        {notificationCount}
                      </span>
                    }
                  </Button>
                <button 
                  onClick={onLogout}
                  className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] font-medium transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <Button variant="secondary" onClick={onAdminClick}>
                Acceso Admin
              </Button>
            )}
        </div>
      </div>
    </header>
  );
};
