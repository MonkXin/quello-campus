import Phaser from "phaser";
import { MAP_HEIGHT, MAP_SCALE, MAP_WIDTH } from "../config";
import { AtmosphereController } from "../systems/AtmosphereController";
import { AudioController } from "../systems/AudioController";
import { CameraController } from "../systems/CameraController";
import { CinematicPostFX } from "../systems/CinematicPostFX";
import { InputController } from "../systems/InputController";
import { MapPointRegistry } from "../systems/MapPointRegistry";
import { PlayerController } from "../systems/PlayerController";
import { ResponsiveViewport } from "../systems/ResponsiveViewport";
import { RouteController } from "../systems/RouteController";
import type { MapPoint, SiteConfig } from "../types/content";

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
  private playerController?: PlayerController;
  private routeController?: RouteController;
  private atmosphere?: AtmosphereController;
  private audio?: AudioController;
  private atmosphereLabel?: Phaser.GameObjects.Text;
  private muteLabel?: Phaser.GameObjects.Text;
  private joystick?: JoystickState;
  private waterHighlights: Phaser.GameObjects.Ellipse[] = [];
  private waterLayer?: Phaser.GameObjects.Image;
  private shadowLayer?: Phaser.GameObjects.Image;
  private cloudShadowLayer?: Phaser.GameObjects.Image;
  private duskDimLayer?: Phaser.GameObjects.Rectangle;
  private duskLayer?: Phaser.GameObjects.Image;
  private foregroundCanopy?: Phaser.GameObjects.Image;
  private waterTween?: Phaser.Tweens.Tween;
  private duskTween?: Phaser.Tweens.Tween;
  private points: MapPoint[] = [];
  private activePointIndex = -1;
  private pointLabel?: Phaser.GameObjects.Text;
  private site?: SiteConfig;
  private hudItems: Phaser.GameObjects.Text[] = [];
  private observerMode = false;
  private cinematicMode = false;

  constructor() {
    super("CampusScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#102019");
    this.site = this.cache.json.get("site") as SiteConfig;
    const searchParams = new URLSearchParams(window.location.search);
    this.observerMode = searchParams.get("observerMode") === "1";
    this.cinematicMode = searchParams.get("tourMode") === "1";

    this.createCampusArtLayers();
    this.createForegroundCanopy();
    new CinematicPostFX(this);

    this.inputController = new InputController(this);
    if (!this.observerMode) {
      this.playerController = new PlayerController(this, this.inputController);
      if (this.cinematicMode) {
        this.routeController = new RouteController(this.inputController, this.playerController.avatar);
      }
    }
    this.cameraController = new CameraController(
      this,
      this.inputController,
      this.playerController?.avatar,
      this.cinematicMode
    );
    this.atmosphere = new AtmosphereController(this);
    this.audio = new AudioController(this);

    const points = new MapPointRegistry(this);
    this.points = points.getPoints();
    if (new URLSearchParams(window.location.search).get("debugPoints") === "1") {
      points.renderDebugMarkers();
    } else {
      this.renderSubtlePointGlints();
    }

    this.createHud();
    this.createJoystick();
    this.createTransientHint();
    this.bindPresenterKeys();

    this.scale.on("resize", () => {
      this.cameraController?.resize();
      this.layoutHud();
      this.positionJoystick();
      this.layoutForegroundCanopy();
    });
  }

  update(time: number, delta: number) {
    this.routeController?.update();
    this.cameraController?.update(delta);
    this.playerController?.update(delta);
    this.atmosphere?.update(time);
    if (this.foregroundCanopy) {
      const camera = this.cameras.main;
      const parallaxX = (camera.scrollX + camera.displayWidth / 2 - MAP_WIDTH / 2) * -0.014;
      const parallaxY = (camera.scrollY + camera.displayHeight / 2 - MAP_HEIGHT / 2) * -0.01;
      this.foregroundCanopy.setPosition(
        this.scale.width / 2 + parallaxX + Math.sin(time / 2400) * 14,
        this.scale.height / 2 + parallaxY + Math.cos(time / 3100) * 8
      );
      const canopyAlpha = this.cinematicMode ? 0.68 + Math.sin(time / 5200) * 0.16 : 0.94;
      this.foregroundCanopy.setAlpha(canopyAlpha);
    }

    this.waterHighlights.forEach((highlight, index) => {
      highlight.setAlpha(0.12 + Math.sin(time / 900 + index) * 0.05);
      highlight.x += Math.sin(time / 1200 + index) * 0.018;
    });
  }

  private createCampusArtLayers() {
    this.add.image(0, 0, "campus-base").setOrigin(0).setScale(MAP_SCALE).setDepth(0);

    this.waterLayer = this.add
      .image(0, 0, "campus-water")
      .setOrigin(0)
      .setScale(MAP_SCALE)
      .setAlpha(0.62)
      .setDepth(8)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.shadowLayer = this.add
      .image(0, 0, "campus-shadows")
      .setOrigin(0)
      .setScale(MAP_SCALE)
      .setAlpha(0.32)
      .setDepth(32)
      .setBlendMode(Phaser.BlendModes.MULTIPLY);

    this.cloudShadowLayer = this.add
      .image(MAP_WIDTH * 0.52, MAP_HEIGHT * 0.52, "campus-cloud-shadows")
      .setOrigin(0.5)
      .setScale(2.85)
      .setAlpha(0.08)
      .setDepth(34)
      .setBlendMode(Phaser.BlendModes.MULTIPLY);

    this.duskDimLayer = this.add
      .rectangle(0, 0, MAP_WIDTH, MAP_HEIGHT, 0x1f241d, 0)
      .setOrigin(0)
      .setDepth(88)
      .setBlendMode(Phaser.BlendModes.MULTIPLY);

    this.duskLayer = this.add
      .image(0, 0, "campus-dusk-overlay")
      .setOrigin(0)
      .setScale(MAP_SCALE)
      .setAlpha(0.08)
      .setDepth(92)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.add
      .image(0, 0, "campus-canopy")
      .setOrigin(0)
      .setScale(MAP_SCALE)
      .setDepth(112);

    this.waterTween = this.tweens.add({
      targets: this.waterLayer,
      alpha: 0.72,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.duskTween = this.tweens.add({
      targets: this.duskLayer,
      alpha: 0.12,
      duration: 5200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.tweens.add({
      targets: this.cloudShadowLayer,
      x: MAP_WIDTH * 0.48,
      y: MAP_HEIGHT * 0.55,
      alpha: 0.12,
      duration: 22000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  private createForegroundCanopy() {
    this.foregroundCanopy = this.add
      .image(this.scale.width / 2, this.scale.height / 2, "route-canopy")
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(150)
      .setAlpha(0.94);
    this.layoutForegroundCanopy();
  }

  private layoutForegroundCanopy() {
    if (!this.foregroundCanopy) {
      return;
    }
    const coverScale = Math.max(
      this.scale.width / this.foregroundCanopy.width,
      this.scale.height / this.foregroundCanopy.height
    );
    this.foregroundCanopy.setScale(coverScale * 1.04);
  }

  private createHud() {
    const hudStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      color: "#fff1c4",
      fontFamily: "Arial, sans-serif",
      fontSize: "15px",
      backgroundColor: "rgba(8, 20, 15, 0.42)",
      padding: { x: 10, y: 7 }
    };

    this.atmosphereLabel = ResponsiveViewport.createFixedHudText(
      this,
      20,
      18,
      "天气: 晴天",
      hudStyle
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

    this.pointLabel = ResponsiveViewport.createFixedHudText(
      this,
      20,
      132,
      this.observerMode ? "地点: 自由浏览" : "探索: 角色跟随",
      {
      color: "#d8f0d8",
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      backgroundColor: "rgba(8, 20, 15, 0.42)",
      padding: { x: 10, y: 7 }
      }
    );

    if (this.observerMode) {
      this.pointLabel.setInteractive({ useHandCursor: true });
    }

    this.hudItems = [this.atmosphereLabel, switchButton, this.muteLabel, this.pointLabel];
    this.layoutHud();

    switchButton.on("pointerdown", () => {
      this.toggleEnvironment();
    });

    this.muteLabel.on("pointerdown", () => {
      const muted = this.audio?.toggleMuted() ?? true;
      this.muteLabel?.setText(`声音: ${muted ? "关" : "开"}`);
    });

    if (this.observerMode) {
      this.pointLabel.on("pointerdown", () => this.focusNextPoint());
    }
  }

  private bindPresenterKeys() {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      return;
    }

    keyboard.on("keydown-T", () => this.toggleEnvironment());
    keyboard.on("keydown-M", () => {
      const muted = this.audio?.toggleMuted() ?? true;
      this.muteLabel?.setText(`声音: ${muted ? "关" : "开"}`);
    });
    if (this.observerMode) {
      keyboard.on("keydown-N", () => this.focusNextPoint());
    }
  }

  private toggleEnvironment() {
    const preset = this.atmosphere?.togglePreset();
    this.atmosphereLabel?.setText(`天气: ${this.atmosphere?.getActiveLabel()}`);
    if (preset) {
      this.applyEnvironmentVisuals(preset.id);
    }
  }

  private layoutHud() {
    if (!this.hudItems.length) {
      return;
    }

    const isPortrait = this.scale.height > this.scale.width;
    const startX = isPortrait ? 12 : 20;
    const startY = isPortrait ? 12 : 18;
    const gap = isPortrait ? 34 : 38;

    this.hudItems.forEach((item, index) => {
      item.setVisible(!this.cinematicMode);
      item.setPosition(startX, startY + index * gap);
      item.setFontSize(isPortrait ? 12 : 14);
      item.setAlpha(isPortrait ? 0.86 : 1);
    });
  }

  private focusNextPoint() {
    if (!this.points.length) {
      return;
    }

    this.activePointIndex = (this.activePointIndex + 1) % this.points.length;
    const point = this.points[this.activePointIndex];
    this.cameraController?.glideTo(point.x, point.y);
    this.pointLabel?.setText(`地点: ${point.name}`);
  }

  private applyEnvironmentVisuals(presetId: "sunny" | "dusk") {
    const isDusk = presetId === "dusk";
    this.waterTween?.stop();
    this.duskTween?.stop();

    this.tweens.add({
      targets: this.shadowLayer,
      alpha: isDusk ? 0.58 : 0.32,
      duration: 900,
      ease: "Sine.easeInOut"
    });

    this.tweens.add({
      targets: this.cloudShadowLayer,
      alpha: isDusk ? 0.16 : 0.08,
      duration: 900,
      ease: "Sine.easeInOut"
    });

    this.tweens.add({
      targets: this.duskDimLayer,
      alpha: isDusk ? 0.22 : 0,
      duration: 900,
      ease: "Sine.easeInOut"
    });

    this.tweens.add({
      targets: this.waterLayer,
      alpha: isDusk ? 0.5 : 0.62,
      duration: 900,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.waterTween = this.tweens.add({
          targets: this.waterLayer,
          alpha: isDusk ? 0.58 : 0.72,
          duration: isDusk ? 1800 : 2400,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut"
        });
      }
    });

    this.tweens.add({
      targets: this.duskLayer,
      alpha: isDusk ? 0.28 : 0.08,
      duration: 900,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.duskTween = this.tweens.add({
          targets: this.duskLayer,
          alpha: isDusk ? 0.36 : 0.12,
          duration: isDusk ? 4300 : 5600,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut"
        });
      }
    });
  }

  private createTransientHint() {
    if (this.cinematicMode) {
      return;
    }
    const hint = ResponsiveViewport.createFixedHudText(
      this,
      this.scale.width / 2,
      this.scale.height - 42,
      this.observerMode
        ? "拖动画面或使用 WASD / 方向键慢慢浏览校园"
        : "使用 WASD / 方向键或屏幕摇杆带角色探索校园",
      {
        color: "#fff6d6",
        fontFamily: "Arial, sans-serif",
        fontSize: "15px",
        backgroundColor: "rgba(8, 20, 15, 0.45)",
        padding: { x: 14, y: 8 }
      }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: 0,
      delay: 4200,
      duration: 1200,
      onComplete: () => hint.destroy()
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
    base.setAlpha(this.cinematicMode ? 0.12 : 1);
    knob.setAlpha(this.cinematicMode ? 0.12 : 1);
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
