# pixdiff.py <dirA> <dirB>: per-image max / mean abs diff and count of differing pixels between same-named PNGs
import sys, os, numpy as np
from PIL import Image
a, b = sys.argv[1], sys.argv[2]; worst = 0
for f in sorted(os.listdir(a)):
    if not f.endswith('.png') or not os.path.exists(os.path.join(b, f)): continue
    x = np.asarray(Image.open(os.path.join(a, f)).convert('RGBA'), dtype=np.int16); y = np.asarray(Image.open(os.path.join(b, f)).convert('RGBA'), dtype=np.int16)
    if x.shape != y.shape: print(f, 'SIZE', x.shape, y.shape); continue
    d = np.abs(x - y); n = int((d.max(axis=2) > 0).sum()); worst = max(worst, int(d.max()))
    print(f'{f:24s} max {int(d.max()):3d}  mean {d.mean():.5f}  px>0 {n:6d} ({100*n/(x.shape[0]*x.shape[1]):.3f}%)  px>2 {int((d.max(axis=2) > 2).sum())}')
print('worst max diff', worst)
