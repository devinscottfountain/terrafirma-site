# Film perf review (perf2-film)

Scope: `film/` (the scroll-driven Mars film). Baseline 0b06303, branch `perf2-film`.

How numbers were taken. Headless Chrome on SwiftShader (software GL), 640x360 unless stated, `?q=high&gov=0` (level 5). Valid here: JS/CPU ms, draw calls, triangles, programs, target and texture sizes, uploaded bytes. Not valid here: any GPU time. Every GPU-side figure below is labelled "estimate" and shows its arithmetic (pixels x bytes, taps x pixels). Software-GL boot timings (getProgramInfoLog etc.) are inflated and are used only as ratios.

## 1. Film map

Track: Austin leg (clock -2..-1, section start to the Earth frame), then S -1..P_END (about 8 viewports). Beats from `beatOf()`: austin, earth, mars-title (S < .12), reindustrialize (< .42), colony (< .88), launch.

| Segment | World / mode | Built and visible | Main pass (calls / tris) | Shadow pass (calls / tris) | Post passes (non-scene) | Upload / frame |
| --- | --- | --- | --- | --- | --- | --- |
| Austin, clock -2..-1.3 | site (origin 0,40000,0) | lot, ground quad (4 ortho textures), oak/colMesh/deck instances, 44 crew, machines, building timelapse (instance scale, `HIDE`, no clipping) | 57 to 139 / 80k to 123k | 28 to 71 / 23k to 45k (every frame while sun up and siteDist < 2500) | 19 | 7 KB (instance matrices) |
| Earth / globe, clock -1.1..-1.02 | globe | Earth 192x96, clouds 160x80, atmosphere, moon, points | 6 to 8 / 82k to 98k | none | 15 | 0 |
| Space, S -.9..0.38 | space | planets, Mars 192x96, atmospheres (16-step march, 3-sample sun loop), 38.5k points | 6 to 9 / 20k to 98k (57k typical) | none | 18 | 0 |
| Colony idle, S .46..0.66 | colony (COL at y -6000) | terrain 420x420 (353k tris, one draw), far hab LOD, pads | 15 to 20 / 411k to 421k | none (`autoUpdate = false`, nothing moving) | 19 | 23 KB (life lights/dust) |
| Colony build, S .75 | colony | ships land, domes up, cranes | 137 / 583k | 54 / 76k | 19 | 23 KB |
| Colony peak, S .85 | colony | hab frame/pad/shell/glass, 20 tower cranes, rovers | 176 / 1.46M | 86 / 369k | 19 | 23 KB |
| Colony late, S .92 | colony | + rocket on pad | 138 / 1.55M | 53 / 397k | 23 (streak on) | 23 KB |
| Pre-launch, S 1.0 | colony | full colony | 77 / 1.15M | none | 23 | 23 KB |
| Launch, S 1.12 | colony | plume, dust, fire light | 110 / 1.55M | 33 / 397k | 23 | 23 KB |

Caveat: the first rows of the map were sampled with a section-offset bug that I fixed and re-ran for the colony rows; the Austin and space rows are indicative (same code paths, small shifts in S).

Per frame, always (cine chain, level 3): ScenePass (TAA jitter, own HalfFloat RT plus DepthTexture) -> HDRFX (AO / trails / TAA / motion blur) -> BokehPass DOF (reads scene depth, about 41 taps) -> half-res bloom (5 mips, blur passes; streak off unless `look.streak > 0`, launch only: +4 passes) -> exposure reduce 64x64 / 8x8 / 1x1 and adapt -> tone + bloom composite + ACES + grade (one pass, samples 5 bloom textures and the streak texture every time) -> SMAA (level 2) or FXAA (level 1) -> lens pass (heat, vignette, scrim, grain, edge fade). Programs: 66 at `film.ready`, 157 after the colony is built (65 MeshPhysical, about 25 ShaderMaterial, 10 basic, 10 depth, 3 sprite, rest points/lines). 95 of the 157 use the default `customProgramCacheKey` (the `onBeforeCompile` source), so identical patches share.

Governor ladder (`perf.js`):

| Level | pr | post | trails | shadow map | every | keep |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | .75 | 0 | no | 1024 | 3 | .4 |
| 1 | 1.0 | 1 | no | 2048 | 2 | .6 |
| 2 | 1.0 | 2 | yes | 2048 | 1 | 1 |
| 3 | 1.0 | 3 | yes | 4096 | 1 | 1 |
| 4 | 1.25 | 3 | yes | 4096 | 1 | 1 |
| 5 | 1.5 | 3 | yes | 4096 | 1 | 1 |

