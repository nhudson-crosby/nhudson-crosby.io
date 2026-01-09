from pathlib import Path
from PIL import Image

MUSH_DIR = Path(r"C:\Users\iancr\OneDrive\Desktop\foranimate\assets\mushrooms")

def remove_white_bg(img: Image.Image, threshold=245):
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r,g,b,a = px[x,y]
            # if pixel is near white, drop alpha
            if r >= threshold and g >= threshold and b >= threshold:
                px[x,y] = (r,g,b,0)
    return img

for p in MUSH_DIR.glob("*.png"):
    im = Image.open(p)
    out = remove_white_bg(im, threshold=245)
    out.save(p, "PNG", optimize=True)
    print("fixed:", p.name)

print("Done. Re-upload mushrooms folder to GitHub.")
