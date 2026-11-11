# terrafirma-site

Custom JS for the TerraFirma Webflow site. Currently: the 3D footer and the Mission section (planets and Starship) on the careers page, the Solutions scene and the scroll film (Austin, Earth, Mars) on the homepage.

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
- `film/mount.js`: film entry, imported by `home3d.js` when `section[data-three="film"]` exists. Lazy-loads three and the film modules within ~1.5 viewports, reads `film/assets/manifest.json`, fades the canvas in.
- `film/film.js`: `createFilm({ THREE, host, section, scenes, sol, quality, files })` returns `{ ready, canvas, start, stop, step, resize, relayout, snap, state, dispose }`. One canvas, scroll scrubbed: the Austin lot over one day (dawn to dusk) in one continuous pull-back up to Earth (orbiting Moon), over Earth to Mars, "One day on Mars" title, SpaceX line, atmospheric entry, Jezero colony timelapse with rockets, launch, SOL counter.
- `film/colony.js`, `planets.js`, `sky.js`, `site.js`, `habitat.js`, `machines.js`, `rockets.js`, `post.js`, `util.js`: ported from the prototype (`tf-d5` `d5/`) with the 6.1 flags hard-coded. `colony.js` builds the Jezero colony lazily in idle time. Rockets import `footer/foot-model-starship.js` and `footer/foot-model-kit.js` (no copy).
- `film/assets/`: WebP textures per tier plus `manifest.json`. Rebuild with `python3 film/tools/build-assets.py <d5-assets> [<extra-dir>]`.
- `test/film.html`: local film test page that mimics the Webflow DOM. Scene heights via `?h=austin,earth,title,reind,colony,launch` in viewports. Not for production.
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

## Film DOM contract (homepage, `film/mount.js`)

- `section[data-section="film"][data-three="film"]`: the whole film track, normal flow, no overflow clip on the sticky.
- `[data-three-mount="film"]`: `position: sticky; top: 0; height: 100vh`, empty, `aria-hidden`; the canvas is created inside it.
- Six scenes, in order, which set the scroll timing. Each is read from the DOM, so any height works: `austin`, `earth`, `mars-title` (holds the `[data-split]` spans of "One day / on Mars"), `reindustrialize` (the SpaceX lines), `colony`, `launch`. The text in each scene is Webflow copy.
- `[data-sol]`: SOL counter, written by the film (0000 to 0206). The film sets its opacity and visibility.

Recommended scene heights (vh): austin 2, earth 1.5, title 3.5, reindustrialize 4, colony 3, launch 2, about 16 vh in all.

Austin beat (`film/austin.js`): from the scene's first frame on screen to the Earth frame the camera never holds: a slow drift up and back while the H2 is up, accelerating into the rise, C1 (position, aim, lens) into the space camera at S = -1. Scroll sets only the build progress and the hour (07:54 to 19:36, one day); machines, crew and street traffic run on the film clock, so the lot stays alive when the scroll stops. Exposure on this beat is a fixed curve of sun elevation and altitude (no metering); auto exposure takes over at the Earth frame from the value it settles on there (`EARTH_EXP`). A soft burn in the lens pass sits behind the H2 while it is on screen.

Aircraft (`film/aircraft.js`): night traffic over the city on the rise, navigation lights only (no airframe): red left and green right wingtips, white tail, double-flash wingtip strobes, a red beacon top and belly, landing lights on the two low arrivals. One `THREE.Points` in the site group (compiled with it at boot), eight aircraft on high, four on low, 1.6 to 11.3 km up. Each is placed from the camera pose at a given camera distance (so it lands on the same frame whatever the scene heights) and moves along a straight level track by the camera's ln distance, i.e. by scroll, plus a bounded drift on the film clock (+/- 50 m for the two close passes, +/- 300 m for the rest, wrapping with a short fade) so they keep moving when the scroll stops; strobes and beacons run on the film clock. The two close passes (camera at ~3.9 km and ~6.8 km) enter at the top edge about 230 m and 300 m away and fall down the left and right thirds; they never come within 120 m of the camera. Lights fade in from sun elevation +2 deg to -1.7 deg and out between 60 and 250 km camera distance, well before the world swap. At the recommended heights the camera climbs ~40 to 50 m per px of scroll there, so each pass is on screen within 400 m for only ~5 px of scroll; slowing the rise in that band (`austin.js`) is the knob if it should linger.

Lifecycle: `html[data-film3d="on"]` is set before the first frame and `tf:film-ready` fires when the canvas is live. On reduced motion, no WebGL2, `?film=0` or any error there is no canvas and no flag; an error after the flag was set removes it and fires `tf:film-fail`. The 2D script should listen for both. Renders only while the section intersects; shaders and the colony are compiled off screen first.

Switches: `?film=0` bails, `?q=low|high` forces a tier, `?qa` exposes `window.TFFilm`.

Assets (WebP, transferred): high about 1.55 MB (Earth 2K 154 KB, clouds 292, lights 77, spec 31, normal 22, Moon 1K 69, Mars 610, Mars normal 43, Milky Way 11, stars.bin 244). Low about 0.37 MB (Earth 41, clouds 82, lights 17, spec 11, Moon 13, Mars 161, Milky Way 3, stars.bin 40). Earth loads first, Moon and Mars on demand. Code is extra (three itself is shared with the other modules).

Open issues: the Webflow-hosted ortho tiles (Austin 8 km / 80 km) and Jezero terrain files are not in the repo, so the Austin neighbourhood is procedural and the Mars terrain is flat (visible seam); add them to the manifest `ortho` and `jezero` keys. The perf governor is not wired in. Phone pacing is untuned.

## Loading on Webflow

Head (before the module): an importmap for `three@0.160.0` and `three/addons/`, plus preloads. Footer: the module script.

```html
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
<script type="module" src="https://cdn.jsdelivr.net/gh/devinscottfountain/terrafirma-site@SHA/careers.js"></script>
```

Everything is resolved relative to `careers.js`, so the footer and mission modules and textures come from the same pinned SHA.

## Pin the SHA, never `@main`

Always replace `SHA` with a commit SHA (short is fine). Never use `@main` or a branch: jsDelivr caches branches for up to 12 hours and the footer modules must match `careers.js`. Pin a new SHA on every deploy.
