'use client';

import React from 'react';

interface ToolbarButtonProps {
  onClick?: () => void;
  tooltip: string;
  children: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  variant?: 'normal' | 'danger';
  className?: string;
  title?: string;
}

export default function ToolbarButton({
  onClick,
  tooltip,
  children,
  isActive = false,
  disabled = false,
  variant = 'normal',
  className = '',
  title
}: ToolbarButtonProps) {
  const getButtonClasses = () => {
    const baseClasses = "relative group p-2 rounded transition-all duration-200 border flex items-center justify-center";
    
    if (isActive) {
      return `${baseClasses} bg-blue-500 text-white shadow-md border-blue-500`;
    }
    
    if (variant === 'danger') {
      return `${baseClasses} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-gray-300 dark:border-gray-600`;
    }
    
    return `${baseClasses} bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed`;
  };

  const combinedClassName = `${getButtonClasses()} ${className}`;

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={combinedClassName}
        title={title || tooltip}
        disabled={disabled}
      >
        {children}
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
        {tooltip}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
      </div>
    </div>
  );
}