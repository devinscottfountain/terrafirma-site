# D6.1 footer textures: credits and licences

## Scanned (Poly Haven, CC0 1.0)
Fetched from polyhaven.com (2k JPG) via the browser on 2026-11-04, downsized in-browser, then graded and re-encoded to WebP by `_src/gen_foot.py` + `_src/build_foot.py`.

| role | Poly Haven asset | changes |
|---|---|---|
| regolith | red_laterite_soil_stones (https://polyhaven.com/a/red_laterite_soil_stones) | colour graded toward Mars dust, darkened; metal zeroed |
| mars_rock | rock_face_03 (https://polyhaven.com/a/rock_face_03) | recoloured to dark basalt with red dust on the facets; metal zeroed |

## Shared from D6 (by URL, not copied)
- dome_glass: `../../../d6/assets/tex/512/glass_smudge_orm.webp` (procedural, CC0, see `d6/assets/tex/CREDITS.md`).

## Procedural (authored for this project, CC0 1.0)
`_src/gen_foot.py`: dome_frame, foliage, habitat_panel, stainless, rover_paint, dusk_sky. Periodic FFT noise, wrapped Worley,
wrapped leaf stamps; no third-party pixels. dusk_sky is an analytic Mars dusk (near-black zenith, warm glow at -Z under a
low ridge silhouette) so it matches Figma `22951:8878` and stays tiny.

## Conventions
- `_c` colour (sRGB), `_n` normal (linear, OpenGL green up), `_orm` R ao, G roughness, B metalness (linear).
- `dusk_sky.hdr` 256 x 128 RLE RGBE (high). `256/dusk_sky_ldr.webp` stores linear * 0.5 in sRGB (low; intensity 2).
  three.js equirect: glow centre at direction -Z, about 2 degrees below the horizon.
- texScale (metres per tile): regolith 4, mars_rock 3, dome_glass 1.5, dome_frame 0.5, foliage 0.6, habitat_panel [2, 2],
  stainless [1, 1.8] (u around the hull, weld ring at v 0.5), rover_paint 1.

## Regenerate
1. Put the Poly Haven maps (`<id>_c.webp`, `<id>_n.webp` from nor_gl, `<id>_orm.webp` from arm) in `<scan_dir>`.
2. `python3 -I gen_foot.py <scan_dir> <png_dir>` then `python3 -I build_foot.py <png_dir> <d61/assets/tex>` (needs cwebp).
   `build_foot.py` writes `_src/manifest.json` with per-file sizes and tier totals.

Tier totals: high 1567 KB (23 files incl. the shared D6 glass map), low 270 KB (10 files).
