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
  assert.match(campusPreloadSource, /"route-canopy"/);
  assert.match(campusPreloadSource, /foreground\/route-canopy\.webp/);
  assert.match(campusSource, /createForegroundCanopy/);
  assert.match(campusSource, /setScrollFactor\(0\)/);
  assert.match(campusSource, /foregroundCanopy\.setPosition/);
});

test("the large route canopy ships as an alpha WebP runtime asset", () => {
  assert.match(campusPreloadSource, /foreground\/route-canopy\.webp/);
  assert.doesNotMatch(campusPreloadSource, /foreground\/route-canopy\.png/);
});

test("the follow camera keeps the explorer low in frame and looks ahead", () => {
  assert.match(cameraSource, /baseFollowOffsetY/);
  assert.match(cameraSource, /Phaser\.Math\.Linear/);
  assert.match(cameraSource, /setFollowOffset/);
  assert.match(cameraSource, /movement\.x \* this\.lookAheadX/);
  assert.match(cameraSource, /this\.lookAheadX = isPortrait \? 28 : 90/);
  assert.match(cameraSource, /movement\.y \* 58/);
  assert.match(cameraSource, /baseFollowOffsetY = -height \*/);
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
  assert.match(campusPreloadSource, /campus-canopy/);
  assert.match(campusPreloadSource, /this\.scene\.start\("CampusScene"\)/);
  assert.match(mainSource, /CampusPreloadScene/);
});
