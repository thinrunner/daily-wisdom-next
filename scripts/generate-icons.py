#!/usr/bin/env python3
"""Generate Daily Wisdom logo: amber sun rising from an open book on dark navy background."""
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
    return a + (b - a) * t

def clamp(v, lo=0, hi=255):
    return max(lo, min(hi, int(v)))

def blend(base, overlay, alpha):
    return tuple(clamp(base[i] * (1 - alpha) + overlay[i] * alpha) for i in range(3))

def draw_icon(size):
    pixels = []
    cx, cy = size / 2, size / 2
    s = size  # shorthand

    # Colors
    bg1 = (26, 26, 46)      # #1a1a2e
    bg2 = (22, 33, 62)      # #16213e
    amber = (255, 202, 40)   # #FFCA28
    amber_dark = (255, 160, 0)
    white = (255, 255, 255)
    cream = (245, 240, 230)
    book_dark = (180, 170, 155)

    corner_r = s * 0.22

    for y in range(size):
        row = []
        for x in range(size):
            # Rounded rect mask
            dx = max(corner_r - x, 0, x - (s - 1 - corner_r))
            dy = max(corner_r - y, 0, y - (s - 1 - corner_r))
            dist = math.sqrt(dx*dx + dy*dy)
            if dist > corner_r:
                row.append((0, 0, 0, 0))
                continue

            # Background gradient (dark navy)
            t = (x + y) / (s * 2.0)
            r = lerp(bg1[0], bg2[0], t)
            g = lerp(bg1[1], bg2[1], t)
            b = lerp(bg1[2], bg2[2], t)
            color = (r, g, b)

            # Sun position: slightly above center
            sun_cx = s * 0.5
            sun_cy = s * 0.38
            sun_r = s * 0.13
            d_sun = math.sqrt((x - sun_cx)**2 + (y - sun_cy)**2)

            # Sun glow (large soft)
            glow_r = s * 0.38
            if d_sun < glow_r:
                glow_t = 1.0 - (d_sun / glow_r)
                glow_t = glow_t ** 2.0  # softer falloff
                glow_color = (255, 180, 20)
                color = blend(color, glow_color, glow_t * 0.25)

            # Sun rays (8 rays)
            angle = math.atan2(y - sun_cy, x - sun_cx)
            ray_count = 8
            ray_angle = (angle % (2 * math.pi / ray_count)) / (2 * math.pi / ray_count)
            ray_width = abs(ray_angle - 0.5) * 2  # 0 at center of ray, 1 at edge
            if d_sun > sun_r * 1.2 and d_sun < s * 0.32 and ray_width < 0.25:
                ray_t = (1.0 - ray_width / 0.25) * (1.0 - (d_sun - sun_r * 1.2) / (s * 0.32 - sun_r * 1.2))
                color = blend(color, amber, ray_t * 0.35)

            # Sun disk
            if d_sun < sun_r:
                sun_t = 1.0 - (d_sun / sun_r)
                inner = blend(amber_dark, amber, sun_t ** 0.5)
                # bright center
                if sun_t > 0.6:
                    inner = blend(inner, white, (sun_t - 0.6) / 0.4 * 0.5)
                color = inner

            # Open book
            book_top = s * 0.52
            book_bottom = s * 0.78
            book_left = s * 0.18
            book_right = s * 0.82
            spine_x = s * 0.5

            if book_top <= y <= book_bottom and book_left <= x <= book_right:
                # Book pages
                in_left_page = book_left <= x < spine_x - s * 0.015
                in_right_page = spine_x + s * 0.015 < x <= book_right

                if in_left_page or in_right_page:
                    # Page curve: slight arc shape
                    if in_left_page:
                        page_t = (x - book_left) / (spine_x - s * 0.015 - book_left)
                        curve = math.sin(page_t * math.pi) * s * 0.02
                    else:
                        page_t = (x - (spine_x + s * 0.015)) / (book_right - spine_x - s * 0.015)
                        curve = math.sin(page_t * math.pi) * s * 0.02

                    adj_top = book_top + curve
                    adj_bottom = book_bottom - curve * 0.3

                    if adj_top <= y <= adj_bottom:
                        # Page color with subtle gradient
                        page_y_t = (y - adj_top) / max(1, adj_bottom - adj_top)
                        page_color = blend(cream, book_dark, page_y_t * 0.15)

                        # Slight shadow near spine
                        if in_left_page:
                            spine_dist = (spine_x - s * 0.015 - x) / (spine_x - s * 0.015 - book_left)
                            if spine_dist < 0.15:
                                page_color = blend(page_color, (80, 70, 60), (1 - spine_dist / 0.15) * 0.25)
                        else:
                            spine_dist = (x - spine_x - s * 0.015) / (book_right - spine_x - s * 0.015)
                            if spine_dist < 0.15:
                                page_color = blend(page_color, (80, 70, 60), (1 - spine_dist / 0.15) * 0.25)

                        # Text lines (decorative)
                        line_spacing = s * 0.04
                        line_y_start = adj_top + s * 0.04
                        line_idx = (y - line_y_start) / line_spacing
                        if line_idx > 0 and (line_idx % 1) < 0.15:
                            margin = s * 0.04
                            if in_left_page:
                                line_left = book_left + margin
                                line_right = spine_x - s * 0.015 - margin
                            else:
                                line_left = spine_x + s * 0.015 + margin
                                line_right = book_right - margin
                            if line_left <= x <= line_right:
                                page_color = blend(page_color, (140, 130, 120), 0.2)

                        color = page_color

                # Spine
                if abs(x - spine_x) <= s * 0.015:
                    spine_t = abs(x - spine_x) / (s * 0.015)
                    color = blend((60, 50, 40), (100, 85, 70), spine_t)

            # Book cover edges (slight 3D effect)
            cover_thickness = s * 0.012
            if book_bottom < y <= book_bottom + cover_thickness and book_left - cover_thickness <= x <= book_right + cover_thickness:
                color = blend((60, 50, 40), (90, 75, 60), 0.5)

            row.append((clamp(color[0]), clamp(color[1]), clamp(color[2]), 255))
        pixels.append(row)
    return pixels

out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../public/icons')
os.makedirs(out_dir, exist_ok=True)

sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512]
for size in sizes:
    pixels = draw_icon(size)
    if size == 180:
        path = os.path.join(out_dir, 'apple-touch-icon.png')
    else:
        path = os.path.join(out_dir, f'icon-{size}.png')
    write_png(path, size, size, pixels)
    print(f'✓ {os.path.basename(path)} ({size}x{size})')

print('\nAll icons generated!')
