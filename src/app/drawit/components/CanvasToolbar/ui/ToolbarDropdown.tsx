'use client';

import React, { useRef, useEffect } from 'react';

interface ToolbarDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  tooltip: string;
  className?: string;
}

export default function ToolbarDropdown({
  trigger,
  children,
  isOpen,
  onToggle,
  tooltip,
  className = ''
}: ToolbarDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    // Use 'click' instead of 'mousedown' and add a small delay to avoid conflicts
    // with the toggle button's click handler
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="p-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-center group text-gray-700 dark:text-gray-300"
      >
        {trigger}
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
        </div>
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-20"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}