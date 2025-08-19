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
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fillColor?: string;
  strokeWidth?: number;
  rotation?: number;
  cornerRadius?: number;
}

interface CircleParams {
  x: number;
  y: number;
  radius: number;
  color: string;
  fillColor?: string;
  strokeWidth?: number;
  rotation?: number;
}

interface TextParams {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  fontFamily?: string;
  fontWeight?: string;
  rotation?: number;
}

interface PolygonParams {
  vertices: Array<{ x: number; y: number }>;
  color: string;
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
  reorderObject: (id: string, operation: 'up' | 'down' | 'top' | 'bottom') => void;
  clearCanvas: () => void;
  getCanvasStatus: () => CanvasStatus;
  getCanvasImage: () => string;
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
    try {
      const info = getSystemInfo();
      return {
        content: [{
          type: 'text',
          text: info
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }, [getSystemInfo]);

  handlersRef.current.handleRectangle = useCallback(async (args: unknown): Promise<ToolResponse> => {
    try {
      const params = args as Record<string, unknown>;
      let result: CanvasObject;
      
      if (params.id) {
        const { id, ...updates } = params;
        result = modifyObject(id as string, updates as Partial<CanvasObject>);
      } else {
        result = addRectangle(params as unknown as RectangleParams);
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }, [addRectangle, modifyObject]);

  handlersRef.current.handleCircle = useCallback(async (args: unknown): Promise<ToolResponse> => {
    try {
      const params = args as Record<string, unknown>;
      let result: CanvasObject;
      
      if (params.id) {
        const { id, ...updates } = params;
        result = modifyObject(id as string, updates as Partial<CanvasObject>);
      } else {
        result = addCircle(params as unknown as CircleParams);
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }, [addCircle, modifyObject]);

  handlersRef.current.handleText = useCallback(async (args: unknown): Promise<ToolResponse> => {
    try {
      const params = args as Record<string, unknown>;
      let result: CanvasObject;
      
      if (params.id) {
        const { id, ...updates } = params;
        result = modifyObject(id as string, updates as Partial<CanvasObject>);
      } else {
        result = addText(params as unknown as TextParams);
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }, [addText, modifyObject]);

  handlersRef.current.handlePolygon = useCallback(async (args: unknown): Promise<ToolResponse> => {
    try {
      const params = args as Record<string, unknown>;
      let result: CanvasObject;
      
      if (params.id) {
        const { id, ...updates } = params;
        result = modifyObject(id as string, updates as Partial<CanvasObject>);
      } else {
        result = addPolygon(params as unknown as PolygonParams);
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }, [addPolygon, modifyObject]);

  handlersRef.current.handleDelete = useCallback(async (args: unknown): Promise<ToolResponse> => {
    try {
      const { id } = args as { id: string };
      deleteObject(id);
      
      return {
        content: [{
          type: 'text',
          text: `Deleted object with ID: ${id}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }, [deleteObject]);

  handlersRef.current.handleReorder = useCallback(async (args: unknown): Promise<ToolResponse> => {
    try {
      const { id, operation } = args as { id: string; operation: 'up' | 'down' | 'top' | 'bottom' };
      reorderObject(id, operation);
      
      return {
        content: [{
          type: 'text',
          text: `Reordered object ${id} - moved ${operation}`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }, [reorderObject]);

  handlersRef.current.handleClear = useCallback(async (): Promise<ToolResponse> => {
    try {
      clearCanvas();
      
      return {
        content: [{
          type: 'text',
          text: 'Canvas cleared'
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }, [clearCanvas]);

  handlersRef.current.handleGetStatus = useCallback(async (): Promise<ToolResponse> => {
    try {
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
            text: JSON.stringify(status, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
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
        description: 'Change drawing order of an object',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Object ID' },
            operation: { 
              type: 'string', 
              enum: ['up', 'down', 'top', 'bottom'],
              description: 'Move up/down/top/bottom in stack' 
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
        description: 'Get canvas status and all objects',
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