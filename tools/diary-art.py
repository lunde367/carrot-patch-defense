# Turns finished journal sketches into the game's picture files.
# Usage: python3 tools/diary-art.py <picture> <page code> [more pairs...]
#   e.g. python3 tools/diary-art.py ~/Downloads/cabbage.jpg start-cabbage
# Each picture is cropped to the journal's shape (19:17), the paper is lifted off so only the pencil
# is left (the journal page shows through), and it is saved as web/img/diary/<page code>.webp.
import sys, os, numpy as np
from PIL import Image
W, H = 640, 572
def convert(src, key):
    im = Image.open(src).convert('RGB'); w, h = im.size; r = W/H
    if w/h > r: nw = int(h*r); im = im.crop(((w-nw)//2, 0, (w-nw)//2+nw, h))
    else: nh = int(w/r); im = im.crop((0, (h-nh)//2, w, (h-nh)//2+nh))
    a = np.asarray(im.resize((W, H), Image.LANCZOS)).astype(np.float32)
    edge = np.concatenate([a[:8].reshape(-1,3), a[-8:].reshape(-1,3), a[:,:8].reshape(-1,3), a[:,-8:].reshape(-1,3)])
    paper = np.percentile(edge, 60, axis=0)
    al = np.clip(np.clip(1-a/paper, 0, 1).max(axis=2)*1.15, 0, 1); al[al < .035] = 0
    col = np.clip((a-paper*(1-al[...,None]))/np.maximum(al, 1e-3)[...,None], 0, 255)
    out = f'web/img/diary/{key}.webp'; os.makedirs(os.path.dirname(out), exist_ok=True)
    Image.fromarray(np.dstack([col, al*255]).astype(np.uint8), 'RGBA').save(out, quality=72, method=6)
    print(key, f'{os.path.getsize(out)//1024} KB')
args = sys.argv[1:]
for i in range(0, len(args)-1, 2): convert(args[i], args[i+1])
