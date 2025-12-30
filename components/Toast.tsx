
import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-success text-white border-success-focus',
    error: 'bg-danger text-white border-danger-focus',
    info: 'bg-primary text-white border-primary-focus',
  };

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center px-6 py-3 rounded-xl shadow-2xl border-b-4 animate-fade-in-up ${styles[type]}`}>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
