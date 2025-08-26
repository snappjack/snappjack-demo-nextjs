'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MiniConnectionStatus } from '@/components/snappjack/MiniConnectionStatus';

interface HeaderWithStatusProps {
  connectionStatus?: 'connecting' | 'connected' | 'bridged' | 'disconnected' | 'error';
  appName?: string;
}

export default function HeaderWithStatus({ connectionStatus, appName }: HeaderWithStatusProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/pipster', label: 'Pipster' },
    { href: '/drawit', label: 'DrawIt' },
  ];

  // Determine if we're on an app page
  const isAppPage = pathname === '/pipster' || pathname === '/drawit';
  
  // Get the current app name from the path if not provided
  const currentAppName = appName || (pathname === '/pipster' ? 'Pipster' : pathname === '/drawit' ? 'DrawIt' : '');

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Snappjack
              </span>
              <span className="text-sm text-gray-600 font-medium">Demos</span>
            </Link>
            
            {/* Mini Connection Status - only show on app pages */}
            {isAppPage && connectionStatus && (
              <div className="border-l border-gray-200 pl-6">
                <MiniConnectionStatus 
                  status={connectionStatus} 
                  appName={currentAppName}
                />
              </div>
            )}
          </div>
          
          <nav>
            <ul className="flex space-x-6">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}