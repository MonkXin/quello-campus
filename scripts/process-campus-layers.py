#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def convert_layer(source: Path, destination: Path, mode: str) -> None:
    image = Image.open(source).convert("RGBA")
    pixels = []

    for red, green, blue, _alpha in image.getdata():
        maximum = max(red, green, blue)
        minimum = min(red, green, blue)
        saturation = maximum - minimum
        luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue
        alpha = 255
        out_red, out_green, out_blue = red, green, blue

        if mode == "canopy":
            if luminance > 178 and saturation < 36:
                alpha = 0
            else:
                alpha = min(255, max(0, int((210 - luminance) * 2.45 + saturation * 1.35)))
        elif mode == "water":
            blue_green = blue > 95 and green > 75 and red < 190
            gold = red > 150 and green > 130 and blue < 130
            if (luminance > 190 and saturation < 36) or not (blue_green or gold):
                alpha = 0
            else:
                alpha = 116 if blue_green else 92
        elif mode == "shadows":
            alpha = int(max(0, min(165, (242 - luminance) * 1.55)))
            if alpha < 18:
                alpha = 0
            out_red, out_green, out_blue = 50, 45, 38
        elif mode == "atmosphere":
            warm = red > 138 and green > 105 and red >= green and (red - blue) > 16
            if not warm:
                alpha = 0
            else:
                alpha = int(max(0, min(132, (red - blue) * 0.82 + (green - blue) * 0.28)))
                out_red = 255
                out_green = min(238, max(168, green + 18))
                out_blue = max(82, min(170, blue + 10))
        else:
            raise ValueError(f"Unsupported mode: {mode}")

        pixels.append((out_red, out_green, out_blue, alpha))

    image.putdata(pixels)
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination)


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert generated RGB checkerboard layers to RGBA runtime assets.")
    parser.add_argument("mode", choices=["canopy", "water", "shadows", "atmosphere"])
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()

    convert_layer(args.source, args.destination, args.mode)


if __name__ == "__main__":
    main()
