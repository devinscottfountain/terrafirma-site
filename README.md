# terrafirma-site

Custom JS for the TerraFirma Webflow site. Currently: the 3D footer and the Mission section (planets and Starship) on the careers page, and the Solutions scene on the homepage.

## Files

- `careers.js`: page mount (ES module). Finds `[data-foot]` and `[data-mission]`, lazy-loads three and each module, crossfades the canvas over the poster, drives the footer sunrise from scroll. Falls back to the posters on any failure.
- `footer/footer3d.js`: `createFooter({ THREE, host, quality, base })`. Compositing, sky, post chain, camera, sunrise.
- `footer/foot-glsl.js`: shaders for the sky, haze, bloom and the final grade.
- `footer/foot-model*.js`: the procedural settlement (terrain, colony, plants, starships, life). `foot-model-plan.js` holds the colony layout (a local copy of the prototype's `colonyLayout`, no d5 dependency).
- `footer/foot-tex.js`: texture streamer. Loads after the first frame, one upload per frame.
- `footer/assets/tex/`: only the WebP textures the footer loads. High tier about 1.56 MB, low tier about 0.28 MB. `dusk_sky.hdr` and `256/dusk_sky_ldr.webp` are kept for reference; the footer bakes its own environment and never fetches them.
- `kit/hero-model-kit.js`: shared modelling helpers, copied unchanged from the prototype.
- `mission/mission3d.js`: `createMission({ THREE, section, quality, base })` returns `{ ready, start, stop, resize, dispose, stats, capture, canvas, renderer }`. Orthographic camera in section pixels, analytic planet quads, the footer's Starship on the SVG arc.
- `mission/mission-glsl.js`: Earth, Mars, engine plume and environment shaders.
- `mission/assets/`: planet textures. High tier (2048 colour, 1024 normals, Earth clouds) about 0.70 MB, low tier (1024 colour) about 0.14 MB. See `CREDITS.md`.
- `home3d.js`: homepage entry (ES module). Finds the Solutions section, lazy-loads three and `solutions/` within ~1.5 viewports, listens to `tf:solutions`, frames the scene into the spacer, renders only while visible.
- `solutions/solutions.js`: `createSolutions({ THREE, host, quality })` returns `{ ready, canvas, setFrame, setMode, start, step, stop, resize, warm, onTelemetry, onGame, dispose }`. Dot grid terrain plus the three modes. No assets: the grid is procedural.
- `solutions/sol-machines.js`: procedural wireframe excavator, backhoe loader and roller. `solutions/sol-game.js`: the Mission Control dig game.
- `test/home.html`: local Solutions test page that mimics the Webflow DOM (three tabs dispatch `tf:solutions`). Not for production.
- `test/mission.html`: local Mission test page (1600 wide, scales down under 600 px). Not for production.
- `test/careers.html`: local test page that mimics the Webflow DOM. Not for production.

## Webflow DOM contract

- `[data-foot]`: footer root, `position: relative; overflow: hidden`
- `[data-foot-canvas]`: absolute mount holding the poster `img`
- `[data-foot-logo]`: wrapper around the logotype svg

URL switches: `?foot=0` keeps the poster, `?q=low|high` forces a quality tier.

## Mission DOM contract

- `[data-mission]`: section, `position: relative; overflow: hidden`
- `[data-mission-canvas]`: absolute inset-0 empty mount, `pointer-events: none` (the canvas is created inside it)
- `[data-mission-earth]`, `[data-mission-mars]`: square boxes, each with a poster `img`; the sphere is drawn exactly over its box (diameter = box width) and may bleed off the section edge. The imgs fade out once the first real frame is drawn.
- `img[data-mission-billboard]`: the designer's static 2D rocket with plume, placed on the arc. It is the fallback for the 3D Starship, so it fades out with the posters on the first real frame and stays visible on any bail or failure.
- `[data-mission-arc]` containing `path[data-mission-path]`, left to right: the rocket's arc

The rocket's arc parameter is `t = remap(p, 0.15..0.85 -> 0.04..0.96)`, where `p` is section progress (0 when the section top meets the viewport bottom, 1 when its bottom meets the viewport top). It is smoothed, clamped, and fades out at the extremes. Rings around the planets are Webflow CSS.

Switches: `?mission=0` keeps the posters, `?q=low|high` applies to both. QA hook: `window.TFMission`.

## Solutions DOM contract (homepage, `home3d.js`)

- `section[data-three="solutions"]#solutions`: `position: relative; overflow: hidden`
- `[data-three-mount="solutions"]#solutions-stage`: absolute inset-0 empty div, `aria-hidden`; the canvas is created inside it
- a `.container` above it with `pointer-events: none`, holding the heading, `[data-solutions-spacer]` and the tab row `[data-tabs="solutions"]` (buttons `[data-tab="orchestration|planning|execution"]`, `pointer-events: auto`)
- `[data-solutions-spacer]`: the scene is framed into this box (its rect relative to the mount). If it is shorter than 120 px (0 under 992 px) the frame runs from the spacer's top to the bottom of the section.
- The page script owns the tabs and dispatches `window` event `tf:solutions` with `detail.mode` = `orchestration | planning | execution` on every selection, including once on load. The canvas only listens. If the event fired before the module ran, the selected tab (`aria-selected="true"` or `.w--current`) is read instead; default is orchestration.

Modes: orchestration = Mission Control (3/4 view, rolling terrain, dig game), planning = Planning, execution = Accelerated Operations. The mode changes only on a tab click, over about 1.2 s (the machines in execution then drive in over about 3.6 s). Off screen it jumps. The mission topography is 2D in Webflow and does not morph into the grid, so the scene starts as the dot grid.

The canvas takes `pointer-events: auto` only in Mission Control (the dig game arms it), with `touch-action: pan-y`; clicks above the spacer pass to the page.

Starts only when the section is within ~1.5 viewports; renders only while it is on screen (25% margin); shaders are compiled on idle after load. Drives frames from `gsap.ticker` when present, else its own rAF. Leaves the section untouched (no canvas) on `prefers-reduced-motion`, no WebGL2, `?sol=0`, context loss or any error.

Switches: `?sol=0` bails, `?q=low|high` forces a quality tier (same logic as `careers.js`), `?qa` exposes `window.TFSolutions`.

TODO (Tim's notes): one excavator is to be replaced by a new vehicle and Execution gets new vehicles. Marked in `solutions/solutions.js` above the machine slots; not modelled yet.

Load: same importmap as below, then `<script type="module" src="https://cdn.jsdelivr.net/gh/devinscottfountain/terrafirma-site@SHA/home3d.js"></script>`.

## Loading on Webflow

Head (before the module): an importmap for `three@0.160.0` and `three/addons/`, plus preloads. Footer: the module script.

```html
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
<script type="module" src="https://cdn.jsdelivr.net/gh/devinscottfountain/terrafirma-site@SHA/careers.js"></script>
```

Everything is resolved relative to `careers.js`, so the footer and mission modules and textures come from the same pinned SHA.

## Pin the SHA, never `@main`

Always replace `SHA` with a commit SHA (short is fine). Never use `@main` or a branch: jsDelivr caches branches for up to 12 hours and the footer modules must match `careers.js`. Pin a new SHA on every deploy.
