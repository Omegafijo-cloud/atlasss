
import React, { useState, useEffect } from 'react';
import { ContentItem } from '../types';
import { Button } from './Button';

interface ContentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
}

export const ContentDetailModal: React.FC<ContentDetailModalProps> = ({ isOpen, onClose, item }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Reset selected image index when modal opens with a new item
  useEffect(() => {
    if (isOpen) {
      setSelectedImageIndex(0);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const hasImages = item.image_urls && item.image_urls.length > 0;
  const currentImage = hasImages ? item.image_urls[selectedImageIndex] : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-[#DFE4EA] flex justify-between items-start bg-gray-50 rounded-t-2xl">
          <div className="pr-8">
            <div className="flex items-center gap-3 mb-3">
               <span className="inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide bg-rose-100 text-rose-700">
                {item.category}
              </span>
              <span className="inline-block text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest bg-gray-800 text-white shadow-sm">
                REF: {item.code}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2F3542] leading-tight">
              {item.title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-[#FF4757] transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          
          {/* Main Text Content */}
          <div className="prose prose-lg max-w-none text-[#2F3542] leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-gray-50 shadow-inner">
            {item.content}
          </div>

          {/* Support Material Gallery Section */}
          {hasImages && (
            <div className="border-t border-[#DFE4EA] pt-8">
              <h3 className="text-lg font-bold text-[#2F3542] mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#FF4757]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Material de Apoyo Visual
              </h3>

              <div className="flex flex-col gap-6">
                {/* Main Preview Area */}
                <div className="relative w-full aspect-video md:aspect-[21/9] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-white group">
                  <img 
                    src={currentImage!} 
                    alt={`${item.title} - vista principal`} 
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                  
                  {/* Overlay for External Link - AHORA VISIBLE SIEMPRE (opacity-80) */}
                  <a 
                    href={currentImage!} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full opacity-80 hover:opacity-100 transition-all border border-white/20 shadow-lg"
                    title="Ver imagen en tamaño completo"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  {/* Navigation Arrows (if multiple) */}
                  {item.image_urls.length > 1 && (
                    <>
                      <button 
                        onClick={() => setSelectedImageIndex(prev => (prev === 0 ? item.image_urls.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-all"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button 
                        onClick={() => setSelectedImageIndex(prev => (prev === item.image_urls.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-all"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails Strip */}
                {item.image_urls.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-4 pt-2 custom-scrollbar snap-x">
                    {item.image_urls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative shrink-0 w-24 md:w-32 aspect-video rounded-lg overflow-hidden border-2 transition-all snap-start ${
                          selectedImageIndex === idx 
                          ? 'border-[#FF4757] ring-4 ring-rose-100 scale-105' 
                          : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img 
                          src={url} 
                          alt={`Miniatura ${idx + 1}`} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {selectedImageIndex === idx && (
                          <div className="absolute inset-0 bg-rose-500/10" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DFE4EA] bg-gray-50 rounded-b-2xl flex justify-between items-center">
          <p className="text-xs text-[#747D8C] font-medium hidden md:block">
            Base de Conocimientos Atlass • Soporte Técnico Interno
          </p>
          <Button onClick={onClose} variant="secondary" className="px-8">
            Cerrar Manual
          </Button>
        </div>

      </div>
    </div>
  );
};
