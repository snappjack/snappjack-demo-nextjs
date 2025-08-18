'use client';

import Image from 'next/image';
import { ConnectionStatusProps } from '@/types/dice';

export default function ConnectionStatus({ status, appName = 'Pipster', appEmoji = '🎲' }: ConnectionStatusProps) {
  const getLineColor = (line: 'agent' | 'app') => {
    if (line === 'agent') {
      return status === 'bridged' ? 'bg-green-500' : status === 'connected' ? 'bg-red-500' : 'bg-gray-300';
    } else {
      return status !== 'disconnected' ? 'bg-green-500' : 'bg-red-500';
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      <h4 className="text-center mb-4 text-gray-700 font-semibold">Connection Status</h4>
      <div className="flex justify-center items-center p-2">
        {/* Agent */}
        <div className="text-center p-2">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-2 border-2 border-gray-300">
            <span className="text-3xl">🤖</span>
          </div>
          <div className="text-sm font-medium text-gray-600">Agent</div>
        </div>

        {/* Agent to Snappjack line */}
        <div className="flex-1 max-w-[150px] flex items-center mx-2 -mt-6">
          <div className={`w-full h-1 rounded ${getLineColor('agent')}`}></div>
        </div>

        {/* Snappjack */}
        <div className="text-center p-2">
          <div 
            className={`
              w-20 h-20 rounded-full flex items-center justify-center mb-2 border-2
              bg-gradient-to-br from-purple-500 to-purple-700 border-purple-600
              ${status === 'bridged' ? 'relative overflow-hidden' : ''}
            `}
          >
            {status === 'bridged' && (
              <div className="absolute inset-0 animate-gradient-rotate">
                <div className="w-full h-full bg-gradient-to-r from-purple-500 via-purple-700 to-purple-500"></div>
              </div>
            )}
            <Image 
              src="/images/logo-white-64.png" 
              alt="Snappjack Logo" 
              width={24}
              height={24}
              className="relative z-10"
            />
          </div>
          <div className="text-sm font-medium text-gray-600">Snappjack</div>
        </div>

        {/* Snappjack to App line */}
        <div className="flex-1 max-w-[150px] flex items-center mx-2 -mt-6">
          <div className={`w-full h-1 rounded ${getLineColor('app')}`}></div>
        </div>

        {/* App */}
        <div className="text-center p-2">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-2 border-2 border-gray-300">
            <span className="text-3xl">{appEmoji}</span>
          </div>
          <div className="text-sm font-medium text-gray-600">{appName}</div>
        </div>
      </div>
    </div>
  );
}