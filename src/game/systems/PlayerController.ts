import Phaser from "phaser";
import { MAP_HEIGHT, MAP_WIDTH } from "../config";
import type { InputController } from "./InputController";

export class PlayerController {
  readonly avatar: Phaser.GameObjects.Container;
  private readonly speed = 230;
  private readonly sprite: Phaser.GameObjects.Sprite;
  private facing: "down" | "left" | "right" | "up" = "down";

  constructor(
    scene: Phaser.Scene,
    private readonly input: InputController
  ) {
    const shadow = scene.add.ellipse(0, 39, 50, 18, 0x07110d, 0.3);
    this.sprite = scene.add.sprite(0, 0, "student-walk", 0).setScale(0.78);
    this.createAnimations(scene);

    this.avatar = scene.add.container(MAP_WIDTH * 0.5, MAP_HEIGHT * 0.58, [shadow, this.sprite]);
    this.avatar.setDepth(80);
  }

  update(deltaMs: number) {
    const movement = this.input.getMovementVector();
    const distance = (this.speed * deltaMs) / 1000;

    this.avatar.x = Phaser.Math.Clamp(this.avatar.x + movement.x * distance, 48, MAP_WIDTH - 48);
    this.avatar.y = Phaser.Math.Clamp(this.avatar.y + movement.y * distance, 48, MAP_HEIGHT - 48);

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
}
