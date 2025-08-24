import { useCallback } from 'react';
import { CanvasObject } from '@/app/drawit/types/drawit';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../lib/constants';

interface UseFileOperationsProps {
  objects: CanvasObject[];
  appName: string;
  onLoadObjects: (objects: CanvasObject[]) => void;
}

export const useFileOperations = ({ objects, appName, onLoadObjects }: UseFileOperationsProps) => {
  const saveCanvas = useCallback(() => {
    const saveData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      objects: objects,
      canvasSize: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }
    };
    
    const dataStr = JSON.stringify(saveData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${appName.toLowerCase()}-canvas-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [objects, appName]);

  const loadCanvas = useCallback((file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const saveData = JSON.parse(content);
          
          // Validate the save data structure
          if (!saveData.objects || !Array.isArray(saveData.objects)) {
            throw new Error('Invalid save file format: missing or invalid objects array');
          }
          
          // Validate each object has required properties
          for (const obj of saveData.objects) {
            if (!obj.id || !obj.name || !obj.type || typeof obj.x !== 'number' || typeof obj.y !== 'number') {
              throw new Error('Invalid save file format: objects missing required properties');
            }
          }
          
          // Load new objects
          onLoadObjects(saveData.objects);
          resolve();
        } catch (error) {
          reject(new Error(`Failed to load canvas: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }, [onLoadObjects]);

  return {
    saveCanvas,
    loadCanvas
  };
};