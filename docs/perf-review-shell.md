# Performance review: page shell, 3D footer, Careers Mission

Scope: footer/, mission/, home3d.js, careers.js, stage.js, env.js, root.js, build.mjs, kit/, brand/, and the test pages. Solutions and the film were read, not edited (cross-area notes at the end). Branch `perf2-shell`, from 0b06303.

Measurement rules used here. This box has software GL only, so nothing below is a GPU time. Numbers are CPU/JS time, allocation, GL call counts, bytes, memory arithmetic and download sizes. Memory figures are arithmetic from the render target formats (an upper bound; tilers and drivers can compress MSAA), not readings from a GPU. Anything I could not measure says so.

## Findings

Sorted by expected win. Status: done = implemented and verified in this branch, proposed = needs the owner.

| id | finding | evidence | kind | who benefits | expected win | effort | visual risk | status |
|----|---------|----------|------|--------------|--------------|--------|-------------|--------|
| F1 | Footer MSAA 4x HalfFloat scene target is about 140 of about 220 MB of footer render memory at 1440p, pr 1.5 | footer/footer3d.js:138 | memory, fill | desktop high tier, integrated GPUs | -140 MB VRAM, less bandwidth per frame (arithmetic; GPU time not measured) | S | low to medium (edges) | proposed, flag exists (`?msaa=0|2`) |
| F2 | Footer height field evaluated every fbm term for every ground vertex | footer/foot-model-kit.js rawHeight | CPU, boot | every device, first footer boot | boot long task median about 470 ms to about 345 ms (-27%), ground grid 165 to 44 ms (node) | S | none | done ec2777d |
| F3 | Texture bytes: Mission and footer ship re-encoded WebP at high quality; film DTM is a 804 KB PNG | see asset table | download, decode | all, phones most | about -190 KB (DTM lossless WebP), about -160 KB (Mission mars-2048 at q80), about -80 KB (earth poster q80) | S | none for lossless, low for lossy | proposed (lossless DTM is the safe one) |
| F4 | Three WebGL2 probe contexts created at load by home3d.js and careers.js, plus the film's own | home3d.js, careers.js, film/mount.js | main thread, GPU process round trip | every page load | contexts created 3 to 2 on Home (about 3 ms each on software GL, more on real GPUs) | S | none | done 8d7a551 (film side proposed) |
| F5 | Mission measure() reallocated the 2160x1440 drawing buffer and resampled the SVG arc on every ResizeObserver call | mission/mission3d.js measure() | CPU, GC, blank frame | Careers on resize, late fonts and images | page load 579 to 193 path samples, 6 to 2 canvas size writes, body-only resize 193 + 2 to 0 + 0 | S | none | done d8509d3 |
| F6 | stage.js keyed the frame turn on document.timeline.currentTime | stage.js turn() | correctness, jank | Firefox resistFingerprinting, any coarse timer | with a 100 ms timer the footer and film ran 5 Hz each in runs of 6; now strict alternation (300/300) at 1, 16.7 and 100 ms | S | none | done 46e9407 |
| F7 | Footer life.update allocated arrays every frame (rovers, traffic, walker) | footer/foot-model-life.js | GC | every device with the footer on screen | life.update 8.0 to 3.0 KB/frame, whole footer frame 66 to 54 KB/frame (Chrome heap sampling, 120 frames) | S | none | done fd7a8b3 |
| F8 | Footer is static between scroll events but redraws every frame | footer/footer3d.js loop | GPU, power | laptops on battery | not measured (needs a real GPU). Skipping identical frames would cut footer draws to scroll and shimmer only | M | low (shimmer cadence) | proposed |
| F9 | 120 to 160 Hz displays run both loops at full rate | footer3d.js, mission3d.js | GPU, power | ProMotion and gaming displays | pacer verified at 60.0 fps on 60/120/144/160/240 Hz synthetic displays (CPU side) | S | none while off | done as `?hz=N`, off by default |
| F10 | Overlap policy is strict halves regardless of coverage | stage.js | GPU split | the seam where film and footer overlap | none by default | S | low | done as `?stage=off|area`, off by default |
| F11 | Canvas context attributes | footer3d.js:48, mission3d.js:45 | memory | all | footer is already alpha/depth/stencil false; Mission has stencil false but still a default depth buffer it does not use (about 4 B/px of canvas) | S | none | proposed (below) |
| F12 | Loader-gate preload list is a fixed list of 13 chunks plus three, not keyed on device class | head snippet, `if(window.tfGate)` block | download | phones | the list includes the film and Solutions chunks (322 + 140 KB, minified, before compression); whether a poster-only phone path needs them was not checked | S | none | proposed, check first |

