import Phaser from "phaser";
import type { MapPoint } from "../types/content";

export class MapPointRegistry {
  private points: MapPoint[];

  constructor(private readonly scene: Phaser.Scene) {
    this.points = scene.cache.json.get("map-points") as MapPoint[];
  }

  renderDebugMarkers() {
    this.points.forEach((point) => {
      const ring = this.scene.add.circle(point.x, point.y, point.radius, 0xf6d987, 0.08);
      ring.setStrokeStyle(2, 0xf6d987, 0.38);
      ring.setDepth(80);

      this.scene.add
        .text(point.x, point.y - point.radius - 18, point.name, {
          color: "#fff1bf",
          fontFamily: "Arial, sans-serif",
          fontSize: "20px",
          stroke: "#102019",
          strokeThickness: 4
        })
        .setOrigin(0.5)
        .setDepth(81);
    });
  }
}
