import { Tool, ToolResponse } from '@snappjack/sdk-js';
import { 
  CanvasStatus, 
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

// Parameter types now imported from shared types file

interface DrawingAPI {
  addRectangle: (params: RectangleParams) => RectangleObject | null;
  addCircle: (params: CircleParams) => CircleObject | null;
  addText: (params: TextParams) => TextObject | null;
  addPolygon: (params: PolygonParams) => PolygonObject | null;
  modifyObject: (id: string, updates: Partial<CanvasObject>) => CanvasObject | null;
  deleteObject: (id: string) => void;
  reorderObject: (id: string, operation: 'up' | 'down' | 'top' | 'bottom' | 'above' | 'below', referenceId?: string) => void;
  clearCanvas: () => void;
  getCanvasStatus: () => CanvasStatus;
  getCanvasImage: () => string;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;

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

const getSystemDocumentation = (objectCount: number, appName: string): string => {
  const currentTime = new Date().toLocaleString();
  
  const docs = `# ${appName} Canvas System

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

## Object Naming
- **Object Names**: Every object has unique id and an optional \`name\` property for better understandability
- **Naming Best Practice**: Always provide short, descriptive names when inserting objects (e.g., "tree-trunk", "branch-1", "branch-2", "leaves", "sky", "ground")
- **Renaming Objects**: Use any object tool with \`id\` and \`name\` parameters to rename (e.g., \`${appName.toLowerCase()}_rectangle_upsert(id: "abc123", name: "sky")\`)

## Drawing Order and Layering
- **Order Rule**: Objects are drawn from beginning to end of the objects array
- **Layering**: Objects drawn later appear **in front of** objects drawn earlier
- **Array Position**: First object in array = bottom layer, last object = top layer
- **Overlap Behavior**: When objects overlap, later objects visually cover earlier objects
- **Reordering Tools**: Use \`${appName.toLowerCase()}_object_reorder\` to change layer positions:
  - \`"up"\` - moves object one position forward (more visible)
  - \`"down"\` - moves object one position backward (less visible)  
  - \`"top"\` - moves object to front (most visible)
  - \`"bottom"\` - moves object to back (least visible)
  - \`"above"\` + referenceId - places object in front of specified object
  - \`"below"\` + referenceId - places object behind specified object
- **Strategy**: Insert background elements first, then add foreground details on top
- **Precise Positioning**: Use \`above\`/\`below\` for exact layering relative to other objects

## Available Tools
- **Object Tools**: \`${appName.toLowerCase()}_rectangle_upsert\`, \`${appName.toLowerCase()}_circle_upsert\`, \`${appName.toLowerCase()}_text_upsert\`, \`${appName.toLowerCase()}_polygon_upsert\` (insert new without ID, update existing with ID)
- **Management**: \`${appName.toLowerCase()}_object_reorder\`, \`${appName.toLowerCase()}_object_delete\`
- **Status**: \`${appName.toLowerCase()}_canvas_status\` - returns complete object list, canvas info, and visual screenshot
- **Utility**: \`${appName.toLowerCase()}_canvas_clear\`
- **Info**: \`${appName.toLowerCase()}_system_get\` - returns this documentation

## Usage Examples  
- **Insert rectangle**: \`${appName.toLowerCase()}_rectangle_upsert(x: 50, y: 50, width: 20, height: 10, color: "blue", name: "box")\`
- **Rename object**: \`${appName.toLowerCase()}_rectangle_upsert(id: "abc123", name: "sky-bg")\`
- **Update rectangle**: \`${appName.toLowerCase()}_rectangle_upsert(id: "abc123", color: "red", width: 30)\`
- **Insert circle**: \`${appName.toLowerCase()}_circle_upsert(x: 25, y: 75, radius: 15, color: "green", name: "ball")\`
- **Rename and update**: \`${appName.toLowerCase()}_circle_upsert(id: "xyz789", name: "sun", color: "yellow", fillColor: "orange")\`
- **Update text**: \`${appName.toLowerCase()}_text_upsert(id: "xyz789", fontSize: 8, color: "purple")\`
- **Insert triangle**: \`${appName.toLowerCase()}_polygon_upsert(vertices: [{x: 50, y: 20}, {x: 30, y: 60}, {x: 70, y: 60}], color: "red", name: "triangle")\`
- **Insert diamond**: \`${appName.toLowerCase()}_polygon_upsert(vertices: [{x: 50, y: 10}, {x: 80, y: 50}, {x: 50, y: 90}, {x: 20, y: 50}], color: "blue", fillColor: "lightblue", name: "diamond")\`
- **Rename polygon**: \`${appName.toLowerCase()}_polygon_upsert(id: "def456", name: "mountain-1", color: "orange", strokeWidth: 3)\`
- **Check everything**: \`${appName.toLowerCase()}_canvas_status()\` - Get complete object list with all properties including names

## Layering Examples
- **Background first**: \`${appName.toLowerCase()}_rectangle_upsert(x: 50, y: 50, width: 80, height: 60, fillColor: "lightblue", name: "sky")\` (drawn first = back layer)
- **Add middle layer**: \`${appName.toLowerCase()}_circle_upsert(x: 30, y: 70, radius: 20, fillColor: "brown", name: "tree-trunk")\` (drawn second = middle layer)  
- **Add foreground**: \`${appName.toLowerCase()}_text_upsert(x: 50, y: 30, text: "My Scene", fontSize: 10, color: "white", name: "title")\` (drawn last = front layer)

### Simple Reordering:
- **Bring to front**: \`${appName.toLowerCase()}_object_reorder(id: "tree_trunk_id", operation: "top")\` - brings tree trunk to front
- **Send to back**: \`${appName.toLowerCase()}_object_reorder(id: "text_id", operation: "bottom")\` - sends text behind everything
- **Move up one**: \`${appName.toLowerCase()}_object_reorder(id: "sky_id", operation: "up")\` - moves sky forward one layer

### Precise Reordering:
- **Above specific object**: \`${appName.toLowerCase()}_object_reorder(id: "bird_id", operation: "above", referenceId: "branch_1_id")\` - puts bird in front of branch
- **Below specific object**: \`${appName.toLowerCase()}_object_reorder(id: "shadow_id", operation: "below", referenceId: "tree_trunk_id")\` - puts shadow behind tree trunk
- **Complex scene**: Insert sun, then \`${appName.toLowerCase()}_object_reorder(id: "sun_id", operation: "below", referenceId: "cloud_id")\` to put sun behind clouds

## Recommended Workflow
1. **Check Status**: Use \`${appName.toLowerCase()}_canvas_status\` to see current objects and visual screenshot
2. **Insert/Update**: Use object tools (\`${appName.toLowerCase()}_rectangle_upsert\`, \`${appName.toLowerCase()}_circle_upsert\`, \`${appName.toLowerCase()}_text_upsert\`, \`${appName.toLowerCase()}_polygon_upsert\`) to build your design
3. **Check Status Again**: Use \`${appName.toLowerCase()}_canvas_status\` to see the updated result with visual feedback
4. **Fine-tune**: Update specific objects by their ID or reorder objects as needed
5. **Validate**: Use \`${appName.toLowerCase()}_canvas_status\` again to see the updated result with visual feedback

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

export function createSnappjackTools(drawingAPI: DrawingAPI, appName: string): Tool[] {
  return [
    {
      name: `${appName.toLowerCase()}_system_get`,
      description: 'IMPORTANT: Call this first to understand the drawing system, coordinate system, and see usage examples. Returns comprehensive documentation and current canvas state.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async (): Promise<ToolResponse> => {
        const status = drawingAPI.getCanvasStatus();
        const info = getSystemDocumentation(status.objectCount, appName);
        return {
          content: [{
            type: 'text',
            text: info
          }]
        };
      }
    },
    {
      name: `${appName.toLowerCase()}_rectangle_upsert`,
      description: 'Insert a new rectangle (no ID) or update existing (with ID)',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Object ID to update (omit to insert new)' },
          name: { type: 'string', description: 'Descriptive name for the object' },
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
      handler: async (args: unknown): Promise<ToolResponse> => {
        const params = args as Record<string, unknown>;
        let result: CanvasObject | null;
        
        if (params.id) {
          const { id, ...updates } = params as { id: string; [key: string]: unknown };
          result = drawingAPI.modifyObject(id, updates as Partial<CanvasObject>);
        } else {
          const rectParams = params as unknown as RectangleParams;
          result = drawingAPI.addRectangle(rectParams);
        }
        
        if (!result) {
          throw new Error('Failed to create or modify rectangle');
        }
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(formatNumericValue(result))
          }]
        };
      }
    },
    {
      name: `${appName.toLowerCase()}_circle_upsert`,
      description: 'Insert a new circle (no ID) or update existing (with ID)',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Object ID to update (omit to insert new)' },
          name: { type: 'string', description: 'Descriptive name for the object' },
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
      handler: async (args: unknown): Promise<ToolResponse> => {
        const params = args as Record<string, unknown>;
        let result: CanvasObject | null;
        
        if (params.id) {
          const { id, ...updates } = params as Record<string, unknown>;
          result = drawingAPI.modifyObject(id as string, updates as Partial<CanvasObject>);
        } else {
          const circleParams = params as unknown as CircleParams;
          result = drawingAPI.addCircle(circleParams);
        }
        
        if (!result) {
          throw new Error('Failed to create or modify circle');
        }
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(formatNumericValue(result))
          }]
        };
      }
    },
    {
      name: `${appName.toLowerCase()}_text_upsert`,
      description: 'Insert new text (no ID) or update existing (with ID)',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Object ID to update (omit to insert new)' },
          name: { type: 'string', description: 'Descriptive name for the object' },
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
      handler: async (args: unknown): Promise<ToolResponse> => {
        const params = args as Record<string, unknown>;
        let result: CanvasObject | null;
        
        if (params.id) {
          const { id, ...updates } = params as Record<string, unknown>;
          result = drawingAPI.modifyObject(id as string, updates as Partial<CanvasObject>);
        } else {
          const textParams = params as Record<string, unknown>;
          result = drawingAPI.addText(textParams as unknown as TextParams);
        }
        
        if (!result) {
          throw new Error('Failed to create or modify text');
        }
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(formatNumericValue(result))
          }]
        };
      }
    },
    {
      name: `${appName.toLowerCase()}_polygon_upsert`,
      description: 'Insert new polygon (no ID) or update existing (with ID)',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Object ID to update (omit to insert new)' },
          name: { type: 'string', description: 'Descriptive name for the object' },
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
      handler: async (args: unknown): Promise<ToolResponse> => {
        const params = args as Record<string, unknown>;
        let result: CanvasObject | null;
        
        if (params.id) {
          const { id, ...updates } = params as Record<string, unknown>;
          result = drawingAPI.modifyObject(id as string, updates as Partial<CanvasObject>);
        } else {
          const polygonParams = params as Record<string, unknown>;
          result = drawingAPI.addPolygon(polygonParams as unknown as PolygonParams);
        }
        
        if (!result) {
          throw new Error('Failed to create or modify polygon');
        }
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(formatNumericValue(result))
          }]
        };
      }
    },
    {
      name: `${appName.toLowerCase()}_object_delete`,
      description: 'Delete an object by ID',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Object ID to delete' }
        },
        required: ['id']
      },
      handler: async (args: unknown): Promise<ToolResponse> => {
        const { id } = args as { id: string };
        drawingAPI.deleteObject(id);
        
        return {
          content: [{
            type: 'text',
            text: `Deleted object with ID: ${id}`
          }]
        };
      }
    },
    {
      name: `${appName.toLowerCase()}_object_reorder`,
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
      handler: async (args: unknown): Promise<ToolResponse> => {
        const { id, operation, referenceId } = args as { 
          id: string; 
          operation: 'up' | 'down' | 'top' | 'bottom' | 'above' | 'below';
          referenceId?: string;
        };
        drawingAPI.reorderObject(id, operation, referenceId);
        
        const operationText = referenceId 
          ? `moved ${operation} object ${referenceId}`
          : `moved ${operation}`;
        
        return {
          content: [{
            type: 'text',
            text: `Reordered object ${id} - ${operationText}`
          }]
        };
      }
    },
    {
      name: `${appName.toLowerCase()}_canvas_clear`,
      description: 'Clear all objects from canvas',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async (): Promise<ToolResponse> => {
        drawingAPI.clearCanvas();
        
        return {
          content: [{
            type: 'text',
            text: 'Canvas cleared'
          }]
        };
      }
    },
    {
      name: `${appName.toLowerCase()}_canvas_status`,
      description: 'Get canvas status, all objects, and a visual screenshot of the current drawing',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async (): Promise<ToolResponse> => {
        const status = drawingAPI.getCanvasStatus();
        const base64Image = drawingAPI.getCanvasImage();
        
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
      }
    }
  ];
}