import Phaser from "phaser";

export interface InputVector {
  x: number;
  y: number;
}

export class InputController {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly keys: Record<"w" | "a" | "s" | "d", Phaser.Input.Keyboard.Key>;
  private joystickVector: InputVector = { x: 0, y: 0 };
  private autopilotVector: InputVector = { x: 0, y: 0 };

  constructor(private readonly scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;

    if (!keyboard) {
      throw new Error("Keyboard input is unavailable.");
    }

    this.cursors = keyboard.createCursorKeys();
    this.keys = {
      w: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
  }

  setJoystickVector(vector: InputVector) {
    this.joystickVector = vector;
  }

  setAutopilotVector(vector: InputVector) {
    this.autopilotVector = vector;
  }

  hasManualInput(): boolean {
    return Math.hypot(this.getManualVector().x, this.getManualVector().y) > 0.05;
  }

  getMovementVector(): InputVector {
    const manual = this.getManualVector();
    const vector = Math.hypot(manual.x, manual.y) > 0.05 ? manual : { ...this.autopilotVector };

    const length = Math.hypot(vector.x, vector.y);

    if (length > 1) {
      vector.x /= length;
      vector.y /= length;
    }

    return vector;
  }

  private getManualVector(): InputVector {
    const vector = { ...this.joystickVector };

    if (this.cursors.left.isDown || this.keys.a.isDown) {
      vector.x -= 1;
    }

    if (this.cursors.right.isDown || this.keys.d.isDown) {
      vector.x += 1;
    }

    if (this.cursors.up.isDown || this.keys.w.isDown) {
      vector.y -= 1;
    }

    if (this.cursors.down.isDown || this.keys.s.isDown) {
      vector.y += 1;
    }

    const length = Math.hypot(vector.x, vector.y);

    if (length > 1) {
      vector.x /= length;
      vector.y /= length;
    }

    return vector;
  }
}
