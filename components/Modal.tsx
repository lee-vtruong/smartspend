import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className = '' }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex justify-center items-start md:items-center overflow-y-auto p-4 transition-all duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop with gradient */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl transition-opacity duration-500 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className={`
          relative 
          bg-gradient-to-br 
          from-white 
          via-white/98 
          to-white/95 
          dark:from-gray-800 
          dark:via-gray-800/98 
          dark:to-gray-900/95 
          rounded-2xl 
          shadow-2xl 
          w-full 
          max-w-lg 
          my-auto 
          border 
          border-white/40 
          dark:border-white/10
          animate-fade-in-up 
          flex 
          flex-col 
          max-h-[90vh]
          overflow-hidden
          ${className}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Shine effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary animate-shine"></div>
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 dark:border-white/10 shrink-0 bg-white/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 
              id="modal-title" 
              className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight"
            >
              {title}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 transform hover:rotate-90"
            aria-label="Đóng modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="text-gray-800 dark:text-gray-100">
            {children}
          </div>
        </div>
        
        {/* Corner accents
        <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/5 to-transparent rounded-br-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-2xl pointer-events-none"></div> */}
      </div>
    </div>
  );
};

export default Modal;