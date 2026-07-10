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

## Preview

```bash
pnpm dev
```

Open `http://localhost:5174/`.

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
