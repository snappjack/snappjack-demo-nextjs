'use client';

import { useState, useRef, useEffect } from 'react';
import { CanvasObject, RectangleObject, CircleObject, TextObject, PolygonObject } from '@/app/drawit/types/drawit';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  XMarkIcon,
  FolderOpenIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

interface ObjectListProps {
  objects: CanvasObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
  onDeleteObject: (id: string) => void;
  onReorderObject: (id: string, operation: 'up' | 'down' | 'top' | 'bottom') => void;
  onClearAll: () => void;
  onSave: () => void;
  onLoad: (file: File) => Promise<void>;
}

export default function ObjectList({
  objects,
  selectedObjectId,
  onSelectObject,
  onDeleteObject,
  onReorderObject,
  onClearAll,
  onSave,
  onLoad
}: ObjectListProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadStatus, setLoadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const objectRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleSave = () => {
    try {
      onSave();
      setLoadStatus('Canvas saved successfully!');
      setTimeout(() => setLoadStatus(null), 3000);
    } catch (error) {
      setLoadStatus(`Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setLoadStatus(null), 5000);
    }
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadStatus(null);

    try {
      await onLoad(file);
      setLoadStatus('Canvas loaded successfully!');
      setTimeout(() => setLoadStatus(null), 3000);
    } catch (error) {
      setLoadStatus(`Load failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setLoadStatus(null), 5000);
    } finally {
      setIsLoading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const scrollToObject = (objectId: string) => {
    const container = containerRef.current;
    const objectElement = objectRefs.current[objectId];
    
    if (!container || !objectElement) {
      console.warn('ScrollToObject: Missing container or object element for', objectId);
      return;
    }
    
    // Get container and element positions
    const containerRect = container.getBoundingClientRect();
    const elementRect = objectElement.getBoundingClientRect();
    
    // Calculate the element's position relative to the container's current scroll position
    const elementTopRelativeToContainer = elementRect.top - containerRect.top + container.scrollTop;
    const elementHeight = elementRect.height;
    const containerHeight = container.clientHeight;
    
    // Calculate where the element center is in the scroll area
    const elementCenter = elementTopRelativeToContainer + (elementHeight / 2);
    
    // Calculate where we want the container's center to be
    const containerCenter = containerHeight / 2;
    
    // Calculate the new scroll position to center the element
    const newScrollTop = elementCenter - containerCenter;
    
    // Clamp to valid scroll range
    const maxScroll = container.scrollHeight - containerHeight;
    const clampedScrollTop = Math.max(0, Math.min(newScrollTop, maxScroll));
    
    console.log('Scroll debug:', {
      objectId,
      elementTopRelativeToContainer,
      elementCenter,
      containerCenter,
      newScrollTop,
      clampedScrollTop,
      containerHeight,
      containerScrollHeight: container.scrollHeight
    });
    
    // Scroll only the container
    container.scrollTo({
      top: clampedScrollTop,
      behavior: 'smooth'
    });
  };

  // Auto-scroll when selected object changes
  useEffect(() => {
    if (selectedObjectId) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToObject(selectedObjectId);
      }, 10);
    }
  }, [selectedObjectId]);

  const handleReorderWithScroll = (objectId: string, operation: 'up' | 'down') => {
    // Call the reorder function
    onReorderObject(objectId, operation);
    
    // Schedule a scroll after the DOM updates with a slightly longer delay
    setTimeout(() => {
      scrollToObject(objectId);
    }, 50);
  };

  const getObjectDescription = (obj: CanvasObject): string => {
    switch (obj.type) {
      case 'rectangle':
        const rect = obj as RectangleObject;
        return `${rect.width.toFixed(1)}%×${rect.height.toFixed(1)}%${rect.cornerRadius ? ` (r:${rect.cornerRadius.toFixed(1)}%)` : ''}`;
      case 'circle':
        const circle = obj as CircleObject;
        return `radius: ${circle.radius.toFixed(1)}%`;
      case 'text':
        const text = obj as TextObject;
        return `"${text.text.substring(0, 20)}${text.text.length > 20 ? '...' : ''}" (${text.fontSize.toFixed(1)}%)`;
      case 'polygon':
        const polygon = obj as PolygonObject;
        return `${polygon.vertices.length} vertices`;
      default:
        return '';
    }
  };

  // Reverse the objects array to show top objects first
  const reversedObjects = [...objects].reverse();

  return (
    <>
      {objects.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          <em className="text-sm">No objects yet</em>
        </div>
      ) : (
        <div ref={containerRef} className="space-y-2 max-h-96 overflow-y-auto">
          {reversedObjects.map((obj, reversedIndex) => {
            // Get the original index for up/down operations
            const originalIndex = objects.length - 1 - reversedIndex;
            
            return (
              <div
                key={obj.id}
                ref={(el) => { objectRefs.current[obj.id] = el; }}
                className={`bg-white p-3 rounded border-2 cursor-pointer transition-all ${
                  selectedObjectId === obj.id
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSelectObject(obj.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">
                      {obj.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {getObjectDescription(obj)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Position: ({obj.x.toFixed(1)}%, {obj.y.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorderWithScroll(obj.id, 'up');
                      }}
                      disabled={originalIndex === objects.length - 1}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ArrowUpIcon className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorderWithScroll(obj.id, 'down');
                      }}
                      disabled={originalIndex === 0}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ArrowDownIcon className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteObject(obj.id);
                      }}
                      className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-600 rounded"
                      title="Delete"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Save/Load and Clear buttons */}
      <div className="space-y-2 mt-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSave}
            disabled={objects.length === 0}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={handleLoadClick}
            disabled={isLoading}
            className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            <FolderOpenIcon className="w-4 h-4" />
            {isLoading ? 'Loading...' : 'Load'}
          </button>
        </div>
        
        {objects.length > 0 && (
          <button
            onClick={onClearAll}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded transition-colors text-sm"
          >
            Clear All Objects
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {loadStatus && (
        <div className={`text-xs p-2 rounded mt-2 ${
          loadStatus.includes('failed') || loadStatus.includes('failed')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {loadStatus}
        </div>
      )}
    </>
  );
}