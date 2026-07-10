import Phaser from "phaser";

export class ResponsiveViewport {
  static createFixedHudText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    style: Phaser.Types.GameObjects.Text.TextStyle
  ) {
    return scene.add.text(x, y, text, style).setScrollFactor(0).setDepth(200);
  }
}
