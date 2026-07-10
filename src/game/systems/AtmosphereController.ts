import Phaser from "phaser";
import { MAP_HEIGHT, MAP_WIDTH } from "../config";
import type { EnvironmentConfig, EnvironmentPreset } from "../types/content";

export class AtmosphereController {
  private presets: EnvironmentPreset[];
  private activeIndex = 0;
  private overlay: Phaser.GameObjects.Rectangle;
  private cloudShadow: Phaser.GameObjects.Ellipse;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter;

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
}
