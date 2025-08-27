import { 
  CanvasObject, 
  RectangleObject, 
  CircleObject, 
  TextObject, 
  PolygonObject,
  RectangleParams,
  CircleParams,
  TextParams,
  PolygonParams
} from '@/app/drawit/types/drawit';
import { CONSTRAINTS, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { clamp, calculateBoundingBox, generateId } from './geometry';
import { 
  validateRectangleParams, 
  validateCircleParams, 
  validateTextParams, 
  validatePolygonParams 
} from './validation';

// Parameter types now imported from shared types file

export class DrawingEngine {
  constructor(
    private defaultStrokeColor: string,
    private defaultFillColor: string,
    private defaultStrokeWidth: number = 2
  ) {}

  addRectangle(params: RectangleParams): RectangleObject {
    validateRectangleParams(params);
    
    const { 
      x = 50, 
      y = 50, 
      width = 20, 
      height = 15, 
      color = this.defaultStrokeColor, 
      fillColor = this.defaultFillColor, 
      strokeWidth = this.defaultStrokeWidth, 
      rotation = 0, 
      cornerRadius = 0  
    } = params;

    const id = generateId();
    const rectangle: RectangleObject = {
      id,
      name: `rectangle_${id}`,
      type: 'rectangle',
      x: clamp(x, CONSTRAINTS.common.position.min, CONSTRAINTS.common.position.max),
      y: clamp(y, CONSTRAINTS.common.position.min, CONSTRAINTS.common.position.max),
      width: clamp(width, CONSTRAINTS.rectangle.width.min, CONSTRAINTS.rectangle.width.max),
      height: clamp(height, CONSTRAINTS.rectangle.height.min, CONSTRAINTS.rectangle.height.max),
      color,
      fillColor,
      strokeWidth: clamp(strokeWidth, CONSTRAINTS.common.strokeWidth.min, CONSTRAINTS.common.strokeWidth.max),
      rotation: clamp(rotation, CONSTRAINTS.common.rotation.min, CONSTRAINTS.common.rotation.max),
      cornerRadius: clamp(cornerRadius, CONSTRAINTS.rectangle.cornerRadius.min, CONSTRAINTS.rectangle.cornerRadius.max),
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 } // Will be calculated below
    };
    
    rectangle.boundingBox = calculateBoundingBox(rectangle);
    return rectangle;
  }

  addCircle(params: CircleParams): CircleObject {
    validateCircleParams(params);
    
    const { 
      x = 50, 
      y = 50, 
      radius = 15, 
      color = this.defaultStrokeColor, 
      fillColor = this.defaultFillColor, 
      strokeWidth = this.defaultStrokeWidth, 
      rotation = 0 
    } = params;

    const id = generateId();
    const circle: CircleObject = {
      id,
      name: `circle_${id}`,
      type: 'circle',
      x: clamp(x, CONSTRAINTS.common.position.min, CONSTRAINTS.common.position.max),
      y: clamp(y, CONSTRAINTS.common.position.min, CONSTRAINTS.common.position.max),
      radius: clamp(radius, CONSTRAINTS.circle.radius.min, CONSTRAINTS.circle.radius.max),
      color,
      fillColor,
      strokeWidth: clamp(strokeWidth, CONSTRAINTS.common.strokeWidth.min, CONSTRAINTS.common.strokeWidth.max),
      rotation: clamp(rotation, CONSTRAINTS.common.rotation.min, CONSTRAINTS.common.rotation.max),
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 } // Will be calculated below
    };
    
    circle.boundingBox = calculateBoundingBox(circle);
    return circle;
  }

  addText(params: TextParams): TextObject {
    validateTextParams(params);
    
    const { 
      x = 50, 
      y = 50, 
      text = 'Text', 
      fontSize = 5, 
      color = this.defaultStrokeColor, 
      fontFamily = 'Arial', 
      fontWeight = 'normal', 
      rotation = 0 
    } = params;

    const id = generateId();
    const textObject: TextObject = {
      id,
      name: `text_${id}`,
      type: 'text',
      x: clamp(x, CONSTRAINTS.common.position.min, CONSTRAINTS.common.position.max),
      y: clamp(y, CONSTRAINTS.common.position.min, CONSTRAINTS.common.position.max),
      text,
      fontSize: clamp(fontSize, CONSTRAINTS.text.fontSize.min, CONSTRAINTS.text.fontSize.max),
      color,
      fontFamily,
      fontWeight,
      rotation: clamp(rotation, CONSTRAINTS.common.rotation.min, CONSTRAINTS.common.rotation.max),
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 } // Will be calculated below
    };
    
    textObject.boundingBox = calculateBoundingBox(textObject);
    return textObject;
  }

  addPolygon(params: PolygonParams): PolygonObject {
    validatePolygonParams(params);
    
    const { 
      vertices = [
        { x: 50, y: 20 }, 
        { x: 30, y: 60 }, 
        { x: 70, y: 60 }
      ], 
      color = this.defaultStrokeColor, 
      fillColor = this.defaultFillColor, 
      strokeWidth = this.defaultStrokeWidth, 
      rotation = 0 
    } = params;

    const validatedVertices = vertices.map(vertex => ({
      x: clamp(vertex.x, CONSTRAINTS.common.position.min, CONSTRAINTS.common.position.max),
      y: clamp(vertex.y, CONSTRAINTS.common.position.min, CONSTRAINTS.common.position.max)
    }));
    
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
      strokeWidth: clamp(strokeWidth, CONSTRAINTS.common.strokeWidth.min, CONSTRAINTS.common.strokeWidth.max),
      rotation: clamp(rotation, CONSTRAINTS.common.rotation.min, CONSTRAINTS.common.rotation.max),
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 } // Will be calculated below
    };
    
    polygon.boundingBox = calculateBoundingBox(polygon);
    return polygon;
  }

  modifyObject(objects: CanvasObject[], id: string, updates: Partial<CanvasObject>): { updatedObjects: CanvasObject[], updatedObject: CanvasObject } {
    const objectIndex = objects.findIndex(obj => obj.id === id);
    
    if (objectIndex === -1) {
      throw new Error(`Object with ID "${id}" not found`);
    }
    
    const existingObject = objects[objectIndex];
    const updatedObject = { ...existingObject, ...updates } as CanvasObject;
    updatedObject.boundingBox = calculateBoundingBox(updatedObject);
    
    const updatedObjects = objects.map((obj, i) => i === objectIndex ? updatedObject : obj);
    
    return { updatedObjects, updatedObject };
  }

  deleteObject(objects: CanvasObject[], id: string): CanvasObject[] {
    return objects.filter(obj => obj.id !== id);
  }

  reorderObject(objects: CanvasObject[], id: string, operation: 'up' | 'down' | 'top' | 'bottom' | 'above' | 'below', referenceId?: string): CanvasObject[] {
    const currentIndex = objects.findIndex(obj => obj.id === id);
    
    if (currentIndex === -1) {
      throw new Error(`Object with ID "${id}" not found`);
    }
    
    let newIndex = currentIndex;
    
    switch (operation) {
      case 'up':
        newIndex = Math.min(currentIndex + 1, objects.length - 1);
        break;
      case 'down':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'top':
        newIndex = objects.length - 1;
        break;
      case 'bottom':
        newIndex = 0;
        break;
      case 'above':
      case 'below':
        if (!referenceId) {
          throw new Error(`Reference ID is required for "${operation}" operation`);
        }
        const referenceIndex = objects.findIndex(obj => obj.id === referenceId);
        if (referenceIndex === -1) {
          throw new Error(`Reference object with ID "${referenceId}" not found`);
        }
        if (operation === 'above') {
          // Place object in front of (after) the reference object in array
          newIndex = referenceIndex + 1;
          // If we're moving an object from before the reference, adjust for the removal
          if (currentIndex < referenceIndex) {
            newIndex = referenceIndex;
          }
        } else { // below
          // Place object behind (before) the reference object in array
          newIndex = referenceIndex;
          // If we're moving an object from after the reference, adjust for the removal
          if (currentIndex > referenceIndex) {
            newIndex = referenceIndex;
          }
        }
        break;
    }
    
    if (newIndex !== currentIndex) {
      const newObjects = [...objects];
      const [movedObject] = newObjects.splice(currentIndex, 1);
      newObjects.splice(newIndex, 0, movedObject);
      return newObjects;
    }
    
    return objects;
  }

  moveObject(objects: CanvasObject[], id: string, newX: number, newY: number): { updatedObjects: CanvasObject[], updatedObject: CanvasObject | null } {
    const objectIndex = objects.findIndex(obj => obj.id === id);
    
    if (objectIndex === -1) {
      return { updatedObjects: objects, updatedObject: null };
    }
    
    const originalObject = objects[objectIndex];
    
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
    
    const updatedObjects = objects.map((obj, i) => i === objectIndex ? updatedObject : obj);
    
    return { updatedObjects, updatedObject };
  }

  getCanvasStatus(objects: CanvasObject[], selectedObjectId: string | null) {
    return {
      canvasSize: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
      objectCount: objects.length,
      objects: objects,
      selectedObjectId: selectedObjectId
    };
  }
}