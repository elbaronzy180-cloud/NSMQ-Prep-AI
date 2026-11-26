"""Makes the PNG app icons (needed by phones) using only Python's standard library.

Run from the project folder:   python3 tools/make_icons.py
It writes icons/icon-192.png, icons/icon-512.png and icons/icon-maskable-512.png.
You only need to run it again if you want to change the icon's look.
"""
import math
import struct
import zlib

BG = (79, 70, 229)        # indigo
LINE = (255, 255, 255)    # white curve
DOT = (251, 191, 36)      # amber end dot


def curve_points(n=200):
    """A falling curve in a 0..1 box, like a loss graph."""
    pts = []
    for i in range(n + 1):
        t = i / n
        x = 0.19 + 0.62 * t
        y = 0.30 + 0.40 * (1 - math.exp(-4 * t)) / (1 - math.exp(-4))
        pts.append((x, y))
    return pts


def make_icon(size, rounded, scale):
    """scale < 1 shrinks the drawing toward the centre (for the maskable icon)."""
    pts = [(0.5 + (x - 0.5) * scale, 0.5 + (y - 0.5) * scale) for x, y in curve_points()]
    line_w = 0.06 * scale
    dot = pts[-1]
    dot_r = 0.055 * scale
    corner = 0.22
    rows = []
    for py in range(size):
        row = bytearray()
        for px in range(size):
            x, y = (px + 0.5) / size, (py + 0.5) / size
            # Transparent outside the rounded square (normal icons only).
            if rounded:
                cx, cy = min(max(x, corner), 1 - corner), min(max(y, corner), 1 - corner)
                if math.hypot(x - cx, y - cy) > corner:
                    row += bytes((0, 0, 0, 0))
                    continue
            colour = BG
            if math.hypot(x - dot[0], y - dot[1]) <= dot_r:
                colour = DOT
            elif min(math.hypot(x - qx, y - qy) for qx, qy in pts) <= line_w / 2:
                colour = LINE
            row += bytes(colour + (255,))
        rows.append(b'\x00' + bytes(row))   # \x00 = "no filter" for this PNG row
    return rows


def write_png(path, size, rows):
    def chunk(kind, data):
        body = kind + data
        return struct.pack('>I', len(data)) + body + struct.pack('>I', zlib.crc32(body) & 0xffffffff)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))   # 8-bit RGBA
    png += chunk(b'IDAT', zlib.compress(b''.join(rows), 9))
    png += chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(png)


for name, size, rounded, scale in [
    ('icon-192.png', 192, True, 1.0),
    ('icon-512.png', 512, True, 1.0),
    ('icon-maskable-512.png', 512, False, 0.7),   # full-bleed, drawing kept in the safe middle
]:
    write_png(f'icons/{name}', size, make_icon(size, rounded, scale))
    print('wrote icons/' + name)
