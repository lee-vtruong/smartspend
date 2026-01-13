import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative
        rounded-2xl
        overflow-hidden
        transition-all
        duration-300
        shadow-xl
        hover:shadow-2xl
        hover:scale-[1.002]
        border
        border-gray-200/60
        dark:border-white/15
        bg-white
        dark:bg-gray-900
        ${onClick ? 'cursor-pointer hover:-translate-y-[2px]' : ''}
        ${className}
      `}
    >
      {/* ===== Background Blur Layer (KHÔNG ảnh hưởng text) ===== */}
      <div
        className="
          absolute
          inset-0
          -z-10
          bg-gradient-to-br
          from-white/90
          to-gray-50/80
          dark:from-gray-800/90
          dark:to-gray-900/80
          backdrop-blur-sm
        "
      />

      {/* ===== Corner Accent (opacity thấp, dưới content) ===== */}
      <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/3 to-transparent rounded-br-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-primary/3 to-transparent rounded-tl-2xl pointer-events-none" />

      {/* ===== Content ===== */}
      <div className="relative z-10 p-6">
        {title && (
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-white/10">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              {title}
            </h3>
          </div>
        )}

        <div className="text-gray-700 dark:text-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Card;
