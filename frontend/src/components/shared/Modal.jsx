import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = '2xl' }) => {
  if (!isOpen) return null;
  
  const maxWidthClass = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '500px': 'max-w-[500px]',
  }[maxWidth] || maxWidth;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
      <div 
        className={`w-full ${maxWidthClass} max-h-[90vh] flex flex-col bg-gray-900 light:bg-white border border-white/10 light:border-gray-200 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] light:shadow-xl animate-scale-in overflow-hidden`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 light:border-gray-200 shrink-0 bg-gray-950/50 light:bg-gray-50/80">
          <h3 className="text-lg font-bold text-white light:text-gray-900 m-0">{title}</h3>
          <button 
            className="p-1.5 rounded-lg text-gray-500 hover:text-white light:hover:text-gray-900 hover:bg-white/10 light:hover:bg-gray-200 transition-colors" 
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
export default Modal;
