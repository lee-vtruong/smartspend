import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  // FIX: Add optional onClick handler to make cards clickable.
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, onClick }) => {
  return (
    <div 
      className={`bg-card/40 backdrop-blur-2xl rounded-2xl shadow-lg p-6 border border-white/30 transition-all duration-300 ${className}`}
      onClick={onClick}
    >
      {title && <h3 className="text-xl font-semibold text-text mb-4">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;