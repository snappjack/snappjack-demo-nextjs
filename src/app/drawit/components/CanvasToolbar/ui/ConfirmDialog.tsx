'use client';

import { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmButtonClass = 'bg-red-500 hover:bg-red-600 text-white',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  // Focus trap
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      firstElement?.focus();

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
    return undefined;
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/40 dark:bg-gray-400/40 backdrop-blur-sm z-20 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        {/* Dialog */}
        <div 
          ref={dialogRef}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            aria-label="Close dialog"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 pr-8">
            {title}
          </h2>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {message}
          </p>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onCancel(); // Close dialog after confirming
              }}
              className={`px-4 py-2 font-medium rounded transition-colors ${confirmButtonClass}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}