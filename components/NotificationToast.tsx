
import React, { useEffect, useState } from 'react';

interface NotificationToastProps {
  message: string;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500); // Wait for fade out animation
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-20 right-6 z-[60] transform transition-all duration-500 ease-out ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
    }`}>
      <div className="bg-white border-l-4 border-[#FF4757] p-4 rounded-lg shadow-2xl flex items-center gap-4 max-w-sm backdrop-blur-md bg-opacity-95">
        <div className="flex-shrink-0 bg-rose-50 p-2 rounded-full">
          <svg className="w-6 h-6 text-[#FF4757]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-[#FF4757] uppercase tracking-wider">Nueva Pregunta</p>
          <p className="text-sm text-[#2F3542] font-medium truncate">{message}</p>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-gray-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};