Thresholds: GPU_DOWN 14 ms, GPU_UP 9, MISS 20, HITCH 250, WIN 40 frames, COOL 1500 ms, UP_HOLD 4000, PROBATION 15000. Firefox starts at level 3. Phones use PHONE_PR. Every `apply()` calls `renderer.setPixelRatio` + `post.setSize` + `post.resetMotion`: all targets reallocate, and a shadow-map size change disposes the map. Both happen mid-scroll; `hold()` only covers S in (E0, .52).

## 2. Findings (sorted by expected win)

Kind: M memory, G GPU (estimate), C compile/boot, P pacing, J JS/CPU. Status: done = committed and verified, flag = off-by-default switch committed, prop = proposal, no change.

| id | Finding | Evidence | Kind | Who benefits | Expected win | Effort | Visual risk | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F1 | Composer keeps its construct-time pixel ratio; governor pr steps never reach the post targets | post.js:405-409 (`composer.setSize` only), film.js:111 | G, M | hi-DPI Firefox (starts level 3, pr 1.0, post at 1.5) and phones | Measured: composer RT stays 960x540 while canvas is 640x360 / 480x270 (dpr 2 test). Estimate: Firefox 2x pr 1.5 vs 1.0 = 2.25x post pixels; 2.916 Mpx vs 1.296 Mpx at 1440x900 | S | medium (look changes at lower tiers on hi-DPI) | done 47ebbea, default ON, `?postpr=0` off |
| F2 | Warm-up compiled programs for doubled light counts | film.js `compileIn`, three r160 `compile` gathers lights from scene and again from root | C | everyone (boot, first colony swap) | Measured: programs 161 -> 107 at colony done, 66 -> 53 at ready; 57 of 157 programs were never-drawn twins | S | none | done 5681305 |
| F3 | Composer ping-pong targets carry unused depth buffers | post.js:60-62, cine renders into `scenePass.rt` | M | every user | Estimate: 2 x 2.916 Mpx x 4 B = 23 MB at 2160x1350 (11.7 MB each) | S | none | done 60198fd |
| F4 | Crane-only shadow redraw runs every frame in the colony; code comment says every 3rd | film.js colony shadow rule (`every` is 1 at levels 2 to 5) | G | colony segment, S .75 to 1.12 | Measured: 86 calls and 369k tris per shadow frame at S .85 while scroll is idle. Estimate: every 3rd frame cuts that to about a third in the crane-only case | S | low (crane shadow lags up to 2 frames) | done e5621dc |
| F5 | DOF runs almost always on high | post.js DOF skip rule `0.4*maxblur*bufW >= 0.5` | G | high tier | Estimate: 41 taps x 2.916 Mpx = 120M fetches / frame at level 3 | M | medium (look) | done c859e50 |
| F6 | Tone and lens are two full-res passes | post.js tone + lens | G | high tier | Estimate: one HalfFloat write + read removed, 2.916 Mpx x 8 B x 2 = 47 MB / frame | M | none to low (grain order) | done f62bda7 |
| F7 | Colony geometry volume: terrain 353k tris (5 `terrH` evaluations per vertex), hab pad/frame 310k, shells and glass about 270k; pads and panels cast about 40% of shadow tris | colony.js, census at S .85 | G | colony segment | Estimate only: shadow pass `custom|inst` 182k + habdepth-shell 111k of 369k; a coarser caster LOD for pads and panels could remove about 180k | M | low | prop |
| F8 | No frame pacing: a 160 Hz display runs the film at up to 160 fps | film.js `step`, mount.js tick | P | 120 to 165 Hz owners | Estimate: 160 -> 80 fps is half the GPU and JS work per second; measured pacing result in section 4 | S | low | done 54cdb3a, default on from 110 Hz, `?fps=0` uncaps |
| F9 | HalfFloat (RGBA16F) HDR targets everywhere | post.js targets | M, G | high tier | Estimate: R11G11B10F halves 8 B/px to 4 B/px; scene RT 23.3 MB -> 11.7 MB, TAA history x2 46.7 MB -> 23.3 MB | M | medium (banding in dark skies) | flag `?hdr=rg11b10` d05f151, off by default |
| F10 | Colony swap long task (165 ms) is one synchronous chunk: PMREM env, program compiles, throwaway draw, texture uploads | film.js `warmColony`, habitat.js populate | C | first colony arrival | not measured here (SwiftShader inflates it); F2 removes the compile share | M | none | prop (split across idle slices) |
| F11 | Governor steps reallocate all targets and dispose the shadow map mid-scroll | perf.js, film.js:111 | P | any tier change | not measured; hitch size is GPU-allocation dependent | M | none | done 30eb72a (deferral; shadow map not pre-allocated) |
| F12 | Small items: `checkShaderErrors = false` after warm-up; always-on PointLight `fire` (intensity 0 idle) adds a per-fragment light to every colony material; mars.webp 4096x2048 is the largest texture on high (about 45 MB; low already uses 2048x1024); per-rover array literal in `machines.js` update | film.js, rockets.js, machines.js | J, G, M | everyone | Estimates: error-check round trips only (boot getProgramInfoLog is a link-wait, not extra work); fire light cost = one extra light term per fragment on 65 physical programs while idle | S | none to low | no change needed: low tier already ships a 2048x1024 mars.webp (see F12) |

