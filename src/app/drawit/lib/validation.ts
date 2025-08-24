import { CONSTRAINTS } from './constants';
import { RectangleParams, CircleParams, TextParams, PolygonParams } from '@/app/drawit/types/drawit';

export function validateColor(color: string): boolean {
  const div = document.createElement('div');
  div.style.color = color;
  return div.style.color !== '';
}

export function validateRectangleParams(params: RectangleParams) {
  const { color, fillColor } = params;
  
  if (color && !validateColor(color)) {
    throw new Error(`Invalid color: ${color || 'undefined'}`);
  }
  if (fillColor && !validateColor(fillColor)) {
    throw new Error(`Invalid fill color: ${fillColor || 'undefined'}`);
  }
}

export function validateCircleParams(params: CircleParams) {
  const { color, fillColor } = params;
  
  if (color && !validateColor(color)) {
    throw new Error(`Invalid color: ${color || 'undefined'}`);
  }
  if (fillColor && !validateColor(fillColor)) {
    throw new Error(`Invalid fill color: ${fillColor || 'undefined'}`);
  }
}

export function validateTextParams(params: TextParams) {
  const { color } = params;
  
  if (color && !validateColor(color)) {
    throw new Error(`Invalid color: ${color || 'undefined'}`);
  }
}

export function validatePolygonParams(params: PolygonParams) {
  const { vertices = [], color, fillColor } = params;
  
  if (color && !validateColor(color)) {
    throw new Error(`Invalid color: ${color || 'undefined'}`);
  }
  if (fillColor && !validateColor(fillColor)) {
    throw new Error(`Invalid fill color: ${fillColor || 'undefined'}`);
  }
  if (vertices.length < CONSTRAINTS.polygon.minVertices) {
    throw new Error(`Polygon must have at least ${CONSTRAINTS.polygon.minVertices} vertices`);
  }
  if (vertices.length > CONSTRAINTS.polygon.maxVertices) {
    throw new Error(`Polygon cannot have more than ${CONSTRAINTS.polygon.maxVertices} vertices`);
  }
  
  vertices.forEach((vertex, index) => {
    if (typeof vertex.x !== 'number' || typeof vertex.y !== 'number') {
      throw new Error(`Vertex ${index + 1} must have numeric x and y coordinates`);
    }
  });
}