import Phaser from "phaser";
import { MAP_HEIGHT, MAP_WIDTH } from "../config";
import type { InputController } from "./InputController";

export class CameraController {
  private readonly camera: Phaser.Cameras.Scene2D.Camera;
  private speed = 260;
  private dragPointerId: number | null = null;
  private lastDragX = 0;
  private lastDragY = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly input: InputController
  ) {
    this.camera = scene.cameras.main;
    this.camera.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.camera.centerOn(MAP_WIDTH * 0.5, MAP_HEIGHT * 0.55);
    this.resize();
    this.bindDragPan();
  }

  resize() {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const isPortrait = height > width;
    const zoom = isPortrait ? 0.78 : 0.92;

    this.camera.setZoom(Math.min(1, Math.max(0.68, zoom)));
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

  private bindDragPan() {
    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < 150 && pointer.y > this.scene.scale.height - 160) {
        return;
      }

      this.dragPointerId = pointer.id;
      this.lastDragX = pointer.x;
      this.lastDragY = pointer.y;
    });

    this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.dragPointerId !== pointer.id || !pointer.isDown) {
        return;
      }

      const zoom = this.camera.zoom || 1;
      const deltaX = (this.lastDragX - pointer.x) / zoom;
      const deltaY = (this.lastDragY - pointer.y) / zoom;

      this.camera.scrollX = Phaser.Math.Clamp(
        this.camera.scrollX + deltaX,
        0,
        MAP_WIDTH - this.camera.displayWidth
      );
      this.camera.scrollY = Phaser.Math.Clamp(
        this.camera.scrollY + deltaY,
        0,
        MAP_HEIGHT - this.camera.displayHeight
      );
      this.lastDragX = pointer.x;
      this.lastDragY = pointer.y;
    });

    this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (this.dragPointerId === pointer.id) {
        this.dragPointerId = null;
      }
    });
  }
}
