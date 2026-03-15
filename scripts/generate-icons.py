#!/usr/bin/env python3
import struct, zlib, math, os

def write_png(filename, width, height, pixels):
    def pack_row(row):
        return b'\x00' + bytes([c for rgba in row for c in rgba])
    raw = b''.join(pack_row(pixels[y]) for y in range(height))
    compressed = zlib.compress(raw, 9)
    def chunk(name, data):
        c = name + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')
    with open(filename, 'wb') as f:
        f.write(png)

def lerp(a, b, t):
    return int(a + (b - a) * t)

def draw_icon(size):
    pixels = []
    cx, cy = size / 2, size / 2

    col1 = (102, 126, 234)
    col2 = (118, 75, 162)
    corner_r = size * 0.22

    for y in range(size):
        row = []
        for x in range(size):
            # Rounded rect mask
            dx = max(corner_r - x, 0, x - (size - 1 - corner_r))
            dy = max(corner_r - y, 0, y - (size - 1 - corner_r))
            dist = math.sqrt(dx*dx + dy*dy)
            if dist > corner_r:
                row.append((0, 0, 0, 0))
                continue

            # Gradient
            t = (x + y) / (size * 2.0)
            r = lerp(col1[0], col2[0], t)
            g = lerp(col1[1], col2[1], t)
            b = lerp(col1[2], col2[2], t)

            # Decorative circle top-right
            d_circ = math.sqrt((x - size*0.82)**2 + (y - size*0.18)**2)
            if d_circ < size * 0.35:
                r = min(255, r + 18)
                g = min(255, g + 18)
                b = min(255, b + 18)

            # Card rectangle
            cx1, cx2 = size*0.13, size*0.87
            cy1, cy2 = size*0.27, size*0.73
            cr = size * 0.06
            cdx = max(cx1 + cr - x, 0, x - (cx2 - cr))
            cdy = max(cy1 + cr - y, 0, y - (cy2 - cr))
            in_card = (cx1 <= x <= cx2 and cy1 <= y <= cy2 and math.sqrt(cdx*cdx + cdy*cdy) <= cr)
            if in_card:
                r = min(255, r + 33)
                g = min(255, g + 33)
                b = min(255, b + 33)

            # Center dot (star)
            d_star = math.sqrt((x - cx)**2 + (y - cy)**2)
            if d_star < size * 0.06:
                brightness = 1.0 - (d_star / (size * 0.06)) * 0.25
                r = int(255 * brightness)
                g = int(255 * brightness)
                b = int(255 * brightness)

            row.append((r, g, b, 255))
        pixels.append(row)
    return pixels

out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../public/icons')
os.makedirs(out_dir, exist_ok=True)

sizes = [72, 96, 128, 144, 152, 192, 384, 512]
for size in sizes:
    pixels = draw_icon(size)
    path = os.path.join(out_dir, f'icon-{size}.png')
    write_png(path, size, size, pixels)
    print(f'✓ icon-{size}.png')

print('\nAll icons generated!')