Done in this branch: F2, F4 (shell side), F5, F6, F7, F9, F10. Everything else is a proposal.

## Evidence per finding

### F1 Footer MSAA scene target

At 1440x900 CSS px and pr 1.5 (the high-tier cap), the buffers are 2160 x 1350 = 2.916 Mpx.

| target | formula | MB |
|--------|---------|----|
| scene color, 4x MSAA RGBA16F renderbuffer | 32 B/px | 93.3 |
| scene resolve texture | 8 B/px | 23.3 |
| scene depth, 4x MSAA renderbuffer (24 bit) | 16 B/px | 46.7 |
| scene depth texture | 4 B/px | 11.7 |
| rtA (aerial pass output) | 8 B/px | 23.3 |
| rtPre, half res | 8 B per half-res px | 5.8 |
| bloom chain, 5 levels, two targets each | 1.33 x 0.729 Mpx x 16 B | 15.5 |
| total | | about 220 |

With `?msaa=0` the two MSAA renderbuffers drop out: about 80 MB, a saving of about 140 MB. The aerial perspective pass and bloom soften most edges in this scene, but the terrain horizon and the dome silhouettes are exactly where 4x MSAA shows, so I did not change the default. `?msaa=0` and `?msaa=2` already exist for the A/B. Recommended default: keep 4x on desktop high, test 2x on integrated GPUs on a real device, and only then change it. On the phone tier (samples 2, pr cap 1.25, 390 px wide at dpr 3) the same arithmetic gives about 30 MB, so phones are not the problem.

### F2 Height field (done)

`rawHeight()` evaluated every fbm term per sample, but each term sits in a window the `ss()` ramps clamp to exactly 0 outside. Each term is now computed only inside its window, expression order unchanged. `test/check-height.mjs` compares 344k points (grid rows, random points, window edges) against 0b06303: 0 mismatches. Ground grid samples 165 to 44 ms in node. `buildFooterScene` long task in headless Chrome, 3 interleaved rounds of 9 runs: medians 469/505/436 ms to 363/318/351 ms. Software GL box, CPU only; real devices are faster in absolute terms but the ratio should hold since this is pure JS.

### F3 Assets

20 largest raster assets in my area plus the film assets the page also loads. GPU column is RGBA8 with mips (what three uploads for a WebP/PNG/JPEG). The KTX2 column is arithmetic for ASTC 4x4 or BC7 (1 byte per pixel, times 1.33 for mips).

