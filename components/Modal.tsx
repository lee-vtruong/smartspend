
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-start md:items-center overflow-y-auto p-4 transition-opacity duration-300" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-card dark:bg-card/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 w-full max-w-md my-auto border border-white/40 animate-fade-in-up flex flex-col max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-card-border pb-3 mb-4 shrink-0">
          <h3 id="modal-title" className="text-xl font-bold text-text dark:text-white uppercase tracking-tight">
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="text-muted hover:text-text p-1.5 rounded-full hover:bg-background transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
