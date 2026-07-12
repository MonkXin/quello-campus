import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const preloadSource = readFileSync(new URL("../src/game/scenes/PreloadScene.ts", import.meta.url), "utf8");
const campusPreloadUrl = new URL("../src/game/scenes/CampusPreloadScene.ts", import.meta.url);
const campusPreloadSource = existsSync(campusPreloadUrl) ? readFileSync(campusPreloadUrl, "utf8") : "";
const titleSource = readFileSync(new URL("../src/game/scenes/TitleScene.ts", import.meta.url), "utf8");
const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
const campusSource = readFileSync(new URL("../src/game/scenes/CampusScene.ts", import.meta.url), "utf8");
const cameraSource = readFileSync(new URL("../src/game/systems/CameraController.ts", import.meta.url), "utf8");
const playerSource = readFileSync(new URL("../src/game/systems/PlayerController.ts", import.meta.url), "utf8");
const collisionSource = readFileSync(new URL("../src/game/data/campusCollision.ts", import.meta.url), "utf8");
const routeUrl = new URL("../src/game/data/campusRoute.ts", import.meta.url);
const routeControllerUrl = new URL("../src/game/systems/RouteController.ts", import.meta.url);
const routeSource = existsSync(routeUrl) ? readFileSync(routeUrl, "utf8") : "";
const routeControllerSource = existsSync(routeControllerUrl)
  ? readFileSync(routeControllerUrl, "utf8")
  : "";
const atmosphereSource = readFileSync(
  new URL("../src/game/systems/AtmosphereController.ts", import.meta.url),
  "utf8"
);
const postFxUrl = new URL("../src/game/systems/CinematicPostFX.ts", import.meta.url);
const postFxSource = existsSync(postFxUrl) ? readFileSync(postFxUrl, "utf8") : "";
const mapAdapterUrl = new URL("../src/game/map/CampusMapAdapter.ts", import.meta.url);
const mapAdapterSource = existsSync(mapAdapterUrl) ? readFileSync(mapAdapterUrl, "utf8") : "";
const foregroundControllerUrl = new URL(
  "../src/game/systems/WorldForegroundController.ts",
  import.meta.url
);
const foregroundControllerSource = existsSync(foregroundControllerUrl)
  ? readFileSync(foregroundControllerUrl, "utf8")
  : "";
const foregroundNodesUrl = new URL(
  "../src/game/data/campusForegroundNodes.ts",
  import.meta.url
);
const foregroundNodesSource = existsSync(foregroundNodesUrl)
  ? readFileSync(foregroundNodesUrl, "utf8")
  : "";
const detailAssetsUrl = new URL("../src/game/assets/campusDetailAssets.ts", import.meta.url);
const detailAssetsSource = existsSync(detailAssetsUrl) ? readFileSync(detailAssetsUrl, "utf8") : "";

test("initial preload only loads assets required by the title scene", () => {
  assert.match(preloadSource, /campus-base/);
  assert.match(preloadSource, /quello-campus-title/);
  assert.match(preloadSource, /title-canopy-frame/);
  assert.doesNotMatch(preloadSource, /campus-water/);
  assert.doesNotMatch(preloadSource, /campus-shadows/);
  assert.doesNotMatch(preloadSource, /campus-canopy/);
});

test("character follow mode is the default and observer mode stays opt-in", () => {
  assert.match(campusSource, /get\("observerMode"\) === "1"/);
  assert.match(campusSource, /if \(!this\.observerMode\)/);
  assert.match(campusSource, /new PlayerController/);
  assert.match(cameraSource, /startFollow\(followTarget, true, 0\.09, 0\.09\)/);
});

