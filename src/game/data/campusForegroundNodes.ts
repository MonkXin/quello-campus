export interface ForegroundNodeDefinition {
  id: string;
  texture: string;
  sourceX: number;
  sourceY: number;
  scale: number;
  alpha: number;
  depth: number;
  swayX: number;
  swayY: number;
  swayPeriod: number;
}

export const CAMPUS_FOREGROUND_NODES: ForegroundNodeDefinition[] = [
  {
    id: "west-gate-canopy",
    texture: "canopy-node-left",
    sourceX: 205,
    sourceY: 420,
    scale: 0.34,
    alpha: 0.9,
    depth: 138,
    swayX: 5,
    swayY: 2,
    swayPeriod: 4100
  },
  {
    id: "west-path-canopy",
    texture: "canopy-node-upper",
    sourceX: 292,
    sourceY: 410,
    scale: 0.3,
    alpha: 0.88,
    depth: 142,
    swayX: 4,
    swayY: 3,
    swayPeriod: 4700
  },
  {
    id: "garden-turn-canopy",
    texture: "canopy-node-right",
    sourceX: 390,
    sourceY: 600,
    scale: 0.32,
    alpha: 0.9,
    depth: 140,
    swayX: 6,
    swayY: 2,
    swayPeriod: 5300
  },
  {
    id: "plaza-edge-canopy",
    texture: "canopy-node-lower",
    sourceX: 475,
    sourceY: 610,
    scale: 0.28,
    alpha: 0.86,
    depth: 136,
    swayX: 4,
    swayY: 3,
    swayPeriod: 4500
  }
];
