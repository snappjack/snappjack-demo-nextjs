export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface BaseCanvasObject {
  id: string;
  type: 'rectangle' | 'circle' | 'text' | 'polygon';
  x: number; // center x position as percentage (0-100)
  y: number; // center y position as percentage (0-100)
  color: string;
  rotation?: number;
  boundingBox: BoundingBox;
}

export interface RectangleObject extends BaseCanvasObject {
  type: 'rectangle';
  width: number; // width as percentage of canvas width (0-100)
  height: number; // height as percentage of canvas height (0-100)
  fillColor?: string;
  strokeWidth?: number;
  cornerRadius?: number; // corner radius as percentage of smaller dimension (0-50)
}

export interface CircleObject extends BaseCanvasObject {
  type: 'circle';
  radius: number; // radius as percentage of smaller canvas dimension (0-50)
  fillColor?: string;
  strokeWidth?: number;
}

export interface TextObject extends BaseCanvasObject {
  type: 'text';
  text: string;
  fontSize: number; // font size as percentage of canvas height (1-50)
  fontFamily?: string;
  fontWeight?: string;
}

export interface PolygonObject extends BaseCanvasObject {
  type: 'polygon';
  vertices: Array<{ x: number; y: number }>; // vertices in percentage coordinates (0-100)
  fillColor?: string;
  strokeWidth?: number;
}

export type CanvasObject = RectangleObject | CircleObject | TextObject | PolygonObject;

export interface DrawingState {
  objects: CanvasObject[];
  selectedObject: CanvasObject | null;
  isDragging: boolean;
}

export interface CanvasStatus {
  canvasSize: { width: number; height: number };
  objectCount: number;
  objects: CanvasObject[];
  selectedObjectId: string | null;
}