# diff-png.py a.png b.png: pixel diff of two stills (max channel delta, count of differing pixels, mean abs error). Exit 1 when any pixel differs by more than TOL (env, default 0).
import sys, os
from PIL import Image, ImageChops
a = Image.open(sys.argv[1]).convert('RGBA'); b = Image.open(sys.argv[2]).convert('RGBA')
if a.size != b.size: print('size differs', a.size, b.size); sys.exit(1)
d = ImageChops.difference(a, b); px = list(d.get_flattened_data() if hasattr(d, "get_flattened_data") else d.getdata()); tol = int(os.environ.get('TOL', '0'))
mx = max(max(p) for p in px); nz = sum(1 for p in px if max(p) > tol); mae = sum(sum(p) for p in px) / (len(px) * 4)
print(f'{a.size[0]}x{a.size[1]} max delta {mx}, pixels over tol({tol}) {nz}, mean abs error {mae:.5f}')
sys.exit(1 if nz else 0)
