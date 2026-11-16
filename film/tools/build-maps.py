#!/usr/bin/env python3
"""Builds the film's large terrain and aerial maps (both tiers) into film/assets/ and merges them into manifest.json.

  python3 film/tools/build-maps.py <src-dir>

<src-dir> holds the six source files (the ones that used to be Webflow assets), by these names:
  film-austin-site-ortho.jpg        800 m, 4096 px (0.195 m/texel). If it is missing, the first *site-ortho*.jpg in the
                                    folder is used as a stand-in: resampled to 4096 and its outputs marked provisional.
  film-austin-ortho-8km.jpg         8 km, 2048 px
  film-austin-ortho-80km.jpg        80 km, 2048 px
  film-jezero-dtm-16bit.png         1024 x 512 RGBA, two 512 px halves (HiRISE | CTX), height = R * 256 + G
  film-jezero-hirise-bump-1600m.jpg 1.6 km, 2048 px, greyscale
  film-jezero-ctx-bump-12km.jpg     12 km, 2048 px, greyscale
Needs Pillow with WebP and pyoxipng (pip install pyoxipng). Rerun it whenever a source changes; it only touches these maps.
"""
import glob, io, json, os, sys
import numpy as np
from PIL import Image
import oxipng

src = sys.argv[1]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')
man_path = os.path.join(out, 'manifest.json')
man = json.load(open(man_path))
Image.MAX_IMAGE_PIXELS = None

# site ortho: lot crop at the native 0.195 m/texel (half width in m, px) + the whole 800 m (px), per tier
LOT = {'high': (150, 1536), 'low': (100, 1024)}
SITE = {'high': 1536, 'low': 1024}   # low: 0.78 m/texel outside the lot crop, so the 8 km map and the HiRISE bump can stay 1024
# (key, source, {tier: (px, webp quality)}); quality None = ship the source bytes unchanged (same name extension)
PHOTO = [('km8', 'film-austin-ortho-8km.jpg', {'high': (2048, None), 'low': (1024, 70)}),
         ('km80', 'film-austin-ortho-80km.jpg', {'high': (512, 70), 'low': (512, 70)})]
BUMP = [('hiBump', 'film-jezero-hirise-bump-1600m.jpg', {'high': (1024, 70), 'low': (1024, 66)}),
        ('ctxBump', 'film-jezero-ctx-bump-12km.jpg', {'high': (1024, 70), 'low': (512, 70)})]
Q_LOT, Q_SITE = {'high': 74, 'low': 74}, {'high': 70, 'low': 66}
DTM_N = {'high': 512, 'low': 256}   # texels per half side; colony.js reads it from the manifest

provisional = []

def put(tier, rel, data, group, key):
    path = os.path.join(out, rel); os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'wb').write(data)
    man['tiers'][tier].setdefault(group, {})[key] = rel
    man['bytes'][rel] = len(data)
    return len(data)

def webp(im, q):
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6); return b.getvalue()

def png(rgba):   # lossless, RGBA kept, 8-bit channels kept (no colour type or depth reductions)
    b = io.BytesIO(); Image.fromarray(rgba, 'RGBA').save(b, 'PNG')
    return oxipng.optimize_from_memory(b.getvalue(), level=6, color_type_reduction=False, bit_depth_reduction=False,
                                       palette_reduction=False, grayscale_reduction=False, optimize_alpha=False)

for t in ('high', 'low'):   # these keys are rebuilt from scratch every run
    man['tiers'][t]['ortho'] = {}
    man['tiers'][t]['jezero'] = {}
for k in [k for k in man['bytes'] if '/ortho-' in k or '/jezero-' in k]: del man['bytes'][k]

# Austin site ortho
sp = os.path.join(src, 'film-austin-site-ortho.jpg')
stand_in = not os.path.exists(sp)
if stand_in:
    c = sorted(glob.glob(os.path.join(src, '*site-ortho*.jpg')))
    if not c: sys.exit('no site ortho in ' + src)
    sp = c[0]
site = Image.open(sp).convert('RGB')
if site.size != (4096, 4096):
    print('site ortho is %dx%d, not 4096: outputs are PROVISIONAL' % site.size); stand_in = True
    site = site.resize((4096, 4096), Image.LANCZOS)
for t in ('high', 'low'):
    half, px = LOT[t]; c0 = 2048 - half * 4096 // 800; c1 = 4096 - c0   # 800 m = 4096 px, centred on the lot
    lot = site.crop((c0, c0, c1, c1))
    if lot.size[0] != px: lot = lot.resize((px, px), Image.LANCZOS)
    for rel, im, q in ((f'{t}/ortho-lot.webp', lot, Q_LOT[t]), (f'{t}/ortho-site.webp', site.resize((SITE[t],) * 2, Image.LANCZOS), Q_SITE[t])):
        put(t, rel, webp(im, q), 'ortho', 'lot' if 'lot' in rel else 'site')
        if stand_in: provisional.append(rel)
    man['tiers'][t]['lotHalf'] = half

for key, name, tiers in PHOTO + BUMP:
    sp = os.path.join(src, name); im = Image.open(sp)
    im = im.convert('L').convert('RGB') if key.endswith('Bump') else im.convert('RGB')
    grp = 'ortho' if key.startswith('km') else 'jezero'
    for t, (px, q) in tiers.items():
        if q is None:   # byte-identical copy of the source
            assert im.size[0] == px, (name, im.size)
            put(t, f'{t}/{grp}-{key}{os.path.splitext(name)[1]}', open(sp, 'rb').read(), grp, key); continue
        r = im if im.size[0] == px else im.resize((px, px), Image.LANCZOS)
        put(t, f'{t}/{grp}-{key}.webp', webp(r, q), grp, key)

# Jezero DTM: high = the original pixels, losslessly recompressed; low = heights averaged 2x2 per half, then repacked
raw = np.asarray(Image.open(os.path.join(src, 'film-jezero-dtm-16bit.png')).convert('RGBA'))
assert raw.shape == (512, 1024, 4), raw.shape
h16 = raw[..., 0].astype(np.uint32) * 256 + raw[..., 1]
def pack(h):
    o = np.zeros(h.shape + (4,), np.uint8); o[..., 0] = h >> 8; o[..., 1] = h & 255; o[..., 3] = 255; return o
for t in ('high', 'low'):
    n = DTM_N[t]
    if n == 512: rgba = raw.copy()
    else:
        f = 512 // n
        halves = [h16[:, s * 512:(s + 1) * 512].reshape(n, f, n, f).astype(np.float64).mean(axis=(1, 3)) for s in (0, 1)]
        rgba = pack(np.rint(np.concatenate(halves, axis=1)).astype(np.uint32))
    data = png(rgba)
    back = np.asarray(Image.open(io.BytesIO(data)).convert('RGBA'))
    assert np.array_equal(back, rgba), 'DTM png round trip changed pixels'
    put(t, f'{t}/jezero-dtm.png', data, 'jezero', 'dtm')
    man['tiers'][t]['jezero']['dtmN'] = n

man['provisional'] = provisional
man['totals'] = {t: sum(v for k, v in man['bytes'].items() if k.startswith(t + '/')) for t in ('high', 'low')}
json.dump(man, open(man_path, 'w'), indent=1)
print('high %.0f KB, low %.0f KB' % (man['totals']['high'] / 1024, man['totals']['low'] / 1024))
for k in sorted(man['bytes']):
    if '/ortho-' in k or '/jezero-' in k: print('  %-26s %7.0f KB%s' % (k, man['bytes'][k] / 1024, '  provisional' if k in provisional else ''))
