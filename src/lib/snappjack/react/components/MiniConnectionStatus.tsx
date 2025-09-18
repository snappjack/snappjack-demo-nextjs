'use client';

import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface MiniConnectionStatusProps {
  status: 'connecting' | 'connected' | 'bridged' | 'disconnected' | 'error';
  appInitial: string;
  onClick: () => void;
}

export function MiniConnectionStatus({ status, appInitial, onClick }: MiniConnectionStatusProps) {

  const getAgentConnectionColor = () => {
    switch (status) {
      case 'bridged':
        return 'stroke-green-500';
      case 'connected':
      case 'connecting':
      case 'disconnected':
        return 'stroke-gray-300';
      case 'error':
        return 'stroke-red-500';
      default:
        return 'stroke-gray-300';
    }
  };

  const getAppConnectionColor = () => {
    switch (status) {
      case 'connecting':
        return 'stroke-yellow-500';
      case 'connected':
      case 'bridged':
        return 'stroke-green-500';
      case 'disconnected':
        return 'stroke-gray-300';
      case 'error':
        return 'stroke-red-500';
      default:
        return 'stroke-gray-300';
    }
  };

  const getSnappjackColor = () => {
    switch (status) {
      case 'connecting':
        return 'bg-yellow-500';
      case 'connected':
        return 'bg-blue-500';
      case 'bridged':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-gray-400';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const isPulsing = status === 'connecting';

  return (
    <div className="relative">
      <div 
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onClick}
      >
        {/* Mini connection diagram */}
        <div className="flex items-center">
        {/* Agent icon */}
        <div className="relative">
          <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          {status === 'bridged' && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
          )}
        </div>
        
        {/* Agent to Snappjack line */}
        <svg width="20" height="2" className="mx-0.5">
          <line 
            x1="0" 
            y1="1" 
            x2="20" 
            y2="1" 
            className={getAgentConnectionColor()}
            strokeWidth="2"
            strokeDasharray={status === 'bridged' ? '0' : '2 2'}
          />
        </svg>
        
        {/* Snappjack center */}
        <div className={`relative w-5 h-5 rounded-full ${getSnappjackColor()} ${isPulsing ? 'animate-pulse' : ''} flex items-center justify-center`}>
          <span className="text-[10px] text-white font-bold">S</span>
        </div>
        
        {/* Snappjack to App line */}
        <svg width="20" height="2" className="mx-0.5">
          <line 
            x1="0" 
            y1="1" 
            x2="20" 
            y2="1" 
            className={getAppConnectionColor()}
            strokeWidth="2"
            strokeDasharray={status === 'connecting' ? '2 2' : '0'}
          />
        </svg>
        
        {/* App icon */}
        <div className="relative">
          <div className="w-4 h-4 bg-gray-600 dark:bg-gray-400 rounded-sm flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">
              {appInitial}
            </span>
          </div>
          {(status === 'connected' || status === 'bridged') && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
          )}
        </div>
      </div>
      
        {/* Status text */}
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {status === 'connecting' && 'Connecting...'}
          {status === 'connected' && 'Connected'}
          {status === 'bridged' && 'Agent active'}
          {status === 'disconnected' && 'Disconnected'}
          {status === 'error' && 'Error'}
        </span>
      </div>

    </div>
  );
}