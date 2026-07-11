import Phaser from "phaser";
import { CAMPUS_TOUR_ROUTE } from "../data/campusRoute";
import type { InputController } from "./InputController";

export class RouteController {
  private pointIndex = 1;

  constructor(
    private readonly input: InputController,
    private readonly target: Phaser.GameObjects.Components.Transform
  ) {}

  update() {
    if (this.input.hasManualInput()) {
      this.input.setAutopilotVector({ x: 0, y: 0 });
      return;
    }

    const point = CAMPUS_TOUR_ROUTE[this.pointIndex];
    const dx = point.x - this.target.x;
    const dy = point.y - this.target.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 28) {
      this.pointIndex = (this.pointIndex + 1) % CAMPUS_TOUR_ROUTE.length;
      return;
    }

    this.input.setAutopilotVector({ x: dx / distance, y: dy / distance });
  }
}
