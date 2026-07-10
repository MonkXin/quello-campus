# Campus Art Handoff

Place final runtime art in this folder when generated.

Expected Phase 1 filenames:

- `map/base.webp` or `map/base.png`
- `map/foreground-canopy.png`
- `map/shadows.png`
- `map/water.png`
- `atmosphere/dusk-overlay.png`
- `particles/leaf.png`
- `../ui/quello-campus-title.png`

All map-sized layers must use the same canvas size and origin. Preferred canvas size is `4096 x 3072` or `5120 x 3840`.

The current implementation now uses the first generated layered map set:

- `map/base.png`
- `map/foreground-canopy.png`
- `map/shadows.png`
- `map/water.png`
- `atmosphere/dusk-overlay.png`

Important: the source images supplied on 2026-07-10 were RGB PNGs with checkerboard backgrounds baked into the pixels. The runtime layers here were automatically converted into RGBA for integration. For the public-quality pass, export true transparent PNGs directly from the image tool or design file.

If the generated source still contains a baked checkerboard, run `scripts/process-campus-layers.py` from the project root.

## Title Canopy Frame

The generated square canopy frame from 2026-07-10 is integrated as `../ui/title-canopy-frame.png` for the title screen only.

Reason:

- it has a strong foreground-framing feel for the entry screen;
- it is square and does not match the 16:9 authored campus map composition;
- it cannot replace `map/foreground-canopy.png`, which must stay aligned to the full campus map canvas.

For a future runtime map canopy replacement, generate a same-size layer that exactly matches the main map canvas and origin.
