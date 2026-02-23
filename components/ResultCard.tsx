
import React from 'react';
import { ContentItem } from '../types';

interface ResultCardProps {
  item: ContentItem;
  onClick: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ item, onClick }) => {
  const mainImage = item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : null;
  const isImportant = item.is_important;

  return (
    <div 
      onClick={onClick}
      className={`bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-lg hover:border-[var(--color-primary)] transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer group`}
    >
      <div className="h-48 w-full overflow-hidden bg-gray-100 relative">
        {mainImage ? (
          <img 
            src={mainImage} 
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
             <svg className="w-16 h-16 opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <title>Sin imagen disponible</title>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
             </svg>
          </div>
        )}
        
        {isImportant && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              Importante
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-1.5 rounded-lg shadow-xl border border-white/20">
            <span className="text-xs block opacity-70 font-bold leading-none tracking-wider uppercase">ID</span>
            <span className="text-md font-mono font-black tracking-tighter">#{item.code}</span>
          </div>
        </div>
        <div className="absolute bottom-3 left-3">
           <span className="bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            {item.category}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <h3 className={`text-xl font-bold mb-3 leading-snug text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors duration-300 line-clamp-2`}>
          {item.title}
        </h3>
        
        <p className="text-[var(--color-text-secondary)] text-md leading-relaxed line-clamp-3 mb-5 min-h-[4.5rem]">
          {item.content}
        </p>
        
        <div className="mt-auto pt-5 border-t border-[var(--color-border)] flex justify-between items-center text-[var(--color-text-secondary)]">
          <span className="text-sm font-semibold tracking-wide">Ver Detalles</span>
          <svg className="w-6 h-6 text-[var(--color-primary)] opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </div>
      </div>
    </div>
  );
};
