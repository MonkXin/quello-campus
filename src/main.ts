import Phaser from "phaser";
import { gameConfig } from "./game/config";
import { BootScene } from "./game/scenes/BootScene";
import { CampusPreloadScene } from "./game/scenes/CampusPreloadScene";
import { CampusScene } from "./game/scenes/CampusScene";
import { PreloadScene } from "./game/scenes/PreloadScene";
import { TitleScene } from "./game/scenes/TitleScene";
import "./styles/shell.css";

const config: Phaser.Types.Core.GameConfig = {
  ...gameConfig,
  parent: "app",
  scene: [BootScene, PreloadScene, TitleScene, CampusPreloadScene, CampusScene]
};

new Phaser.Game(config);
