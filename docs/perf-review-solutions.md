# Solutions scene: performance review (round 2)

Area: `solutions/` (solutions.js, sol-terrain.js, sol-fx.js, sol-game.js, sol-machines.js, sol-crew.js, sol-hud.js, sol-shroud.js) and the Solutions parts of `test/`.
Branch `perf2-sol`, from 0b06303. Phones first.

Everything measured here ran on software GL (SwiftShader) in headless Chrome. There are no GPU timings anywhere in this document. A number is either measured (bytes, calls, counts, JS ms, memory-by-arithmetic of known formats) or an estimate whose arithmetic is shown and which is labelled "estimate".

## Findings

Sorted by expected win. "Status" is Done (committed, verified), Proposal (needs the owner's decision or a real device) or Switch (off-by-default query flag, committed, for A/B on a device).

| id | finding | evidence | kind | who benefits | expected win | effort | visual risk | status |
|---|---|---|---|---|---|---|---|---|
| S-01 | Per-frame GPU uploads were 245 to 375 KB (phone) and 315 to 444 KB (desktop high). Four sources: whole edit field, whole line-set buffers, whole particle buffers, re-posed track buffers | solutions.js `field.upload`, sol-terrain.js createField, sol-fx.js lineSet / particles, sol-machines.js makeTrack | upload bandwidth, driver work | all tiers, phones most | measured: phone 239 / 365 / 356 KB per frame down to 31 / 29 / 30 (orchestration / planning / execution), desktop high 315 / 388 / 444 down to 45 / 47 / 42. About 90% less | M | none | Done (S-02 to S-04) |
| S-02 | Edit field: the whole 320x320 RG32F texture (800 KB) re-uploaded on every field update | sol-terrain.js `upload` (was one `needsUpdate`) | upload | all | measured: 200 KB per frame (phone, 0.25 uploads x 800 KB) to 11 to 15 KB; desktop 267 KB to 15 to 20 KB | M | none | Done 23917bc |
| S-03 | Excavator and dozer track shoes re-posed on the CPU each frame and uploaded as geometry | sol-machines.js makeTrack, `update(off)` | upload, CPU | all (phones: execution and planning tabs) | measured: dozer 135 KB per frame and excavator 144 KB per frame become one uniform (phone planning bufSub 138 KB to 17.6 KB) | M | none (float rounding, see below) | Done 6ca0026 |
| S-04 | Line sets (`lineSet.commit`) and dirt particles uploaded their whole buffers although only a prefix / a few slots change | sol-fx.js lineSet, particles, `markRange` | upload | all | measured: 25 to 40 KB per frame on phone, 22 to 95 KB on desktop | S | none | Done f94feef |
| S-05 | HUD called `measureText` every redraw for strings whose width was never used | sol-hud.js `text()` | CPU (main thread) | all | measured: calls per frame desktop orchestration 14 to 10, planning 4 to 0, execution 12 to 3; phone 4 to 2.5, 2 to 0. Sub-0.1 ms each in this CPU, so a small win, but it is layout work that is slowest on phones | S | none | Done 01c473f |
| P-01 | `createSolutions` is one synchronous task started by a scroll-triggered IntersectionObserver 1.5 viewports before the section: dots 64 to 100 ms, contours 66 to 105 ms, field 19 ms, three machines 355 ms cold (about 118 ms each), plus the pre-age (5 tasks of 24 to 35 ms) | home3d.js:191 (trigger), solutions.js:168, :182 (kit), :874 (pre-age) | scroll hitch (main thread) | phones most | measured here: about 450 to 510 ms in one task plus 5 tasks of 24 to 35 ms. Estimate on a phone: 2 to 4x slower CPU (assumption, no device) so 1 to 2 s with no frame while the user scrolls | M | none if the output is identical | Proposal (needs the owner: restructure) |
| P-02 | Scene runs at the display refresh rate. On 120 to 160 Hz screens the GPU work per second is 2 to 2.7x that of 60 Hz for a slow blueprint scene | solutions.js:865 `loop`, governor thresholds 45 / 57 fps (absolute, solutions.js:790) | GPU, battery | 120 Hz phones, 144 Hz desktops | estimate: GPU time per second scales with frame count, so a 60 Hz cap halves it at 120 Hz (arithmetic only) | S | timing (motion cadence) | Switch `?solhz=60`, c9e762a |
| P-03 | MSAA 4x on a HalfFloat scene target on desktop high | sol-fx.js:321 | memory, fill | desktop high | estimate: 56 B per pixel (8 resolve + 32 colour samples + 16 depth samples) = 88 MB at 1440x1089, 198 MB at pr 1.5 (3.53 MP); 12 B per pixel without = 19 MB / 42 MB. Fill of the resolve scales with it | S | look (edges of lines and points) | Proposal, existing `?msaa=0\|2` to compare |
| P-04 | Targets freed 2.5 s after `stop()` and reallocated on re-entry | solutions.js:916, `allocate` | scroll-time hitch, memory | phones, desktop | measured: `start` 1.6 ms + first step 6.9 ms of JS, 3 GL allocations each way; the GPU side is not measurable here. On a phone the freed memory is small (estimate: 0.35 MP x 12 B = 4.2 MB + bloom 0.35 MB + HUD 2.5 MB = about 7 MB) | S | none to timing | Switch `?free=N\|never`, e27de94 |
| P-05 | Governor level change reallocates the scene target (pixel ratio changes `setSize`) | solutions.js:779 `applyLevel`, 803 | hitch on a level change | phones | measured: `setLevel` median 2.3 ms, max 100.8 ms of JS (first call of each size, software GL). The size set is 3 values on phones | M | none | Proposal (render into a viewport of a fixed target) |
| P-06 | HUD canvas on phones at pixel ratio 2 (780x800 = 0.62 MP, 2.5 MB), redrawn at 30 Hz, composited as a second full-size layer | solutions.js (`createHud ... prMax`), sol-hud.js | compositing, memory | phones | estimate: ratio 1.5 is 0.35 MP, 44% fewer pixels cleared, drawn and composited per HUD frame | S | look (text crispness) | Switch `?hudpr=1.5`, e27de94 |
| P-07 | Excavator hydraulics (cylinders and links) are the last big dynamic buffer: 25,344 B per update (16,704 + 8,640) | sol-machines.js:450 makeHyd, :497 | upload | all | measured: about 25 of the remaining 27 KB per frame of buffer uploads. 1.5 MB per second at 60 Hz (arithmetic). Small | M to L | none | Proposal, low priority (check-arm.mjs inspects these buffers, the test would change) |
| P-08 | Dot grid: 224,575 points on high (47,768 low), about 10 `hF` evaluations plus 7 field fetches and 6 box tests per vertex | sol-fx.js:56 to 140, sol-terrain.js:9 | GPU vertex | all | estimate, arithmetic below: about 0.3 to 0.4% of an M1 ALU budget at 60 fps. Not a lever. Baking `hF` into a texture would save roughly 90% of that, but there is nothing to save | M | look (bake error) | Rejected unless a device profile says otherwise |
| P-09 | HUD redraws a full-canvas clear at 60 Hz on desktop (30 Hz phone) | sol-hud.js, solutions.js `hudHz` | CPU, raster | desktop | not measurable here (canvas raster is GPU in real browsers); a dirty-rectangle clear is the only no-look-change option | M | none | Proposal, unmeasured, low priority |

## Method and verification

Harness (all new, in `test/`):

- `test/lib/serve.mjs`: serves the worktree from disk through a Playwright `ctx.route` (origin `http://tf.test`), so no listener is needed. With `det`, it also replaces the three.js `Math.random() * 0xffffffff | 0` UUID line with an LCG stream, because `generateUUID` otherwise consumes the seeded `Math.random` and shifts the sim.
- `test/perf-sol.mjs`: wraps WebGL2 to count bytes and calls (bufferData, bufferSubData with a size histogram, texImage2D, texSubImage2D, draw calls) and 2D canvas calls (measureText, fillText, clearRect), JS ms per frame step, heap growth per frame, and RO / IO callbacks. The scene's own `loop` rAF is blocked and frames are stepped by `step()`.
- `test/perf-shot.mjs`: deterministic screenshots (seeded `Math.random`, fixed dt, shroud preloaded, `renderNow` uploads the field before its one draw), phone and desktop, three tabs x three times, plus a four-image zone scenario on desktop.
- `test/lib/pixdiff.py A B`: per-image max, mean and count of differing pixels between two PNG directories, and the count of pixels that differ by more than 2 levels.
- `test/perf-sol-misc.mjs`: one-off costs (refit, setSafe, resize, level change, stop to start).

Pixel identity (baseline b0 = 0b06303 with the same det serve, against HEAD c9e762a):

| set | images | differing images | worst image |
|---|---|---|---|
| phone 390x844 @3x, low | 9 | 2 | orchestration-2: 371 px differ (0.238%), 1 px over 2 levels, max 118 (one pixel on a track edge) |
| desktop 1440x900, high | 13 | 11 | worst by pixel count: zone-2, 387 px (0.025%), 1 px over 2 levels, max 93. Worst by level: orchestration-0, max 94 on 68 px, 2 px over 2 levels. All others 0.000 to 0.019% of pixels, at most 2 px over 2 levels |

The differences come from S-03 only (the shader seats the shoes: same maths in a different place, so float rounding on a track edge). The set after the field, line-set and particle commits alone (f1 to f3) was pixel-identical to the baseline: 0 differing pixels on all 9 phone and 13 desktop images. A phone re-run on HEAD after the last commit matches the phone row above exactly.

Checks, re-run on HEAD: `check-arm`, `check-roller`, `NOORIG=1 check-crew`, `check-gov`, `check-phone-gov` all pass, no page errors in any shot or perf run. Note `check-arm` inspects the hydraulics dynamic buffers, which is why S-03 left `makeHyd` alone.

Before / after, targeted metrics (single runs, 150 frames per tab; bytes are exact, ms are noisy and only medians are quoted):

| metric | tab | phone before | phone after | desktop high before | desktop high after |
|---|---|---|---|---|---|
| bufferSubData per frame | orchestration | 38.9 KB | 15.8 KB | 48.4 KB | 24.8 KB |
| | planning | 165.3 KB | 17.6 KB | 121.4 KB | 26.8 KB |
| | execution | 156.3 KB | 17.8 KB | 177.7 KB | 27.1 KB |
| texSubImage2D per frame | all | 200 KB | 11 to 15 KB | 266.7 KB | 15 to 20 KB |
| total upload per frame | orchestration | 239 KB | 31 KB | 315 KB | 45 KB |
| | planning | 365 KB | 29 KB | 388 KB | 47 KB |
| | execution | 356 KB | 30 KB | 444 KB | 42 KB |
| measureText calls per frame | orchestration | 4 | 2.5 | 14 | 10 |
| | planning | 2 | 0 | 4 | 0 |
| JS ms per frame, median | orchestration / planning / execution | 0.5 / 0.6 / 0.8 | 0.5 / 0.5 / 0.4 | 1.1 / 0.5 / 0.7 | 0.6 / 0.4 / 0.4 |
| draw calls | all | unchanged | unchanged | unchanged | unchanged |

The JS ms rows are inside software-GL noise (p90 swung between 0.6 and 12.6 ms across identical runs), so treat them as "not worse" rather than a win. The byte and call counts are exact and repeatable.

Attribution on phone planning (bufferSubData): 176 KB (after the field change, which does not touch buffers) to 138 KB after line sets and particles (S-04) to 17.6 KB after tracks (S-03).

The upload on a real device is a driver and bus cost that does not show in a software renderer, so the win in frame time is an expectation, not a measurement. At 60 Hz the byte change is about 23 MB per second down to about 2.8 MB per second on desktop (388 KB), and on a phone at 30 Hz about 11 MB per second down to about 0.9 MB per second (arithmetic).

## Per-finding notes

### S-01 to S-04: upload diet (Done)

S-02 (field tiles): the field is split into 32x32 texel tiles. The writers (`lower`, `raise`, `take`, `flatten`, `mark`, `relax`, `heal`) mark the tiles they touch. `upload(dt, renderer)` sends dirty tiles with `renderer.copyTextureToTexture` (texSubImage2D under the hood in r160) from a scratch DataTexture, and falls back to a full `needsUpdate` when more than 24 tiles are dirty or no renderer is given. `flushAll()` sends the whole thing once after the pre-age. Pixel-identical.

S-04 (ranges): `markRange(attr, start, count)` merges one update range per attribute. A line set marks `0..n*12` for position and aOther and `0..n*4` for aT and aK (n = live segments); particles track the lowest and highest written slot.

S-03 (tracks): the track mesh is now static local geometry carrying a shoe index. The pose (belt length, pitch, offset, centre height, and 3 vec4 per piece for up to 6 pieces) lives in a uniform array `uRig`; the vertex shader places each shoe on the belt curve. `update(off)` sets one float. Bounds are set from the offset-0 pose plus 1 m. The clip-fade `onBeforeCompile` hook is reused (cache keys `mclipS_rig` and `mclipL_rig`), so the hidden-line look is the same program family. Only float rounding differs, see the pixel table.

### S-05: HUD measureText

`text()` no longer measures; a new `textW()` returns the width where one is used (readout row, tag layout) and caches label widths in a Map. Zone labels no longer measure. The approved UI change is a separate commit: the intro demo cursor sprite is 24 px tall (`CS = 24 / 17`, arrow, outline width, press ring and offset scaled together) f3c2238.

### P-01: the scroll-time long task (largest unresolved phone issue)

What differs while scrolling on a phone: nothing in the Solutions loop itself. When the section is off screen the scene is stopped; when it is on screen the frame cost is small (JS 0.4 to 0.8 ms median, 26 to 57 draw calls, 30 KB uploads). The only Solutions work that lands in a scroll is the boot, and it lands there by design: home3d.js:191 starts `boot()` when the section is within 1.5 viewports, `import()` resolves, and `createSolutions` runs as one synchronous task (home3d.js:150 to 152).

Measured with `/tmp/boottime.mjs` and `/tmp/boottime2.mjs` (Node, no GL, desktop CPU, cold then warm):

| step | cold | warm |
|---|---|---|
| buildDots high (224,575) | 99.9 ms | 64.2 ms |
| buildDots low (47,768) | 29.7 ms | 10.7 ms |
| buildContours | 105.2 ms | 66.1 ms |
| createField | 19.0 ms | |
| kit + 3 machines | 355.5 ms (excavator 118, dozer 120, compactor 115) | second excavator 11.9 ms (templates cached) |
| pre-age, 225 steps of dig + crew | 23 to 35 ms, five times (dig alone 6 to 9 ms) | |

So about 450 to 510 ms in one task on this CPU for a phone-tier build (dots low), then five tasks of 24 to 35 ms. A 4x slower phone CPU is an assumption, not a measurement: it would make the first task 1.8 to 2 s. Any frame of the page scroll in that window is lost (the main thread is blocked, so the compositor can still scroll but any JS-driven or sticky-pinned layer, such as the film's scroll-driven scenes, will stall).

What I tried: slicing the pre-age into 45-step slices of at most 6 ms, yielded through a `MessageChannel`. The sim steps are identical (1125, same clock), but the harness then became non-deterministic (two runs of the same code differed by up to 205 levels in orchestration), because `sol-crew.js` and `sol-game.js` use `Math.random()` for particles and the page's other scripts share the seeded stream, so changing the interleaving changes who draws which number. Production is unaffected (particles are random anyway), but I could not meet the "screenshots identical" bar, so I reverted it rather than ship an unverified change. This is the cheap half of the fix (about 5 of the long tasks). The expensive half (the first task) needs `createSolutions` to build the second and third machine on idle (a placeholder group, the kit's templates and programs compiled before first draw so no compile lands mid-scroll). The machine build uses no `Math.random`, so it is verifiable by the same pixel diff. Effort M. It touches `solutions.js` and `sol-crew.js` consumers of `exc`, `loader`, `roller`.

### P-02: 120 to 160 Hz

The governor (solutions.js:787 to 797) works in seconds (an EMA of dt with 0.08 gain; steps down after 1.5 s over 22.2 ms, up after 6 s under 17.5 ms), so it behaves the same at any refresh rate, and `check-gov` covers 120 Hz with 1 ms, 16.67 ms and 100 ms timer quantums (new minimum level 5 ok). The consequence is that it never tries to hold 60: at 144 Hz the scene draws 144 frames per second until the EMA passes 22 ms, which is 2.4x the GPU work for a scene whose motion is slow. `?solhz=60` skips frames until 1/60 s have banked (with a 2.5 ms slack so a 59.94 Hz timer is not starved) and steps the sim with the banked dt, so speeds are unchanged. It is off by default because it changes the cadence of motion (look and timing). Recommendation: turn it on for desktop at `solhz=60` after one look on a 120 Hz display, and measure battery on a ProMotion phone with `?solhz=60` against none.

### P-03: MSAA

Formula: HalfFloat RGBA = 8 B per pixel; 4x multisampled colour renderbuffer 32 B; 4x depth renderbuffer 16 B (24-bit depth in a 32-bit slot); the resolve texture adds the first 8. At 1440x1089 (1.568 MP): 56 B x 1.568 MP = 87.8 MB; no MSAA 12 B = 18.8 MB. At the 1.5 pixel ratio cap (2160x1634 = 3.53 MP): 198 MB versus 42 MB. Bloom targets are 1/4 size each, 2 x 0.107 MP x 8 B = 1.7 MB (small). This is the largest single memory item on desktop high and is only an estimate for the driver's real layout (tile memory, compression). The scene is mostly points and thin lines, where MSAA helps the machine edges most. It is a look decision, so I did not touch it. `?msaa=2` and `?msaa=0` already exist in env.js; compare them side by side on a real display.

### P-04, P-06: free timer and HUD ratio

Both are switches with defaults unchanged: `?free=N` seconds (or `never`) and `?hudpr=N`. The default for a phone could be a longer free time (the memory is about 7 MB by arithmetic, so freeing it costs a reallocation on every quick scroll back for little gain) but this is a tier decision.

### P-05: level change

`applyLevel` sets the pixel ratio, which resizes the scene target and the post targets. `setLevel` median 2.3 ms, but the first change of each size cost 100.8 ms of JS here (probably program and target setup in software GL; it will be smaller on a GPU and is not measured there). A phone has only 3 ratios (0.75, 1, 1.5). Rendering into a viewport of a fixed 1.5-size target would avoid reallocation entirely. The sample positions change slightly, so it is not pixel-identical.

### P-08: dot grid

Per vertex: hF 3 sin and 1 cos (plus one 3 term) + 3 exp + 1 smoothstep, so about 16 transcendentals; 10 hF evaluations (1 for p, 2 for the slope, 7 for the shadow march; hD reuses the first) is about 160; the 7 field fetches and 6 box tests add maybe 150 ALU. Say 600 FLOP-equivalents per vertex: 224,575 x 600 = 135 MFLOP per frame, 8 GFLOP per second at 60 fps. An M1 GPU is about 2.6 TFLOP, so 0.3%. On a phone, 47,768 points with the off-view cull (PHONE_CULL skips the march for far, off-screen dots) is smaller still. Point fill (up to a few pixels each, alpha-blended) is the other cost and cannot be bounded without a GPU. Conclusion: the dot grid is not a lever; the density ladder (`uDensity`) already exists for the governor.

### Governor

Start level 3 on desktop and 1 on phones; the phone ladder is `PHONE_PR = [0.75, 1, 1.5]` with a ceiling after a 15 s step-up reversal (anti-flap) and a 30 Hz cap detector (`gs[4] > 25 && gs[36] - gs[4] < 3`). `check-phone-gov` passes (2 steps, ceiling 1, stable trace). Nothing to change except P-02 and P-05.

## What I would do next, in order

1. Decide on P-01: build the loader and roller on idle (and slice the pre-age), so no 450 ms task lands in a phone scroll. Biggest remaining phone item; effort M; needs the owner to accept a restructure of `createSolutions`.
2. Put `?solhz=60` through one look on a 120 Hz display and a battery check on a ProMotion phone; if good, make 60 the desktop default (P-02).
3. Compare `?msaa=2` and `?msaa=0` on a retina display (P-03); if 2x is acceptable, desktop high saves about 40% of the target memory (estimate: 56 to 36 B per pixel).
4. A/B `?free=never` and `?free=10` on a phone while scrolling back and forth over the section (P-04), and `?hudpr=1.5` (P-06). Pick phone defaults from the numbers, not from this document.
5. Profile one real phone (Safari timeline, Chrome `chrome://tracing`) to see whether the Solutions canvas is a measurable part of the scroll at all; every number here says its steady cost is small.
6. If level changes show as hitches on a device, render into a viewport of a fixed target (P-05).
7. Move the excavator hydraulics into a shader rig like the tracks (P-07), only if upload bytes still matter after step 5.
8. Leave the dot shader and the HUD clear alone unless a device profile points at them (P-08, P-09).

## Not verified

- Any GPU time, frame time or battery effect (software GL only).
- Real-device scroll behaviour on iOS Safari and Android Chrome, including the long-task estimate in P-01 (the 2 to 4x phone CPU factor is an assumption).
- Memory figures are format arithmetic, not driver readouts.
- Firefox and Safari behaviour of `copyTextureToTexture` (S-02) in real browsers. It is the supported r160 path (texSubImage2D) and falls back to a full upload when no renderer is passed, but I only ran Chrome.
- P-02 on a real 120 Hz display.

## Files in other areas worth a look

- `home3d.js:191` and `:150 to 152`: the 1.5 viewport lazy trigger starts the whole synchronous build during a scroll. Splitting the work across idle tasks (or triggering earlier, at idle after load) belongs there too.
- `home3d.js:62` `safeInsets` and the ResizeObserver path at `:109`: cheap (0.1 ms median), but it runs on every phone browser-chrome resize while scrolling.
- `env.js`: `MSAA`, `DPR_MAX` and `POST_MAX` are read at import, so they apply to every scene; any default change there affects film and footer too.
