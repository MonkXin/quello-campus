# Quello Campus Web

Standalone Web Environment Alpha for Quello Campus.

## Run

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

The production-ready static site is written to `dist/`.

Generated source PNGs that are not needed by the browser live under `art-source/` so
they remain available for future art work without inflating the static deployment.

The site uses staged loading: the title scene loads first, then the detailed campus
layers load after the visitor chooses to enter the campus.

## Preview

```bash
pnpm dev
```

Open `http://localhost:5174/`.

## Experience Controls

- Drag / WASD / arrow keys: browse the campus.
- `T`: switch sunny / dusk.
- `M`: toggle ambient audio.
- `N`: focus the next future pet spot.
- `?debugPoints=1`: show point names and radii.
- `?followMode=1`: preview the Phase 2 character-follow camera with a temporary marker.

## Standalone Site

The site is currently designed to run independently from the official website. It includes Open Graph sharing metadata, a wide share cover, `manifest.webmanifest`, and `robots.txt` so a static deployment can be shared directly.

## Process Generated Layers

Some image tools export fake transparency as a checkerboard baked into RGB pixels. Convert those into runtime RGBA layers with:

```bash
python3 scripts/process-campus-layers.py canopy /path/to/canopy.png public/assets/campus/map/foreground-canopy.png
python3 scripts/process-campus-layers.py atmosphere /path/to/dusk.png public/assets/campus/atmosphere/dusk-overlay.png
```

## Scope

This project follows `docs/superpowers/specs/2026-07-10-quello-campus-web-architecture-whitepaper.md`.

Phase 1 is environment-only:

- no formal pets;
- no player creation;
- no login;
- no backend;
- no tasks or rewards;
- no official-site integration yet.

Use `?debugPoints=1` to show point names and radii.
