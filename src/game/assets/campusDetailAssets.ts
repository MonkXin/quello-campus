export interface CampusImageAsset {
  key: string;
  path: string;
}

export const CINEMATIC_CANOPY_ASSETS: readonly CampusImageAsset[] = [
  { key: "canopy-node-left", path: "assets/campus/foreground/nodes/left.webp" },
  { key: "canopy-node-upper", path: "assets/campus/foreground/nodes/upper.webp" },
  { key: "canopy-node-right", path: "assets/campus/foreground/nodes/right.webp" },
  { key: "canopy-node-lower", path: "assets/campus/foreground/nodes/lower.webp" }
];

export const ORDINARY_CANOPY_ASSETS: readonly CampusImageAsset[] = [
  { key: "campus-canopy", path: "assets/campus/map/foreground-canopy.webp" },
  { key: "route-canopy", path: "assets/campus/foreground/route-canopy.webp" }
];

export function getCampusCanopyAssets(cinematicMode: boolean): readonly CampusImageAsset[] {
  return cinematicMode ? CINEMATIC_CANOPY_ASSETS : ORDINARY_CANOPY_ASSETS;
}
