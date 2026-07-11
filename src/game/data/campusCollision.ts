export interface CollisionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Coordinates are authored against the 1672×941 source map.
export const CAMPUS_BUILDING_COLLISIONS: CollisionRect[] = [
  { x: 704, y: 67, width: 270, height: 215 },
  { x: 1080, y: 18, width: 250, height: 120 },
  { x: 1364, y: 48, width: 150, height: 146 },
  { x: 1340, y: 188, width: 225, height: 134 },
  { x: 142, y: 366, width: 150, height: 115 },
  { x: 280, y: 294, width: 160, height: 190 },
  { x: 546, y: 260, width: 112, height: 84 },
  { x: 1040, y: 279, width: 206, height: 180 },
  { x: 612, y: 692, width: 244, height: 170 },
  { x: 338, y: 785, width: 162, height: 116 },
  { x: 1612, y: 357, width: 60, height: 224 }
];

export function circleIntersectsRect(
  x: number,
  y: number,
  radius: number,
  rect: CollisionRect
): boolean {
  const closestX = Math.max(rect.x, Math.min(x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(y, rect.y + rect.height));
  const dx = x - closestX;
  const dy = y - closestY;
  return dx * dx + dy * dy < radius * radius;
}
