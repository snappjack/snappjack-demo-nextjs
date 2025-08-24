import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  DrawingState, 
  CanvasObject, 
  CreationMode,
  HandleType,
  RectangleParams,
  CircleParams,
  TextParams,
  PolygonParams
} from '@/app/drawit/types/drawit';
import { CanvasHandle } from '../components/Canvas';
import { DrawingEngine } from '../lib/DrawingEngine';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../lib/constants';

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
  
  const canvasRef = useRef<CanvasHandle>(null);
  const drawingStateRef = useRef(drawingState);
  const drawingEngineRef = useRef<DrawingEngine | null>(null);
  
  useEffect(() => {
    drawingStateRef.current = drawingState;
  }, [drawingState]);

  // Initialize drawing engine when colors change
  useEffect(() => {
    drawingEngineRef.current = new DrawingEngine(defaultStrokeColor, defaultFillColor);
  }, [defaultStrokeColor, defaultFillColor]);

  // Object creation methods
  const addRectangle = useCallback((params: RectangleParams) => {
    if (!drawingEngineRef.current) return null;
    
    const rectangle = drawingEngineRef.current.addRectangle(params);
    setDrawingState(prev => ({
      ...prev,
      objects: [...prev.objects, rectangle]
    }));
    
    return rectangle;
  }, []);

  const addCircle = useCallback((params: CircleParams) => {
    if (!drawingEngineRef.current) return null;
    
    const circle = drawingEngineRef.current.addCircle(params);
    setDrawingState(prev => ({
      ...prev,
      objects: [...prev.objects, circle]
    }));
    
    return circle;
  }, []);

  const addText = useCallback((params: TextParams) => {
    if (!drawingEngineRef.current) return null;
    
    const textObject = drawingEngineRef.current.addText(params);
    setDrawingState(prev => ({
      ...prev,
      objects: [...prev.objects, textObject]
    }));
    
    return textObject;
  }, []);

  const addPolygon = useCallback((params: PolygonParams) => {
    if (!drawingEngineRef.current) return null;
    
    const polygon = drawingEngineRef.current.addPolygon(params);
    setDrawingState(prev => ({
      ...prev,
      objects: [...prev.objects, polygon]
    }));
    
    return polygon;
  }, []);

  // Object manipulation methods
  const modifyObject = useCallback((id: string, updates: Partial<CanvasObject>) => {
    if (!drawingEngineRef.current) return null;
    
    const currentState = drawingStateRef.current;
    const { updatedObjects, updatedObject } = drawingEngineRef.current.modifyObject(currentState.objects, id, updates);
    
    setDrawingState(prev => ({
      ...prev,
      objects: updatedObjects,
      selectedObject: prev.selectedObject?.id === id ? updatedObject : prev.selectedObject
    }));
    
    return updatedObject;
  }, []);

  const deleteObject = useCallback((id: string) => {
    if (!drawingEngineRef.current) return;
    
    const currentState = drawingStateRef.current;
    const updatedObjects = drawingEngineRef.current.deleteObject(currentState.objects, id);
    
    setDrawingState(prev => ({
      ...prev,
      objects: updatedObjects,
      selectedObject: prev.selectedObject?.id === id ? null : prev.selectedObject
    }));
  }, []);

  const reorderObject = useCallback((id: string, operation: 'up' | 'down' | 'top' | 'bottom' | 'above' | 'below', referenceId?: string) => {
    if (!drawingEngineRef.current) return;
    
    const currentState = drawingStateRef.current;
    const updatedObjects = drawingEngineRef.current.reorderObject(currentState.objects, id, operation, referenceId);
    
    setDrawingState(prev => ({
      ...prev,
      objects: updatedObjects
    }));
  }, []);

  const clearCanvas = useCallback(() => {
    setDrawingState(prev => ({
      ...prev,
      objects: [],
      selectedObject: null
    }));
  }, []);

  const moveObject = useCallback((id: string, newX: number, newY: number) => {
    if (!drawingEngineRef.current) return;
    
    const currentState = drawingStateRef.current;
    const { updatedObjects, updatedObject } = drawingEngineRef.current.moveObject(currentState.objects, id, newX, newY);
    
    if (updatedObject) {
      setDrawingState(prev => ({
        ...prev,
        objects: updatedObjects,
        selectedObject: prev.selectedObject?.id === id ? updatedObject : prev.selectedObject
      }));
    }
  }, []);

  // Selection and UI state methods
  const selectObject = useCallback((id: string | null) => {
    if (id === null) {
      setDrawingState(prev => ({ ...prev, selectedObject: null }));
      return;
    }
    
    const obj = drawingStateRef.current.objects.find(o => o.id === id);
    if (obj) {
      setDrawingState(prev => ({ ...prev, selectedObject: obj }));
    }
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
              strokeWidth: 2,
              cornerRadius: 0
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

  const startHandleInteraction = useCallback((handleType: string, x: number, y: number, object: CanvasObject) => {
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

  const endHandleInteraction = useCallback(() => {
    setDrawingState(prev => ({
      ...prev,
      handleInteraction: null
    }));
  }, []);

  // Status and utility methods
  const getCanvasStatus = useCallback(() => {
    if (!drawingEngineRef.current) {
      return {
        canvasSize: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
        objectCount: 0,
        objects: [],
        selectedObjectId: null
      };
    }
    
    const currentState = drawingStateRef.current;
    return drawingEngineRef.current.getCanvasStatus(currentState.objects, currentState.selectedObject?.id || null);
  }, []);

  const getCanvasImage = useCallback((): string => {
    if (!canvasRef.current) {
      throw new Error('Canvas not available');
    }
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const base64Data = dataUrl.split(',')[1];
    return base64Data;
  }, []);

  // Load objects from file (used by file operations hook)
  const loadObjects = useCallback((objects: CanvasObject[]) => {
    setDrawingState(prev => ({
      ...prev,
      objects: objects,
      selectedObject: null,
      creationMode: 'none',
      isCreating: false,
      creationStart: null,
      polygonVertices: []
    }));
  }, []);

  return {
    // State
    drawingState,
    canvasRef,
    defaultStrokeColor,
    defaultFillColor,
    
    // State setters
    setDefaultStrokeColor,
    setDefaultFillColor,
    
    // Object creation
    addRectangle,
    addCircle,
    addText,
    addPolygon,
    
    // Object manipulation
    modifyObject,
    deleteObject,
    reorderObject,
    clearCanvas,
    moveObject,
    
    // Selection and UI
    selectObject,
    setCreationMode,
    startCreation,
    updateCreation,
    finishCreation,
    addPolygonVertex,
    finishPolygon,
    cancelCreation,
    startHandleInteraction,
    endHandleInteraction,
    
    // Status and utilities
    getCanvasStatus,
    getCanvasImage,
    loadObjects,
    
    // Constants
    CANVAS_WIDTH,
    CANVAS_HEIGHT
  };
};