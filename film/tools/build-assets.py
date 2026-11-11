#!/usr/bin/env python3
"""Builds film/assets/ (both quality tiers + manifest.json) from the prototype's d5/assets.

  python3 film/tools/build-assets.py <d5-assets-dir> [<extra-dir>]

<d5-assets-dir>  the prototype's d5/assets (d5-earth.jpg, d5-mars.jpg, earth_*.webp, milkyway.webp, stars.bin, ...)
<extra-dir>      optional: the six Webflow-hosted source files, by these names (any missing one is skipped and the film
                 falls back to its procedural ground):
                 austin-site-ortho.jpg  austin-ortho-8km.jpg  austin-ortho-80km.jpg
                 jezero-dtm-16bit.png   jezero-hirise-bump-1600m.jpg  jezero-ctx-bump-12km.jpg
Needs Pillow with WebP. Only the files listed in manifest.json are ever requested by the browser.
"""
import json, os, struct, sys
from PIL import Image

src = sys.argv[1]
extra = sys.argv[2] if len(sys.argv) > 2 else None
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')
os.makedirs(out, exist_ok=True)

def save(im, rel, size, q, lossless=False):
    path = os.path.join(out, rel); os.makedirs(os.path.dirname(path), exist_ok=True)
    if size: im = im.resize(size, Image.LANCZOS)
    im.save(path, 'WEBP', quality=q, method=6, lossless=lossless)
    return os.path.getsize(path)

def load(name, mode='RGB'):
    return Image.open(os.path.join(src, name)).convert(mode)

# (key, source, {tier: (size, quality)}); a tier left out does not get the map (flat fallback in the shader)
PLAN = [
    ('earth',       'd5-earth.jpg',     {'high': ((2048, 1024), 82), 'low': ((1024, 512), 78)}),
    ('earthSpec',   'earth_spec.jpg',   {'high': ((1024, 512), 70),  'low': ((512, 256), 65)}),
    ('earthNorm',   'earth_normal.jpg', {'high': ((1024, 512), 75)}),
    ('earthLights', 'earth_lights.jpg', {'high': ((2048, 1024), 72), 'low': ((1024, 512), 66)}),
    ('clouds',      'earth_clouds.jpg', {'high': ((2048, 1024), 70), 'low': ((1024, 512), 66)}),
    ('moon',        'd5-moon.jpg',      {'high': ((1024, 512), 82),  'low': ((512, 256), 78)}),   # colour only, no normal map
    ('mars',        'd5-mars.jpg',      {'high': ((4096, 2048), 80), 'low': ((2048, 1024), 78)}), # the sharpest map
    ('marsNorm',    'mars_normal.jpg',  {'high': ((2048, 1024), 74)}),
]
manifest = {'tiers': {t: {'tex': {}, 'ortho': [], 'jezero': {}} for t in ('high', 'low')}, 'bytes': {}}
sizes = {'high': 0, 'low': 0}

for key, f, tiers in PLAN:
    im = load(f)
    if key in ('clouds', 'earthSpec'): im = im.convert('L').convert('RGB')   # only the red channel is sampled
    for t, (size, q) in tiers.items():
        rel = f'{t}/{key}.webp'; n = save(im, rel, size, q)
        manifest['tiers'][t]['tex'][key] = rel; sizes[t] += n; manifest['bytes'][rel] = n

mw = load('milkyway.jpg')
for t, (size, q) in {'high': ((1024, 512), 70), 'low': ((512, 256), 64)}.items():
    rel = f'{t}/milkyway.webp'; n = save(mw, rel, size, q); manifest['tiers'][t]['milky'] = rel; sizes[t] += n; manifest['bytes'][rel] = n

# stars.bin: 5 floats per star (x, y, z, mag, bv). High keeps the catalog (mag <= 6.8); low keeps the bright ones only.
raw = open(os.path.join(src, 'stars.bin'), 'rb').read()
n = len(raw) // 20
for t, lim in (('high', 99.0), ('low', 5.2)):
    keep = bytearray()
    for i in range(n):
        rec = raw[i * 20:(i + 1) * 20]
        if struct.unpack('<5f', rec)[3] <= lim: keep += rec
    rel = f'{t}/stars.bin'; os.makedirs(os.path.join(out, t), exist_ok=True)
    open(os.path.join(out, rel), 'wb').write(keep); manifest['tiers'][t]['stars'] = rel; sizes[t] += len(keep); manifest['bytes'][rel] = len(keep)

# the Webflow-hosted sources (optional)
def opt(name):
    p = os.path.join(extra, name) if extra else None
    return Image.open(p) if p and os.path.exists(p) else None
for i, (name, hi, lo) in enumerate([('austin-site-ortho.jpg', ((2048, 2048), 78), ((1024, 1024), 72)),
                                    ('austin-ortho-8km.jpg', ((1024, 1024), 74), ((512, 512), 68)),
                                    ('austin-ortho-80km.jpg', ((1024, 1024), 72), ((512, 512), 66))]):
    im = opt(name)
    if not im: print('skipped (not supplied):', name); continue
    im = im.convert('RGB')
    for t, (size, q) in (('high', hi), ('low', lo)):
        rel = f'{t}/ortho{i}.webp'; n = save(im, rel, size, q); manifest['tiers'][t]['ortho'].append(rel); sizes[t] += n; manifest['bytes'][rel] = n
for key, name, hi, lo in [('hiBump', 'jezero-hirise-bump-1600m.jpg', ((1024, 1024), 74), ((512, 512), 68)),
                          ('ctxBump', 'jezero-ctx-bump-12km.jpg', ((1024, 1024), 74), ((512, 512), 68))]:
    im = opt(name)
    if not im: print('skipped (not supplied):', name); continue
    im = im.convert('L').convert('RGB')
    for t, (size, q) in (('high', hi), ('low', lo)):
        rel = f'{t}/{key}.webp'; n = save(im, rel, size, q); manifest['tiers'][t]['jezero'][key] = rel; sizes[t] += n; manifest['bytes'][rel] = n
im = opt('jezero-dtm-16bit.png')
if im:   # height bytes live in R and G: lossless, same size for both tiers (the shader hardcodes 512 per half)
    im = im.convert('RGB')
    for t in ('high', 'low'):
        rel = f'{t}/jezero-dtm.webp'; n = save(im, rel, None, 100, lossless=True); manifest['tiers'][t]['jezero']['dtm'] = rel; sizes[t] += n; manifest['bytes'][rel] = n
else: print('skipped (not supplied): jezero-dtm-16bit.png')

manifest['totals'] = sizes
json.dump(manifest, open(os.path.join(out, 'manifest.json'), 'w'), indent=1)
print('high %.0f KB, low %.0f KB' % (sizes['high'] / 1024, sizes['low'] / 1024))
for k, v in sorted(manifest['bytes'].items()): print('  %-28s %7.0f KB' % (k, v / 1024))