| bytes | file | px | format | GPU RGBA8+mips | KTX2 ASTC/BC7+mips |
|------:|------|----|--------|---------------:|-------------------:|
| 887,949 | film/assets/high/ortho-km8.jpg | 2048x2048 | JPEG | 22.4 MB | 5.6 MB |
| 804,134 | film/assets/high/jezero-dtm.png | 1024x512 | PNG RGBA (data) | 2.8 MB | do not compress (packed 16-bit data) |
| 624,394 | film/assets/high/mars.webp | 4096x2048 | WebP | 44.7 MB | 11.2 MB |
| 526,114 | film/assets/high/ortho-lot.webp | 1536x1536 | WebP | 12.6 MB | 3.1 MB |
| 476,280 | footer/assets/tex/1k/regolith_n.webp | 1024x1024 | WebP (normal) | 5.6 MB | BC5/ASTC, 1.4 MB |
| 401,234 | mission/posters/earth-poster.webp | 1642x1642 | WebP RGBA | 14.4 MB | (poster, an img, not a texture) |
| 337,878 | film/assets/high/ortho-site.webp | 1536x1536 | WebP | 12.6 MB | 3.1 MB |
| 314,240 | film/assets/low/ortho-km8.webp | 1024x1024 | WebP | 5.6 MB | 1.4 MB |
| 313,640 | mission/assets/mars-2048.webp | 2048x1024 | WebP | 11.2 MB | 2.8 MB |
| 298,604 | film/assets/high/clouds.webp | 2048x1024 | WebP | 11.2 MB | 2.8 MB |
| 260,252 | footer/assets/tex/1k/mars_rock_n.webp | 1024x1024 | WebP (normal) | 5.6 MB | 1.4 MB |
| 256,056 | film/assets/low/ortho-lot.webp | 1024x1024 | WebP | 5.6 MB | 1.4 MB |
| 247,498 | film/assets/high/jezero-hiBump.webp | 1024x1024 | WebP | 5.6 MB | 1.4 MB |
| 238,152 | footer/assets/tex/1k/regolith_c.webp | 1024x1024 | WebP | 5.6 MB | 1.4 MB |
| 237,436 | film/assets/low/jezero-hiBump.webp | 1024x1024 | WebP | 5.6 MB | 1.4 MB |
| 226,248 | mission/assets/earth-2048.webp | 2048x1024 | WebP | 11.2 MB | 2.8 MB |
| 223,670 | footer/assets/tex/1k/mars_rock_c.webp | 1024x1024 | WebP | 5.6 MB | 1.4 MB |
| 217,960 | film/assets/low/jezero-dtm.png | 512x256 | PNG RGBA (data) | 0.7 MB | do not compress |
| 168,134 | mission/posters/mars-poster.webp | 1110x1110 | WebP RGBA | 6.6 MB | (poster) |
| 164,618 | film/assets/low/mars.webp | 2048x1024 | WebP | 11.2 MB | 2.8 MB |

Re-encode experiments with PIL (one pass, not committed, no files changed):

| file | now | candidate | result |
|------|----:|-----------|-------:|
| film/assets/high/jezero-dtm.png | 804,134 | lossless WebP | 613,172 (-24%), bit exact |
| mission/assets/mars-2048.webp | 313,640 | WebP q80 | 152,260 (-51%) |
| mission/posters/earth-poster.webp | 401,234 | WebP q80 / q70 | 319,718 / 252,358 |
| film/assets/high/mars.webp | 624,394 | WebP q80 / q70 | 526,862 / 374,998 |
| footer/assets/tex/1k/regolith_n.webp | 476,280 | WebP q70 | 418,034 (a normal map, do not go lower) |
| film/assets/high/ortho-km8.jpg | 887,949 | WebP q70 | 1,040,336 (bigger: the JPEG is already tight) |
| film/assets/high/ortho-lot.webp | 526,114 | WebP q70 | 504,092 (not worth it) |

These are re-encodes of already lossy sources, so they stack generation loss. The right way to do the lossy ones is from the master images, and to eyeball them at the size they are shown. Only the lossless DTM change is safe to apply blind (the shader reads the packed 16 bit height, so it must stay bit exact; ImageBitmapLoader in kit/bitmap.js already uses colorSpaceConversion none and premultiplyAlpha none, so lossless WebP decodes to the same bytes).

KTX2 (Basis or ASTC/BC7): the GPU memory win is real (about 4x, for example mars.webp 44.7 MB to about 11.2 MB), and it removes the main-thread upload stall of a 4096x2048 texture. It does not shrink the download (KTX2 with zstd is usually larger than a good WebP), and it needs KTX2Loader plus the transcoder (a new dependency and about 200 KB of wasm), so it is a proposal, not a quick fix. The one place it would matter most is film/assets/high/mars.webp.

