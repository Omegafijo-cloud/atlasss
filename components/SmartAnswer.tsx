
import React from 'react';

interface SmartAnswerProps {
  answer: string;
  isLoading: boolean;
}

export const SmartAnswer: React.FC<SmartAnswerProps> = ({ answer, isLoading }) => {
  if (!isLoading && !answer) return null;

  return (
    <div className="relative mb-10 overflow-hidden rounded-2xl border-2 border-transparent bg-white p-1 shadow-xl">
      {/* Animated Gradient Border */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-rose-400 via-indigo-500 to-rose-400 animate-gradient-x opacity-20"></div>
      
      <div className="bg-white rounded-[calc(1rem-2px)] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF4757] text-white shadow-lg">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#2F3542] tracking-tight">Respuesta Inteligente de Atlass</h3>
          {isLoading && (
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse"></div>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none text-[#2F3542] leading-relaxed whitespace-pre-line text-lg">
            {answer}
          </div>
        )}
        
        <div className="mt-6 flex items-center gap-2 border-t border-gray-100 pt-4 text-xs text-[#747D8C] italic">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Generado automáticamente por IA basándose en la base de conocimientos.
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
      `}} />
    </div>
  );
};
