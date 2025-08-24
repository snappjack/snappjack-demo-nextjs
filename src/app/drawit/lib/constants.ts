export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 800;

// Object dimension constraints
export const CONSTRAINTS = {
  rectangle: {
    width: { min: 1, max: 100 },
    height: { min: 1, max: 100 },
    cornerRadius: { min: 0, max: 100 }
  },
  circle: {
    radius: { min: 1, max: 50 }
  },
  text: {
    fontSize: { min: 1, max: 50 }
  },
  common: {
    position: { min: 0, max: 100 },
    strokeWidth: { min: 1, max: 20 },
    rotation: { min: -360, max: 360 }
  },
  polygon: {
    maxVertices: 50,
    minVertices: 3
  }
} as const;