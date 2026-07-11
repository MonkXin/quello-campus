import Phaser from "phaser";
import { MAP_HEIGHT, MAP_WIDTH } from "../config";
import type { InputController } from "./InputController";

export class CameraController {
  private readonly camera: Phaser.Cameras.Scene2D.Camera;
  private speed = 260;
  private readonly followsTarget: boolean;
  private followOffsetX = 0;
  private followOffsetY = 0;
  private baseFollowOffsetY = 0;
  private lookAheadX = 90;
  private dragPointerId: number | null = null;
  private lastDragX = 0;
  private lastDragY = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly input: InputController,
    followTarget?: Phaser.GameObjects.GameObject
  ) {
    this.camera = scene.cameras.main;
    this.followsTarget = Boolean(followTarget);
    this.camera.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.camera.centerOn(MAP_WIDTH * 0.5, MAP_HEIGHT * 0.55);
    this.resize();
    if (followTarget) {
      this.camera.startFollow(followTarget, true, 0.09, 0.09);
    } else {
      this.bindDragPan();
    }
  }

  resize() {
    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const isPortrait = height > width;
    const zoom = isPortrait ? 0.78 : 0.92;

    this.camera.setZoom(Math.min(1, Math.max(0.68, zoom)));
    this.baseFollowOffsetY = -height * (isPortrait ? 0.1 : 0.14);
    this.lookAheadX = isPortrait ? 28 : 90;
  }

  update(deltaMs: number) {
    if (this.followsTarget) {
      const movement = this.input.getMovementVector();
      const damping = 1 - Math.pow(0.001, deltaMs / 1000);
      this.followOffsetX = Phaser.Math.Linear(
        this.followOffsetX,
        movement.x * this.lookAheadX,
        damping
      );
      this.followOffsetY = Phaser.Math.Linear(
        this.followOffsetY,
        this.baseFollowOffsetY + movement.y * 58,
        damping
      );
      this.camera.setFollowOffset(this.followOffsetX, this.followOffsetY);
      return;
    }
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

  glideTo(x: number, y: number) {
    const targetScrollX = Phaser.Math.Clamp(
      x - this.camera.displayWidth / 2,
      0,
      MAP_WIDTH - this.camera.displayWidth
    );
    const targetScrollY = Phaser.Math.Clamp(
      y - this.camera.displayHeight / 2,
      0,
      MAP_HEIGHT - this.camera.displayHeight
    );

    this.scene.tweens.add({
      targets: this.camera,
      scrollX: targetScrollX,
      scrollY: targetScrollY,
      duration: 900,
      ease: "Sine.easeInOut"
    });
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
