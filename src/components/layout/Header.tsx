'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MiniConnectionStatus, useSafeSnappjack } from '@/lib/snappjack/nextjs';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/pipster', label: 'Pipster' },
    { href: '/drawit', label: 'DrawIt' },
  ];

  // Determine if we're on an app page and what the current app is
  const isAppPage = pathname === '/pipster' || pathname === '/drawit';
  const currentApp = pathname === '/pipster' ? 'Pipster' : pathname === '/drawit' ? 'DrawIt' : null;
  const appInitial = currentApp === 'Pipster' ? 'P' : currentApp === 'DrawIt' ? 'D' : '';

  // Get Snappjack context - safely handles cases where provider is not available
  const { status, openConnectionModal } = useSafeSnappjack();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 flex items-center h-16">
      <div className="max-w-7xl mx-auto px-5 py-4 flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Snappjack
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Demos</span>
            </Link>

            {/* Mini Connection Status - only show on app pages when context is available */}
            {isAppPage && status && openConnectionModal && (
              <div className="border-l border-gray-200 dark:border-gray-700 pl-6">
                <MiniConnectionStatus
                  status={status}
                  appInitial={appInitial}
                  onClick={openConnectionModal}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <nav>
              <ul className="flex space-x-6">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}