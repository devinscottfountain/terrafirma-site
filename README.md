# terrafirma-site

Custom JS for the TerraFirma Webflow site. Currently: the 3D footer on the careers page.

## Files

- `careers.js`: page mount (ES module). Finds `[data-foot]`, lazy-loads three and the footer, crossfades the canvas over the poster, drives the sunrise from scroll. Falls back to the poster on any failure.
- `footer/footer3d.js`: `createFooter({ THREE, host, quality, base })`. Compositing, sky, post chain, camera, sunrise.
- `footer/foot-glsl.js`: shaders for the sky, haze, bloom and the final grade.
- `footer/foot-model*.js`: the procedural settlement (terrain, colony, plants, starships, life). `foot-model-plan.js` holds the colony layout (a local copy of the prototype's `colonyLayout`, no d5 dependency).
- `footer/foot-tex.js`: texture streamer. Loads after the first frame, one upload per frame.
- `footer/assets/tex/`: only the WebP textures the footer loads. High tier about 1.56 MB, low tier about 0.28 MB. `dusk_sky.hdr` and `256/dusk_sky_ldr.webp` are kept for reference; the footer bakes its own environment and never fetches them.
- `kit/hero-model-kit.js`: shared modelling helpers, copied unchanged from the prototype.
- `test/careers.html`: local test page that mimics the Webflow DOM. Not for production.

## Webflow DOM contract

- `[data-foot]`: footer root, `position: relative; overflow: hidden`
- `[data-foot-canvas]`: absolute mount holding the poster `img`
- `[data-foot-logo]`: wrapper around the logotype svg

URL switches: `?foot=0` keeps the poster, `?q=low|high` forces a quality tier.

## Loading on Webflow

Head (before the module): an importmap for `three@0.160.0` and `three/addons/`, plus preloads. Footer: the module script.

```html
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
<script type="module" src="https://cdn.jsdelivr.net/gh/devinscottfountain/terrafirma-site@SHA/careers.js"></script>
```

Everything is resolved relative to `careers.js`, so the footer modules and textures come from the same pinned SHA.

## Pin the SHA, never `@main`

Always replace `SHA` with a commit SHA (short is fine). Never use `@main` or a branch: jsDelivr caches branches for up to 12 hours and the footer modules must match `careers.js`. Pin a new SHA on every deploy.
