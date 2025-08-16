import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  DrawingState, 
  CanvasObject, 
  CanvasStatus, 
  RectangleObject, 
  CircleObject, 
  TextObject, 
  PolygonObject,
  BoundingBox,
  CreationMode,
  HandleType 
} from '@/types/drawit';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;

export const useDrawit = () => {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    objects: [],
    selectedObject: null,
    isDragging: false,
    creationMode: 'none',
    isCreating: false,
    creationStart: null,
    polygonVertices: [],
    handleInteraction: null,
  });

  const [defaultStrokeColor, setDefaultStrokeColor] = useState('#4B5563'); // Dark gray
  const [defaultFillColor, setDefaultFillColor] = useState('#7895A1'); // Slate blue
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingStateRef = useRef(drawingState);
  
  useEffect(() => {
    drawingStateRef.current = drawingState;
  }, [drawingState]);

  const generateId = useCallback((): string => {
    return Math.random().toString(36).substring(2, 11);
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
    
    // Don't clamp bounding box to canvas bounds - allow objects to extend outside
    // This preserves shape integrity when dragging near edges
    
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
**Canvas Size**: ${CANVAS_WIDTH}×${CANVAS_HEIGHT} pixels (square format)

## Coordinate System
- **Percentage-based**: All positions use 0-100% instead of pixels
- **Square canvas**: 800×800 pixels means 1% X = 1% Y for consistent scaling
- **Center-point positioning**: All coordinates specify object centers, not corners/edges
- **Canvas bounds**: Objects automatically clamped to stay within canvas
- **Examples**: (50, 50) = center of canvas, (0, 0) = top-left, (100, 100) = bottom-right

## Size and Positioning
- **Rectangles**: width/height as % of canvas dimensions
- **Circles**: radius as % of canvas dimension (max 50%)
- **Text**: fontSize as % of canvas height
- **Polygons**: defined by array of vertices (x,y coordinates as %), automatically closed, 3-50 vertices
- **Rotation**: All objects can rotate around their center point (-360° to 360°)

## Object Management
- **Object Names**: Every object has a unique \`name\` property (defaults to type_id like "rectangle_abc123")
- **Renaming Objects**: Use any object tool with \`id\` and \`name\` parameters to rename (e.g., \`rectangle(id: "abc123", name: "Sky")\`)
- **Unified Tools**: Each object type has one tool that creates (no ID) or modifies (with ID)
- **Type Safety**: Tools are object-specific - use \`rectangle\` for rectangles, \`circle\` for circles, etc.
- **Deletion**: Remove objects by ID using \`deleteObject\`
- **Status Check**: Use \`getStatus\` to see complete object list with all properties including names
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
- **Rename object**: \`rectangle(id: "abc123", name: "Sky Background")\`
- **Modify rectangle**: \`rectangle(id: "abc123", color: "red", width: 30)\`
- **Create circle**: \`circle(x: 25, y: 75, radius: 15, color: "green")\`
- **Rename and modify**: \`circle(id: "xyz789", name: "Sun", color: "yellow", fillColor: "orange")\`
- **Modify text**: \`text(id: "xyz789", fontSize: 8, color: "purple")\`
- **Create triangle**: \`polygon(vertices: [{x: 50, y: 20}, {x: 30, y: 60}, {x: 70, y: 60}], color: "red")\`
- **Create diamond**: \`polygon(vertices: [{x: 50, y: 10}, {x: 80, y: 50}, {x: 50, y: 90}, {x: 20, y: 50}], color: "blue", fillColor: "lightblue")\`
- **Rename polygon**: \`polygon(id: "def456", name: "Mountain", color: "orange", strokeWidth: 3)\`
- **Check everything**: \`getStatus()\` - Get complete object list with all properties including names

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
    
    const id = generateId();
    const rectangle: RectangleObject = {
      id,
      name: `rectangle_${id}`,
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
    
    const id = generateId();
    const circle: CircleObject = {
      id,
      name: `circle_${id}`,
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
    
    const id = generateId();
    const textObject: TextObject = {
      id,
      name: `text_${id}`,
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
    
    const id = generateId();
    const polygon: PolygonObject = {
      id,
      name: `polygon_${id}`,
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
      objects: prev.objects.map((obj, i) => i === objectIndex ? updatedObject : obj),
      selectedObject: prev.selectedObject?.id === id ? updatedObject : prev.selectedObject
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
    
    const originalObject = currentState.objects[objectIndex];
    
    let updatedObject = {
      ...originalObject,
      x: newX,
      y: newY
    };
    
    // Special handling for polygons - move vertices to match new center
    if (originalObject.type === 'polygon') {
      const polygon = originalObject as PolygonObject;
      const deltaX = newX - originalObject.x;
      const deltaY = newY - originalObject.y;
      
      const updatedVertices = polygon.vertices.map(vertex => ({
        x: vertex.x + deltaX,
        y: vertex.y + deltaY
      }));
      
      updatedObject = {
        ...updatedObject,
        vertices: updatedVertices
      } as PolygonObject;
    }
    
    updatedObject.boundingBox = calculateBoundingBox(updatedObject);
    
    setDrawingState(prev => ({
      ...prev,
      objects: prev.objects.map((obj, i) => i === objectIndex ? updatedObject : obj),
      selectedObject: prev.selectedObject?.id === id ? updatedObject : prev.selectedObject
    }));
  }, [calculateBoundingBox]);

  const getCanvasStatus = useCallback((): CanvasStatus => {
    const currentState = drawingStateRef.current;
    return {
      canvasSize: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
      objectCount: currentState.objects.length,
      objects: currentState.objects,
      selectedObjectId: currentState.selectedObject?.id || null
    };
  }, []);

  const setCreationMode = useCallback((mode: CreationMode) => {
    setDrawingState(prev => ({
      ...prev,
      creationMode: mode,
      selectedObject: null,
      polygonVertices: mode === 'polygon' ? [] : prev.polygonVertices
    }));
  }, []);

  const startCreation = useCallback((x: number, y: number) => {
    setDrawingState(prev => ({
      ...prev,
      isCreating: true,
      creationStart: { x, y }
    }));
  }, []);

  const updateCreation = useCallback(() => {
    // This will be used for real-time preview during creation
    // Implementation will be in Canvas component
  }, []);

  const finishCreation = useCallback((x: number, y: number, text?: string) => {
    const currentState = drawingStateRef.current;
    if (!currentState.creationStart || !currentState.isCreating) return;

    const startX = currentState.creationStart.x;
    const startY = currentState.creationStart.y;

    try {
      switch (currentState.creationMode) {
        case 'rectangle': {
          const centerX = (startX + x) / 2;
          const centerY = (startY + y) / 2;
          const width = Math.abs(x - startX);
          const height = Math.abs(y - startY);
          if (width > 1 && height > 1) {
            addRectangle({
              x: centerX,
              y: centerY,
              width,
              height,
              color: defaultStrokeColor,
              fillColor: defaultFillColor,
              strokeWidth: 2
            });
          }
          break;
        }
        case 'circle': {
          const distanceInPercent = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
          // Convert to radius as percentage of smaller canvas dimension
          const radius = Math.min(distanceInPercent, 50);
          if (radius > 1) {
            addCircle({
              x: startX,
              y: startY,
              radius: radius,
              color: defaultStrokeColor,
              fillColor: defaultFillColor,
              strokeWidth: 2
            });
          }
          break;
        }
        case 'text': {
          if (text && text.trim()) {
            addText({
              x: startX,
              y: startY,
              text: text.trim(),
              fontSize: 5,
              color: defaultStrokeColor
            });
          }
          break;
        }
      }
    } catch (error) {
      console.error('Creation failed:', error);
    }

    // Reset creation state
    setDrawingState(prev => ({
      ...prev,
      isCreating: false,
      creationStart: null,
      creationMode: 'none'
    }));
  }, [addRectangle, addCircle, addText, defaultStrokeColor, defaultFillColor]);

  const finishPolygon = useCallback(() => {
    const currentState = drawingStateRef.current;
    if (currentState.polygonVertices.length >= 3) {
      try {
        addPolygon({
          vertices: currentState.polygonVertices,
          color: defaultStrokeColor,
          fillColor: defaultFillColor,
          strokeWidth: 2
        });
      } catch (error) {
        console.error('Polygon creation failed:', error);
      }
    }
    
    setDrawingState(prev => ({
      ...prev,
      polygonVertices: [],
      creationMode: 'none'
    }));
  }, [addPolygon, defaultStrokeColor, defaultFillColor]);

  const addPolygonVertex = useCallback((x: number, y: number) => {
    setDrawingState(prev => ({
      ...prev,
      polygonVertices: [...prev.polygonVertices, { x, y }]
    }));
  }, []);

  const cancelCreation = useCallback(() => {
    setDrawingState(prev => ({
      ...prev,
      isCreating: false,
      creationStart: null,
      creationMode: 'none',
      polygonVertices: []
    }));
  }, []);

  const resizeObject = useCallback((id: string, handleType: string, newX: number, newY: number): void => {
    const currentState = drawingStateRef.current;
    const objectIndex = currentState.objects.findIndex(obj => obj.id === id);
    
    if (objectIndex === -1 || !currentState.handleInteraction) return;
    
    const originalObject = currentState.handleInteraction.startObject;
    let updatedObject = { ...currentState.objects[objectIndex] };
    
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
    
    // Calculate resize based on handle type
    if (originalObject.type === 'rectangle') {
      updatedObject = updatedObject as RectangleObject;
      const rect = updatedObject as RectangleObject;
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
      const startMouseX = currentState.handleInteraction.startX;
      const startMouseY = currentState.handleInteraction.startY;
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
      rect.x = newCenterX;
      rect.y = newCenterY;
      rect.width = Math.max(1, projectedWidth);
      rect.height = Math.max(1, projectedHeight);
    } else if (originalObject.type === 'circle') {
      const circle = updatedObject as CircleObject;
      const startCircle = originalObject as CircleObject;
      
      // For circles, all resize handles adjust the radius
      // Use the local transformed coordinates for consistent behavior
      const deltaX = Math.abs(localNew.x - startCircle.x);
      const deltaY = Math.abs(localNew.y - startCircle.y);
      const newRadius = Math.max(1, Math.min(50, Math.max(deltaX, deltaY)));
      circle.radius = newRadius;
    }
    
    updatedObject.boundingBox = calculateBoundingBox(updatedObject);
    
    setDrawingState(prev => ({
      ...prev,
      objects: prev.objects.map((obj, i) => i === objectIndex ? updatedObject : obj),
      selectedObject: prev.selectedObject?.id === id ? updatedObject : prev.selectedObject
    }));
  }, [calculateBoundingBox]);

  const rotateObject = useCallback((id: string, mouseX: number, mouseY: number): void => {
    const currentState = drawingStateRef.current;
    const objectIndex = currentState.objects.findIndex(obj => obj.id === id);
    
    if (objectIndex === -1) return;
    
    const object = currentState.objects[objectIndex];
    
    // Calculate angle from object center to mouse position
    const deltaX = mouseX - object.x;
    const deltaY = mouseY - object.y;
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    
    // Normalize angle to -180 to 180 range
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;
    
    const updatedObject = {
      ...object,
      rotation: angle
    };
    
    updatedObject.boundingBox = calculateBoundingBox(updatedObject);
    
    setDrawingState(prev => ({
      ...prev,
      objects: prev.objects.map((obj, i) => i === objectIndex ? updatedObject : obj),
      selectedObject: prev.selectedObject?.id === id ? updatedObject : prev.selectedObject
    }));
  }, [calculateBoundingBox]);

  const startHandleInteraction = useCallback((handleType: string, x: number, y: number, object: CanvasObject): void => {
    setDrawingState(prev => ({
      ...prev,
      handleInteraction: {
        type: handleType as HandleType,
        startX: x,
        startY: y,
        startObject: { ...object }
      }
    }));
  }, []);

  const endHandleInteraction = useCallback((): void => {
    setDrawingState(prev => ({
      ...prev,
      handleInteraction: null
    }));
  }, []);

  const saveCanvas = useCallback(() => {
    const currentState = drawingStateRef.current;
    const saveData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      objects: currentState.objects,
      canvasSize: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }
    };
    
    const dataStr = JSON.stringify(saveData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `drawit-canvas-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

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
          
          // Clear current canvas and load new objects
          setDrawingState(prev => ({
            ...prev,
            objects: saveData.objects,
            selectedObject: null,
            creationMode: 'none',
            isCreating: false,
            creationStart: null,
            polygonVertices: []
          }));
          
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
    setCreationMode,
    startCreation,
    updateCreation,
    finishCreation,
    addPolygonVertex,
    finishPolygon,
    cancelCreation,
    resizeObject,
    rotateObject,
    startHandleInteraction,
    endHandleInteraction,
    saveCanvas,
    loadCanvas,
    defaultStrokeColor,
    defaultFillColor,
    setDefaultStrokeColor,
    setDefaultFillColor,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
  };
};