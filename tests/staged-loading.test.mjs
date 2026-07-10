import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const preloadSource = readFileSync(new URL("../src/game/scenes/PreloadScene.ts", import.meta.url), "utf8");
const campusPreloadUrl = new URL("../src/game/scenes/CampusPreloadScene.ts", import.meta.url);
const campusPreloadSource = existsSync(campusPreloadUrl) ? readFileSync(campusPreloadUrl, "utf8") : "";
const titleSource = readFileSync(new URL("../src/game/scenes/TitleScene.ts", import.meta.url), "utf8");
const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");

test("initial preload only loads assets required by the title scene", () => {
  assert.match(preloadSource, /campus-base/);
  assert.match(preloadSource, /quello-campus-title/);
  assert.match(preloadSource, /title-canopy-frame/);
  assert.doesNotMatch(preloadSource, /campus-water/);
  assert.doesNotMatch(preloadSource, /campus-shadows/);
  assert.doesNotMatch(preloadSource, /campus-canopy/);
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
