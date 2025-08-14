'use client';

import { useEffect, useRef, useCallback } from 'react';
import { CanvasObject, RectangleObject, CircleObject, TextObject, PolygonObject } from '@/types/drawit';

interface CanvasProps {
  objects: CanvasObject[];
  selectedObject: CanvasObject | null;
  width: number;
  height: number;
  onCanvasClick: () => void;
  onObjectClick: (id: string) => void;
  onObjectDrag: (id: string, x: number, y: number) => void;
}

export default function Canvas({
  objects,
  selectedObject,
  width,
  height,
  onCanvasClick,
  onObjectClick,
  onObjectDrag
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const percentToPixelX = useCallback((percent: number): number => (percent / 100) * width, [width]);
  const percentToPixelY = useCallback((percent: number): number => (percent / 100) * height, [height]);
  const pixelToPercentX = useCallback((pixel: number): number => (pixel / width) * 100, [width]);
  const pixelToPercentY = useCallback((pixel: number): number => (pixel / height) * 100, [height]);

  const getObjectAtPoint = useCallback((x: number, y: number): CanvasObject | null => {
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      const bbox = obj.boundingBox;
      if (x >= bbox.minX && x <= bbox.maxX && y >= bbox.minY && y <= bbox.maxY) {
        return obj;
      }
    }
    return null;
  }, [objects]);

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
        const bbox = obj.boundingBox;
        const x = percentToPixelX(bbox.minX);
        const y = percentToPixelY(bbox.minY);
        const bboxWidth = percentToPixelX(bbox.width);
        const bboxHeight = percentToPixelY(bbox.height);

        ctx.strokeStyle = '#00aaff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, bboxWidth, bboxHeight);
        ctx.setLineDash([]);
      }

      ctx.restore();
    };

    ctx.clearRect(0, 0, width, height);
    objects.forEach(obj => drawObjectLocal(ctx, obj));
  }, [objects, selectedObject, width, height, percentToPixelX, percentToPixelY, drawRectangle, drawCircle, drawText, drawPolygon]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = pixelToPercentX(e.clientX - rect.left);
    const y = pixelToPercentY(e.clientY - rect.top);

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
    if (!isDraggingRef.current || !selectedObject) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = pixelToPercentX(e.clientX - rect.left);
    const y = pixelToPercentY(e.clientY - rect.top);

    onObjectDrag(
      selectedObject.id,
      x - dragOffsetRef.current.x,
      y - dragOffsetRef.current.y
    );
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border-2 border-gray-300 rounded-lg bg-white cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
}