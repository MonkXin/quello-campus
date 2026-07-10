import Phaser from "phaser";
import { MAP_HEIGHT, MAP_WIDTH } from "../config";
import type { InputController } from "./InputController";

export class CameraController {
  private readonly camera: Phaser.Cameras.Scene2D.Camera;
  private speed = 360;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly input: InputController
  ) {
    this.camera = scene.cameras.main;
    this.camera.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.camera.centerOn(MAP_WIDTH * 0.5, MAP_HEIGHT * 0.55);
    this.resize();
  }

  resize() {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const isPortrait = height > width;
    const zoom = isPortrait ? 0.46 : 0.62;

    this.camera.setZoom(Math.min(0.72, Math.max(0.42, zoom)));
  }

  update(deltaMs: number) {
    const movement = this.input.getMovementVector();
    const deltaSeconds = deltaMs / 1000;

    this.camera.scrollX += movement.x * this.speed * deltaSeconds;
    this.camera.scrollY += movement.y * this.speed * deltaSeconds;

    this.camera.scrollX = Phaser.Math.Clamp(
      this.camera.scrollX,
      0,
      MAP_WIDTH - this.camera.displayWidth
    );
    this.camera.scrollY = Phaser.Math.Clamp(
      this.camera.scrollY,
      0,
      MAP_HEIGHT - this.camera.displayHeight
    );
  }
}
