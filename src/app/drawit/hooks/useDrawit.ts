import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  DrawingState, 
  CanvasObject, 
  CanvasStatus, 
  RectangleObject, 
  CircleObject, 
  TextObject, 
  PolygonObject,
  BoundingBox 
} from '@/types/drawit';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export const useDrawit = () => {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    objects: [],
    selectedObject: null,
    isDragging: false,
  });
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingStateRef = useRef(drawingState);
  
  useEffect(() => {
    drawingStateRef.current = drawingState;
  }, [drawingState]);

  const generateId = useCallback((): string => {
    return Math.random().toString(36).substr(2, 9);
  }, []);

  const clamp = useCallback((value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  }, []);

  const validateColor = useCallback((color: string): boolean => {
    const div = document.createElement('div');
    div.style.color = color;
    return div.style.color !== '';
  }, []);

  const calculateBoundingBox = useCallback((obj: CanvasObject): BoundingBox => {
    let minX: number, minY: number, maxX: number, maxY: number;
    
    switch (obj.type) {
      case 'rectangle':
        const rect = obj as RectangleObject;
        const halfWidth = rect.width / 2;
        const halfHeight = rect.height / 2;
        minX = obj.x - halfWidth;
        minY = obj.y - halfHeight;
        maxX = obj.x + halfWidth;
        maxY = obj.y + halfHeight;
        break;
        
      case 'circle':
        const circle = obj as CircleObject;
        const radiusX = circle.radius;
        const radiusY = circle.radius;
        minX = obj.x - radiusX;
        minY = obj.y - radiusY;
        maxX = obj.x + radiusX;
        maxY = obj.y + radiusY;
        break;
        
      case 'text':
        const text = obj as TextObject;
        const estimatedCharWidth = text.fontSize * 0.6;
        const estimatedWidth = Math.min(text.text.length * estimatedCharWidth, 100);
        const estimatedHeight = text.fontSize;
        const halfEstimatedWidth = estimatedWidth / 2;
        const halfEstimatedHeight = estimatedHeight / 2;
        minX = obj.x - halfEstimatedWidth;
        minY = obj.y - halfEstimatedHeight;
        maxX = obj.x + halfEstimatedWidth;
        maxY = obj.y + halfEstimatedHeight;
        break;
        
      case 'polygon':
        const polygon = obj as PolygonObject;
        if (polygon.vertices.length === 0) {
          minX = obj.x;
          minY = obj.y;
          maxX = obj.x;
          maxY = obj.y;
        } else {
          minX = Math.min(...polygon.vertices.map(v => v.x));
          minY = Math.min(...polygon.vertices.map(v => v.y));
          maxX = Math.max(...polygon.vertices.map(v => v.x));
          maxY = Math.max(...polygon.vertices.map(v => v.y));
        }
        break;
    }
    
    minX = Math.max(0, minX);
    minY = Math.max(0, minY);
    maxX = Math.min(100, maxX);
    maxY = Math.min(100, maxY);
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    return { minX, minY, maxX, maxY, width, height };
  }, []);

  const getSystemInfo = useCallback((): string => {
    const objectCount = drawingStateRef.current.objects.length;
    const currentTime = new Date().toLocaleString();
    
    const docs = `# DrawIt Canvas System

**System Status**: Active at ${currentTime}
**Current Objects**: ${objectCount} objects on canvas
**Canvas Size**: ${CANVAS_WIDTH}×${CANVAS_HEIGHT} pixels

## Coordinate System
- **Percentage-based**: All positions use 0-100% instead of pixels
- **Center-point positioning**: All coordinates specify object centers, not corners/edges
- **Canvas bounds**: Objects automatically clamped to stay within canvas
- **Examples**: (50, 50) = center of canvas, (0, 0) = top-left, (100, 100) = bottom-right

## Size and Positioning
- **Rectangles**: width/height as % of canvas dimensions
- **Circles**: radius as % of smaller canvas dimension (max 50%)
- **Text**: fontSize as % of canvas height
- **Polygons**: defined by array of vertices (x,y coordinates as %), automatically closed, 3-50 vertices
- **Rotation**: All objects can rotate around their center point (-360° to 360°)

## Object Management
- **Unified Tools**: Each object type has one tool that creates (no ID) or modifies (with ID)
- **Type Safety**: Tools are object-specific - use \`rectangle\` for rectangles, \`circle\` for circles, etc.
- **Deletion**: Remove objects by ID using \`deleteObject\`
- **Status Check**: Use \`getStatus\` to see complete object list with all properties and positions
- **Reordering**: Move objects up/down in drawing stack or to front/back with \`reorderObject\`
- **Drawing order**: Objects drawn in array order (later = on top)
- **Bounding boxes**: Automatic calculation and tracking in percentage coordinates
- **Validation**: All parameters automatically validated and clamped to safe ranges

## Available Tools
- **Object Tools**: \`rectangle\`, \`circle\`, \`text\`, \`polygon\` (create new without ID, modify existing with ID)
- **Management**: \`reorderObject\`, \`deleteObject\`
- **Status**: \`getStatus\` - returns complete object list and canvas info
- **Utility**: \`clearCanvas\`
- **Info**: \`systemInfo.get\` - returns this documentation

## Interactive Canvas Features
- **Object Selection**: Click on any object to select it (shows blue highlight)
- **Object Movement**: Drag selected objects to move them around the canvas
- **Visual Feedback**: Selected objects are highlighted with a blue dashed outline

## Usage Examples
- **Create rectangle**: \`rectangle(x: 50, y: 50, width: 20, height: 10, color: "blue")\`
- **Modify rectangle**: \`rectangle(id: "abc123", color: "red", width: 30)\`
- **Create circle**: \`circle(x: 25, y: 75, radius: 15, color: "green")\`
- **Modify text**: \`text(id: "xyz789", fontSize: 8, color: "purple")\`
- **Create triangle**: \`polygon(vertices: [{x: 50, y: 20}, {x: 30, y: 60}, {x: 70, y: 60}], color: "red")\`
- **Create diamond**: \`polygon(vertices: [{x: 50, y: 10}, {x: 80, y: 50}, {x: 50, y: 90}, {x: 20, y: 50}], color: "blue", fillColor: "lightblue")\`
- **Modify polygon**: \`polygon(id: "def456", color: "orange", strokeWidth: 3)\`
- **Check everything**: \`getStatus()\` - Get complete object list with all properties

## Recommended Workflow
1. **Check Status**: Use \`getStatus\` to see current objects
2. **Create/Modify**: Use object tools (\`rectangle\`, \`circle\`, \`text\`, \`polygon\`) to build your design
3. **Fine-tune**: Modify specific objects by their ID to adjust properties
4. **Reorder**: Use \`reorderObject\` to change drawing order if needed
5. **Validate**: Use \`getStatus\` again to see the updated result

## Special Notes for Polygons
- **Auto-closing**: Polygons automatically connect the last vertex back to the first
- **Vertex limits**: Minimum 3 vertices, maximum 50 vertices
- **Center calculation**: Object center is calculated as the centroid of all vertices
- **Flexibility**: Great for creating custom shapes like triangles, pentagons, stars, arrows, etc.

## Color and Styling
- **Colors**: Any valid CSS color (e.g., "red", "#FF0000", "rgb(255,0,0)")
- **Fill vs Stroke**: Objects can have both fillColor and stroke color
- **Stroke Width**: Adjustable line thickness (1-20 pixels)
- **Corner Radius**: Rectangles support rounded corners (0-50% of smaller dimension)`;
    
    return docs;
  }, []);

  const addRectangle = useCallback((params: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    fillColor?: string;
    strokeWidth?: number;
    rotation?: number;
    cornerRadius?: number;
  }): RectangleObject => {
    
    const { x, y, width, height, color, fillColor, strokeWidth, rotation, cornerRadius } = params;
    
    if (!validateColor(color)) {
      throw new Error(`Invalid color: ${color}`);
    }
    if (fillColor && !validateColor(fillColor)) {
      throw new Error(`Invalid fill color: ${fillColor}`);
    }
    
    const rectangle: RectangleObject = {
      id: generateId(),
      type: 'rectangle',
      x: clamp(x, 0, 100),
      y: clamp(y, 0, 100),
      width: clamp(width, 1, 100),
      height: clamp(height, 1, 100),
      color,
      fillColor,
      strokeWidth: strokeWidth ? clamp(strokeWidth, 1, 20) : 2,
      rotation: rotation ? clamp(rotation, -360, 360) : 0,
      cornerRadius: cornerRadius ? clamp(cornerRadius, 0, 50) : undefined,
      boundingBox: {} as BoundingBox
    };
    
    rectangle.boundingBox = calculateBoundingBox(rectangle);
    
    setDrawingState(prev => ({
      ...prev,
      objects: [...prev.objects, rectangle]
    }));
    
    return rectangle;
  }, [generateId, validateColor, clamp, calculateBoundingBox]);

  const addCircle = useCallback((params: {
    x: number;
    y: number;
    radius: number;
    color: string;
    fillColor?: string;
    strokeWidth?: number;
    rotation?: number;
  }): CircleObject => {
    
    const { x, y, radius, color, fillColor, strokeWidth, rotation } = params;
    
    if (!validateColor(color)) {
      throw new Error(`Invalid color: ${color}`);
    }
    if (fillColor && !validateColor(fillColor)) {
      throw new Error(`Invalid fill color: ${fillColor}`);
    }
    
    const circle: CircleObject = {
      id: generateId(),
      type: 'circle',
      x: clamp(x, 0, 100),
      y: clamp(y, 0, 100),
      radius: clamp(radius, 1, 50),
      color,
      fillColor,
      strokeWidth: strokeWidth ? clamp(strokeWidth, 1, 20) : 2,
      rotation: rotation ? clamp(rotation, -360, 360) : 0,
      boundingBox: {} as BoundingBox
    };
    
    circle.boundingBox = calculateBoundingBox(circle);
    
    setDrawingState(prev => ({
      ...prev,
      objects: [...prev.objects, circle]
    }));
    
    return circle;
  }, [generateId, validateColor, clamp, calculateBoundingBox]);

  const addText = useCallback((params: {
    x: number;
    y: number;
    text: string;
    fontSize: number;
    color: string;
    fontFamily?: string;
    fontWeight?: string;
    rotation?: number;
  }): TextObject => {
    
    const { x, y, text, fontSize, color, fontFamily, fontWeight, rotation } = params;
    
    if (!validateColor(color)) {
      throw new Error(`Invalid color: ${color}`);
    }
    if (text.length === 0) {
      throw new Error('Text cannot be empty');
    }
    
    const textObject: TextObject = {
      id: generateId(),
      type: 'text',
      x: clamp(x, 0, 100),
      y: clamp(y, 0, 100),
      text,
      fontSize: clamp(fontSize, 1, 50),
      color,
      fontFamily: fontFamily || 'Arial',
      fontWeight: fontWeight || 'normal',
      rotation: rotation ? clamp(rotation, -360, 360) : 0,
      boundingBox: {} as BoundingBox
    };
    
    textObject.boundingBox = calculateBoundingBox(textObject);
    
    setDrawingState(prev => ({
      ...prev,
      objects: [...prev.objects, textObject]
    }));
    
    return textObject;
  }, [generateId, validateColor, clamp, calculateBoundingBox]);

  const addPolygon = useCallback((params: {
    vertices: Array<{ x: number; y: number }>;
    color: string;
    fillColor?: string;
    strokeWidth?: number;
    rotation?: number;
  }): PolygonObject => {
    
    const { vertices, color, fillColor, strokeWidth, rotation } = params;
    
    if (!validateColor(color)) {
      throw new Error(`Invalid color: ${color}`);
    }
    if (fillColor && !validateColor(fillColor)) {
      throw new Error(`Invalid fill color: ${fillColor}`);
    }
    if (vertices.length < 3) {
      throw new Error('Polygon must have at least 3 vertices');
    }
    if (vertices.length > 50) {
      throw new Error('Polygon cannot have more than 50 vertices');
    }
    
    const validatedVertices = vertices.map((vertex, index) => {
      if (typeof vertex.x !== 'number' || typeof vertex.y !== 'number') {
        throw new Error(`Vertex ${index + 1} must have numeric x and y coordinates`);
      }
      return {
        x: clamp(vertex.x, 0, 100),
        y: clamp(vertex.y, 0, 100)
      };
    });
    
    const centerX = validatedVertices.reduce((sum, v) => sum + v.x, 0) / validatedVertices.length;
    const centerY = validatedVertices.reduce((sum, v) => sum + v.y, 0) / validatedVertices.length;
    
    const polygon: PolygonObject = {
      id: generateId(),
      type: 'polygon',
      x: centerX,
      y: centerY,
      vertices: validatedVertices,
      color,
      fillColor,
      strokeWidth: strokeWidth ? clamp(strokeWidth, 1, 20) : 2,
      rotation: rotation ? clamp(rotation, -360, 360) : 0,
      boundingBox: {} as BoundingBox
    };
    
    polygon.boundingBox = calculateBoundingBox(polygon);
    
    setDrawingState(prev => ({
      ...prev,
      objects: [...prev.objects, polygon]
    }));
    
    return polygon;
  }, [generateId, validateColor, clamp, calculateBoundingBox]);

  const modifyObject = useCallback((id: string, updates: Partial<CanvasObject>): CanvasObject => {
    
    const currentState = drawingStateRef.current;
    const objectIndex = currentState.objects.findIndex(obj => obj.id === id);
    
    if (objectIndex === -1) {
      throw new Error(`Object with ID "${id}" not found`);
    }
    
    const existingObject = currentState.objects[objectIndex];
    const updatedObject = { ...existingObject, ...updates } as CanvasObject;
    updatedObject.boundingBox = calculateBoundingBox(updatedObject);
    
    setDrawingState(prev => ({
      ...prev,
      objects: prev.objects.map((obj, i) => i === objectIndex ? updatedObject : obj)
    }));
    
    return updatedObject;
  }, [calculateBoundingBox]);

  const deleteObject = useCallback((id: string): void => {
    
    setDrawingState(prev => ({
      ...prev,
      objects: prev.objects.filter(obj => obj.id !== id),
      selectedObject: prev.selectedObject?.id === id ? null : prev.selectedObject
    }));
  }, []);

  const reorderObject = useCallback((id: string, operation: 'up' | 'down' | 'top' | 'bottom'): void => {
    
    const currentState = drawingStateRef.current;
    const currentIndex = currentState.objects.findIndex(obj => obj.id === id);
    
    if (currentIndex === -1) {
      throw new Error(`Object with ID "${id}" not found`);
    }
    
    let newIndex = currentIndex;
    
    switch (operation) {
      case 'up':
        newIndex = Math.min(currentIndex + 1, currentState.objects.length - 1);
        break;
      case 'down':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'top':
        newIndex = currentState.objects.length - 1;
        break;
      case 'bottom':
        newIndex = 0;
        break;
    }
    
    if (newIndex !== currentIndex) {
      setDrawingState(prev => {
        const newObjects = [...prev.objects];
        const [movedObject] = newObjects.splice(currentIndex, 1);
        newObjects.splice(newIndex, 0, movedObject);
        return { ...prev, objects: newObjects };
      });
    }
  }, []);

  const clearCanvas = useCallback((): void => {
    setDrawingState(prev => ({
      ...prev,
      objects: [],
      selectedObject: null
    }));
  }, []);

  const selectObject = useCallback((id: string | null): void => {
    if (id === null) {
      setDrawingState(prev => ({ ...prev, selectedObject: null }));
      return;
    }
    
    const obj = drawingStateRef.current.objects.find(o => o.id === id);
    if (obj) {
      setDrawingState(prev => ({ ...prev, selectedObject: obj }));
    }
  }, []);

  const moveObject = useCallback((id: string, newX: number, newY: number): void => {
    const currentState = drawingStateRef.current;
    const objectIndex = currentState.objects.findIndex(obj => obj.id === id);
    
    if (objectIndex === -1) return;
    
    const updatedObject = {
      ...currentState.objects[objectIndex],
      x: clamp(newX, 0, 100),
      y: clamp(newY, 0, 100)
    };
    
    updatedObject.boundingBox = calculateBoundingBox(updatedObject);
    
    setDrawingState(prev => ({
      ...prev,
      objects: prev.objects.map((obj, i) => i === objectIndex ? updatedObject : obj),
      selectedObject: prev.selectedObject?.id === id ? updatedObject : prev.selectedObject
    }));
  }, [clamp, calculateBoundingBox]);

  const getCanvasStatus = useCallback((): CanvasStatus => {
    const currentState = drawingStateRef.current;
    return {
      canvasSize: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
      objectCount: currentState.objects.length,
      objects: currentState.objects,
      selectedObjectId: currentState.selectedObject?.id || null
    };
  }, []);

  return {
    drawingState,
    canvasRef,
    getSystemInfo,
    addRectangle,
    addCircle,
    addText,
    addPolygon,
    modifyObject,
    deleteObject,
    reorderObject,
    clearCanvas,
    selectObject,
    moveObject,
    getCanvasStatus,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
  };
};