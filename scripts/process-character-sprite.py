#!/usr/bin/env python3
from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


def is_checker(pixel: tuple[int, int, int]) -> bool:
    red, green, blue = pixel
    return max(pixel) - min(pixel) <= 14 and min(pixel) >= 232


def remove_connected_checker(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    width, height = rgb.size
    source = rgb.load()
    background = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if not background[index] and is_checker(source[x, y]):
            background[index] = 1
            queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        if x > 0:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y > 0:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)

    rgba = rgb.convert("RGBA")
    pixels = rgba.load()
    for y in range(height):
        for x in range(width):
            if background[y * width + x]:
                pixels[x, y] = (255, 255, 255, 0)
    return rgba


def normalize_grid(image: Image.Image, frame_size: int = 128) -> Image.Image:
    width, height = image.size
    output = Image.new("RGBA", (frame_size * 4, frame_size * 4), (0, 0, 0, 0))

    for row in range(4):
        for column in range(4):
            left = round(column * width / 4)
            top = round(row * height / 4)
            right = round((column + 1) * width / 4)
            bottom = round((row + 1) * height / 4)
            frame = image.crop((left, top, right, bottom))
            frame.thumbnail((frame_size, frame_size), Image.Resampling.LANCZOS)
            x = column * frame_size + (frame_size - frame.width) // 2
            y = row * frame_size + (frame_size - frame.height)
            output.alpha_composite(frame, (x, y))

    return output


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize a generated 4x4 character sprite sheet.")
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()

    normalized = normalize_grid(remove_connected_checker(Image.open(args.source)))
    args.destination.parent.mkdir(parents=True, exist_ok=True)
    normalized.save(args.destination, optimize=True)


if __name__ == "__main__":
    main()
