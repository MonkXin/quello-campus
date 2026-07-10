import Phaser from "phaser";

export class AudioController {
  private muted = true;

  constructor(private readonly scene: Phaser.Scene) {}

  toggleMuted() {
    this.muted = !this.muted;
    this.scene.sound.mute = this.muted;
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }
}
