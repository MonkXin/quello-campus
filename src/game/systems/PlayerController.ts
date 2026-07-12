import Phaser from "phaser";
import { MAP_HEIGHT, MAP_WIDTH } from "../config";
import { CAMPUS_BUILDING_COLLISIONS, circleIntersectsRect } from "../data/campusCollision";
import { RASTER_MAP_ADAPTER } from "../map/CampusMapAdapter";
import type { InputController } from "./InputController";

const SPAWN_X = 500 * 2;
const SPAWN_Y = 510 * 2;
const COLLISION_RADIUS = 18;

export class PlayerController {
  readonly avatar: Phaser.GameObjects.Container;
  private readonly speed = 230;
  private readonly sprite: Phaser.GameObjects.Sprite;
  private facing: "down" | "left" | "right" | "up" = "down";

  constructor(
    scene: Phaser.Scene,
    private readonly input: InputController
  ) {
    const shadow = scene.add.ellipse(0, 47, 58, 20, 0x07110d, 0.3);
    this.sprite = scene.add.sprite(0, 0, "student-walk", 0).setScale(0.96);
    this.createAnimations(scene);

    this.avatar = scene.add.container(SPAWN_X, SPAWN_Y, [shadow, this.sprite]);
    this.avatar.setDepth(80);

    if (new URLSearchParams(window.location.search).get("debugCollision") === "1") {
      this.renderCollisionDebug(scene);
    }
  }

  update(deltaMs: number) {
    const movement = this.input.getMovementVector();
    const distance = (this.speed * deltaMs) / 1000;

    const nextX = Phaser.Math.Clamp(this.avatar.x + movement.x * distance, 48, MAP_WIDTH - 48);
    const nextY = Phaser.Math.Clamp(this.avatar.y + movement.y * distance, 48, MAP_HEIGHT - 48);

    if (this.canOccupy(nextX, this.avatar.y)) {
      this.avatar.x = nextX;
    }
    if (this.canOccupy(this.avatar.x, nextY)) {
      this.avatar.y = nextY;
    }

    const moving = Math.abs(movement.x) + Math.abs(movement.y) > 0.02;
    if (moving) {
      this.facing = this.resolveFacing(movement.x, movement.y);
      this.sprite.play(`student-walk-${this.facing}`, true);
    } else {
      this.sprite.stop();
      this.sprite.setFrame({ down: 0, left: 4, right: 8, up: 12 }[this.facing]);
    }
  }

  private createAnimations(scene: Phaser.Scene) {
    const rows = { down: 0, left: 4, right: 8, up: 12 } as const;
    Object.entries(rows).forEach(([direction, start]) => {
      const key = `student-walk-${direction}`;
      if (!scene.anims.exists(key)) {
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers("student-walk", { start, end: start + 3 }),
          frameRate: 8,
          repeat: -1
        });
      }
    });
  }

  private resolveFacing(x: number, y: number): "down" | "left" | "right" | "up" {
    if (Math.abs(x) > Math.abs(y)) {
      return x < 0 ? "left" : "right";
    }
    return y < 0 ? "up" : "down";
  }

  private canOccupy(worldX: number, worldY: number): boolean {
    const sourcePoint = RASTER_MAP_ADAPTER.worldToSource({ x: worldX, y: worldY });
    const sourceWorldX = sourcePoint.x;
    const sourceWorldY = sourcePoint.y;
    const sourceRadius = COLLISION_RADIUS / 2;
    if (
      CAMPUS_BUILDING_COLLISIONS.some((rect) =>
        circleIntersectsRect(sourceWorldX, sourceWorldY, sourceRadius, rect)
      )
    ) {
      return false;
    }

    const samples = [
      [0, 0],
      [-COLLISION_RADIUS, 0],
      [COLLISION_RADIUS, 0],
      [0, -COLLISION_RADIUS],
      [0, COLLISION_RADIUS]
    ];

    return samples.every(([offsetX, offsetY]) => {
      const samplePoint = RASTER_MAP_ADAPTER.worldToSource({
        x: worldX + offsetX,
        y: worldY + offsetY
      });
      const sourceX = Math.round(samplePoint.x);
      const sourceY = Math.round(samplePoint.y);
      const pixel = this.avatar.scene.textures.getPixel(sourceX, sourceY, "campus-water");
      const basePixel = this.avatar.scene.textures.getPixel(sourceX, sourceY, "campus-base");
      const baseLooksLikeWater = Boolean(
        basePixel &&
          basePixel.blue > 90 &&
          basePixel.blue > basePixel.red * 1.25 &&
          basePixel.blue > basePixel.green * 1.08
      );
      return (!pixel || pixel.alpha < 24) && !baseLooksLikeWater;
    });
  }

  private renderCollisionDebug(scene: Phaser.Scene) {
    CAMPUS_BUILDING_COLLISIONS.forEach((rect) => {
      scene.add
        .rectangle(rect.x * 2, rect.y * 2, rect.width * 2, rect.height * 2, 0xff466d, 0.2)
        .setOrigin(0)
        .setStrokeStyle(3, 0xff8ca2, 0.85)
        .setDepth(180);
    });
  }
}
