import Phaser from "phaser";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#101d17");

    this.add.rectangle(width / 2, height / 2, width, height, 0x101d17, 1);
    this.add.rectangle(width / 2, height / 2, width, height, 0xf0c06a, 0.08);

    this.add
      .text(width / 2, height * 0.35, "Quello Campus", {
        color: "#fff2cf",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: `${Math.max(42, Math.min(74, width * 0.07))}px`
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.46, "一座正在醒来的像素校园", {
        color: "#d8f0d8",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px"
      })
      .setOrigin(0.5);

    const start = this.add
      .text(width / 2, height * 0.62, "进入校园", {
        backgroundColor: "#f3d27b",
        color: "#1d2118",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        padding: { x: 24, y: 14 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, height * 0.73, "WASD / 方向键 / 屏幕摇杆移动观察视角", {
        color: "#afc7af",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px"
      })
      .setOrigin(0.5);

    start.on("pointerdown", () => {
      this.scene.start("CampusScene");
    });
  }
}
