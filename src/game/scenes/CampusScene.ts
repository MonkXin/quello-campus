import Phaser from "phaser";
import { MAP_HEIGHT, MAP_WIDTH } from "../config";
import { AtmosphereController } from "../systems/AtmosphereController";
import { AudioController } from "../systems/AudioController";
import { CameraController } from "../systems/CameraController";
import { InputController } from "../systems/InputController";
import { MapPointRegistry } from "../systems/MapPointRegistry";
import { ResponsiveViewport } from "../systems/ResponsiveViewport";

interface JoystickState {
  base: Phaser.GameObjects.Arc;
  knob: Phaser.GameObjects.Arc;
  pointerId: number | null;
  originX: number;
  originY: number;
  radius: number;
}

export class CampusScene extends Phaser.Scene {
  private inputController?: InputController;
  private cameraController?: CameraController;
  private atmosphere?: AtmosphereController;
  private audio?: AudioController;
  private atmosphereLabel?: Phaser.GameObjects.Text;
  private muteLabel?: Phaser.GameObjects.Text;
  private joystick?: JoystickState;
  private waterHighlights: Phaser.GameObjects.Ellipse[] = [];

  constructor() {
    super("CampusScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#102019");

    this.createPlaceholderCampus();

    this.inputController = new InputController(this);
    this.cameraController = new CameraController(this, this.inputController);
    this.atmosphere = new AtmosphereController(this);
    this.audio = new AudioController(this);

    const points = new MapPointRegistry(this);
    if (new URLSearchParams(window.location.search).get("debugPoints") === "1") {
      points.renderDebugMarkers();
    } else {
      this.renderSubtlePointGlints();
    }

    this.createHud();
    this.createJoystick();

    this.scale.on("resize", () => {
      this.cameraController?.resize();
      this.positionJoystick();
    });
  }

  update(time: number, delta: number) {
    this.cameraController?.update(delta);
    this.atmosphere?.update(time);

    this.waterHighlights.forEach((highlight, index) => {
      highlight.setAlpha(0.12 + Math.sin(time / 900 + index) * 0.05);
      highlight.x += Math.sin(time / 1200 + index) * 0.018;
    });
  }

  private createPlaceholderCampus() {
    this.add.rectangle(0, 0, MAP_WIDTH, MAP_HEIGHT, 0x436b3f).setOrigin(0).setDepth(0);
    this.createGrassTexture();
    this.createRoads();
    this.createLake();
    this.createBuildings();
    this.createProps();
    this.createBakedShadows();
    this.createForegroundCanopy();
    this.createAtmosphericLightBeams();
  }

  private createGrassTexture() {
    const graphics = this.add.graphics().setDepth(1);
    const colors = [0x4e7a46, 0x5c884d, 0x3d653a, 0x6b9457];

    for (let i = 0; i < 800; i += 1) {
      const x = Phaser.Math.Between(40, MAP_WIDTH - 40);
      const y = Phaser.Math.Between(40, MAP_HEIGHT - 40);
      const color = Phaser.Utils.Array.GetRandom(colors);
      graphics.fillStyle(color, Phaser.Math.FloatBetween(0.08, 0.2));
      graphics.fillEllipse(x, y, Phaser.Math.Between(12, 36), Phaser.Math.Between(4, 12));
    }
  }

  private createRoads() {
    const graphics = this.add.graphics().setDepth(10);

    graphics.lineStyle(132, 0x958765, 1);
    graphics.beginPath();
    graphics.moveTo(360, 2890);
    graphics.lineTo(820, 2380);
    graphics.lineTo(1240, 1900);
    graphics.lineTo(1690, 1570);
    graphics.lineTo(2180, 1280);
    graphics.lineTo(2760, 920);
    graphics.lineTo(3540, 430);
    graphics.strokePath();

    graphics.lineStyle(96, 0xae9b74, 1);
    graphics.beginPath();
    graphics.moveTo(240, 1610);
    graphics.lineTo(940, 1580);
    graphics.lineTo(1660, 1570);
    graphics.lineTo(2480, 1660);
    graphics.lineTo(3650, 1770);
    graphics.strokePath();

    graphics.lineStyle(56, 0xd4c18e, 0.72);
    graphics.beginPath();
    graphics.moveTo(360, 2890);
    graphics.lineTo(820, 2380);
    graphics.lineTo(1240, 1900);
    graphics.lineTo(1690, 1570);
    graphics.lineTo(2180, 1280);
    graphics.lineTo(2760, 920);
    graphics.lineTo(3540, 430);
    graphics.strokePath();

    graphics.lineStyle(44, 0xd8c998, 0.7);
    graphics.beginPath();
    graphics.moveTo(240, 1610);
    graphics.lineTo(940, 1580);
    graphics.lineTo(1660, 1570);
    graphics.lineTo(2480, 1660);
    graphics.lineTo(3650, 1770);
    graphics.strokePath();
  }

