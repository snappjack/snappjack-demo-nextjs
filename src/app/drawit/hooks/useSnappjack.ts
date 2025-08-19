import { useState, useEffect, useCallback, useRef } from 'react';
import { Snappjack, ConnectionData, SnappjackStatus, Tool, ToolResponse, ToolHandler } from '@snappjack/sdk-js';
import { CanvasStatus, CanvasObject, RectangleObject, CircleObject, TextObject, PolygonObject } from '@/types/drawit';

const appId = process.env.NEXT_PUBLIC_SNAPPJACK_APP_ID;
const apiKey = process.env.NEXT_PUBLIC_SNAPPJACK_API_KEY;
const serverUrl = process.env.NEXT_PUBLIC_SNAPPJACK_SERVER_URL;

if (!appId || !apiKey) {
  throw new Error('Missing required environment variables');
}

interface RectangleParams {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  rotation?: number;
  cornerRadius?: number;
}

interface CircleParams {
  x?: number;
  y?: number;
  radius?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  rotation?: number;
}

interface TextParams {
  x?: number;
  y?: number;
  text?: string;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: string;
  rotation?: number;
}

interface PolygonParams {
  vertices?: Array<{ x: number; y: number }>;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  rotation?: number;
}

interface SnappjackHookProps {
  getSystemInfo: () => string;
  addRectangle: (params: RectangleParams) => RectangleObject;
  addCircle: (params: CircleParams) => CircleObject;
  addText: (params: TextParams) => TextObject;
  addPolygon: (params: PolygonParams) => PolygonObject;
  modifyObject: (id: string, updates: Partial<CanvasObject>) => CanvasObject;
  deleteObject: (id: string) => void;
  reorderObject: (id: string, operation: 'up' | 'down' | 'top' | 'bottom' | 'above' | 'below', referenceId?: string) => void;
  clearCanvas: () => void;
  getCanvasStatus: () => CanvasStatus;
  getCanvasImage: () => string;
}

// Helper function to format numeric values with limited precision
function formatNumericValue<T>(value: T, decimals: number = 2): T {
  if (typeof value === 'number') {
    return (Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)) as T;
  }
  if (Array.isArray(value)) {
    return value.map(item => formatNumericValue(item, decimals)) as T;
  }
  if (value && typeof value === 'object') {
    const formatted: Record<string, unknown> = {};
    for (const key in value) {
      formatted[key] = formatNumericValue((value as Record<string, unknown>)[key], decimals);
    }
    return formatted as T;
  }
  return value;
}

