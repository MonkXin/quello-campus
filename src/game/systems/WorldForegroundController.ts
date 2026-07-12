import Phaser from "phaser";
import type { ForegroundNodeDefinition } from "../data/campusForegroundNodes";
import type { CampusMapAdapter } from "../map/CampusMapAdapter";

interface RenderedForegroundNode {
  image: Phaser.GameObjects.Image;
  baseX: number;
  baseY: number;
  definition: ForegroundNodeDefinition;
  phase: number;
}

export class WorldForegroundController {
  private readonly renderedNodes: RenderedForegroundNode[];
  private readonly reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  constructor(
    scene: Phaser.Scene,
    adapter: CampusMapAdapter,
    nodes: ForegroundNodeDefinition[]
  ) {
    this.renderedNodes = nodes.map((node, index) => {
      const position = adapter.sourceToWorld({ x: node.sourceX, y: node.sourceY });
      const image = scene.add
        .image(position.x, position.y, node.texture)
        .setOrigin(0.5)
        .setScale(node.scale)
        .setAlpha(node.alpha)
        .setDepth(node.depth);

      return {
        image,
        baseX: position.x,
        baseY: position.y,
        definition: node,
        phase: index * 1.37
      };
    });
  }

  update(time: number) {
    if (this.reducedMotion) {
      return;
    }

    this.renderedNodes.forEach(({ image, baseX, baseY, definition, phase }) => {
      const cycle = (time / definition.swayPeriod) * Math.PI * 2 + phase;
      image.setPosition(
        baseX + Math.sin(cycle) * definition.swayX,
        baseY + Math.cos(cycle * 0.82) * definition.swayY
      );
    });
  }
}
