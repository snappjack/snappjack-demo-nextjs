'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MiniConnectionStatus } from '@/components/snappjack/MiniConnectionStatus';
import { useConnectionStatus } from '@/contexts/ConnectionStatusContext';

export default function Header() {
  const pathname = usePathname();
  const { status, appName, connectionData, availableTools } = useConnectionStatus();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/pipster', label: 'Pipster' },
    { href: '/drawit', label: 'DrawIt' },
  ];

  // Determine if we're on an app page
  const isAppPage = pathname === '/pipster' || pathname === '/drawit';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 flex items-center h-16">
      <div className="max-w-7xl mx-auto px-5 py-4 flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Snappjack
              </span>
              <span className="text-sm text-gray-600 font-medium">Demos</span>
            </Link>
            
            {/* Mini Connection Status - only show on app pages */}
            {isAppPage && status && (
              <div className="border-l border-gray-200 pl-6">
                <MiniConnectionStatus 
                  status={status} 
                  appName={appName}
                  connectionData={connectionData}
                  availableTools={availableTools}
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