import Phaser from "phaser";

export class CampusPreloadScene extends Phaser.Scene {
  private loadFailed = false;

  constructor() {
    super("CampusPreloadScene");
  }

  preload() {
    const { width, height } = this.scale;
    const background = this.add.image(width / 2, height / 2, "campus-base").setOrigin(0.5);
    background.setScale(Math.max(width / background.width, height / background.height) * 1.04);
    background.setAlpha(0.36);

    this.add.rectangle(width / 2, height / 2, width, height, 0x07110d, 0.7);

    this.add
      .text(width / 2, height * 0.45, "校园正在醒来", {
        color: "#f7ead1",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "30px"
      })
      .setOrigin(0.5);

    const barWidth = Math.min(360, width * 0.62);
    const barX = (width - barWidth) / 2;
    const barY = height * 0.56;
    const track = this.add.rectangle(barX, barY, barWidth, 6, 0xd7c49a, 0.22).setOrigin(0, 0.5);
    const fill = this.add.rectangle(barX, barY, 2, 6, 0xffd98a, 0.92).setOrigin(0, 0.5);
    const status = this.add
      .text(width / 2, height * 0.62, "正在加载湖面、树影与晚风", {
        color: "#adc7ad",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px"
      })
      .setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      fill.width = Math.max(2, barWidth * value);
    });

    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      this.loadFailed = true;
      status.setColor("#ffd0b8");
      status.setText(`校园资源加载失败，请刷新重试：${file.key}`);
    });

    this.load.on("complete", () => {
      if (!this.loadFailed) {
        track.destroy();
        fill.destroy();
        status.destroy();
      }
    });

    this.load.json("map-points", "data/map_points.json");
    this.load.json("events", "data/events.json");
    this.load.image("campus-water", "assets/campus/map/water.png");
    this.load.image("campus-shadows", "assets/campus/map/shadows.png");
    this.load.image("campus-canopy", "assets/campus/map/foreground-canopy.png");
    this.load.image("campus-dusk-overlay", "assets/campus/atmosphere/dusk-overlay.png");
    this.load.image("campus-cloud-shadows", "assets/campus/atmosphere/cloud-shadows.png");
    this.load.spritesheet("leaf-particles", "assets/campus/particles/leaves-petals.png", {
      frameWidth: 313,
      frameHeight: 627
    });
  }

  create() {
    if (!this.loadFailed) {
      this.scene.start("CampusScene");
    }
  }
}
