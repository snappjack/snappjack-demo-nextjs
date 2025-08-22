'use client';

import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { CanvasObject, RectangleObject, CircleObject, TextObject, PolygonObject, CreationMode, HandleInteraction } from '@/app/drawit/types/drawit';

interface CanvasProps {
  objects: CanvasObject[];
  selectedObject: CanvasObject | null;
  width: number;
  height: number;
  creationMode: CreationMode;
  isCreating: boolean;
  creationStart: { x: number; y: number } | null;
  polygonVertices: Array<{ x: number; y: number }>;
  handleInteraction: HandleInteraction | null;
  onCanvasClick: () => void;
  onObjectClick: (id: string) => void;
  onObjectDrag: (id: string, x: number, y: number) => void;
  onStartCreation: (x: number, y: number) => void;
  onFinishCreation: (x: number, y: number, text?: string) => void;
  onUpdateCreation: () => void;
  onAddPolygonVertex: (x: number, y: number) => void;
  onResizeObject: (id: string, handleType: string, x: number, y: number) => void;
  onRotateObject: (id: string, x: number, y: number) => void;
  onStartHandleInteraction: (handleType: string, x: number, y: number, object: CanvasObject) => void;
  onEndHandleInteraction: () => void;
}

export interface CanvasHandle {
  toDataURL: (type?: string, quality?: number) => string;
}

