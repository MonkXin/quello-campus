import Phaser from "phaser";
import type { SiteConfig } from "../types/content";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }

  create() {
    const { width, height } = this.scale;
    const site = this.cache.json.get("site") as SiteConfig;
    this.cameras.main.setBackgroundColor("#101d17");

    const background = this.add.image(width / 2, height / 2, "campus-base").setOrigin(0.5);
    const scale = Math.max(width / background.width, height / background.height) * 1.06;
    background.setScale(scale);
    background.setAlpha(0.74);

    this.add.rectangle(width / 2, height / 2, width, height, 0x07110d, 0.36);
    this.add.rectangle(width / 2, height / 2, width, height, 0xf0c06a, 0.1);

    const canopyFrame = this.add.image(width / 2, height / 2, "title-canopy-frame").setOrigin(0.5);
    canopyFrame.setScale(Math.max(width / canopyFrame.width, height / canopyFrame.height) * 1.08);
    canopyFrame.setAlpha(0.72);
    canopyFrame.setDepth(4);

    this.tweens.add({
      targets: canopyFrame,
      scale: canopyFrame.scale * 1.018,
      x: width / 2 + 8,
      y: height / 2 - 6,
      alpha: 0.82,
      duration: 6800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    const logo = this.add.image(width / 2, height * 0.36, "quello-campus-title").setOrigin(0.5);
    logo.setScale(Math.min(width * 0.66 / logo.width, 0.42));
    logo.setDepth(12);

    this.add
      .text(width / 2, height * 0.47, "一座正在醒来的像素校园", {
        color: "#d8f0d8",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px"
      })
      .setText(site.subtitle)
      .setOrigin(0.5)
      .setDepth(12);

    const start = this.add
      .text(width / 2, height * 0.63, site.startLabel, {
        backgroundColor: "#f3d27b",
        color: "#1d2118",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        padding: { x: 24, y: 14 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(12);

    this.add
      .text(width / 2, height * 0.74, site.titleHint, {
        color: "#afc7af",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px"
      })
      .setOrigin(0.5)
      .setDepth(12);

    start.on("pointerdown", () => {
      this.scene.start("CampusPreloadScene");
    });

    this.scale.on("resize", this.restartForResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this.restartForResize, this);
    });
  }

  private restartForResize() {
    this.scene.restart();
  }
}
