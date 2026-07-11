import Phaser from "phaser";
import { MAP_HEIGHT, MAP_WIDTH } from "../config";
import type { EnvironmentConfig, EnvironmentPreset } from "../types/content";

export class AtmosphereController {
  private presets: EnvironmentPreset[];
  private activeIndex = 0;
  private overlay: Phaser.GameObjects.Rectangle;
  private cloudShadow: Phaser.GameObjects.Ellipse;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter;
  private sunPatches: Phaser.GameObjects.Ellipse[] = [];
  private windStreaks: Phaser.GameObjects.Rectangle[] = [];

  constructor(private readonly scene: Phaser.Scene) {
    const config = scene.cache.json.get("events") as EnvironmentConfig;
    this.presets = config.presets;
    this.activeIndex = Math.max(
      0,
      this.presets.findIndex((preset) => preset.id === config.defaultPreset)
    );

    this.overlay = scene.add.rectangle(0, 0, MAP_WIDTH, MAP_HEIGHT, 0xffffff, 0.04);
    this.overlay.setOrigin(0);
    this.overlay.setDepth(90);
    this.overlay.setBlendMode(Phaser.BlendModes.ADD);

    this.cloudShadow = scene.add.ellipse(MAP_WIDTH * 0.48, MAP_HEIGHT * 0.34, 1400, 520, 0x082018, 0.18);
    this.cloudShadow.setDepth(12);
    this.cloudShadow.setAngle(-12);

    const particleTexture = this.getParticleTexture();
    this.particles = scene.add.particles(0, 0, particleTexture, {
      frame: [0, 1, 2, 3, 4, 5, 6, 7],
      x: { min: 0, max: MAP_WIDTH },
      y: -80,
      lifespan: { min: 9000, max: 16000 },
      speedX: { min: -18, max: 42 },
      speedY: { min: 18, max: 52 },
      scale: { min: 0.08, max: 0.16 },
      alpha: { start: 0.58, end: 0 },
      rotate: { min: -180, max: 180 },
      frequency: 520,
      quantity: 1
    });
    this.particles.setDepth(95);
    this.createSunPatches();
    this.createWindStreaks();

    this.applyPreset();
  }

  togglePreset() {
    this.activeIndex = (this.activeIndex + 1) % this.presets.length;
    this.applyPreset();
    return this.getActivePreset();
  }

  update(timeMs: number) {
    this.cloudShadow.x = MAP_WIDTH * 0.48 + Math.sin(timeMs / 6800) * 82;
    this.cloudShadow.y = MAP_HEIGHT * 0.34 + Math.cos(timeMs / 7800) * 36;
    this.sunPatches.forEach((patch, index) => {
      patch.x += Math.sin(timeMs / 2600 + index * 1.7) * 0.22;
      patch.y += Math.cos(timeMs / 3100 + index) * 0.12;
      patch.setAlpha(0.045 + Math.sin(timeMs / 1700 + index) * 0.018);
    });
    this.windStreaks.forEach((streak, index) => {
      streak.x += 0.38 + index * 0.035;
      streak.y += 0.12;
      streak.setAlpha(0.08 + Math.sin(timeMs / 900 + index) * 0.035);
      if (streak.x > this.scene.scale.width + 120) {
        streak.x = -120;
        streak.y = (streak.y + 97) % this.scene.scale.height;
      }
    });
  }

  getActiveLabel() {
    return this.presets[this.activeIndex]?.label ?? "Sunny";
  }

  getActivePreset() {
    return this.presets[this.activeIndex];
  }

  private applyPreset() {
    const preset = this.presets[this.activeIndex];
    const color = Phaser.Display.Color.HexStringToColor(preset.tint).color;
    this.overlay.setFillStyle(color, preset.id === "dusk" ? 0.045 : 0.055);
    this.cloudShadow.setAlpha(preset.shadowOpacity * 0.32);
  }

  private getParticleTexture() {
    if (this.scene.textures.exists("leaf-particles")) {
      return "leaf-particles";
    }

    return this.createLeafTexture();
  }

  private createLeafTexture() {
    const key = "leaf-particle";

    if (this.scene.textures.exists(key)) {
      return key;
    }

    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x8ed474, 1);
    graphics.fillEllipse(7, 4, 14, 7);
    graphics.fillStyle(0xeabf73, 0.9);
    graphics.fillEllipse(5, 10, 10, 5);
    graphics.generateTexture(key, 16, 16);
    graphics.destroy();

    return key;
  }

  private createSunPatches() {
    const positions = [
      [MAP_WIDTH * 0.24, MAP_HEIGHT * 0.24, 280, 94],
      [MAP_WIDTH * 0.56, MAP_HEIGHT * 0.42, 360, 112],
      [MAP_WIDTH * 0.76, MAP_HEIGHT * 0.68, 250, 82]
    ];
    this.sunPatches = positions.map(([x, y, width, height]) =>
      this.scene.add
        .ellipse(x, y, width, height, 0xffefae, 0.055)
        .setAngle(-18)
        .setDepth(72)
        .setBlendMode(Phaser.BlendModes.ADD)
    );
  }

  private createWindStreaks() {
    this.windStreaks = Array.from({ length: 7 }, (_, index) =>
      this.scene.add
        .rectangle(
          (this.scene.scale.width / 7) * index,
          90 + ((index * 113) % Math.max(180, this.scene.scale.height - 180)),
          58 + index * 8,
          2,
          0xd9f5c9,
          0.1
        )
        .setOrigin(0.5)
        .setAngle(16)
        .setScrollFactor(0)
        .setDepth(148)
        .setBlendMode(Phaser.BlendModes.ADD)
    );
  }
}
