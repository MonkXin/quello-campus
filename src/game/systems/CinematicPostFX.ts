import Phaser from "phaser";

export class CinematicPostFX {
  private readonly reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  private vignette: Phaser.GameObjects.Rectangle[] = [];
  private bloom: Phaser.GameObjects.Ellipse[] = [];

  constructor(private readonly scene: Phaser.Scene) {
    this.createVignette();
    this.createHighlightBloom();
    this.layout();
    scene.scale.on("resize", this.layout, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.scale.off("resize", this.layout, this);
    });
  }

  private createVignette() {
    this.vignette = Array.from({ length: 4 }, () =>
      this.scene.add
        .rectangle(0, 0, 10, 10, 0x06100c, 0.16)
        .setOrigin(0)
        .setScrollFactor(0)
        .setDepth(170)
        .setBlendMode(Phaser.BlendModes.MULTIPLY)
    );
  }

  private createHighlightBloom() {
    this.bloom = [
      this.scene.add.ellipse(0, 0, 420, 210, 0xfff0b1, 0.035),
      this.scene.add.ellipse(0, 0, 300, 150, 0xc9f5c6, 0.024)
    ];
    this.bloom.forEach((glow, index) => {
      glow.setScrollFactor(0).setDepth(168).setBlendMode(Phaser.BlendModes.ADD);
      if (!this.reducedMotion) {
        this.scene.tweens.add({
          targets: glow,
          alpha: glow.alpha * 1.8,
          scale: 1.08,
          duration: 3600 + index * 900,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut"
        });
      }
    });
  }

  private layout() {
    const { width, height } = this.scene.scale;
    const edgeX = Math.max(42, width * 0.055);
    const edgeY = Math.max(32, height * 0.07);
    this.vignette[0]?.setPosition(0, 0).setSize(width, edgeY);
    this.vignette[1]?.setPosition(0, height - edgeY).setSize(width, edgeY);
    this.vignette[2]?.setPosition(0, 0).setSize(edgeX, height);
    this.vignette[3]?.setPosition(width - edgeX, 0).setSize(edgeX, height);
    this.bloom[0]?.setPosition(width * 0.56, height * 0.42);
    this.bloom[1]?.setPosition(width * 0.42, height * 0.62);
  }
}
