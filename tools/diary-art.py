# Turns finished journal sketches into the game's picture files.
# Usage: python3 tools/diary-art.py <picture> <page code> [more pairs...]
#   e.g. python3 tools/diary-art.py ~/Downloads/cabbage.jpg start-cabbage
# Each picture is trimmed to the drawing, padded out to the journal's shape (19:17), the paper is lifted off so only the pencil
# is left (the journal page shows through), and it is saved as web/img/diary/<page code>.webp.
import sys, os, numpy as np
from PIL import Image
W, H = 640, 572
def lift(a):
    # lift the paper colour off so only the pencil is left
    edge = np.concatenate([a[:8].reshape(-1,3), a[-8:].reshape(-1,3), a[:,:8].reshape(-1,3), a[:,-8:].reshape(-1,3)])
    paper = np.percentile(edge, 60, axis=0)
    al = np.clip(np.clip(1-a/paper, 0, 1).max(axis=2)*1.15, 0, 1)
    al = np.clip((al-.06)/.94, 0, 1)   # drop faint paper grain and stray bands
    col = np.clip((a-paper*(1-al[...,None]))/np.maximum(al, 1e-3)[...,None], 0, 255)
    return col, al
def feather(al, m=.07):
    # fade the last few percent of every edge, so no picture shows a hard box on the journal page
    h, w = al.shape; y = np.minimum(np.arange(h), np.arange(h)[::-1])/(h*m); x = np.minimum(np.arange(w), np.arange(w)[::-1])/(w*m)
    f = np.clip(np.minimum(y[:,None], x[None,:]), 0, 1); return al*(f*f*(3-2*f))
def convert(src, key):
    a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    col, al = lift(a)
    # frame the drawing itself: trim empty paper, keep a small margin, then pad out to the journal's 19:17 shape
    ink = al > .3; rows, cols = np.where(ink.mean(axis=1) > .03)[0], np.where(ink.mean(axis=0) > .03)[0]
    if len(rows) and len(cols):
        h, w = al.shape; mg = int(.04*max(h, w))
        y0, y1 = max(0, rows[0]-mg), min(h, rows[-1]+mg); x0, x1 = max(0, cols[0]-mg), min(w, cols[-1]+mg)
        col, al = col[y0:y1, x0:x1], al[y0:y1, x0:x1]
    h, w = al.shape; r = W/H
    if w/h > r: nh = int(round(w/r)); pad = ((nh-h)//2, nh-h-(nh-h)//2, 0, 0)
    else: nw = int(round(h*r)); pad = (0, 0, (nw-w)//2, nw-w-(nw-w)//2)
    col = np.pad(col, ((pad[0],pad[1]),(pad[2],pad[3]),(0,0))); al = np.pad(al, ((pad[0],pad[1]),(pad[2],pad[3])))
    rgba = np.dstack([col, al*255]).astype(np.uint8)
    im = np.asarray(Image.fromarray(rgba, 'RGBA').resize((W, H), Image.LANCZOS)).astype(np.float32)
    im[...,3] = feather(im[...,3]/255)*255
    out = f'web/img/diary/{key}.webp'; os.makedirs(os.path.dirname(out), exist_ok=True)
    Image.fromarray(im.astype(np.uint8), 'RGBA').save(out, quality=72, method=6)
    print(key, f'{os.path.getsize(out)//1024} KB')
args = sys.argv[1:]
for i in range(0, len(args)-1, 2): convert(args[i], args[i+1])
