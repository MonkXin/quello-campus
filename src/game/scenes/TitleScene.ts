import Phaser from "phaser";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#101d17");

    const background = this.add.image(width / 2, height / 2, "campus-base").setOrigin(0.5);
    const scale = Math.max(width / background.width, height / background.height) * 1.06;
    background.setScale(scale);
    background.setAlpha(0.74);

    this.add.rectangle(width / 2, height / 2, width, height, 0x07110d, 0.36);
    this.add.rectangle(width / 2, height / 2, width, height, 0xf0c06a, 0.1);

    this.add
      .text(width / 2, height * 0.36, "Quello Campus", {
        color: "#fff2cf",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: `${Math.max(42, Math.min(74, width * 0.07))}px`
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.47, "一座正在醒来的像素校园", {
        color: "#d8f0d8",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px"
      })
      .setOrigin(0.5);

    const start = this.add
      .text(width / 2, height * 0.63, "进入校园", {
        backgroundColor: "#f3d27b",
        color: "#1d2118",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        padding: { x: 24, y: 14 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, height * 0.74, "拖动画面 / WASD / 方向键 / 屏幕摇杆", {
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