export const useSnappjack = ({ 
  getSystemInfo,
  addRectangle,
  addCircle,
  addText,
  addPolygon,
  modifyObject,
  deleteObject,
  reorderObject,
  clearCanvas,
  getCanvasStatus,
  getCanvasImage
}: SnappjackHookProps) => {
  const [status, setStatus] = useState<SnappjackStatus>('disconnected');
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);

  const handlersRef = useRef<{
    handleSystemInfo: ToolHandler;
    handleRectangle: ToolHandler;
    handleCircle: ToolHandler;
    handleText: ToolHandler;
    handlePolygon: ToolHandler;
    handleDelete: ToolHandler;
    handleReorder: ToolHandler;
    handleClear: ToolHandler;
    handleGetStatus: ToolHandler;
  }>({
    handleSystemInfo: async () => ({ content: [] }),
    handleRectangle: async () => ({ content: [] }),
    handleCircle: async () => ({ content: [] }),
    handleText: async () => ({ content: [] }),
    handlePolygon: async () => ({ content: [] }),
    handleDelete: async () => ({ content: [] }),
    handleReorder: async () => ({ content: [] }),
    handleClear: async () => ({ content: [] }),
    handleGetStatus: async () => ({ content: [] }),
  });

  handlersRef.current.handleSystemInfo = useCallback(async (): Promise<ToolResponse> => {
    const info = getSystemInfo();
    return {
      content: [{
        type: 'text',
        text: info
      }]
    };
  }, [getSystemInfo]);

  handlersRef.current.handleRectangle = useCallback(async (args: unknown): Promise<ToolResponse> => {
    const params = args as Record<string, unknown>;
    let result: CanvasObject;
    
    if (params.id) {
      const { id, ...updates } = params as { id: string; [key: string]: unknown };
      result = modifyObject(id, updates as Partial<CanvasObject>);
    } else {
      const rectParams = params as unknown as RectangleParams;
      result = addRectangle(rectParams);
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(formatNumericValue(result))
      }]
    };
  }, [addRectangle, modifyObject]);

  handlersRef.current.handleCircle = useCallback(async (args: unknown): Promise<ToolResponse> => {
    const params = args as Record<string, unknown>;
      let result: CanvasObject;
      
      if (params.id) {
        const { id, ...updates } = params as Record<string, unknown>;
        result = modifyObject(id as string, updates as Partial<CanvasObject>);
      } else {
        const circleParams = params as unknown as CircleParams;
        result = addCircle(circleParams);
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(formatNumericValue(result))
        }]
      };
  }, [addCircle, modifyObject]);

  handlersRef.current.handleText = useCallback(async (args: unknown): Promise<ToolResponse> => {
    const params = args as Record<string, unknown>;
      let result: CanvasObject;
      
      if (params.id) {
        const { id, ...updates } = params as Record<string, unknown>;
        result = modifyObject(id as string, updates as Partial<CanvasObject>);
      } else {
        const textParams = params as Record<string, unknown>;
        result = addText(textParams as unknown as TextParams);
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(formatNumericValue(result))
        }]
      };
  }, [addText, modifyObject]);

  handlersRef.current.handlePolygon = useCallback(async (args: unknown): Promise<ToolResponse> => {
    const params = args as Record<string, unknown>;
      let result: CanvasObject;
      
      if (params.id) {
        const { id, ...updates } = params as Record<string, unknown>;
        result = modifyObject(id as string, updates as Partial<CanvasObject>);
      } else {
        const polygonParams = params as Record<string, unknown>;
        result = addPolygon(polygonParams as unknown as PolygonParams);
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(formatNumericValue(result))
        }]
      };
  }, [addPolygon, modifyObject]);

  handlersRef.current.handleDelete = useCallback(async (args: unknown): Promise<ToolResponse> => {
    const { id } = args as { id: string };
    deleteObject(id);
    
    return {
      content: [{
        type: 'text',
        text: `Deleted object with ID: ${id}`
      }]
    };
  }, [deleteObject]);

  handlersRef.current.handleReorder = useCallback(async (args: unknown): Promise<ToolResponse> => {
    const { id, operation, referenceId } = args as { 
      id: string; 
      operation: 'up' | 'down' | 'top' | 'bottom' | 'above' | 'below';
      referenceId?: string;
    };
    reorderObject(id, operation, referenceId);
    
    const operationText = referenceId 
      ? `moved ${operation} object ${referenceId}`
      : `moved ${operation}`;
    
    return {
      content: [{
        type: 'text',
        text: `Reordered object ${id} - ${operationText}`
      }]
    };
  }, [reorderObject]);

  handlersRef.current.handleClear = useCallback(async (): Promise<ToolResponse> => {
    clearCanvas();
    
    return {
      content: [{
        type: 'text',
        text: 'Canvas cleared'
      }]
    };
  }, [clearCanvas]);

  handlersRef.current.handleGetStatus = useCallback(async (): Promise<ToolResponse> => {
    const status = getCanvasStatus();
    const base64Image = getCanvasImage();
    
    return {
      content: [
        {
          type: 'image',
          data: base64Image,
          mimeType: 'image/png'
        },
        {
          type: 'text',
          text: JSON.stringify(formatNumericValue(status), null, 2)
        }
      ]
    };
  }, [getCanvasStatus, getCanvasImage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tools: Tool[] = [
      {
        name: 'drawit.systemInfo.get',
        description: 'IMPORTANT: Call this first to understand the drawing system, coordinate system, and see usage examples. Returns comprehensive documentation and current canvas state.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        handler: (args, msg) => handlersRef.current.handleSystemInfo(args, msg)
      },
      {
        name: 'drawit.rectangle',
        description: 'Create a new rectangle (no ID) or modify existing (with ID)',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Object ID to modify (omit to create new)' },
            x: { type: 'number', description: 'Center X (0-100%)' },
            y: { type: 'number', description: 'Center Y (0-100%)' },
            width: { type: 'number', description: 'Width (1-100%)' },
            height: { type: 'number', description: 'Height (1-100%)' },
            color: { type: 'string', description: 'Stroke color' },
            fillColor: { type: 'string', description: 'Fill color (optional)' },
            strokeWidth: { type: 'number', description: 'Stroke width (1-20)' },
            rotation: { type: 'number', description: 'Rotation (-360 to 360)' },
            cornerRadius: { type: 'number', description: 'Corner radius (0-50%)' }
          },
          required: []
        },
        handler: (args, msg) => handlersRef.current.handleRectangle(args, msg)
      },
      {
        name: 'drawit.circle',
        description: 'Create a new circle (no ID) or modify existing (with ID)',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Object ID to modify (omit to create new)' },
            x: { type: 'number', description: 'Center X (0-100%)' },
            y: { type: 'number', description: 'Center Y (0-100%)' },
            radius: { type: 'number', description: 'Radius (1-50%)' },
            color: { type: 'string', description: 'Stroke color' },
            fillColor: { type: 'string', description: 'Fill color (optional)' },
            strokeWidth: { type: 'number', description: 'Stroke width (1-20)' },
            rotation: { type: 'number', description: 'Rotation (-360 to 360)' }
          },
          required: []
        },
        handler: (args, msg) => handlersRef.current.handleCircle(args, msg)
      },
      {
        name: 'drawit.text',
        description: 'Create new text (no ID) or modify existing (with ID)',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Object ID to modify (omit to create new)' },
            x: { type: 'number', description: 'Center X (0-100%)' },
            y: { type: 'number', description: 'Center Y (0-100%)' },
            text: { type: 'string', description: 'Text content' },
            fontSize: { type: 'number', description: 'Font size (1-50%)' },
            color: { type: 'string', description: 'Text color' },
            fontFamily: { type: 'string', description: 'Font family' },
            fontWeight: { type: 'string', description: 'Font weight' },
            rotation: { type: 'number', description: 'Rotation (-360 to 360)' }
          },
          required: []
        },
        handler: (args, msg) => handlersRef.current.handleText(args, msg)
      },
      {
        name: 'drawit.polygon',
        description: 'Create new polygon (no ID) or modify existing (with ID)',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Object ID to modify (omit to create new)' },
            vertices: {
              type: 'array',
              description: 'Array of vertices (3-50 points)',
              items: {
                type: 'object',
                properties: {
                  x: { type: 'number', description: 'X coordinate (0-100%)' },
                  y: { type: 'number', description: 'Y coordinate (0-100%)' }
                },
                required: ['x', 'y']
              }
            },
            color: { type: 'string', description: 'Stroke color' },
            fillColor: { type: 'string', description: 'Fill color (optional)' },
            strokeWidth: { type: 'number', description: 'Stroke width (1-20)' },
            rotation: { type: 'number', description: 'Rotation (-360 to 360)' }
          },
          required: []
        },
        handler: (args, msg) => handlersRef.current.handlePolygon(args, msg)
      },
      {
        name: 'drawit.deleteObject',
        description: 'Delete an object by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Object ID to delete' }
          },
          required: ['id']
        },
        handler: (args, msg) => handlersRef.current.handleDelete(args, msg)
      },
      {
        name: 'drawit.reorderObject',
        description: 'Change drawing order of an object - use above/below for precise layering relative to other objects',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Object ID to reorder' },
            operation: { 
              type: 'string', 
              enum: ['up', 'down', 'top', 'bottom', 'above', 'below'],
              description: 'up/down (1 step), top/bottom (extremes), above/below (relative to referenceId)' 
            },
            referenceId: { 
              type: 'string', 
              description: 'Required for above/below operations - ID of object to position relative to' 
            }
          },
          required: ['id', 'operation']
        },
        handler: (args, msg) => handlersRef.current.handleReorder(args, msg)
      },
      {
        name: 'drawit.clearCanvas',
        description: 'Clear all objects from canvas',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        handler: (args, msg) => handlersRef.current.handleClear(args, msg)
      },
      {
        name: 'drawit.getStatus',
        description: 'Get canvas status, all objects, and a visual screenshot of the current drawing',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        handler: (args, msg) => handlersRef.current.handleGetStatus(args, msg)
      }
    ];

    const snappjack = new Snappjack({
      userId: 'demo-user',
      appId,
      apiKey,
      serverUrl,
      tools: tools,
      autoReconnect: true
    });

    setAvailableTools(tools);

    snappjack.on('status', (newStatus: SnappjackStatus) => {
      setStatus(newStatus);
    });

    snappjack.on('user-api-key-generated', (data: ConnectionData) => {
      setConnectionData(data);
      console.log('DrawIt app connected via Snappjack!');
    });

    snappjack.connect().catch((error: Error) => {
      console.error('Connection failed:', error);
    });

    return () => {
      snappjack.removeAllListeners();
      snappjack.disconnect();
    };
  }, []);

  return {
    status,
    connectionData,
    availableTools
  };
};