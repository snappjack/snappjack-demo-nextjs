import { useCallback } from 'react';
import { CanvasObject, RectangleObject, CircleObject, HandleInteraction } from '@/app/drawit/types/drawit';
import { CONSTRAINTS } from '../lib/constants';

interface UseCanvasInteractionProps {
  onUpdateObject: (id: string, updates: Partial<CanvasObject>) => void;
}

export const useCanvasInteraction = ({ onUpdateObject }: UseCanvasInteractionProps) => {
  const resizeObject = useCallback((id: string, handleType: string, newX: number, newY: number, handleInteraction: HandleInteraction | null): void => {
    if (!handleInteraction) return;
    
    const originalObject = handleInteraction.startObject;
    
    // Get the object's rotation
    const rotation = (originalObject.rotation || 0) * Math.PI / 180;
    
    // Transform mouse coordinates to local space (unrotated)
    const cos = Math.cos(-rotation);
    const sin = Math.sin(-rotation);
    
    // Transform both current and start positions to local space
    const transformToLocal = (x: number, y: number) => {
      const dx = x - originalObject.x;
      const dy = y - originalObject.y;
      return {
        x: originalObject.x + dx * cos - dy * sin,
        y: originalObject.y + dx * sin + dy * cos
      };
    };
    
    const localNew = transformToLocal(newX, newY);
    
    let updates: Partial<CanvasObject> = {};
    
    // Calculate resize based on handle type
    if (originalObject.type === 'rectangle') {
      const startRect = originalObject as RectangleObject;
      
      // For rectangles, we need to work in world space to make the corner follow the mouse exactly
      // First, calculate the corners in world space (rotated)
      
      const halfWidth = startRect.width / 2;
      const halfHeight = startRect.height / 2;
      
      // Calculate corners in local space first
      const localCorners = {
        nw: { x: startRect.x - halfWidth, y: startRect.y - halfHeight },
        ne: { x: startRect.x + halfWidth, y: startRect.y - halfHeight },
        se: { x: startRect.x + halfWidth, y: startRect.y + halfHeight },
        sw: { x: startRect.x - halfWidth, y: startRect.y + halfHeight }
      };
      
      // Transform corners to world space using rotation
      const worldCorners: Record<string, { x: number; y: number }> = {};
      Object.keys(localCorners).forEach(key => {
        const local = localCorners[key as keyof typeof localCorners];
        const dx = local.x - startRect.x;
        const dy = local.y - startRect.y;
        worldCorners[key] = {
          x: startRect.x + dx * Math.cos(rotation) - dy * Math.sin(rotation),
          y: startRect.y + dx * Math.sin(rotation) + dy * Math.cos(rotation)
        };
      });
      
      // Calculate what the moving corner/edge position was when drag started
      let originalMovingCornerWorld: { x: number; y: number };
      let currentMovingCornerWorld: { x: number; y: number };
      let fixedCornerWorld: { x: number; y: number };
      
      // First, determine the original positions when drag started
      switch (handleType) {
        case 'nw':
          fixedCornerWorld = worldCorners.se;
          originalMovingCornerWorld = worldCorners.nw;
          break;
        case 'ne':
          fixedCornerWorld = worldCorners.sw;
          originalMovingCornerWorld = worldCorners.ne;
          break;
        case 'se':
          fixedCornerWorld = worldCorners.nw;
          originalMovingCornerWorld = worldCorners.se;
          break;
        case 'sw':
          fixedCornerWorld = worldCorners.ne;
          originalMovingCornerWorld = worldCorners.sw;
          break;
        case 'n':
          fixedCornerWorld = { x: (worldCorners.sw.x + worldCorners.se.x) / 2, y: (worldCorners.sw.y + worldCorners.se.y) / 2 };
          originalMovingCornerWorld = { x: (worldCorners.nw.x + worldCorners.ne.x) / 2, y: (worldCorners.nw.y + worldCorners.ne.y) / 2 };
          break;
        case 's':
          fixedCornerWorld = { x: (worldCorners.nw.x + worldCorners.ne.x) / 2, y: (worldCorners.nw.y + worldCorners.ne.y) / 2 };
          originalMovingCornerWorld = { x: (worldCorners.sw.x + worldCorners.se.x) / 2, y: (worldCorners.sw.y + worldCorners.se.y) / 2 };
          break;
        case 'w':
          fixedCornerWorld = { x: (worldCorners.ne.x + worldCorners.se.x) / 2, y: (worldCorners.ne.y + worldCorners.se.y) / 2 };
          originalMovingCornerWorld = { x: (worldCorners.nw.x + worldCorners.sw.x) / 2, y: (worldCorners.nw.y + worldCorners.sw.y) / 2 };
          break;
        case 'e':
          fixedCornerWorld = { x: (worldCorners.nw.x + worldCorners.sw.x) / 2, y: (worldCorners.nw.y + worldCorners.sw.y) / 2 };
          originalMovingCornerWorld = { x: (worldCorners.ne.x + worldCorners.se.x) / 2, y: (worldCorners.ne.y + worldCorners.se.y) / 2 };
          break;
        default:
          fixedCornerWorld = worldCorners.nw;
          originalMovingCornerWorld = worldCorners.se;
      }
      
      // Calculate the offset between the original mouse position and the corner
      const startMouseX = handleInteraction.startX;
      const startMouseY = handleInteraction.startY;
      const offsetX = originalMovingCornerWorld.x - startMouseX;
      const offsetY = originalMovingCornerWorld.y - startMouseY;
      
      // Apply the same offset to current mouse position
      switch (handleType) {
        case 'nw':
        case 'ne':
        case 'se':
        case 'sw':
          // Corner handles: maintain offset in both directions
          currentMovingCornerWorld = { x: newX + offsetX, y: newY + offsetY };
          break;
        case 'n':
        case 's':
          // Vertical edge handles: maintain Y offset, keep X centered
          currentMovingCornerWorld = { x: originalMovingCornerWorld.x, y: newY + offsetY };
          break;
        case 'w':
        case 'e':
          // Horizontal edge handles: maintain X offset, keep Y centered  
          currentMovingCornerWorld = { x: newX + offsetX, y: originalMovingCornerWorld.y };
          break;
        default:
          currentMovingCornerWorld = { x: newX, y: newY };
      }
      
      // Calculate new center in world space
      const newCenterX = (fixedCornerWorld.x + currentMovingCornerWorld.x) / 2;
      const newCenterY = (fixedCornerWorld.y + currentMovingCornerWorld.y) / 2;
      
      // Calculate new dimensions by measuring the distance between corners
      // and projecting onto the rectangle's local axes
      const cornerToCorner = {
        x: currentMovingCornerWorld.x - fixedCornerWorld.x,
        y: currentMovingCornerWorld.y - fixedCornerWorld.y
      };
      
      // Project the corner-to-corner vector onto the rectangle's local axes
      const localAxisX = { x: Math.cos(rotation), y: Math.sin(rotation) };
      const localAxisY = { x: -Math.sin(rotation), y: Math.cos(rotation) };
      
      const projectedWidth = Math.abs(cornerToCorner.x * localAxisX.x + cornerToCorner.y * localAxisX.y);
      const projectedHeight = Math.abs(cornerToCorner.x * localAxisY.x + cornerToCorner.y * localAxisY.y);
      
      // Apply with minimum constraints
      updates = {
        x: newCenterX,
        y: newCenterY,
        width: Math.max(CONSTRAINTS.rectangle.width.min, projectedWidth),
        height: Math.max(CONSTRAINTS.rectangle.height.min, projectedHeight)
      };
    } else if (originalObject.type === 'circle') {
      const startCircle = originalObject as CircleObject;
      
      // For circles, all resize handles adjust the radius
      // Use the local transformed coordinates for consistent behavior
      const deltaX = Math.abs(localNew.x - startCircle.x);
      const deltaY = Math.abs(localNew.y - startCircle.y);
      const newRadius = Math.max(CONSTRAINTS.circle.radius.min, Math.min(CONSTRAINTS.circle.radius.max, Math.max(deltaX, deltaY)));
      updates = { radius: newRadius };
    }
    
    // Apply updates
    onUpdateObject(id, updates);
  }, [onUpdateObject]);

  const rotateObject = useCallback((id: string, mouseX: number, mouseY: number, objectX: number, objectY: number): void => {
    // Calculate angle from object center to mouse position
    const deltaX = mouseX - objectX;
    const deltaY = mouseY - objectY;
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    
    // Normalize angle to -180 to 180 range
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;
    
    onUpdateObject(id, { rotation: angle });
  }, [onUpdateObject]);

  return {
    resizeObject,
    rotateObject
  };
};