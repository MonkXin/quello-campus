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

    const track = this.add.rectangle(x, y, barWidth, 6, 0xd7c49a, 0.22).setOrigin(0, 0.5);
    const fill = this.add.rectangle(x, y, 2, 6, 0xffd98a, 0.92).setOrigin(0, 0.5);

    this.load.on("progress", (value: number) => {
      fill.width = Math.max(2, barWidth * value);
    });

    this.load.on("complete", () => {
      track.destroy();
      fill.destroy();
    });

    this.load.json("map-points", "data/map_points.json");
    this.load.json("events", "data/events.json");
  }

  create() {
    this.scene.start("TitleScene");
  }
}