test("follow mode uses a four-direction animated character sheet", () => {
  assert.match(campusPreloadSource, /spritesheet\("student-walk"/);
  assert.match(campusPreloadSource, /frameWidth: 128/);
  assert.match(playerSource, /student-walk-\$\{this\.facing\}/);
  assert.match(playerSource, /down: 0, left: 4, right: 8, up: 12/);
  assert.match(playerSource, /setScale\(0\.96\)/);
});

test("the explorer spawns on the plaza and treats the water alpha as collision", () => {
  assert.match(playerSource, /const SPAWN_X = 500 \* 2/);
  assert.match(playerSource, /const SPAWN_Y = 510 \* 2/);
  assert.match(playerSource, /textures\.getPixel\(sourceX, sourceY, "campus-water"\)/);
  assert.match(playerSource, /pixel\.alpha < 24/);
  assert.match(playerSource, /"campus-base"/);
  assert.match(playerSource, /basePixel\.blue > basePixel\.green \* 1\.08/);
  assert.match(playerSource, /canOccupy\(nextX, this\.avatar\.y\)/);
  assert.match(playerSource, /canOccupy\(this\.avatar\.x, nextY\)/);
});

test("major campus buildings use data-driven collision zones", () => {
  assert.match(collisionSource, /CAMPUS_BUILDING_COLLISIONS/);
  assert.match(collisionSource, /circleIntersectsRect/);
  assert.match(playerSource, /CAMPUS_BUILDING_COLLISIONS\.some/);
  assert.match(playerSource, /get\("debugCollision"\) === "1"/);
});

test("the route canopy is staged and moves as a foreground parallax layer", () => {
  assert.match(detailAssetsSource, /"route-canopy"/);
  assert.match(detailAssetsSource, /foreground\/route-canopy\.webp/);
  assert.match(campusSource, /createForegroundCanopy/);
  assert.match(campusSource, /setScrollFactor\(0\)/);
  assert.match(campusSource, /foregroundCanopy\.setPosition/);
});

test("the large route canopy ships as an alpha WebP runtime asset", () => {
  assert.match(detailAssetsSource, /foreground\/route-canopy\.webp/);
  assert.doesNotMatch(detailAssetsSource, /foreground\/route-canopy\.png/);
});

test("the world-aligned canopy also ships as an alpha WebP runtime asset", () => {
  assert.match(detailAssetsSource, /map\/foreground-canopy\.webp/);
  assert.doesNotMatch(detailAssetsSource, /map\/foreground-canopy\.png/);
});

test("localized canopy clusters preload as transparent WebP runtime assets", () => {
  for (const name of ["left", "upper", "right", "lower"]) {
    assert.match(detailAssetsSource, new RegExp(`canopy-node-${name}`));
    assert.match(detailAssetsSource, new RegExp(`foreground/nodes/${name}\\.webp`));
  }
  assert.doesNotMatch(detailAssetsSource, /foreground\/nodes\/[^"']+\.png/);
});

test("campus preload registers only the canopy profile selected by tour mode", () => {
  assert.match(campusPreloadSource, /getCampusCanopyAssets/);
  assert.match(campusPreloadSource, /get\("tourMode"\) === "1"/);
  assert.match(campusPreloadSource, /canopyAssets\.forEach/);
  assert.doesNotMatch(campusPreloadSource, /this\.load\.image\("campus-canopy"/);
  assert.doesNotMatch(campusPreloadSource, /this\.load\.image\("canopy-node-left"/);
});

test("campus canopy assets are split into cinematic and ordinary profiles", () => {
  assert.match(detailAssetsSource, /CINEMATIC_CANOPY_ASSETS/);
  assert.match(detailAssetsSource, /ORDINARY_CANOPY_ASSETS/);
  assert.match(detailAssetsSource, /getCampusCanopyAssets/);
  assert.match(detailAssetsSource, /canopy-node-left/);
  assert.match(detailAssetsSource, /campus-canopy/);
  assert.doesNotMatch(detailAssetsSource, /from "phaser"/);
  assert.doesNotMatch(detailAssetsSource, /window\./);
});

test("the follow camera keeps the explorer low in frame and looks ahead", () => {
  assert.match(cameraSource, /baseFollowOffsetY/);
  assert.match(cameraSource, /Phaser\.Math\.Linear/);
  assert.match(cameraSource, /setFollowOffset/);
  assert.match(cameraSource, /movement\.x \* this\.lookAheadX/);
  assert.match(cameraSource, /this\.lookAheadX = isPortrait \? 28 : 90/);
  assert.match(cameraSource, /movement\.y \* 58/);
  assert.match(cameraSource, /baseFollowOffsetY = height \*/);
});

test("cinematic camera zooms into the explorer instead of presenting the whole map", () => {
  assert.match(cameraSource, /this\.cinematicMode\s*\? 1\.62/);
  assert.match(cameraSource, /this\.cinematicMode\s*\? 1\.35/);
  assert.match(cameraSource, /0\.2/);
});

test("map coordinates are isolated behind an adapter for future geographic maps", () => {
  assert.match(mapAdapterSource, /interface CampusMapAdapter/);
  assert.match(mapAdapterSource, /lngLatToWorld/);
  assert.match(mapAdapterSource, /RasterCampusMapAdapter/);
  assert.match(playerSource, /RASTER_MAP_ADAPTER\.worldToSource/);
});

test("localized foreground nodes use adapted world coordinates and reduced-motion-safe sway", () => {
  assert.match(foregroundControllerSource, /CampusMapAdapter/);
  assert.match(foregroundControllerSource, /sourceToWorld/);
  assert.doesNotMatch(foregroundControllerSource, /MAP_SCALE/);
  assert.match(foregroundControllerSource, /setDepth\(node\.depth\)/);
  assert.match(foregroundControllerSource, /prefers-reduced-motion/);
  assert.ok((foregroundNodesSource.match(/id:/g) ?? []).length >= 4);
});

test("tour mode follows an authored route while preserving manual input priority", () => {
  assert.match(campusSource, /get\("tourMode"\) === "1"/);
  assert.match(campusSource, /new RouteController/);
  assert.match(routeSource, /CAMPUS_TOUR_ROUTE/);
  assert.match(routeControllerSource, /setAutopilotVector/);
  assert.match(routeControllerSource, /hasManualInput/);
  assert.doesNotMatch(routeSource, /92 \* 2/);
  assert.doesNotMatch(routeSource, /650 \* 2/);
  assert.match(routeSource, /220 \* 2, y: 510 \* 2/);
});

test("tour mode removes map-demo chrome and lets the foreground canopy pass by", () => {
  assert.match(campusSource, /this\.cinematicMode/);
  assert.match(campusSource, /item\.setVisible\(!this\.cinematicMode\)/);
  assert.match(campusSource, /this\.cinematicMode \? 0\.12 : 1/);
  assert.match(campusSource, /canopyAlpha/);
  assert.match(campusSource, /Math\.sin\(time \/ 2400\) \* 14/);
});

test("ordinary mode keeps full canopy while cinematic mode avoids the fixed screen mask", () => {
  assert.match(campusSource, /if \(!this\.cinematicMode\) \{\s*this\.createForegroundCanopy\(\)/);
  assert.match(campusSource, /if \(!this\.cinematicMode\)[\s\S]*"campus-canopy"/);
  assert.match(campusSource, /setDepth\(112\)/);
});

test("cinematic mode creates and updates localized world foreground nodes", () => {
  assert.match(campusSource, /new WorldForegroundController/);
  assert.match(campusSource, /CAMPUS_FOREGROUND_NODES/);
  assert.match(campusSource, /RASTER_MAP_ADAPTER/);
  assert.match(campusSource, /else \{\s*this\.worldForeground = new WorldForegroundController/);
  assert.match(campusSource, /worldForeground\?\.update\(time\)/);
});

test("the atmosphere combines drifting particles, sun patches, and wind streaks", () => {
  assert.match(atmosphereSource, /createSunPatches/);
  assert.match(atmosphereSource, /createWindStreaks/);
  assert.match(atmosphereSource, /sunPatches/);
  assert.match(atmosphereSource, /windStreaks/);
  assert.match(atmosphereSource, /BlendModes\.ADD/);
});

test("cinematic post processing adds restrained depth with reduced-motion fallback", () => {
  assert.match(campusSource, /new CinematicPostFX/);
  assert.match(postFxSource, /prefers-reduced-motion/);
  assert.match(postFxSource, /createVignette/);
  assert.match(postFxSource, /createHighlightBloom/);
  assert.match(postFxSource, /setScrollFactor\(0\)/);
});

test("entering from the title loads campus detail assets before starting the campus", () => {
  assert.ok(campusPreloadSource, "CampusPreloadScene must exist");
  assert.match(titleSource, /this\.scene\.start\("CampusPreloadScene"\)/);
  assert.match(campusPreloadSource, /campus-water/);
  assert.match(campusPreloadSource, /campus-shadows/);
  assert.match(campusPreloadSource, /getCampusCanopyAssets/);
  assert.match(campusPreloadSource, /this\.scene\.start\("CampusScene"\)/);
  assert.match(mainSource, /CampusPreloadScene/);
});
