# Firefox CSS (paste into Webflow)

Why: `backdrop-filter` over the live Solutions canvas makes Firefox (WebRender) re-blur the backdrop on every frame the canvas repaints, and on Windows that cost is much higher. These blocks swap it for the solid fallbacks that already exist in the Home head CSS. Chrome and Safari never match `@supports (-moz-appearance:none)`, so they are untouched.

## 1. Tab cards and the rail scrim (do this first)

Where: Home page, Page settings, Custom code, Head, inside the existing `<style>`, as the last rules (after the `div[data-tab-card]` rules and after the `[data-rail]::before` rules, so the cascade picks it; `@supports` adds no specificity). The reduced-motion block can stay last.

```css
/* Firefox: no backdrop-filter over the live WebGL canvas (re-blurred every frame). Same tokens as the no-support fallback above. */
@supports (-moz-appearance:none){
  div[data-tab-card]{-webkit-backdrop-filter:none;backdrop-filter:none;background:var(--_color---black)}
  div[data-tab-card]:has(> [data-tab][aria-expanded="true"]){background:var(--_color---neutral--900)}
  [data-rail]::before{-webkit-backdrop-filter:none;backdrop-filter:none}  /* the ::after gradient still darkens the rail */
}
```

Trade-off: the stage no longer shows through the cards. If that looks too heavy, use this variant instead of the first two rules (no blur, still translucent, plain alpha blend, cheap):

```css
@supports (-moz-appearance:none){
  div[data-tab-card]{-webkit-backdrop-filter:none;backdrop-filter:none;background:color-mix(in srgb,var(--_color---black) 72%,transparent)}
  div[data-tab-card]:has(> [data-tab][aria-expanded="true"]){background:color-mix(in srgb,var(--_color---neutral--900) 88%,transparent)}
  [data-rail]::before{-webkit-backdrop-filter:none;backdrop-filter:none}
}
```

No spacing values are used, so nothing leaves the 4px/8px grid.

## 2. Optional, only if the profile points at it: `[data-topo]` masks

Where: same `<style>`, after the `[data-topo]` rules. It has two stacked gradient masks (`mask-composite:intersect`) on a section-sized SVG that scrolls with the page. Test last: it changes the look (the left and bottom fade is replaced by one fade).

```css
@supports (-moz-appearance:none){
  [data-topo]{-webkit-mask-image:linear-gradient(90deg,transparent 15%,#000 70%);mask-image:linear-gradient(90deg,transparent 15%,#000 70%)}
}
```

## 3. Not recommended without a measurement

`will-change:transform` on `[data-carousel] [role="listitem"]` and `[data-tab-line]` is a layer per slot; leave it. The HUD canvas, film grain and bloom are WebGL, not CSS, and are covered by the URL switches in `README.md`.
