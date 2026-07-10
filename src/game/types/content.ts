export type MapPointType =
  | "arrival"
  | "walk"
  | "rest"
  | "study"
  | "food"
  | "social"
  | "sport"
  | "home"
  | "garden";

export interface MapPoint {
  id: string;
  name: string;
  type: MapPointType;
  x: number;
  y: number;
  radius: number;
  phase: 1 | 2;
  description: string;
}

export interface EnvironmentPreset {
  id: "sunny" | "dusk";
  label: string;
  tint: string;
  shadowOpacity: number;
  particleSet: string;
  music: string;
}

export interface EnvironmentConfig {
  defaultPreset: EnvironmentPreset["id"];
  presets: EnvironmentPreset[];
}

export interface SiteConfig {
  title: string;
  subtitle: string;
  startLabel: string;
  loadingLabel: string;
  controlHint: string;
  titleHint: string;
}