  private createLake() {
    const lake = this.add.ellipse(1020, 890, 1120, 620, 0x2f7781, 1).setDepth(6);
    lake.setStrokeStyle(18, 0x8fbf9d, 0.38);

    for (let i = 0; i < 16; i += 1) {
      const highlight = this.add
        .ellipse(
          Phaser.Math.Between(560, 1500),
          Phaser.Math.Between(650, 1100),
          Phaser.Math.Between(90, 230),
          Phaser.Math.Between(8, 18),
          0xbce2c6,
          0.14
        )
        .setDepth(7)
        .setAngle(Phaser.Math.Between(-12, 8));
      this.waterHighlights.push(highlight);
    }
  }

  private createBuildings() {
    this.createBuilding(560, 2440, 420, 300, "Main Gate", 0xd8c6a3, 0xa55345);
    this.createBuilding(2220, 1020, 540, 360, "Library", 0xe3d8bd, 0x9f4e45);
    this.createBuilding(3020, 1540, 520, 320, "Cafeteria", 0xd7c5a4, 0xb35b45);
    this.createBuilding(3220, 2280, 620, 360, "Dorms", 0xd9d0b9, 0x93483f);
    this.createBuilding(1790, 2230, 560, 300, "Teaching Hall", 0xe0d6bc, 0x9c5446);

    const track = this.add.ellipse(2960, 610, 780, 430, 0xa85945, 0.95).setDepth(9);
    track.setStrokeStyle(42, 0xd9bc91, 0.5);
    this.add.ellipse(2960, 610, 520, 240, 0x658d4a, 1).setDepth(10);
  }

