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
- `home3d.js`: homepage entry (ES module). Finds the Solutions section, lazy-loads three and `solutions/` within ~1.5 viewports, listens to `tf:solutions`, reads the safe insets, renders only while visible.
- `solutions/solutions.js`: `createSolutions({ THREE, host, root, quality, interactive, safe })` returns `{ ready, canvas, setSafe, setMode, start, step, stop, resize, warm, stats, dispose }` (`setFrame`, `onTelemetry`, `onGame` stay as no-ops for the old contract). One jobsite, three camera shots, flights between them, the governor. No assets: everything is procedural.
- `solutions/sol-terrain.js`: the height field (JS + GLSL), the design surface, the site layout (`SITE`: pit, pad, platform, road, sun), the persistent edit field (dig delta + track marks) and the dot cloud.
- `solutions/sol-fx.js`: palette, the dot shader, screen-space lines, dust motes, GPU dirt particles, sky haze, post (bloom, the film's grade, vignette, grain, soft edges).
- `solutions/sol-game.js`: the dig (excavator rig, IK, autopilot, drag input, carving and dumping). `solutions/sol-crew.js`: the loader (haul) and roller (grade) loops. `solutions/sol-hud.js`: the 2D overlay (operator HUD, machine tags, zone labels).
- `solutions/sol-machines.js`: procedural wireframe excavator, backhoe loader and roller.
- `film/mount.js`: film entry, imported by `home3d.js` when `section[data-three="film"]` exists. Lazy-loads three and the film modules within ~1.5 viewports, reads `film/assets/manifest.json`, fades the canvas in.
- `film/film.js`: `createFilm({ THREE, host, section, scenes, sol, quality, files })` returns `{ ready, canvas, start, stop, step, resize, relayout, snap, state, dispose }`. One canvas, scroll scrubbed: the Austin lot over one day (dawn to dusk) in one continuous pull-back out to the whole Earth (orbiting Moon), Mars rising over its limb, out to Mars, "One day on Mars" title, SpaceX line, atmospheric entry, Jezero colony timelapse with rockets, launch, SOL counter.
- `film/look.json.js`: the film's grade and lens defaults (see Look below). `film/dial.js`: the `?grade` look panel, never loaded without `?grade`.
- `film/flight.js`: the space camera from the Earth frame (S = -1) to the entry swap, the Moon's orbit and Mars's far-off size. Pure math, so node tests import it as shipped.
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

- `section[data-three="solutions"]#solutions`: `position: relative; overflow: hidden`, dark background. The canvas is transparent and fades out at its edges, so it sits on whatever dark colour the section has.
- `[data-three-mount="solutions"]#solutions-stage`: absolute inset-0 empty div, `aria-hidden`; the WebGL canvas and a 2D HUD canvas are created inside it
- a `.container` above it with `pointer-events: none`, holding the heading and the tab row `[data-tabs="solutions"]` (buttons `[data-tab="orchestration|planning|execution"]`, `pointer-events: auto`)
- `[data-solutions-spacer]`: still observed for layout changes; the framing no longer depends on it.
- The page script owns the tabs and dispatches `window` event `tf:solutions` with `detail.mode` = `orchestration | planning | execution` on every selection, including once on load. The canvas only listens. If the event fired before the module ran, the selected tab (`aria-selected="true"` or `.w--current`) is read instead; default is orchestration.

Layout: the stage can be anything from 16:9 at 100svh down to 390 x 400. Each shot is fitted so the subject stays clear of the top and bottom safe insets (fractions of the section height): `--sol-safe-top` / `--sol-safe-bottom` CSS custom properties on the section (these can change per breakpoint), else `data-sol-safe-top` / `data-sol-safe-bottom` attributes on the section or mount, else .2 and .3. The planned desktop layout overlays the tab list on the bottom of the stage, so the page sets .3 / .28 there (tablet stage .06 / .1); the HUD's bottom readout and the hint sit just above the bottom inset. The canvas edges fade top and bottom in proportion to the insets.

Words: nothing client-facing is hardcoded. Add these attributes to the section (or the mount); the fallback in brackets is used when one is missing.

| Attribute | Where it shows | Fallback |
| --- | --- | --- |
| `data-sol-hint` | Orchestration hint, desktop only, while a click would start a dig (and while the autopilot runs) | Click to dig |
| `data-sol-hint-drop` | Orchestration hint, desktop only, while the bucket is full and waiting for a drop click | Click to drop |
| `data-sol-tag-dig` | Execution tag on the excavator | Excavator 01 |
| `data-sol-tag-haul` | Execution tag on the loader | Loader 02 |
| `data-sol-tag-grade` | Execution tag on the roller | Roller 03 |
| `data-sol-hud-auto` | HUD state label, shown only while the autopilot drives | Autopilot |
| `data-sol-hud-manual` | no longer shown (the readout hides while a visitor drives); kept for compatibility | Manual |
| `data-sol-hud-swing`, `-reach`, `-depth`, `-load` | HUD telemetry labels (autopilot readout) | Swing, Reach, To grade, Load |
| `data-sol-hud-grade` | label on the grade ladder | Grade |
| `data-sol-label-cut` / `data-sol-label-fill` | Planning zone labels | Cut / Fill |

Colours: `--sol-dot`, `--sol-cut`, `--sol-fill`, `--sol-haze`, `--sol-accent` (6-digit hex) on the section override the palette in `solutions/sol-fx.js`.

Modes (one site, three shots; the mode changes only on a tab click, never on scroll):
- orchestration = the dig. A drone chase cam behind one excavator with a little handheld life; HUD: reticle on the teeth, a grade ladder (teeth elevation against the design grade), a cut/fill heat patch on the ground under the bucket. Desktop: click the ground to dig there. The excavator drives to a working spot if the click is out of reach (pivots on its tracks, travels, leaves track marks), swings and digs until the bucket is full. The next click drops the load there (it drives if it has to, swings, dumps). A ring marks every click at once (dig: cut colour with ticks; drop: fill colour, double ring and arrow) and a dashed ghost path with the stop footprint shows while it drives; the chase cam follows it and eases out if the arm would leave the safe band. Clicks while it is busy retarget the move in progress (still driving) or queue the next one (shown dashed); a click outside reachable ground is clamped to the nearest reachable spot and marked there. A press that moves more than 6 px, or a page scroll during the press, is not a click. On arrival the autopilot runs (dig a bite in the pit, dump on the spoil pile) with its readout (AUTOPILOT, swing, reach, to grade, load); the first click hands control over and hides the readout; 8 s after the last click once it has nothing left to do (`IDLE` in `solutions/sol-game.js`), the autopilot drives home and takes over again, readout back on. The ground really changes and stays changed for the page session; every view shows it.
- planning = the blueprint. Near top-down; the ground slowly morphs from existing to the design surface and back, design contours draw on, cut and fill in two colours, zones with handles, live machine footprints and each machine's working zone (dashed, in its tag colour).
- execution = breadth. High three-quarter view framed on the three machines' work: excavator digging, loader hauling spoil to the fill pad, roller compacting it. Live path lines with a head at each machine, tags with live numbers, data links pulsing between them.
- Tab clicks fly the camera between the shots (about 1.4 s, eased). A click mid-flight retargets from the current pose. A scan pulse sweeps the point cloud during the flight and the dots take the new look behind it. Off screen it jumps.

Site layout: one place, `SITE` in `solutions/sol-terrain.js`. Each machine keeps its body in its own working zone: the excavator's drive zone around the pit (`digZone`), the loader's route from the far side of the spoil pile to the near end of the fill pad (it dumps on three lanes in turn), the roller on the far end of the pad only. Over 5 minutes of sim time the closest footprints are 8.5 m excavator to loader and 11.9 m loader to roller (at least 1.5 lengths of the shorter machine of each pair), the zones never overlap, and the Execution tags never cover each other or a machine.

Input: the canvas takes pointer events only in orchestration on desktop, once the flight has landed (`touch-action: pan-y`, no wheel listener, nothing is ever prevented, so the wheel and vertical touch pan always scroll the page). Phones (coarse pointer, or a viewport under 768 px) get the same scene on the low tier, no listeners, no hint; the dig plays itself.

Performance: about 225k dots on high and 48k on low, one draw each; machines are line art; 21 to 55 draw calls depending on the view. DPR capped at 1.5. An adaptive governor watches the frame time and steps down (DPR, then 70% dots, then 50% dots with no motes and no bloom) and back up. Every program is compiled by `warm()` on idle (12 programs; the count stays flat across tab switches). The site is pre-aged (about 75 s of work, simulated in small chunks before `ready`) so the first look already has a pit, a pile and tracks.

Starts only when the section is within ~1.5 viewports; renders only while it is on screen (25% margin). Drives frames from `gsap.ticker` when present, else its own rAF. Leaves the section untouched (no canvas) on `prefers-reduced-motion`, no WebGL2, `?sol=0`, context loss or any error.

Switches: `?sol=0` bails, `?q=low|high` forces a tier, `?qa` exposes `window.TFSolutions`. Test page: `test/home.html` (`?layout=stage` for the planned 100svh stage with the tabs overlaid).

TODO (Tim's notes): one machine is to be replaced by a new vehicle and Execution gets new vehicles. Each job has one slot (`SLOT` in `solutions/solutions.js`: `dig`, `haul`, `grade`); model the new vehicle in `solutions/sol-machines.js` and swap the factory there.

Load: same importmap as below, then `<script type="module" src="https://cdn.jsdelivr.net/gh/devinscottfountain/terrafirma-site@SHA/home3d.js"></script>`.

## Film DOM contract (homepage, `film/mount.js`)

- `section[data-section="film"][data-three="film"]`: the whole film track, normal flow, no overflow clip on the sticky.
- `[data-three-mount="film"]`: `position: sticky; top: 0; height: 100vh`, empty, `aria-hidden`; the canvas is created inside it.
- Six scenes, in order, which set the scroll timing. Each is read from the DOM, so any height works: `austin`, `earth`, `mars-title` (holds the `[data-split]` spans of "One day / on Mars"), `reindustrialize` (the SpaceX lines), `colony`, `launch`. The text in each scene is Webflow copy.
- `[data-sol]`: SOL counter, written by the film from `data-sol-from` to `data-sol-to` on `[data-sol]` (defaults 1 and 206), linear in scroll from where it fades in (S -0.02, title nearly centred) to the last px of the track (the section bottom at the viewport bottom, where the sticky lets go); the last value only shows on that px. It fades out through the entry and once the track scrolls past its end. The film sets its opacity and visibility; the page script draws the ruler bar (`--sol-p`) from the number.

Recommended scene heights (vh): austin 2, earth 1.5, title 3.5, reindustrialize 4, colony 3, launch 2, about 16 vh in all. A shorter title scene works: from the copy centred to the title centred the film needs about 1.9 vh for the pass, the cruise and the arrival; with less (title 1.75 vh gives about 1.1) they scale down, the pass least (it leaves the near still copy frame, so squeezing it steps the speed), then the arrival, the cruise most, and the move plays faster in S, not differently. The Mars framing ramps (title in and out, SpaceX in and out) are quintic, so a short title to SpaceX scroll does not step the speed either. Shipped layout (client, round 3): austin 2, earth 1.5, title 1.75, reindustrialize 1.8125 with `padding-bottom: 118.75svh` (the SpaceX line sits 0.3125 vh into its scene, so title centred to line centred is 1.1875 vh, and line centred to the colony scene is still 1.5 vh), colony 3, launch 2. Checked there at 1440x900, 1280x720, 1920x1080, 2560x1340 and 390x844: neighbour speed ratio at most 1.10, heading rate at most 0.15 deg/px.

Austin beat (`film/austin.js`): from the scene's first frame on screen to the Earth frame the camera never holds: a slow drift up and back while the H2 is up, accelerating into the rise, C1 (position, aim, lens) into the space camera at S = -1. Scroll sets only the build progress and the hour (07:54 to 19:36, one day); machines, crew and street traffic run on the film clock, so the lot stays alive when the scroll stops. Exposure on this beat is a fixed curve of sun elevation and altitude (no metering); auto exposure takes over at the Earth frame from the value it settles on there (`EARTH_EXP`). A soft burn in the lens pass sits behind the H2 while it is on screen.

Aircraft (`film/aircraft.js`): night traffic over the city on the rise, navigation lights only (no airframe): red left and green right wingtips, white tail, double-flash wingtip strobes, a red beacon top and belly, landing lights on the two low arrivals. One `THREE.Points` in the site group (compiled with it at boot), eight aircraft on high, four on low, 1.6 to 11.3 km up. Each is placed from the camera pose at a given camera distance (so it lands on the same frame whatever the scene heights) and moves along a straight level track by the camera's ln distance, i.e. by scroll, plus a bounded drift on the film clock (+/- 50 m for the two close passes, +/- 300 m for the rest, wrapping with a short fade) so they keep moving when the scroll stops; strobes and beacons run on the film clock. The two close passes (camera at ~3.9 km and ~6.8 km) enter at the top edge about 230 m and 300 m away and fall down the left and right thirds; they never come within 120 m of the camera. Lights fade in from sun elevation +2 deg to -1.7 deg and out between 60 and 250 km camera distance, well before the world swap. At the recommended heights the camera climbs ~40 to 50 m per px of scroll there, so each pass is on screen within 400 m for only ~5 px of scroll; slowing the rise in that band (`austin.js`) is the knob if it should linger.

Space camera (`film/flight.js`): one move from the Austin hand-off to the swap, in two vertical planes, so it only ever pitches where it matters. Position is a chord-scaled Hermite path through the keys with one speed curve authored in px on the recommended heights (speed and acceleration set at each anchor, a smooth bump sized so each leg covers its length; on other heights each anchor's speed is scaled by how much faster S runs there per px, so the move keeps its shape in S): the hand-off speed (0.0245 units/px, outward from the lot) eases onto the copy frame, which is near still (0.0022 units/px) with the whole Earth centred while "After solving earthmoving" is centred. The hand-off leg is unchanged bit for bit. From there the camera pushes in and over the top of Earth in the vertical plane through Earth's centre and the copy frame: closest approach 1.25 units above the surface (radius 11.25; the air shell is 11, clouds 10.085) around S -0.70, the aim only ever tilts up (or holds) from Earth's centre on the copy frame onto Mars (about 2.7 deg in all, on Mars by S -0.66), so Earth slides down and out of the bottom of the frame as the camera pushes in and over; the horizon leaves the bottom edge at the closest approach. No yaw, no roll through the pass. Mars sits far ahead in that plane (480 units out, 4 deg above the copy frame's aim, behind Earth's centre on the copy frame): it rises over the horizon as a warm star near the centre of frame (Earth hides it by depth) at S -0.82 and grows into the disc (drawn further down its own sight line from S -0.9 until S -0.16). The cruise swings onto the title side. The title and SpaceX frames are in the vertical plane through Mars's centre and the title frame (title offset unchanged): from S 0 to the swap the camera only pitches, up is world up, roll is zero, and the held disc creeps in slowly (`HOLD_CREEP` in film.js). The entry is one straight line from the SpaceX hold over the top of the disc, aim 25 deg under the local horizontal at the swap (the colony camera's pitch); the Mars mesh is tilted 35 deg about the title sight line so that line crosses ~51 N ochre, not the cap, and it spins on the clock only. The Moon orbits on the scroll clock: behind Earth on the copy frame, it clears the limb during the push and crosses the right of frame through the skim, 18+ units clear of the lens. Mouse and handheld drift are trimmed to zero at the air shell and kept in the move's plane where it only pitches (`flight.drift`). Depth of field ramps in S and focus distance (no thresholds) and lands on the colony's lens at the swap.

Lifecycle: `html[data-film3d="on"]` is set before the first frame and `tf:film-ready` fires when the canvas is live. On reduced motion, no WebGL2, `?film=0` or any error there is no canvas and no flag; an error after the flag was set removes it and fires `tf:film-fail`. The 2D script should listen for both. Renders only while the section intersects; shaders and the colony are compiled off screen first.

Switches: `?film=0` bails, `?q=low|high` forces a tier, `?qa` exposes `window.TFFilm`, `?grade` opens the look panel.

Jezero ground: the colony terrain is a 9 km square mesh inside the sky dome, which draws the far ground (crater, delta, rim) itself. From 3.3 to 4.4 km out the mesh's height fades to zero and its colour to the dome's own ground and haze (`JEZ_GROUND_GLSL` in `sky.js`, shared, same uniforms), so the square edge never shows (it read as a box of different haze just after the entry swap).

Look (`film/look.json.js`): the grade, lens and per beat offsets the film renders with, as one plain object (`film.tune` at runtime). Grade and lens are global; each beat (Austin, space, Mars orbit, colony) adds an exposure (stops) and warmth offset, blended on S (Austin to space over S -1 to -0.9, space to Mars orbit over -0.3 to -0.1, Mars orbit to colony over 0.43 to 0.49, across the swap flash). Exposure, contrast, saturation, warmth, tint, lift, gamma and gain are uniforms in the existing tone pass (skipped only if every one is at identity; the shipped defaults are the client's grade, so they always run). Bloom strength, threshold, vignette and grain are the cine `look` values.

Look panel (`?grade`, dev only): `film/dial.js`, imported by `mount.js` only when the URL has `?grade`. It loads DialKit's plain JS adapter (`dialkit@2.2.0/dist/vanilla`, no React) from jsDelivr, or lil-gui 0.21.0 if that fails (`?grade=lil` forces it). Folders: Grade, Lens, Per beat, Camera debug (film clock scrub that drives the page scroll, -2 to -1 is the Austin leg; freeze timelapse; S, scroll px and fps readout bottom left). Escape hides it. It opens on `look.json.js`. Values persist for the tab in `sessionStorage` (`tf-film-dial`), stamped with a hash of `look.json.js`, so a state saved against older defaults is dropped and new defaults always show; Reset goes back to `look.json.js` and clears it.

Round trip: open the page with `?grade`, tune, press Copy JSON (clipboard, and logged in the console).
Send the JSON back; it replaces the object in `film/look.json.js` (keep `export default`).
Commit, pin the new SHA: the published film renders the new look with no panel code loaded.

Assets (WebP, transferred): high about 1.55 MB (Earth 2K 154 KB, clouds 292, lights 77, spec 31, normal 22, Moon 1K 69, Mars 610, Mars normal 43, Milky Way 11, stars.bin 244). Low about 0.37 MB (Earth 41, clouds 82, lights 17, spec 11, Moon 13, Mars 161, Milky Way 3, stars.bin 40). Earth loads first, Moon and Mars on demand. Code is extra (three itself is shared with the other modules).

Open issues: the Webflow-hosted ortho tiles (Austin 8 km / 80 km) and Jezero terrain files are not in the repo, so the Austin neighbourhood is procedural and the Mars terrain is flat; add them to the manifest `ortho` and `jezero` keys. The perf governor is not wired in. Phone pacing is untuned.

## Loading on Webflow

Head (before the module): an importmap for `three@0.160.0` and `three/addons/`, plus preloads. Footer: the module script.

```html
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
<script type="module" src="https://cdn.jsdelivr.net/gh/devinscottfountain/terrafirma-site@SHA/careers.js"></script>
```

Everything is resolved relative to `careers.js`, so the footer and mission modules and textures come from the same pinned SHA.

## Pin the SHA, never `@main`

Always replace `SHA` with a commit SHA (short is fine). Never use `@main` or a branch: jsDelivr caches branches for up to 12 hours and the footer modules must match `careers.js`. Pin a new SHA on every deploy.
