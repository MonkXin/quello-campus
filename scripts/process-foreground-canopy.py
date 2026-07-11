#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def is_checker(pixel: tuple[int, int, int]) -> bool:
    return max(pixel) - min(pixel) <= 30 and min(pixel) >= 150


def main() -> None:
    parser = argparse.ArgumentParser(description="Remove a connected baked checkerboard from canopy art.")
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()

    rgb = Image.open(args.source).convert("RGB")
    width, height = rgb.size
    source = rgb.load()
    rgba = rgb.convert("RGBA")
    pixels = rgba.load()
    for y in range(height):
        for x in range(width):
            if is_checker(source[x, y]):
                pixels[x, y] = (255, 255, 255, 0)

    args.destination.parent.mkdir(parents=True, exist_ok=True)
    rgba.save(args.destination, optimize=True)


if __name__ == "__main__":
    main()
