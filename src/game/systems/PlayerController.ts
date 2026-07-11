import Phaser from "phaser";
import { MAP_HEIGHT, MAP_WIDTH } from "../config";
import type { InputController } from "./InputController";

export class PlayerController {
  readonly avatar: Phaser.GameObjects.Container;
  private readonly speed = 230;

  constructor(
    scene: Phaser.Scene,
    private readonly input: InputController
  ) {
    const shadow = scene.add.ellipse(0, 18, 34, 15, 0x07110d, 0.28);
    const body = scene.add.circle(0, 0, 16, 0xf1d183, 1).setStrokeStyle(3, 0x274737, 1);
    const direction = scene.add.triangle(0, -3, -6, 6, 6, 6, 0, -7, 0x294d3a, 1);

    this.avatar = scene.add.container(MAP_WIDTH * 0.5, MAP_HEIGHT * 0.58, [shadow, body, direction]);
    this.avatar.setDepth(80);
  }

  update(deltaMs: number) {
    const movement = this.input.getMovementVector();
    const distance = (this.speed * deltaMs) / 1000;

    this.avatar.x = Phaser.Math.Clamp(this.avatar.x + movement.x * distance, 48, MAP_WIDTH - 48);
    this.avatar.y = Phaser.Math.Clamp(this.avatar.y + movement.y * distance, 48, MAP_HEIGHT - 48);

    if (Math.abs(movement.x) + Math.abs(movement.y) > 0.02) {
      this.avatar.rotation = Math.atan2(movement.y, movement.x) + Math.PI / 2;
    }
  }
}
