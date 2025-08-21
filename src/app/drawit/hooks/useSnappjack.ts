import { useState, useEffect, useCallback, useRef } from 'react';
import { Snappjack, ConnectionData, SnappjackStatus, Tool, ToolResponse, ToolHandler } from '@snappjack/sdk-js';
import { CanvasStatus, CanvasObject, RectangleObject, CircleObject, TextObject, PolygonObject } from '@/types/drawit';
import { useSnappjackCredentials } from '@/contexts/SnappjackCredentialsContext';

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

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;

// AI agent system information - provides comprehensive documentation for the drawing system
const getSystemInfo = (objectCount: number): string => {
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
- **Bounding boxes**: Automatic calculation and tracking in percentage coordinates
- **Validation**: All parameters automatically validated and clamped to safe ranges

## Drawing Order and Layering
- **Order Rule**: Objects are drawn from beginning to end of the objects array
- **Layering**: Objects drawn later appear **in front of** objects drawn earlier
- **Array Position**: First object in array = bottom layer, last object = top layer
- **Overlap Behavior**: When objects overlap, later objects visually cover earlier objects
- **Reordering Tools**: Use \`reorderObject\` to change layer positions:
  - \`"up"\` - moves object one position forward (more visible)
  - \`"down"\` - moves object one position backward (less visible)  
  - \`"top"\` - moves object to front (most visible)
  - \`"bottom"\` - moves object to back (least visible)
  - \`"above"\` + referenceId - places object in front of specified object
  - \`"below"\` + referenceId - places object behind specified object
- **Strategy**: Create background elements first, then add foreground details on top
- **Precise Positioning**: Use \`above\`/\`below\` for exact layering relative to other objects

## Available Tools
- **Object Tools**: \`rectangle\`, \`circle\`, \`text\`, \`polygon\` (create new without ID, modify existing with ID)
- **Management**: \`reorderObject\`, \`deleteObject\`
- **Status**: \`getStatus\` - returns complete object list, canvas info, and visual screenshot
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

## Layering Examples
- **Background first**: \`rectangle(x: 50, y: 50, width: 80, height: 60, fillColor: "lightblue", name: "Sky")\` (drawn first = back layer)
- **Add middle layer**: \`circle(x: 30, y: 70, radius: 20, fillColor: "brown", name: "Tree")\` (drawn second = middle layer)  
- **Add foreground**: \`text(x: 50, y: 30, text: "My Scene", fontSize: 10, color: "white")\` (drawn last = front layer)

### Simple Reordering:
- **Bring to front**: \`reorderObject(id: "tree_id", operation: "top")\` - brings tree to front
- **Send to back**: \`reorderObject(id: "text_id", operation: "bottom")\` - sends text behind everything
- **Move up one**: \`reorderObject(id: "sky_id", operation: "up")\` - moves sky forward one layer

### Precise Reordering:
- **Above specific object**: \`reorderObject(id: "bird_id", operation: "above", referenceId: "tree_id")\` - puts bird in front of tree
- **Below specific object**: \`reorderObject(id: "shadow_id", operation: "below", referenceId: "tree_id")\` - puts shadow behind tree
- **Complex scene**: Create sun, then \`reorderObject(id: "sun_id", operation: "below", referenceId: "cloud_id")\` to put sun behind clouds

## Recommended Workflow
1. **Check Status**: Use \`getStatus\` to see current objects and visual screenshot
2. **Create/Modify**: Use object tools (\`rectangle\`, \`circle\`, \`text\`, \`polygon\`) to build your design
3. **Fine-tune**: Modify specific objects by their ID to adjust properties
4. **Reorder**: Use \`reorderObject\` to change drawing order if needed
5. **Validate**: Use \`getStatus\` again to see the updated result with visual feedback

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
};

export const useSnappjack = ({ 
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
  const [connectionError, setConnectionError] = useState<{type: string; message: string; canResetCredentials: boolean} | null>(null);
  const snappjackRef = useRef<Snappjack | null>(null);
  
  // Use shared credentials from context
  const { credentials, resetCredentials: resetSharedCredentials } = useSnappjackCredentials();

  // Function to reset credentials and create new user
  const resetCredentials = useCallback(async () => {
    // Reset SDK credentials if it exists
    if (snappjackRef.current) {
      snappjackRef.current.resetCredentials();
    }
    
    setConnectionError(null);
    await resetSharedCredentials();
  }, [resetSharedCredentials]);

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
    const status = getCanvasStatus();
    const info = getSystemInfo(status.objectCount);
    return {
      content: [{
        type: 'text',
        text: info
      }]
    };
  }, [getCanvasStatus]);

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

  // Initialize Snappjack when credentials are available
  useEffect(() => {
    if (typeof window === 'undefined' || !credentials) return;

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
      userId: credentials.userId,
      userApiKey: credentials.userApiKey,
      appId: process.env.NEXT_PUBLIC_SNAPPJACK_APP_ID!,
      serverUrl: process.env.NEXT_PUBLIC_SNAPPJACK_SERVER_URL,
      tools: tools,
      autoReconnect: true
    });
    
    snappjackRef.current = snappjack;

    setAvailableTools(tools);

    snappjack.on('status', (newStatus: SnappjackStatus) => {
      setStatus(newStatus);
      // Clear connection error when status changes to connected/bridged
      if (newStatus === 'connected' || newStatus === 'bridged') {
        setConnectionError(null);
      }
    });

    snappjack.on('user-api-key-generated', (data: ConnectionData) => {
      setConnectionData(data);
      console.log('DrawIt app connected via Snappjack!');
    });

    // Handle connection errors
    snappjack.on('connection-error', (error: {type: string; message: string; canResetCredentials: boolean}) => {
      console.error('Connection error:', error);
      setConnectionError({
        type: error.type,
        message: error.message,
        canResetCredentials: error.canResetCredentials
      });
    });

    snappjack.connect().catch((error: Error) => {
      console.error('Connection failed:', error);
      setConnectionError({
        type: 'connection_failed',
        message: error.message,
        canResetCredentials: false
      });
    });

    return () => {
      snappjack.removeAllListeners();
      snappjack.disconnect();
    };
  }, [credentials, addRectangle, addCircle, addText, addPolygon, modifyObject, deleteObject, reorderObject, clearCanvas, getCanvasStatus, getCanvasImage]);

  return {
    status,
    connectionData,
    availableTools,
    connectionError,
    resetCredentials
  };
};