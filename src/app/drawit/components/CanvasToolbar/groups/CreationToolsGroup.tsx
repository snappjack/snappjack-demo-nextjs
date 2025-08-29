'use client';

import { CreationMode } from '@/app/drawit/types/drawit';
import ToolbarButton from '../ui/ToolbarButton';
import {
  CursorArrowRaysIcon,
} from '@heroicons/react/24/outline';
import { RoundedSquareIcon } from '@/components/icons/RoundedSquareIcon';
import { TextBoxIcon } from '@/components/icons/TextBoxIcon';
import { PolygonIcon } from '@/components/icons/PolygonIcon';
import { useToolbarContext } from '../ToolbarContext';

export default function CreationToolsGroup() {
  const { currentMode, onModeChange } = useToolbarContext();
  const tools = [
    { 
      id: 'none', 
      icon: <CursorArrowRaysIcon className="w-5 h-5" />, 
      title: 'Select' 
    },
    { 
      id: 'rectangle', 
      icon: <RoundedSquareIcon className="w-5 h-5" />, 
      title: 'Rectangle' 
    },
    { 
      id: 'circle', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      ), 
      title: 'Circle' 
    },
    { 
      id: 'polygon', 
      icon: <PolygonIcon className="w-5 h-5" />, 
      title: 'Polygon' 
    },
    { 
      id: 'text', 
      icon: <TextBoxIcon className="w-5 h-5" />, 
      title: 'Text' 
    },
  ] as const;

  return (
    <>
      {tools.map((tool) => (
        <ToolbarButton
          key={tool.id}
          onClick={() => onModeChange(tool.id as CreationMode)}
          tooltip={tool.title}
          isActive={currentMode === tool.id}
        >
          {tool.icon}
        </ToolbarButton>
      ))}
    </>
  );
}