  private createBuilding(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    wallColor: number,
    roofColor: number
  ) {
    this.add.rectangle(x + 28, y + 40, width, height, 0x142017, 0.22).setDepth(17);
    this.add.rectangle(x, y, width, height, wallColor, 1).setDepth(18);
    this.add.rectangle(x, y - height * 0.42, width + 54, 72, roofColor, 1).setDepth(19);

    for (let i = 0; i < 5; i += 1) {
      this.add.rectangle(x - width * 0.34 + i * (width * 0.17), y + 20, 36, 58, 0xffe7a8, 0.54).setDepth(20);
    }

    this.add
      .text(x, y + height * 0.34, label, {
        color: "#fff4cf",
        fontFamily: "Arial, sans-serif",
        fontSize: "22px",
        stroke: "#4c3024",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(21);
  }

  private createProps() {
    const graphics = this.add.graphics().setDepth(22);
    const benchLocations = [
      [1240, 1180],
      [1380, 1194],
      [2480, 1850],
      [3300, 1890],
      [1880, 1450]
    ];

    benchLocations.forEach(([x, y]) => {
      graphics.fillStyle(0x7c4d35, 1);
      graphics.fillRoundedRect(x, y, 86, 18, 6);
      graphics.fillStyle(0x3e2d24, 0.75);
      graphics.fillRect(x + 8, y + 18, 8, 28);
      graphics.fillRect(x + 68, y + 18, 8, 28);
    });

    for (let i = 0; i < 80; i += 1) {
      graphics.fillStyle(Phaser.Utils.Array.GetRandom([0xf2d6a1, 0xd86c62, 0x7fb7df]), 0.85);
      graphics.fillCircle(Phaser.Math.Between(220, 3860), Phaser.Math.Between(260, 2820), Phaser.Math.Between(5, 10));
    }
  }

  private createBakedShadows() {
    const graphics = this.add.graphics().setDepth(30);
    graphics.fillStyle(0x07140f, 0.28);

    for (let i = 0; i < 42; i += 1) {
      graphics.fillEllipse(
        Phaser.Math.Between(200, MAP_WIDTH - 220),
        Phaser.Math.Between(220, MAP_HEIGHT - 220),
        Phaser.Math.Between(220, 520),
        Phaser.Math.Between(48, 130)
      );
    }
  }

  private createForegroundCanopy() {
    const clusters = [
      [260, 320],
      [440, 640],
      [250, 1260],
      [660, 1840],
      [1160, 2520],
      [3600, 420],
      [3740, 900],
      [3560, 1420],
      [3820, 2300],
      [1980, 520],
      [2460, 2600]
    ];

    clusters.forEach(([x, y], clusterIndex) => {
      for (let i = 0; i < 16; i += 1) {
        const leaf = this.add.circle(
          x + Phaser.Math.Between(-220, 220),
          y + Phaser.Math.Between(-180, 180),
          Phaser.Math.Between(92, 180),
          Phaser.Utils.Array.GetRandom([0x1f5e36, 0x26743f, 0x2f8746, 0x3f9a54]),
          0.96
        );
        leaf.setDepth(clusterIndex % 2 === 0 ? 105 : 44);
      }
    });
  }

  private createAtmosphericLightBeams() {
    const graphics = this.add.graphics().setDepth(96);
    graphics.fillStyle(0xffd88b, 0.08);
    graphics.slice(3280, 140, 980, Phaser.Math.DegToRad(102), Phaser.Math.DegToRad(126), false);
    graphics.fillPath();
    graphics.fillStyle(0xffe1a6, 0.05);
    graphics.slice(3820, 840, 820, Phaser.Math.DegToRad(126), Phaser.Math.DegToRad(152), false);
    graphics.fillPath();
  }

  private createHud() {
    this.atmosphereLabel = ResponsiveViewport.createFixedHudText(
      this,
      20,
      18,
      "天气: Sunny",
      {
        color: "#fff1c4",
        fontFamily: "Arial, sans-serif",
        fontSize: "15px",
        backgroundColor: "rgba(8, 20, 15, 0.42)",
        padding: { x: 10, y: 7 }
      }
    );

    const switchButton = ResponsiveViewport.createFixedHudText(this, 20, 56, "切换晴天/黄昏", {
      color: "#203018",
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      backgroundColor: "#f3d27b",
      padding: { x: 10, y: 7 }
    }).setInteractive({ useHandCursor: true });

    this.muteLabel = ResponsiveViewport.createFixedHudText(this, 20, 94, "声音: 关", {
      color: "#d8f0d8",
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      backgroundColor: "rgba(8, 20, 15, 0.42)",
      padding: { x: 10, y: 7 }
    }).setInteractive({ useHandCursor: true });

    switchButton.on("pointerdown", () => {
      this.atmosphere?.togglePreset();
      this.atmosphereLabel?.setText(`天气: ${this.atmosphere?.getActiveLabel()}`);
    });

    this.muteLabel.on("pointerdown", () => {
      const muted = this.audio?.toggleMuted() ?? true;
      this.muteLabel?.setText(`声音: ${muted ? "关" : "开"}`);
    });
  }

  private createJoystick() {
    const radius = 54;
    const base = this.add.circle(0, 0, radius, 0x0d1b14, 0.38).setStrokeStyle(2, 0xf5df9c, 0.38);
    const knob = this.add.circle(0, 0, 22, 0xf3d27b, 0.8);
    base.setScrollFactor(0).setDepth(220).setInteractive();
    knob.setScrollFactor(0).setDepth(221).setInteractive();

    this.joystick = {
      base,
      knob,
      pointerId: null,
      originX: 0,
      originY: 0,
      radius
    };
    this.positionJoystick();

    base.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.joystick!.pointerId = pointer.id;
      this.updateJoystick(pointer.x, pointer.y);
    });
    knob.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.joystick!.pointerId = pointer.id;
      this.updateJoystick(pointer.x, pointer.y);
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.joystick?.pointerId === pointer.id) {
        this.updateJoystick(pointer.x, pointer.y);
      }
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (this.joystick?.pointerId === pointer.id) {
        this.releaseJoystick();
      }
    });
  }

  private positionJoystick() {
    if (!this.joystick) {
      return;
    }

    const margin = this.scale.height > this.scale.width ? 74 : 54;
    this.joystick.originX = margin + this.joystick.radius;
    this.joystick.originY = this.scale.height - margin - this.joystick.radius;
    this.joystick.base.setPosition(this.joystick.originX, this.joystick.originY);
    this.joystick.knob.setPosition(this.joystick.originX, this.joystick.originY);
  }

  private updateJoystick(pointerX: number, pointerY: number) {
    if (!this.joystick) {
      return;
    }

    const dx = pointerX - this.joystick.originX;
    const dy = pointerY - this.joystick.originY;
    const distance = Math.min(Math.hypot(dx, dy), this.joystick.radius);
    const angle = Math.atan2(dy, dx);
    const knobX = this.joystick.originX + Math.cos(angle) * distance;
    const knobY = this.joystick.originY + Math.sin(angle) * distance;

    this.joystick.knob.setPosition(knobX, knobY);
    this.inputController?.setJoystickVector({
      x: Math.cos(angle) * (distance / this.joystick.radius),
      y: Math.sin(angle) * (distance / this.joystick.radius)
    });
  }

  private releaseJoystick() {
    if (!this.joystick) {
      return;
    }

    this.joystick.pointerId = null;
    this.joystick.knob.setPosition(this.joystick.originX, this.joystick.originY);
    this.inputController?.setJoystickVector({ x: 0, y: 0 });
  }

  private renderSubtlePointGlints() {
    const points = this.cache.json.get("map-points") as Array<{ x: number; y: number }>;

    points.forEach((point) => {
      const glint = this.add.circle(point.x, point.y, 9, 0xffe29c, 0.38).setDepth(82);
      this.tweens.add({
        targets: glint,
        alpha: 0.08,
        scale: 1.8,
        duration: 1600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    });
  }
}
