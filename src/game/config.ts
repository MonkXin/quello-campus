import Phaser from "phaser";

export const MAP_WIDTH = 4096;
export const MAP_HEIGHT = 3072;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: "#08130f",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true
  },
  audio: {
    disableWebAudio: false
  }
};
