import { MAP_SCALE } from "../config";

export interface WorldPoint {
  x: number;
  y: number;
}

export interface LngLat {
  lng: number;
  lat: number;
}

export interface CampusMapAdapter {
  sourceToWorld(point: WorldPoint): WorldPoint;
  worldToSource(point: WorldPoint): WorldPoint;
  lngLatToWorld?(point: LngLat): WorldPoint;
  worldToLngLat?(point: WorldPoint): LngLat;
}

export class RasterCampusMapAdapter implements CampusMapAdapter {
  sourceToWorld(point: WorldPoint): WorldPoint {
    return { x: point.x * MAP_SCALE, y: point.y * MAP_SCALE };
  }

  worldToSource(point: WorldPoint): WorldPoint {
    return { x: point.x / MAP_SCALE, y: point.y / MAP_SCALE };
  }
}

export const RASTER_MAP_ADAPTER = new RasterCampusMapAdapter();
