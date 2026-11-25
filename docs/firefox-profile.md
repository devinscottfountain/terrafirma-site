# Measuring Firefox (one page)

Test pages: Home on the published site (or `test/home.html`, `test/film.html`) in a fresh Firefox profile, no extensions, window 1440 x 900, same display scale each run. Close other GPU-heavy apps. Plug in the laptop.

## Record
1. Open profiler.firefox.com and press Enable Firefox Profiler Toolbar Icon (no add-on). Open the toolbar popup, preset Graphics (add the Screenshots feature if offered).
2. Load the page with the URL flag set, wait for the loader to finish, scroll to the top. Start recording.
3. Scroll the same route every time: top to Solutions (click each tab once), on to the film, through Mars and the launch to the footer, about 40 s. Stop. In the Profiler open the Waterfall or Call Tree on the Renderer thread and the Compositor track, and read the frame times in the track graph; note the median frame time and how many frames exceed 33 ms.
4. Also read the live number without recording: `about:support` (Graphics: WebRender, Compositing, WebGL renderer, GPU process) and paste it in the sheet once per machine. On Windows note the display scale (100, 125, 150 percent).
5. Console with `?gov=log`: copy the `[film perf]` and `[sol perf]` lines (tier changes, median interval, `coarse true` means the timer is quantised).

## Flip in this order (one change at a time, then stack the ones that helped)
| # | URL / change | Isolates |
| --- | --- | --- |
| 0 | baseline `?ff=0` | the old governor path |
| 1 | `?ff=1` (the default in Firefox) | new governor: start tier and 30 Hz rule |
| 2 | paste `docs/firefox-css.md` block 1 | backdrop-filter |
| 3 | `?gov=0` | whether the governor helps or hurts at all |
| 4 | `?msaa=0` | MSAA targets (Solutions, footer) |
| 5 | `?post=0` | film post level and Solutions bloom |
| 6 | `?dpr=1` | pixel count (Windows 125 and 150 percent) |
| 7 | `?sol=0&foot=0`, then `?film=0&foot=0` | one live context at a time |
| 8 | `docs/firefox-css.md` block 2 | `[data-topo]` mask |
| 9 | Home footer JS: comment out the parallax / rail / SOL counter block you suspect | page glue (look for getBoundingClientRect, offsetHeight or getComputedStyle inside gsap.ticker, scroll or ScrollTrigger onUpdate callbacks, and a ScrollTrigger.refresh() on resize or scroll) |

## Results (fill in; fps = 1000 / median frame ms)
| Change | macOS fps | macOS median ms | macOS frames over 33 ms | Windows fps | Windows median ms | Windows frames over 33 ms | Notes (display scale, GPU) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 baseline `?ff=0` | | | | | | | |
| 1 `?ff=1` | | | | | | | |
| 2 + CSS block 1 | | | | | | | |
| 3 + `?gov=0` | | | | | | | |
| 4 + `?msaa=0` | | | | | | | |
| 5 + `?post=0` | | | | | | | |
| 6 + `?dpr=1` | | | | | | | |
| 7 one context only | | | | | | | |
| 8 + CSS block 2 | | | | | | | |
| 9 page glue off | | | | | | | |