const Canvas = forwardRef<CanvasHandle, CanvasProps>(({
  objects,
  selectedObject,
  width,
  height,
  creationMode,
  isCreating,
  creationStart,
  polygonVertices,
  handleInteraction,
  onCanvasClick,
  onObjectClick,
  onObjectDrag,
  onStartCreation,
  onFinishCreation,
  onUpdateCreation,
  onAddPolygonVertex,
  onResizeObject,
  onRotateObject,
  onStartHandleInteraction,
  onEndHandleInteraction
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState('');

  useImperativeHandle(ref, () => ({
    toDataURL: (type?: string, quality?: number) => {
      if (!canvasRef.current) {
        throw new Error('Canvas not available');
      }
      return canvasRef.current.toDataURL(type, quality);
    }
  }), []);

  const percentToPixelX = useCallback((percent: number): number => (percent / 100) * width, [width]);
  const percentToPixelY = useCallback((percent: number): number => (percent / 100) * height, [height]);
  const pixelToPercentX = useCallback((pixel: number): number => (pixel / width) * 100, [width]);
  const pixelToPercentY = useCallback((pixel: number): number => (pixel / height) * 100, [height]);

  const getObjectAtPoint = useCallback((x: number, y: number): CanvasObject | null => {
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      
      // Transform point to object's local space if rotated
      let testX = x;
      let testY = y;
      
      if (obj.rotation && obj.type !== 'polygon') {
        // Don't transform for polygons as their vertices are already in world space
        const rotation = -obj.rotation * Math.PI / 180; // Negative for inverse rotation
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        
        // Translate point to origin (object center)
        const dx = x - obj.x;
        const dy = y - obj.y;
        
        // Rotate point around origin (inverse rotation)
        testX = obj.x + (dx * cos - dy * sin);
        testY = obj.y + (dx * sin + dy * cos);
      }
      
      // Check based on object type
      let isInside = false;
      
      switch (obj.type) {
        case 'circle': {
          const circle = obj as CircleObject;
          const distance = Math.sqrt(Math.pow(testX - obj.x, 2) + Math.pow(testY - obj.y, 2));
          const tolerance = 0.5; // Small tolerance in percentage units
          isInside = distance <= (circle.radius + tolerance);
          break;
        }
        case 'polygon': {
          const polygon = obj as PolygonObject;
          // For polygons, check if the point is inside the rotated polygon
          let inside = false;
          const vertices = polygon.vertices;
          
          if (polygon.rotation) {
            // Apply rotation to vertices
            const rotation = polygon.rotation * Math.PI / 180;
            const cos = Math.cos(rotation);
            const sin = Math.sin(rotation);
            const rotatedVertices = vertices.map(v => {
              const dx = v.x - polygon.x;
              const dy = v.y - polygon.y;
              return {
                x: polygon.x + dx * cos - dy * sin,
                y: polygon.y + dx * sin + dy * cos
              };
            });
            
            // Point-in-polygon test on rotated vertices
            for (let j = 0, k = rotatedVertices.length - 1; j < rotatedVertices.length; k = j++) {
              const xi = rotatedVertices[j].x;
              const yi = rotatedVertices[j].y;
              const xj = rotatedVertices[k].x;
              const yj = rotatedVertices[k].y;
              
              const intersect = ((yi > y) !== (yj > y))
                  && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
              if (intersect) inside = !inside;
            }
          } else {
            // No rotation, use original vertices
            for (let j = 0, k = vertices.length - 1; j < vertices.length; k = j++) {
              const xi = vertices[j].x;
              const yi = vertices[j].y;
              const xj = vertices[k].x;
              const yj = vertices[k].y;
              
              const intersect = ((yi > y) !== (yj > y))
                  && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
              if (intersect) inside = !inside;
            }
          }
          isInside = inside;
          break;
        }
        case 'rectangle':
        case 'text':
        default: {
          // Use bounding box for rectangles and text with small tolerance for edge cases
          const bbox = obj.boundingBox;
          const tolerance = 0.5; // Small tolerance in percentage units
          isInside = testX >= (bbox.minX - tolerance) && testX <= (bbox.maxX + tolerance) && 
                     testY >= (bbox.minY - tolerance) && testY <= (bbox.maxY + tolerance);
          break;
        }
      }
      
      if (isInside) {
        return obj;
      }
    }
    return null;
  }, [objects]);

  const getHandleAtPoint = useCallback((x: number, y: number, obj: CanvasObject): string | null => {
    const bbox = obj.boundingBox;
    const handleSize = 12; // Increased for easier clicking
    
    // Convert to pixel coordinates
    const pixelX = percentToPixelX(x);
    const pixelY = percentToPixelY(y);
    
    // Calculate object center and dimensions in pixels
    const left = percentToPixelX(bbox.minX);
    const right = percentToPixelX(bbox.maxX);
    const top = percentToPixelY(bbox.minY);
    const bottom = percentToPixelY(bbox.maxY);
    const centerX = percentToPixelX(obj.x);  // Use actual center for accuracy
    const centerY = percentToPixelY(obj.y);
    
    // Convert rotation to radians
    const rotation = (obj.rotation || 0) * Math.PI / 180;
    
    // Function to rotate a point around the center
    const rotatePoint = (px: number, py: number) => {
      const cos = Math.cos(-rotation); // Negative for inverse rotation
      const sin = Math.sin(-rotation);
      const dx = px - centerX;
      const dy = py - centerY;
      return {
        x: centerX + dx * cos - dy * sin,
        y: centerY + dx * sin + dy * cos
      };
    };
    
    // Transform mouse position to object's local coordinate system
    const localMouse = rotatePoint(pixelX, pixelY);
    
    // Check rotation handle (above the object, also rotated)
    // The rotation handle is at the top center, 30 pixels above (increased distance)
    const rotationHandleLocal = { x: centerX, y: top - 30 };
    
    // Rotate the handle position to match the object's rotation
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const dx = rotationHandleLocal.x - centerX;
    const dy = rotationHandleLocal.y - centerY;
    const rotationHandle = {
      x: centerX + dx * cos - dy * sin,
      y: centerY + dx * sin + dy * cos
    };
    
    // Check if mouse is near rotation handle in world space (use circle distance for better detection)
    const distToRotHandle = Math.sqrt(Math.pow(pixelX - rotationHandle.x, 2) + Math.pow(pixelY - rotationHandle.y, 2));
    if (distToRotHandle < handleSize) {
      return 'rotate';
    }
    
    // Check resize handles using the transformed mouse position
    const handles = [
      { type: 'nw', x: left, y: top },
      { type: 'n', x: centerX, y: top },
      { type: 'ne', x: right, y: top },
      { type: 'e', x: right, y: centerY },
      { type: 'se', x: right, y: bottom },
      { type: 's', x: centerX, y: bottom },
      { type: 'sw', x: left, y: bottom },
      { type: 'w', x: left, y: centerY },
    ];
    
    // Check handles in local space (unrotated)
    for (const handle of handles) {
      if (Math.abs(localMouse.x - handle.x) < handleSize && Math.abs(localMouse.y - handle.y) < handleSize) {
        return handle.type;
      }
    }
    
    return null;
  }, [percentToPixelX, percentToPixelY]);

  const drawRectangle = useCallback((ctx: CanvasRenderingContext2D, rect: RectangleObject) => {
    const centerX = percentToPixelX(rect.x);
    const centerY = percentToPixelY(rect.y);
    const rectWidth = percentToPixelX(rect.width);
    const rectHeight = percentToPixelY(rect.height);
    const x = centerX - rectWidth / 2;
    const y = centerY - rectHeight / 2;

    ctx.strokeStyle = rect.color;
    ctx.lineWidth = rect.strokeWidth || 2;

    if (rect.cornerRadius && rect.cornerRadius > 0) {
      const minDimension = Math.min(rectWidth, rectHeight);
      const radius = Math.min((rect.cornerRadius / 100) * minDimension, minDimension / 2);
      
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + rectWidth - radius, y);
      ctx.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + radius);
      ctx.lineTo(x + rectWidth, y + rectHeight - radius);
      ctx.quadraticCurveTo(x + rectWidth, y + rectHeight, x + rectWidth - radius, y + rectHeight);
      ctx.lineTo(x + radius, y + rectHeight);
      ctx.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      
      if (rect.fillColor) {
        ctx.fillStyle = rect.fillColor;
        ctx.fill();
      }
      ctx.stroke();
    } else {
      if (rect.fillColor) {
        ctx.fillStyle = rect.fillColor;
        ctx.fillRect(x, y, rectWidth, rectHeight);
      }
      ctx.strokeRect(x, y, rectWidth, rectHeight);
    }
  }, [percentToPixelX, percentToPixelY]);

  const drawCircle = useCallback((ctx: CanvasRenderingContext2D, circle: CircleObject) => {
    const centerX = percentToPixelX(circle.x);
    const centerY = percentToPixelY(circle.y);
    const minDimension = Math.min(width, height);
    const radius = (circle.radius / 100) * minDimension;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);

    if (circle.fillColor) {
      ctx.fillStyle = circle.fillColor;
      ctx.fill();
    }

    ctx.strokeStyle = circle.color;
    ctx.lineWidth = circle.strokeWidth || 2;
    ctx.stroke();
  }, [percentToPixelX, percentToPixelY, width, height]);

  const drawText = useCallback((ctx: CanvasRenderingContext2D, text: TextObject) => {
    const centerX = percentToPixelX(text.x);
    const centerY = percentToPixelY(text.y);
    const fontSize = percentToPixelY(text.fontSize);

    ctx.fillStyle = text.color;
    ctx.font = `${text.fontWeight || 'normal'} ${fontSize}px ${text.fontFamily || 'Arial'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.text, centerX, centerY);
  }, [percentToPixelX, percentToPixelY]);

  const drawPolygon = useCallback((ctx: CanvasRenderingContext2D, polygon: PolygonObject) => {
    if (polygon.vertices.length < 3) return;

    ctx.beginPath();
    const firstVertex = polygon.vertices[0];
    ctx.moveTo(percentToPixelX(firstVertex.x), percentToPixelY(firstVertex.y));

    for (let i = 1; i < polygon.vertices.length; i++) {
      const vertex = polygon.vertices[i];
      ctx.lineTo(percentToPixelX(vertex.x), percentToPixelY(vertex.y));
    }
    ctx.closePath();

    if (polygon.fillColor) {
      ctx.fillStyle = polygon.fillColor;
      ctx.fill();
    }

    ctx.strokeStyle = polygon.color;
    ctx.lineWidth = polygon.strokeWidth || 2;
    ctx.stroke();
  }, [percentToPixelX, percentToPixelY]);

  const drawCreationPreview = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!isCreating || !creationStart || !currentMousePos) return;

    ctx.save();
    ctx.strokeStyle = '#0080ff';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;

    const startX = percentToPixelX(creationStart.x);
    const startY = percentToPixelY(creationStart.y);
    const endX = percentToPixelX(currentMousePos.x);
    const endY = percentToPixelY(currentMousePos.y);

    switch (creationMode) {
      case 'rectangle': {
        const rectWidth = Math.abs(endX - startX);
        const rectHeight = Math.abs(endY - startY);
        const rectX = Math.min(startX, endX);
        const rectY = Math.min(startY, endY);
        ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
        break;
      }
      case 'circle': {
        const distanceInPercent = Math.sqrt(Math.pow(currentMousePos.x - creationStart.x, 2) + Math.pow(currentMousePos.y - creationStart.y, 2));
        // Convert percentage distance to pixel radius for preview
        const minDimension = Math.min(width, height);
        const pixelRadius = (distanceInPercent / 100) * minDimension;
        ctx.beginPath();
        ctx.arc(startX, startY, pixelRadius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      }
    }

    ctx.restore();
  }, [isCreating, creationStart, currentMousePos, creationMode, percentToPixelX, percentToPixelY, width, height]);

  const drawPolygonPreview = useCallback((ctx: CanvasRenderingContext2D) => {
    if (creationMode !== 'polygon' || polygonVertices.length === 0) return;

    ctx.save();
    ctx.strokeStyle = '#0080ff';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(0, 128, 255, 0.1)';

    // Draw current polygon
    ctx.beginPath();
    const firstVertex = polygonVertices[0];
    ctx.moveTo(percentToPixelX(firstVertex.x), percentToPixelY(firstVertex.y));

    for (let i = 1; i < polygonVertices.length; i++) {
      const vertex = polygonVertices[i];
      ctx.lineTo(percentToPixelX(vertex.x), percentToPixelY(vertex.y));
    }

    if (polygonVertices.length >= 3) {
      ctx.closePath();
      ctx.fill();
    }
    ctx.stroke();

    // Draw vertices
    polygonVertices.forEach(vertex => {
      ctx.beginPath();
      ctx.arc(percentToPixelX(vertex.x), percentToPixelY(vertex.y), 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#0080ff';
      ctx.fill();
    });

    // Draw preview polygon with mouse position (if mouse is over canvas)
    if (currentMousePos && polygonVertices.length >= 2) {
      ctx.save();
      ctx.strokeStyle = '#80c0ff';
      ctx.setLineDash([2, 2]);
      ctx.lineWidth = 1;
      ctx.fillStyle = 'rgba(128, 192, 255, 0.05)';

      ctx.beginPath();
      const firstVertex = polygonVertices[0];
      ctx.moveTo(percentToPixelX(firstVertex.x), percentToPixelY(firstVertex.y));

      for (let i = 1; i < polygonVertices.length; i++) {
        const vertex = polygonVertices[i];
        ctx.lineTo(percentToPixelX(vertex.x), percentToPixelY(vertex.y));
      }

      // Add preview vertex at mouse position
      ctx.lineTo(percentToPixelX(currentMousePos.x), percentToPixelY(currentMousePos.y));

      if (polygonVertices.length >= 2) {
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();

      // Draw preview vertex at mouse position
      ctx.beginPath();
      ctx.arc(percentToPixelX(currentMousePos.x), percentToPixelY(currentMousePos.y), 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#80c0ff';
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }, [creationMode, polygonVertices, currentMousePos, percentToPixelX, percentToPixelY]);

  const drawSelectionHandles = useCallback((ctx: CanvasRenderingContext2D, obj: CanvasObject) => {
    const bbox = obj.boundingBox;
    const x = percentToPixelX(bbox.minX);
    const y = percentToPixelY(bbox.minY);
    const w = percentToPixelX(bbox.maxX) - x;
    const h = percentToPixelY(bbox.maxY) - y;

    ctx.save();
    
    // Draw selection outline
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);

    // Draw corner handles
    ctx.fillStyle = '#00aaff';
    const handleSize = 8;
    const handles = [
      [x - handleSize/2, y - handleSize/2], // top-left
      [x + w - handleSize/2, y - handleSize/2], // top-right
      [x + w - handleSize/2, y + h - handleSize/2], // bottom-right
      [x - handleSize/2, y + h - handleSize/2] // bottom-left
    ];

    handles.forEach(([hx, hy]) => {
      ctx.fillRect(hx, hy, handleSize, handleSize);
    });

    // Draw rotation handle - use object's actual center for consistency
    const objCenterX = percentToPixelX(obj.x);
    const rotationHandleY = y - 30; // Match the increased distance
    ctx.beginPath();
    ctx.arc(objCenterX, rotationHandleY, 8, 0, 2 * Math.PI); // Larger handle
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw line from object to rotation handle
    ctx.beginPath();
    ctx.moveTo(objCenterX, y);
    ctx.lineTo(objCenterX, rotationHandleY);
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.stroke();

    ctx.restore();
  }, [percentToPixelX, percentToPixelY]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawObjectLocal = (ctx: CanvasRenderingContext2D, obj: CanvasObject) => {
      ctx.save();

      const centerX = percentToPixelX(obj.x);
      const centerY = percentToPixelY(obj.y);

      if (obj.rotation) {
        ctx.translate(centerX, centerY);
        ctx.rotate((obj.rotation * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);
      }

      switch (obj.type) {
        case 'rectangle':
          drawRectangle(ctx, obj as RectangleObject);
          break;
        case 'circle':
          drawCircle(ctx, obj as CircleObject);
          break;
        case 'text':
          drawText(ctx, obj as TextObject);
          break;
        case 'polygon':
          drawPolygon(ctx, obj as PolygonObject);
          break;
      }

      if (selectedObject && selectedObject.id === obj.id) {
        drawSelectionHandles(ctx, obj);
      }

      ctx.restore();
    };

    ctx.clearRect(0, 0, width, height);
    objects.forEach(obj => drawObjectLocal(ctx, obj));
    
    // Draw creation preview
    drawCreationPreview(ctx);
    
    // Draw polygon preview
    drawPolygonPreview(ctx);
  }, [objects, selectedObject, width, height, percentToPixelX, percentToPixelY, drawRectangle, drawCircle, drawText, drawPolygon, drawSelectionHandles, drawCreationPreview, drawPolygonPreview]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = pixelToPercentX(e.clientX - rect.left);
    const y = pixelToPercentY(e.clientY - rect.top);

    // Handle creation modes
    if (creationMode !== 'none') {
      if (creationMode === 'text') {
        // Show text input dialog
        setTextInputPos({ x: e.clientX, y: e.clientY });
        setShowTextInput(true);
        setTextInputValue('');
        // Store the position for when text is entered
        onStartCreation(x, y);
        return;
      } else if (creationMode === 'polygon') {
        // Add vertex to polygon
        onAddPolygonVertex(x, y);
        return;
      } else {
        // Start drag creation for rectangle/circle
        onStartCreation(x, y);
        return;
      }
    }

    // Check for handle interaction first if object is selected
    if (selectedObject) {
      const handle = getHandleAtPoint(x, y, selectedObject);
      if (handle) {
        onStartHandleInteraction(handle, x, y, selectedObject);
        return;
      }
    }

    // Normal selection/dragging mode
    const clickedObject = getObjectAtPoint(x, y);
    if (clickedObject) {
      onObjectClick(clickedObject.id);
      isDraggingRef.current = true;
      dragOffsetRef.current = {
        x: x - clickedObject.x,
        y: y - clickedObject.y
      };
    } else {
      onCanvasClick();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = pixelToPercentX(e.clientX - rect.left);
    const y = pixelToPercentY(e.clientY - rect.top);

    // Update current mouse position for creation preview
    setCurrentMousePos({ x, y });

    // Handle handle interactions (resize/rotate)
    if (handleInteraction && selectedObject) {
      if (handleInteraction.type === 'rotate') {
        onRotateObject(selectedObject.id, x, y);
      } else {
        onResizeObject(selectedObject.id, handleInteraction.type, x, y);
      }
      return;
    }

    // Handle creation mode updates
    if (isCreating && (creationMode === 'rectangle' || creationMode === 'circle')) {
      onUpdateCreation();
      return;
    }

    // Handle object dragging
    if (isDraggingRef.current && selectedObject) {
      onObjectDrag(
        selectedObject.id,
        x - dragOffsetRef.current.x,
        y - dragOffsetRef.current.y
      );
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // End handle interaction
    if (handleInteraction) {
      onEndHandleInteraction();
      return;
    }

    if (isCreating && (creationMode === 'rectangle' || creationMode === 'circle')) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = pixelToPercentX(e.clientX - rect.left);
      const y = pixelToPercentY(e.clientY - rect.top);
      
      onFinishCreation(x, y);
    }
    
    isDraggingRef.current = false;
  };

  const getCursorStyle = () => {
    switch (creationMode) {
      case 'rectangle':
      case 'circle':
      case 'polygon':
        return 'cursor-crosshair';
      case 'text':
        return 'cursor-text';
      default:
        return 'cursor-default';
    }
  };

  const handleTextSubmit = () => {
    if (textInputValue.trim() && creationStart) {
      onFinishCreation(creationStart.x, creationStart.y, textInputValue.trim());
    }
    setShowTextInput(false);
    setTextInputValue('');
    setTextInputPos(null);
  };

  const handleTextCancel = () => {
    setShowTextInput(false);
    setTextInputValue('');
    setTextInputPos(null);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`border-2 border-gray-300 rounded-lg bg-white ${getCursorStyle()}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {/* Text Input Modal */}
      {showTextInput && textInputPos && (
        <div 
          className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-3"
          style={{
            left: textInputPos.x,
            top: textInputPos.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="text-sm font-medium text-gray-700 mb-2">Enter text:</div>
          <input
            type="text"
            value={textInputValue}
            onChange={(e) => setTextInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTextSubmit();
              if (e.key === 'Escape') handleTextCancel();
            }}
            className="w-48 px-2 py-1 text-sm border border-gray-300 rounded mb-2"
            placeholder="Type your text..."
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleTextSubmit}
              className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
              disabled={!textInputValue.trim()}
            >
              Add Text
            </button>
            <button
              onClick={handleTextCancel}
              className="px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;