Distinguish three things when reading the table: what goes over the wire (the WebP/PNG size), what the decoder holds briefly (RGBA8, w x h x 4), and what stays on the GPU (RGBA8 plus mips). Only the third is a long-lived cost.

### F4 Shared WebGL2 probe (done)

home3d.js and careers.js each created a throwaway context at load to test for WebGL2. Both now call a cached `hasWebGL2()` stored on `window.__tfGL2`. `test/check-probe.mjs` on test/home.html plus a footer host: contexts created 3 to 2 (probes 2 to 1; the live Solutions context is unchanged). Creation is about 3 ms on software GL; on real GPUs it is a GPU process round trip on the main thread, so it is worth more there. The film's own probe in film/mount.js can adopt the same two lines (not edited, it is outside my area).

### F5 Mission measure (done)

`measure()` runs from a ResizeObserver on body, section and host, and from load, fonts and every late image. Each call did `renderer.setSize` (which reallocates and clears the 2160x1440 drawing buffer even for the same size, so a blank frame while visible) and re-sampled the arc with 193 `getPointAtLength` calls plus the stroke style writes. It now skips both when nothing changed. `test/check-mission.mjs` at 1440x960 @2x, q=high: page load 579 to 193 samples and 6 to 2 size writes; each body-only resize 193 + 2 to 0 + 0. A still at `renderAt(12.5)` before and after: max channel delta 0 over 2160x1440 px.

### F6 stage.js (done)

A new frame now starts when a canvas asks for its turn a second time (each loop asks at most once per frame). That needs no clock. The counter has its own key so an older copy of stage.js sharing `window.__tfStage` keeps using its own n and f and never double-steps. `test/check-stage.mjs`, 600 synthetic 60 Hz frames, both call orders, timeline at 1 ms, 16.7 ms and 100 ms: old runs were 1, 2 and 6 frames long; the new code is strict alternation (300/300, longest run 1) in all six cases.

### F7 Footer life.update (done)

Rovers, traffic and the walker built arrays each frame (`plan.ring` returns `[x, z]`, nested literals, `HEAD.map` per rover). They now write into scratch pairs through `plan.ringTo` (same arithmetic as `toFooter`), and the headlight colour is hoisted. `test/check-life.mjs` diffs the light point buffers and instance matrices byte for byte against 0b06303 over 4000 scene times on both tiers: identical. Chrome heap sampling over 120 frames: life.update 965 KB to 359 KB (8.0 to 3.0 KB/frame); whole footer frame 66 to 54 KB/frame. What remains is mostly three's own per-object parameter strings, not ours.

### F8 Footer redraw when static (proposed)

The footer loop (footer3d.js:358-363) runs `frame(now)` on every animation frame while on screen. The scene is scroll-driven (progress p drives the sunrise) with a shimmer at rest. When p has not moved and the shimmer is the only change, each frame redraws about the same pixels through the full chain (MSAA scene, aerial pass, 5-level bloom, grade). Two cheap options, neither done: (a) throttle the at-rest shimmer to 30 Hz via `?hz=30` (already built), (b) skip the frame when p and the shimmer phase quantized to 1/30 s are unchanged. I cannot quantify the GPU saving without a real GPU. Recommended default: (a) at-rest only, after an eyeball A/B, since the shimmer is a slow effect. Visual risk is low but not none, so I left it off.

### F9 and F10 switches (done, off by default)

`?hz=N` (env.js `pacer`) is a slot-clock limiter that stays even on 75 to 240 Hz displays: `test/check-pacer.mjs`, 60 cap gives 60.0 fps on 60, 120, 144, 160 and 240 Hz synthetic displays, 30 cap gives 30.0. Mission with `?hz=20` draws 20.0 fps in headless Chrome. `?stage=off` removes alternation (A/B on 120 Hz+ where each still gets 60+ with alternation); `?stage=area` weights turns by coverage with a quarter at least each. README "Diagnostic switches" documents them. Recommended default: leave alternation as is; on 120 Hz+ each canvas still gets 60+, which is the target.