Texture memory (estimate, RGBA8 + mips, my arithmetic): about 166 MB total on high: mars 4096x2048 44.7 MB, ortho-km8 2048^2 22.4, earth/clouds/earthLights 11.2 each, marsNorm 11.2, ortho-lot and ortho-site 12.6 each, bump maps 5.6 each.

## 3. Findings in detail

### F1 stale composer pixel ratio
`createPost` builds `new EffectComposer(renderer)` once, which fixes `_pixelRatio` from the renderer at that moment. `post.setSize` calls `composer.setSize(w, h)` but never `composer.setPixelRatio`, so every later `renderer.setPixelRatio(pr)` from the governor changes the canvas but not the scene RT, TAA history, DOF, bloom base, tone input or lens input. Measured at dpr 2, 640x360: level 5 canvas 960x540 and composer RT 960x540; pinned level 1 canvas 640x360 with composer RT 960x540; pinned level 0 canvas 480x270 with composer RT 960x540. With `?postpr=1` the composer RT follows (640x360 and 480x270). Consequence: lowering the governor level does not lower post cost, so the ladder is weaker than the table suggests, and Firefox (starts at level 3, pr 1.0) pays for the construct-time ratio. Recommended default: ON, after the owner looks at level 3 and below on a hi-DPI screen (the image gets softer, as the tier intends).

### F2 doubled-light compile twins (done)
In r160, `renderer.compile(root, cam, scene)` pushes lights from `targetScene.traverseVisible` and again from `scene.traverseVisible` when `scene !== targetScene`. A root already in the scene therefore counts its lights twice (site work lights 2 -> 4, colony fire light 1 -> 2). The program cache key includes `numDirLights`/`numPointLights`, so those programs were compiled and never used; the throwaway draw then compiled the real ones synchronously. Fix: `compileIn` lifts `root` out of its parent's child list for the synchronous gather and restores it in `finally`. Measured with the boot harness (high, software GL): programs at `film.ready` 66 -> 53, linkProgram 66 -> 53, programs at colony done 161 -> 107 (the map table's 157 is a different run of the same build; the drop of 54 to 57 programs is the point). Four fixed states are pixel identical (see verification).

### F3 composer depth buffers (done)
`composer.renderTarget1/2` are HalfFloat with `depthBuffer` true by default. The cine chain always renders the scene into `scenePass.rt` (own DepthTexture); the ping-pong pair only holds colour. Setting `depthBuffer = false` before the first draw removes 2 full-size depth renderbuffers: 2.916 Mpx x 4 B x 2 = 23 MB at 2160x1350 (estimate). Pixel identical.

### F4 crane shadow cadence
Colony shadow rule: `forceShadow || ((built || cranesUp()) && shadowFrame % every === 0) || (!overlap && built)`. The comment says crane-only motion updates every 3rd frame, but `every` is 1 from level 2 up, and `(!overlap && built)` is true once built, so the map redraws every frame. Measured 86 calls / 369k tris at S .85. Proposal: when only cranes move and nothing else did, draw every 3rd frame regardless of level; split cranes into their own shadow layer if a stricter version is wanted. Risk: crane shadows step at 20 fps while the rest is 60.

### F5 DOF
At 2160 wide the skip threshold `0.4*maxblur*bufW >= 0.5` is almost never met, so 41 taps run on nearly every frame: 41 x 2.916M = 120M fetches (estimate). Option: raise the threshold or run DOF at half resolution with a bilateral upsample. Depends on `look.json.js` values, so it is a look decision.

