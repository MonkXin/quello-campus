import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    const { width, height } = this.scale;
    const barWidth = Math.min(360, width * 0.62);
    const x = (width - barWidth) / 2;
    const y = height * 0.58;

    this.add
      .text(width / 2, height * 0.45, "Quello Campus", {
        color: "#f7ead1",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "34px"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.51, "正在铺开校园地图", {
        color: "#adc7ad",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px"
      })
      .setOrigin(0.5);

    const track = this.add.rectangle(x, y, barWidth, 6, 0xd7c49a, 0.22).setOrigin(0, 0.5);
    const fill = this.add.rectangle(x, y, 2, 6, 0xffd98a, 0.92).setOrigin(0, 0.5);
    const errorText = this.add
      .text(width / 2, height * 0.66, "", {
        color: "#ffd0b8",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px"
      })
      .setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      fill.width = Math.max(2, barWidth * value);
    });

    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      errorText.setText(`地图资源加载失败，请刷新重试：${file.key}`);
    });

    this.load.on("complete", () => {
      track.destroy();
      fill.destroy();
      errorText.destroy();
    });

    this.load.json("map-points", "data/map_points.json");
    this.load.json("events", "data/events.json");
    this.load.json("site", "data/site.json");
    this.load.image("campus-base", "assets/campus/map/base.webp");
    this.load.image("campus-water", "assets/campus/map/water.png");
    this.load.image("campus-shadows", "assets/campus/map/shadows.png");
    this.load.image("campus-canopy", "assets/campus/map/foreground-canopy.png");
    this.load.image("campus-dusk-overlay", "assets/campus/atmosphere/dusk-overlay.png");
    this.load.image("campus-cloud-shadows", "assets/campus/atmosphere/cloud-shadows.png");
    this.load.image("quello-campus-title", "assets/ui/quello-campus-title.webp");
    this.load.image("title-canopy-frame", "assets/ui/title-canopy-frame.webp");
    this.load.spritesheet("leaf-particles", "assets/campus/particles/leaves-petals.png", {
      frameWidth: 313,
      frameHeight: 627
    });
  }

  create() {
    this.scene.start("TitleScene");
  }
}