### F11 Context attributes (proposed)

Footer: `antialias false, alpha false, depth false, stencil false, powerPreference high-performance`. Correct, because all work goes into render targets. Mission: `alpha true, premultipliedAlpha true, antialias high && MSAA !== 0, stencil false`; it keeps the default depth buffer (about 4 B/px of canvas). The additive materials at mission3d.js:59 and :101 set depthTest false, but the environment sphere at :113 only sets depthWrite false (depthTest stays on), so `depth: false` needs that material checked and a before/after still. That is why it is not done. Canvas opacity transitions (home3d.js:156 uses `opacity 0 to 1` over FADE_MS on the Solutions canvas) are cheap: a compositor-only property on a layer that already exists. `desynchronized` is not worth adding: it helps latency, not throughput, and it conflicts with alpha compositing here.

### F12 Preload list (proposed, check first)

The head snippet runs only when `window.tfGate` exists (the loader gate) and modulepreloads three plus 13 chunks, including `film-4FDAWCYA.js` (322 KB, the largest JS file) and `solutions-BS6EHUV4.js` (140 KB), so the loader's progress covers them. The list is a fixed string, not keyed on device class or reduced motion. I did not verify what a phone or a reduced-motion visitor does with those chunks (the film and Solutions have poster and lighter paths, per the project brief), so this is a question for the owner: if those paths never import the chunks, preloading them wastes bytes at the moment the hero is competing for bandwidth. Chunk graph (dist/manifest.json): home3d.js is 4.4 KB with every scene behind a dynamic import; careers.js is 6.1 KB and statically imports two tiny chunks (964 B); the Mission is one 24.5 KB chunk plus shared three helpers (chunk-TAKKMMN3 60 KB, GLTFLoader 45 KB, meshopt 22 KB). The graph is already well split.

## Shell review notes (no finding, recorded because they were on the checklist)

- Bail rules: Careers and Home both gate on the shared WebGL2 probe, reduced motion, and the phone tier. No change needed.
- Quality pick: `hardwareConcurrency <= 2` gives low; a sandbox with 2 cores therefore needs `?q=high` for QA (it bit me during testing, harmless in production).
- IntersectionObserver margins: Home Solutions boots at 1.5 viewports, renders within 0.25 viewport; Careers boots at 2 viewports; Mission renders within 120 px. Reasonable, and `afterLoad` keeps the boot off the loader's critical path.
- tick: the footer and Mission each run their own rAF; both now accept the pacer. A shared ticker would not reduce work, since each loop already returns before drawing when off screen.
- safeInsets ResizeObserver path: observed in home3d.js on root, mount and spacer, calls `frame()`; no layout reads in the observer itself beyond one rect read. Fine.
- stage.js with a third scene: `ORDER` is `['film', 'foot']` and `onScreen()` only counts those names, so a third canvas that reports is ignored and always gets its turn. If Solutions and the film were ever on screen together they would not alternate. They are in different sections today, so this is latent, not a bug.
- env.js flags: now `?hz`, `?msaa`, `?dpr`, `?stage` all parsed in one place and documented.

## Three WebGL contexts

| scene | where | context | live when |
|-------|-------|---------|-----------|
| Solutions | Home | 1 (plus its own overlay canvas) | from 1.5 viewports before the section, renders within 0.25 viewport |
| Film | Home | 1 | when its section is near |
| Footer | Home and Careers | 1 | when near the page bottom |
| Mission | Careers | 1 | within 2 viewports |
| probes | load | now 1 shared, was 2 or 3 | released immediately |

