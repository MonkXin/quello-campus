import Phaser from "phaser";

export const SOURCE_MAP_WIDTH = 1672;
export const SOURCE_MAP_HEIGHT = 941;
export const MAP_SCALE = 2;
export const MAP_WIDTH = SOURCE_MAP_WIDTH * MAP_SCALE;
export const MAP_HEIGHT = SOURCE_MAP_HEIGHT * MAP_SCALE;

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
