import { CanvasObject, RectangleObject, CircleObject, TextObject, PolygonObject, BoundingBox } from '@/app/drawit/types/drawit';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function calculateBoundingBox(obj: CanvasObject): BoundingBox {
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
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}