### F6 tone + lens merge
Tone writes a full-res target that lens immediately reads. Merging puts grain, vignette, scrim and heat in the tone shader; saves one 8 B/px write and read (47 MB per frame at 2.916 Mpx, estimate). Grain must stay after ACES and before the SMAA/FXAA decision to keep the look, which is why this is M and not S.

### F7 colony geometry
The terrain is one 420x420 grid (176k vertices, 353k tris, uint32 index) with 5 `terrH` evaluations per vertex in the vertex shader; it receives shadows only. Census at S .85: terrain 352,800 tris in 1 draw, hab-frame 160k, hab-pad 150k, shells and glass about 270k. Shadow pass: instanced `custom|inst` (pads, panels) 182k and habdepth-shell 111k of 369k. Ideas: drop pads and panels from the shadow caster set (they sit on the ground), use the far LOD in the shadow pass, instance the 20 tower cranes (about 80 draws per pass today, CPU only).

### F8 pacing and high refresh
Decision for a 160 Hz owner display: recommended default stays uncapped (nothing changes for 60 Hz users), and an owner or tester on a 120 to 165 Hz screen uses `?fps=80` (160 Hz) or `?fps=60` (120 Hz). Reasons: the film is TAA and grain driven, scroll-coupled at every frame, and gains little beyond 60 to 80 fps; an uneven cap (for example 60 on 160 Hz) would beat, so the cap snaps to every Nth display callback.
Implementation (film.js `step`): `N = round(1 / (ema(dt) x cap))`, render on every Nth call, give the clock the whole accumulated dt, feed the governor `acc / N` so it sees the display interval. `?idle=N` applies the cap only while `scrollY` has not changed for 400 ms (scroll sampled without forcing layout).
Measured (160 callbacks at a 6.25 ms interval, low tier, software GL): default 160 frames; `?fps=80` 80 frames; `?fps=60` 54 frames (N = 3, so 53 fps, uneven cadence avoided by design); `?idle=30` at rest 32 frames. Clock advanced 1.000 s, 1.000, 1.012 (fps=60: accumulator boundary), 1.000: motion speed unchanged.

### Render-on-demand evaluation
No segment qualifies. The clock drives grain, handheld drift, planet spin, machines, beacons and heat shimmer on every frame, and TAA needs about 8 jittered frames to converge so a stopped scroll would still need frames. Static candidates (space, S -.64..0.38, with nothing animating except grain) still shimmer from grain and the star points; freezing them would show a visible stop. Strobes (beacons, launch) would also break. Recommendation: no render-on-demand; use `?idle=` (F8) as the soft version, which keeps TAA converging at a lower rate. Not enabled by default.

### F9 R11G11B10F
`THREE.R11G11B10Format` is not renderable in WebGL2 without `EXT_color_buffer_float` plus a type workaround on every target in r160; it halves HDR bandwidth but has no alpha and 6/5-bit mantissas, which risks banding in night skies and the bloom chain. Proposal only; needs a look pass.

### F10 colony swap long task
In order: `scheduleColony` idle build, `warmColony` (compile with `compileIn`, then `throwaway(w)` draw to upload), PMREM env generation in the habitat populate chunk, `initTexture` uploads for the Mars maps. F2 removes the doubled-twin compiles from the first two. I could not isolate the 165 ms on software GL (compile costs are link-wait there, 1.3 s to 3.3 s of `getProgramInfoLog`), so I would not claim a number. Next step on real hardware: Chrome performance trace with `?gov=log` and split `warmColony` into idle slices (one family per slice).

### F11 governor reallocations
`apply()` on every level change resizes all post targets and, on a shadow-size change, disposes the shadow map (4096x2048 RGBA8 + depth is about 67 MB, estimate). Proposal: allocate the largest shadow size once and use viewport/scissor for lower levels, and do pr changes only when `hold()` is true or the scroll is idle. Not measurable here.

