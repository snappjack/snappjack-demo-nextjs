'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect } from 'react';
import { Portal } from './Portal';

export default function ThemeToggle() {
  // Add mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Set mounted to true only on the client, after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle toggle and positioning
  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap below button
        right: window.innerWidth - rect.right, // Right-align with button
      });
    }
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // If not mounted, render a placeholder to match the server
  if (!mounted) {
    return (
      <div className="p-2 rounded-md">
        <ComputerDesktopIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </div>
    );
  }

  const themes = [
    { key: 'light', label: 'Light', icon: SunIcon },
    { key: 'dark', label: 'Dark', icon: MoonIcon },
    { key: 'system', label: 'System', icon: ComputerDesktopIcon },
  ] as const;

  const currentThemeConfig = themes.find(t => t.key === theme) || themes[2];
  const CurrentIcon = currentThemeConfig.icon;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle theme"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <CurrentIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {isOpen && (
        <Portal>
          <div
            ref={dropdownRef}
            className="fixed w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[1000]"
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
            }}
            role="menu"
            aria-orientation="vertical"
          >
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              return (
                <button
                  key={themeOption.key}
                  onClick={() => {
                    setTheme(themeOption.key);
                    setIsOpen(false);
                    buttonRef.current?.focus();
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    theme === themeOption.key
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                  role="menuitem"
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {themeOption.label}
                  {theme === themeOption.key && (
                    <div className="ml-auto w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </Portal>
      )}
    </>
  );
}