Memory per context cannot be read from a page. The big long-lived items are the render targets (footer about 220 MB at 1440p, above) and uploaded textures. A single shared renderer would save program duplication and per-context fixed overhead, but the scenes sit in different DOM places and a canvas cannot be in two places without a copy (drawImage or OffscreenCanvas plus transfer), which costs more than it saves. I do not recommend it. Eager versus lazy: the scenes are already lazy by distance. Phones: the footer's low tier is about 30 MB of targets by the same arithmetic, and the film and Solutions take the lighter or poster paths, so the context count is the issue, not memory; keep the probe shared and keep the three scenes mutually exclusive in time where possible.

## Whole-page schedule over one scroll (read from code, not measured)

| scroll position | rendering | notes |
|-----------------|-----------|-------|
| top | hero and loader (Webflow side) | Solutions and film not yet booted |
| about 1.5 viewports before Solutions | Solutions boots and warms programs off screen | `warm()` is gated by the loader or idle |
| Solutions in view | Solutions draws; film and footer idle | IO margin 0.25 viewport |
| between Solutions and the film | film booting | no overlap |
| film | film draws, 8 viewports of it | footer not yet near |
| film tail to CTA to footer | film and footer overlap briefly | stage.js alternates (film even, footer odd frames), seam colour handed from the footer to the film |
| footer in view | footer draws; sunrise on p | the scene is otherwise static (F8) |

A page-level scheduler is not worth building. stage.js already is one for the only overlap that exists, and the scenes are lazy by distance, so there is nothing for a central scheduler to arbitrate. On Careers the Mission and footer are separate sections with the same property.

## Proposals that need an owner decision

| proposal | recommended default | flag |
|----------|--------------------|------|
| Footer MSAA 4x to 2x or off (F1) | keep 4x on desktop high; A/B 2x on integrated GPUs | `?msaa=0|2` exists |
| Footer at-rest throttle (F8) | 30 Hz at rest, after eyeball A/B | `?hz=30` exists (applies to all footer frames, not only at rest) |
| Lossless WebP for the DTMs (F3) | yes, safe | none needed |
| Lossy re-export of Mission Mars and posters (F3) | from masters, at q80, eyeball first | none |
| KTX2 for film mars.webp (F3) | only if GPU memory on phones is a measured problem | none |
| Mission `depth: false` (F11) | yes, after checking the env sphere material | none |
| Preload only for the active path (F12) | yes | none |

## Could not be verified here

GPU frame times, real VRAM, driver MSAA behaviour, real 120 Hz and 160 Hz displays, Firefox (the `resistFingerprinting` case is a synthetic timer test, not a Firefox run), Safari, and phones. `check-phone-gov` needs a localhost:8731 server and a background server was refused here, so I ran a routed copy that printed ok.

## Notes for other areas

- film/mount.js has its own WebGL2 probe (adopt `window.__tfGL2`) and reads a rect for coverage each frame; fold it into one read per frame.
- film/film.js:48 and solutions/solutions.js:130 create the renderer with three's defaults (depth and stencil true). If neither scene uses the stencil, `stencil: false` is free memory.
- Solutions uses MSAA on its default framebuffer; same A/B as F1 applies.
- film/assets/high/mars.webp (4096x2048) is 44.7 MB on the GPU as RGBA8 with mips: the largest single texture on the page.

## What I would do next, in order

1. A/B `?msaa=2` and `?msaa=0` on the footer on a real integrated-GPU laptop and a phone; decide the default (F1, about 140 MB).
2. Convert the two DTM PNGs to lossless WebP (F3, about -190 KB, bit exact).
3. Re-export Mission Mars and the earth poster from masters at q80 and eyeball them (F3, about -240 KB).
4. Have film/mount.js adopt `window.__tfGL2` (F4, one fewer context at load).
5. Check whether the head preload list pulls the film and Solutions chunks on paths that never use them (F12).
6. Check Mission materials and set `depth: false` (F11).
7. Try the footer at-rest throttle on a real display, then decide (F8).
8. Consider KTX2 for film mars.webp only if a phone shows memory pressure.