### F12 small items
`checkShaderErrors = false` after warm-up skips `getProgramParameter`/info-log round trips for later compiles (none are expected after F2). `fire` PointLight is always visible at intensity 0 when idle; keeping it out of `visible` until the launch would change the light count and force a recompile, so it needs a warm path. `the low tier already ships a 2048x1024 `low/mars.webp` (manifest.json), so nothing to do; only the high tier loads the 4096x2048 file (about 45 MB on the GPU). Allocation per frame is negligible (0.12 to 2.2 KB/frame, heap sampling), `yard.js` costs 42 us per frame (measured 10,000 frames in 414 ms), so caching it is not worth the complexity. DOM reads (`rectOf(section)` per frame, two rects for the Austin H2 scrim, `rectOf(tG.h2)` and `rectOf(host)` during the title beat, `coverage()` in mount.js) are cheap while layout is clean; measure on the real page before touching them (JS per step measured 0.3 to 2.4 ms median).

## 4. Post chain cost by level (estimates, arithmetic shown)

Pixels: desktop 1440x900 x pr 1.5 = 2160x1350 = 2.916 Mpx; phone 390x844 at pr 2 = 780x1688 = 1.317 Mpx.

| Item at 2.916 Mpx | Size (estimate) |
| --- | --- |
| scene RT HalfFloat 8 B/px | 23.3 MB |
| scene depth texture | 11.7 MB |
| composer RT1 + RT2 (HF) | 46.7 MB, plus 23 MB of unused depth before F3 |
| TAA history x2 | 46.7 MB |
| bloom chain (half res, 5 mips) | about 16 MB |
| shadow map 4096x2048 | about 67 MB |
| total post + shadow at level 3 | about 168 MB (after F3, about 145 MB) |

Per level (non-scene passes measured at level 3 site 19, space 18, launch 23; lower levels drop passes by design): level 0 FXAA only, no TAA, no trails; level 1 FXAA plus bloom; level 2 SMAA, trails and AO; level 3 adds TAA jitter and history. With F1 on, level 0 at pr .75 runs post at (1440 x .75) x (900 x .75) = 0.729 Mpx, 25% of the level 5 pixels (estimate). Phone at 1.317 Mpx has the same chain at 45% of the desktop pixel count; the phone tier uses the lighter chain, so I would verify on a real phone before changing it.

## 5. Verification

Checks (all run in the worktree): `node test/check-arm.mjs` ALL OK; `node test/check-roller.mjs` all PASS; `NOORIG=1 node test/check-crew.mjs` all checks passed (0 overlapping frames, determinism 0 differing, 41.5 us per frame); `node test/check-gov.mjs` ok; `node test/check-phone-gov.mjs` ok (needs a server on port 8731, which this environment would not allow; I ran an identical copy that serves the worktree through Playwright routing, same assertions, `ok`). No page errors in headless Chrome in any run.

Screenshots at fixed states (clock -1.5, S 0.1, 0.85, 1.12; 640x360; `shot.mjs`, per-channel max abs diff over RGB): base vs the F2+F3 build at level 5 (`gov=0`): max 0 in all four states (`pixel identical`). Base vs HEAD at `?post=2` (no TAA): max 0 in all four states, and two HEAD runs equal each other. At level 3 and 5 with TAA, two runs of the identical code differ from each other by up to 140 (the TAA jitter sequence depends on how many real frames the page ticked before the shot), so pixel identity can only be shown where TAA is off; the level-5 runs at F2 and F3 happened to be identical to base.

## 6. What I would do next, in order

1. Check the whole set on the owner's 160 Hz hi-DPI display with `?gov=log` (level changes, deferral, pacing, merged pass) and a GPU trace of the DOF and tone passes.
2. Look at skies with `?hdr=rg11b10` on a GPU; if there is no banding make it the default (about 58 MB, estimate).
3. Take pads and panels out of the shadow casters or use the far LOD in the shadow pass (F7), then re-census.
4. Split the colony swap into idle slices (F10) after a real-hardware trace says which part of the 165 ms is the biggest.
5. Check `footer/` and `solutions/` for the same stale pixel ratio and the same uncapped 120 to 165 Hz behaviour (they are not in this area).
6. Pre-allocate or reuse the shadow map across levels if the deferral still leaves a visible step on a real device.
7. Re-tune the DOF threshold and half-res weight divisor (1.5 px) on real hardware if the focus plane looks soft.

## 7. Could not verify here

GPU timings of any pass, the 165 ms colony swap long task, real compile cost (software-GL link waits are inflated), mid-scroll reallocation hitches, phone cost, Firefox behaviour, the real DOM read cost on the full page, and any thermal or high-refresh behaviour on the owner display. Memory figures are arithmetic from target sizes, not measured with a driver query.

## 8. Other-area files worth a look (read only, not edited)

`stage.js` alternates film and footer frames when both are visible (the overlap path halves the film's cadence by design; combined with `?fps` the governor feed assumes `overlap` is set correctly). `env.js` parses the shared query flags once; `?postpr`, `?fps` and `?idle` are read in `film/` instead, so they are not in the env switch table. `footer/` shares the same governor ideas and was not reviewed for the stale pixel-ratio issue (F1); worth a check there too.

## 9. Round 2 (owner-approved changes, all committed)

| Item | Commit | What it does | Metric |
| --- | --- | --- | --- |
| F1 post pixel ratio default ON | 47ebbea | `composer.setPixelRatio` in `post.setSize`; `?postpr=0` restores the old behaviour | Targets match the governor at dpr 1, 1.5, 2 and levels 5,4,3,2,1,0,3,5 (640x360: 960x540 at level 5, 800x450 at 4, 640x360 at 3 to 1, 480x270 at 0); TAA history valid again one frame after the resize; no page errors. Estimate: level 3 post pixels 2.25x fewer on a 1.5 base |
| F4 crane shadows | e5621dc | when only cranes turn (`built` false) the map redraws every 3rd frame; while scroll or the launch plume moves (`built` true) the old per-frame rule holds | shadow draws per 30 frames at S .85 idle: 30 -> 10 (60 -> 20 per second); screenshots identical at `?post=2` |
| F5 DOF | c859e50 | skip under 1 device px of reach (was 0.5); half-res taps + 2-fetch composite at governor levels 0 to 4, full res at level 5 | Frames still running DOF (samples along the track, bufW 2160 / 1440): Austin 19/19 -> 0/19 / 0/19 -> 0/19; Earth + space 75/75 -> 72/75 / 73/75 -> 70/75; colony 32/32 -> 32/32 both. Half-res cost estimate 36M vs 120M fetches at 2.916 Mpx; diff full vs half at S .85 mean 1.75/255 (noise floor 0.29) |
| F8 pacing | 54cdb3a | default every 2nd frame from 110 Hz | 120 -> 60, 144 -> 72, 165 -> 82 rendered frames per second, 60 and 75 Hz unchanged, clock exact, governor sees 16.67 / 13.89 / 12.12 ms |
| F11 safe steps | 30eb72a | heavy governor changes wait for 300 ms of still scroll, a hold window, 1 s of 40 ms frames, or 3 s; urgent steps (emergency, stalls, pin, start) go at once | 30 ms frames while scrolling: pr change about 1.5 s after the level step; 45 ms frames (emergency): same step |
| F6 tone + lens | f62bda7 | one pass where no FXAA or SMAA follows and no heat is on (levels 0, 3, 4, 5); `?tonemerge=0` off | 19 -> 18 passes at level 3; 47 MB per frame at 2.916 Mpx less traffic (estimate); max 1/255 diff where the scene is deterministic |
| F9 R11G11B10F | d05f151 | `?hdr=rg11b10` only | about 58 MB less at 2.916 Mpx (estimate); max diff 4 to 10 per channel in deterministic states |
| F12 mars.webp | none | the low tier already ships 2048x1024 `low/mars.webp` | nothing to do |
| F7, F10 | none | left as proposals: neither is small and risk-free (caster set and colony swap slicing both change what is drawn or when) | |

Screenshots (in /tmp/p2film, not in the repo): `shots-final/{base,new}-{clock-1.5,S0.1,S0.85,S1.12}.png` (TAA on, 640x360, base 0b06303 vs HEAD) and `shots-final/cmp-S0.85-taa-on.png` side by side; TAA-off pairs `shot-f4b-*`/`shot-f4n-*` (F4, identical), `dof-t3-{full,half,full2}-*` (F5), `m-a-*`/`m-off-*` (F6), `m-hdr-*`/`m-hdrref-*` (F9), `shot-f1-{off,on}-*` (F1, dpr 2 level 3: differs by design).

Diff method: per-channel max and mean absolute difference of PNG screenshots. Level 3 TAA is not deterministic across runs (the render counter that picks the jitter sample differs with timing), so TAA-off or zeroed TAA weights plus a pinned counter (`post.frame = 8`) are used wherever a pixel comparison is stated.

Pacing caveat: from 110 Hz, not "above 90". At 100 Hz every 2nd frame is 20 ms, the governor's MISS line, so a 100 Hz display would read the cap as load. If the owner wants 91 to 109 Hz capped as well, the governor's MISS and capped rules need to learn the display interval first.

stage.js: no change needed. The film cap is bypassed while `overlap` is true and stage.js alternation (film on even frames, footer on odd) still produces film frames at half the display rate there. The footer's own canvas is not capped when it is alone on screen at 120 to 165 Hz; if the owner wants that, `footer/` needs the same median-of-30 detector. env.js: no change needed (the new flags are read in `film/`).
