# terrafirma-site

Custom JS for the TerraFirma Webflow site. Currently: the 3D footer and the Mission section (planets and Starship) on the careers page.

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
- `[data-mission-arc]` containing `path[data-mission-path]`, left to right: the rocket's arc

The rocket's arc parameter is `t = remap(p, 0.15..0.85 -> 0.04..0.96)`, where `p` is section progress (0 when the section top meets the viewport bottom, 1 when its bottom meets the viewport top). It is smoothed, clamped, and fades out at the extremes. Rings around the planets are Webflow CSS.

Switches: `?mission=0` keeps the posters, `?q=low|high` applies to both. QA hook: `window.TFMission`.

## Loading on Webflow

Head (before the module): an importmap for `three@0.160.0` and `three/addons/`, plus preloads. Footer: the module script.

```html
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
<script type="module" src="https://cdn.jsdelivr.net/gh/devinscottfountain/terrafirma-site@SHA/careers.js"></script>
```

Everything is resolved relative to `careers.js`, so the footer and mission modules and textures come from the same pinned SHA.

## Pin the SHA, never `@main`

Always replace `SHA` with a commit SHA (short is fine). Never use `@main` or a branch: jsDelivr caches branches for up to 12 hours and the footer modules must match `careers.js`. Pin a new SHA on every deploy.
