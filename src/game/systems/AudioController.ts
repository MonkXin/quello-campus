import Phaser from "phaser";

export class AudioController {
  private muted = true;
  private context?: AudioContext;
  private master?: GainNode;
  private windSource?: AudioBufferSourceNode;
  private windGain?: GainNode;
  private padOscillators: OscillatorNode[] = [];
  private bellTimer?: number;

  constructor(private readonly scene: Phaser.Scene) {
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }

  toggleMuted() {
    this.muted = !this.muted;

    if (!this.muted) {
      this.start();
    } else {
      this.master?.gain.setTargetAtTime(0, this.context?.currentTime ?? 0, 0.08);
    }

    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  private start() {
    this.ensureGraph();

    if (!this.context || !this.master) {
      return;
    }

    if (this.context.state === "suspended") {
      void this.context.resume();
    }

    this.master.gain.setTargetAtTime(0.24, this.context.currentTime, 0.12);
  }

  private ensureGraph() {
    if (this.context) {
      return;
    }

    const audioWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
    const AudioContextClass = window.AudioContext ?? audioWindow.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    this.context = new AudioContextClass();
    this.master = this.context.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.context.destination);

    this.createWindLayer();
    this.createPadLayer();
    this.scheduleBell();
  }

  private createWindLayer() {
    if (!this.context || !this.master) {
      return;
    }

    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(1, sampleRate * 2, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.32;
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 760;
    filter.Q.value = 0.7;

    this.windGain = this.context.createGain();
    this.windGain.gain.value = 0.13;

    source.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.master);
    source.start();
    this.windSource = source;
  }

  private createPadLayer() {
    if (!this.context || !this.master) {
      return;
    }

    const padGain = this.context.createGain();
    padGain.gain.value = 0.035;
    padGain.connect(this.master);

    const frequencies = [196, 246.94, 293.66, 392];

    frequencies.forEach((frequency, index) => {
      const oscillator = this.context!.createOscillator();
      const gain = this.context!.createGain();
      oscillator.type = index % 2 === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index * 3 - 5;
      gain.gain.value = 0.2;
      oscillator.connect(gain);
      gain.connect(padGain);
      oscillator.start();
      this.padOscillators.push(oscillator);
    });
  }

  private scheduleBell() {
    this.bellTimer = window.setInterval(() => this.playBell(), 16000);
  }

  private playBell() {
    if (this.muted || !this.context || !this.master) {
      return;
    }

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, this.context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(660, this.context.currentTime + 1.8);
    gain.gain.setValueAtTime(0.0001, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.055, this.context.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 2.1);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start();
    oscillator.stop(this.context.currentTime + 2.2);
  }

  private destroy() {
    if (this.bellTimer) {
      window.clearInterval(this.bellTimer);
    }

    this.windSource?.stop();
    this.padOscillators.forEach((oscillator) => oscillator.stop());
    void this.context?.close();
  }
}
