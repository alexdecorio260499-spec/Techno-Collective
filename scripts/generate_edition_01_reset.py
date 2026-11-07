#!/usr/bin/env python3
"""
RUPTURE Studio — Edition 01: Complete Visual Reset Campaign Generator
Master Art Direction & Creative Archetypes Implementation:
  - Primary Family: Sculptural Liquid Chrome
  - Secondary Family: Folded Liquid Surfaces
  - Strict Monochrome Palette: Obsidian Void, Charcoal, Slate, Liquid Chrome, Cold Silver, Subtle Icy Blue
  - STRICTLY ZERO RED, ZERO ORANGE, ZERO NEON
  - Varied Creative Archetypes:
      * Full Artwork Compositions (Posts 01, 05, 15)
      * Typography-Led Compositions (Posts 02, 06, 11)
      * Artwork Fragments & Framing (Posts 03, 04, 12, 14)
      * Cinematic DJ Videos with Chrome Framing (Posts 07, 08, 09)
      * Cropped Macro Artwork (Posts 10, 13)
Outputs:
  - 1080x1350 (4:5) master feed posts
  - 1080x1080 (1:1) safe-crop square profile posts
  - 1080x1920 (9:16) vertical story/reel concepts for video posts
"""

import os
import sys
import math
import json
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MASTERS_DIR = os.path.join(ROOT, "artworks", "masters")
EDITION_DIR = os.path.join(ROOT, "campaign", "editions", "edition_01_hydraulic_void")
OUTPUT_POSTS = os.path.join(EDITION_DIR, "posts")
OUTPUT_TEMPLATES = os.path.join(EDITION_DIR, "templates")

PUBLIC_EDITION_DIR = os.path.join(ROOT, "public", "campaign", "editions", "edition_01_hydraulic_void")
PUBLIC_POSTS = os.path.join(PUBLIC_EDITION_DIR, "posts")
PUBLIC_TEMPLATES = os.path.join(PUBLIC_EDITION_DIR, "templates")

for d in [OUTPUT_POSTS, OUTPUT_TEMPLATES, PUBLIC_POSTS, PUBLIC_TEMPLATES]:
    os.makedirs(d, exist_ok=True)

# Font loading helpers
FONT_HELVETICA_TTC = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_MONO_TTF = "/System/Library/Fonts/SFNSMono.ttf"
if not os.path.exists(FONT_MONO_TTF):
    FONT_MONO_TTF = "/System/Library/Fonts/Menlo.ttc"

def get_font(size, weight="regular"):
    idx_map = { "regular": 0, "bold": 1, "condensed_bold": 4, "light": 7, "condensed_black": 9 }
    if weight == "mono":
        if os.path.exists(FONT_MONO_TTF):
            try:
                return ImageFont.truetype(FONT_MONO_TTF, size)
            except Exception:
                pass
        return ImageFont.load_default()
    idx = idx_map.get(weight, 0)
    try:
        return ImageFont.truetype(FONT_HELVETICA_TTC, size, index=idx)
    except Exception:
        return ImageFont.load_default()

# Palette constants (STRICT MONOCHROMATIC + RESTRICTED ICY BLUE ONLY)
COLOR_WHITE = (255, 255, 255)
COLOR_OFFWHITE = (235, 238, 242)
COLOR_SILVER = (195, 202, 212)
COLOR_MUTED_SILVER = (150, 158, 170)
COLOR_SLATE = (100, 108, 122)
COLOR_DARK_SLATE = (42, 46, 56)
COLOR_CHARCOAL = (20, 22, 28)
COLOR_DEEP_VOID = (10, 11, 14)
COLOR_VOID = (6, 7, 9)

COLOR_ICY_BLUE = (122, 231, 255)       # Subtle cool highlight accent
COLOR_STEEL_BLUE = (94, 180, 215)
COLOR_SUBTLE_LAVENDER = (185, 188, 220)

def draw_letterspaced(draw, pos, text, font, fill, spacing=0, align="left"):
    x, y = pos
    char_widths = []
    for ch in text:
        bbox = draw.textbbox((0, 0), ch, font=font)
        char_widths.append(bbox[2] - bbox[0])
    total_w = sum(char_widths) + spacing * (len(text) - 1) if text else 0
    if align == "center":
        cur_x = x - total_w / 2
    elif align == "right":
        cur_x = x - total_w
    else:
        cur_x = x
    for ch, cw in zip(text, char_widths):
        draw.text((cur_x, y), ch, font=font, fill=fill)
        cur_x += cw + spacing
    return total_w

def draw_technical_frame(draw, width=1080, height=1350, margin=54, color=COLOR_DARK_SLATE, corner_len=24, crop_ticks=True):
    left, top = margin, margin
    right, bottom = width - margin, height - margin
    # Corners
    draw.line([(left, top), (left + corner_len, top)], fill=color, width=1)
    draw.line([(left, top), (left, top + corner_len)], fill=color, width=1)
    draw.line([(right, top), (right - corner_len, top)], fill=color, width=1)
    draw.line([(right, top), (right, top + corner_len)], fill=color, width=1)
    draw.line([(left, bottom), (left + corner_len, bottom)], fill=color, width=1)
    draw.line([(left, bottom), (left, bottom - corner_len)], fill=color, width=1)
    draw.line([(right, bottom), (right - corner_len, bottom)], fill=color, width=1)
    draw.line([(right, bottom), (right, bottom - corner_len)], fill=color, width=1)
    # 1:1 safe crop tick marks at Y=135 and Y=1215
    if crop_ticks and height == 1350:
        draw.line([(left - 12, 135), (left + 6, 135)], fill=(65, 72, 84), width=1)
        draw.line([(right - 6, 135), (right + 12, 135)], fill=(65, 72, 84), width=1)
        draw.line([(left - 12, 1215), (left + 6, 1215)], fill=(65, 72, 84), width=1)
        draw.line([(right - 6, 1215), (right + 12, 1215)], fill=(65, 72, 84), width=1)

def draw_header_meta(draw, post_num, archetype_label, right_tag="RUPTURE // EDITION 01", width=1080):
    font_mono = get_font(18, "mono")
    font_bold = get_font(20, "bold")
    draw.text((64, 68), "RUPTURE", font=font_bold, fill=COLOR_WHITE)
    draw.text((195, 70), f"// {post_num} · {archetype_label}", font=font_mono, fill=COLOR_SLATE)
    draw_letterspaced(draw, (width - 64, 70), right_tag, font_mono, COLOR_SILVER, spacing=1, align="right")
    draw.line([(64, 108), (width - 64, 108)], fill=(32, 36, 45), width=1)

def draw_footer_meta(draw, left_tag="CHAPTER I: CHROME & FOLDED SURFACES", right_tag="LINK IN BIO // RUPTURE.MU", width=1080, y_line=1242, y_text=1262):
    font_mono = get_font(16, "mono")
    draw.line([(64, y_line), (width - 64, y_line)], fill=(32, 36, 45), width=1)
    draw.text((64, y_text), left_tag, font=font_mono, fill=COLOR_SLATE)
    draw_letterspaced(draw, (width - 64, y_text), right_tag, font_mono, COLOR_SLATE, spacing=1, align="right")

def load_master_artwork(filename, target_size=(1080, 1350), scale=1.0, offset=(0, 0), align="center"):
    path = os.path.join(MASTERS_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing master artwork: {path}")
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    tw, th = target_size
    scale_factor = max(tw / w, th / h) * scale
    nw, nh = int(w * scale_factor), int(h * scale_factor)
    img_resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    
    if align == "center":
        left = (nw - tw) // 2 + offset[0]
        top = (nh - th) // 2 + offset[1]
    elif align == "top":
        left = (nw - tw) // 2 + offset[0]
        top = offset[1]
    elif align == "bottom":
        left = (nw - tw) // 2 + offset[0]
        top = (nh - th) + offset[1]
    else:
        left, top = offset
        
    left = max(0, min(left, nw - tw))
    top = max(0, min(top, nh - th))
    return img_resized.crop((left, top, left + tw, top + th))

def load_master_fragment(filename, crop_box_norm, target_size=None, fade_edges=None):
    """
    Extracts a normalized region [x0, y0, x1, y1] (0.0 to 1.0) from master artwork.
    Applies optional soft alpha feathering on specified edges ('left', 'right', 'top', 'bottom').
    """
    path = os.path.join(MASTERS_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing master artwork: {path}")
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    x0 = int(crop_box_norm[0] * w)
    y0 = int(crop_box_norm[1] * h)
    x1 = int(crop_box_norm[2] * w)
    y1 = int(crop_box_norm[3] * h)
    cropped = img.crop((x0, y0, x1, y1))
    
    if target_size:
        cropped = cropped.resize(target_size, Image.Resampling.LANCZOS)
        
    if fade_edges:
        cw, ch = cropped.size
        mask = Image.new("L", (cw, ch), 255)
        mdraw = ImageDraw.Draw(mask)
        fade_len = int(min(cw, ch) * 0.25)
        for edge in fade_edges:
            if edge == "bottom":
                for i in range(fade_len):
                    alpha = int(255 * (1.0 - i / fade_len))
                    mdraw.line([(0, ch - fade_len + i), (cw, ch - fade_len + i)], fill=255 - alpha)
            elif edge == "top":
                for i in range(fade_len):
                    alpha = int(255 * (i / fade_len))
                    mdraw.line([(0, i), (cw, i)], fill=alpha)
            elif edge == "right":
                for i in range(fade_len):
                    alpha = int(255 * (1.0 - i / fade_len))
                    mdraw.line([(cw - fade_len + i, 0), (cw - fade_len + i, ch)], fill=255 - alpha)
            elif edge == "left":
                for i in range(fade_len):
                    alpha = int(255 * (i / fade_len))
                    mdraw.line([(i, 0), (i, ch)], fill=alpha)
        cropped.putalpha(ImageOps.invert(ImageOps.invert(mask)))
    return cropped

def apply_gradient_overlay(base_img, direction="bottom", height_px=550, max_alpha=220, color=(6, 7, 9)):
    w, h = base_img.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    r, g, b = color
    for i in range(height_px):
        progress = i / float(height_px)
        if direction == "bottom":
            alpha = int(progress * max_alpha)
            y = h - height_px + i
            draw.line([(0, y), (w, y)], fill=(r, g, b, alpha))
        elif direction == "top":
            alpha = int((1.0 - progress) * max_alpha)
            y = i
            draw.line([(0, y), (w, y)], fill=(r, g, b, alpha))
    return Image.alpha_composite(base_img.convert("RGBA"), overlay)

def draw_cinematic_dj_stage(draw, base_img, box, artist_title, slot_info, track_meta, seed=42):
    """
    Renders a photo-cinematic desaturated monochrome DJ / live modular performance stage
    occupying the central container, complete with subtle atmospheric smoke, hardware deck,
    live audio visualizer, playhead scrub bar, and timecode HUD.
    """
    bx0, by0, bx1, by1 = box
    bw = bx1 - bx0
    bh = by1 - by0
    
    # Render dark atmospheric stage background
    stage = Image.new("RGBA", (bw, bh), (12, 14, 18, 255))
    sdraw = ImageDraw.Draw(stage)
    
    # Ambient overhead conical spotlight & smoke haze
    spot_center_x = int(bw * 0.52)
    for r in range(int(bh * 0.7), 0, -8):
        alpha = int(28 * (1.0 - r / (bh * 0.7)))
        sdraw.ellipse([(spot_center_x - r, -r // 2), (spot_center_x + r, r * 1.2)], fill=(130, 140, 160, alpha))
        
    # Volumetric haze rays
    for angle in [-24, -12, 6, 18, 30]:
        rad = math.radians(angle)
        x_end = spot_center_x + int(math.tan(rad) * bh)
        sdraw.line([(spot_center_x, 0), (x_end, bh)], fill=(160, 175, 200, 14), width=32)
        
    # DJ & Hardware Performance Silhouette (desaturated monochrome photo-treatment)
    dj_cx = int(bw * 0.5)
    dj_base_y = int(bh * 0.82)
    
    # Performance table / modular synth case
    tbl_y = dj_base_y - 70
    sdraw.rectangle([(int(bw * 0.15), tbl_y), (int(bw * 0.85), tbl_y + 90)], fill=(18, 20, 26, 240))
    sdraw.line([(int(bw * 0.15), tbl_y), (int(bw * 0.85), tbl_y)], fill=(70, 78, 92), width=2)
    
    # Modular Eurorack knobs, patch cables, and LED indicators (pale cyan / white)
    rnd = random.Random(seed)
    for k in range(28):
        kx = int(bw * 0.18) + k * 18
        ky = tbl_y + 16 + (k % 3) * 18
        sdraw.ellipse([(kx, ky), (kx + 6, ky + 6)], fill=(120, 130, 145))
        if k % 4 == 0:
            # Illuminated LED
            sdraw.ellipse([(kx + 1, ky + 1), (kx + 4, ky + 4)], fill=COLOR_ICY_BLUE)
            
    # Arched patch cables
    for _ in range(7):
        p1 = (rnd.randint(int(bw * 0.2), int(bw * 0.45)), tbl_y + rnd.randint(10, 45))
        p2 = (rnd.randint(int(bw * 0.45), int(bw * 0.8)), tbl_y + rnd.randint(10, 45))
        ctrl = ((p1[0] + p2[0]) // 2, tbl_y + rnd.randint(60, 110))
        # Draw cable curve
        pts = [p1, ctrl, p2]
        sdraw.line([p1, ctrl], fill=(55, 62, 75, 180), width=2)
        sdraw.line([ctrl, p2], fill=(55, 62, 75, 180), width=2)
        
    # DJ Performer Silhouette (torso, arms manipulating controls, head tilted over mixer)
    sdraw.ellipse([(dj_cx - 48, tbl_y - 180), (dj_cx + 48, tbl_y - 84)], fill=(16, 18, 22))  # Head
    # Headphones band
    sdraw.arc([(dj_cx - 52, tbl_y - 170), (dj_cx + 52, tbl_y - 110)], start=160, end=380, fill=(180, 190, 205), width=4)
    sdraw.ellipse([(dj_cx + 38, tbl_y - 145), (dj_cx + 54, tbl_y - 120)], fill=(90, 100, 115))
    
    # Shoulders and arms
    shoulder_poly = [
        (dj_cx - 130, tbl_y),
        (dj_cx - 90, tbl_y - 100),
        (dj_cx - 40, tbl_y - 80),
        (dj_cx + 40, tbl_y - 80),
        (dj_cx + 90, tbl_y - 100),
        (dj_cx + 130, tbl_y),
    ]
    sdraw.polygon(shoulder_poly, fill=(14, 16, 20))
    # Active arms reaching forward
    sdraw.line([(dj_cx - 80, tbl_y - 70), (dj_cx - 40, tbl_y + 10)], fill=(22, 25, 32), width=22)
    sdraw.line([(dj_cx + 80, tbl_y - 70), (dj_cx + 50, tbl_y + 10)], fill=(22, 25, 32), width=22)
    
    # ---------------- VIDEO INTERFACE HUD ----------------
    font_mono_sm = get_font(13, "mono")
    font_mono_xs = get_font(11, "mono")
    
    # Top HUD Bar
    hud_y = 16
    sdraw.line([(20, hud_y + 24), (bw - 20, hud_y + 24)], fill=(38, 44, 55, 180), width=1)
    # Blinking Recording Dot
    sdraw.ellipse([(24, hud_y + 6), (34, hud_y + 16)], fill=COLOR_WHITE)
    sdraw.text((42, hud_y + 4), "● LIVE STREAM // 4K 60FPS", font=font_mono_sm, fill=COLOR_WHITE)
    sdraw.text((bw - 190, hud_y + 4), "PCM STEREO 24-BIT", font=font_mono_sm, fill=COLOR_MUTED_SILVER)
    
    # Center Playback Overlay Icon (subtle watermark)
    pcx, pcy = bw // 2, bh // 2 - 20
    sdraw.ellipse([(pcx - 36, pcy - 36), (pcx + 36, pcy + 36)], outline=(255, 255, 255, 70), width=2)
    sdraw.polygon([(pcx - 12, pcy - 20), (pcx - 12, pcy + 20), (pcx + 22, pcy)], fill=(255, 255, 255, 120))
    
    # Audio Waveform Visualizer (48 animated vertical bars)
    wave_y = bh - 78
    wave_h = 34
    num_bars = 46
    bar_w = 6
    bar_gap = 4
    start_x = (bw - (num_bars * (bar_w + bar_gap))) // 2
    for b in range(num_bars):
        # Generate algorithmic techno beat wave envelope
        factor = math.sin(b * 0.35 + seed) * math.cos(b * 0.18)
        bar_height = int(max(4, abs(factor) * wave_h + (rnd.randint(2, 10) if b % 4 == 0 else 2)))
        bx = start_x + b * (bar_w + bar_gap)
        by = wave_y - bar_height
        bar_fill = COLOR_ICY_BLUE if (b >= 16 and b <= 28) else COLOR_SILVER
        sdraw.rectangle([(bx, by), (bx + bar_w, wave_y)], fill=bar_fill)
        
    # Bottom Video Scrub Bar & Timecode
    scrub_y = bh - 32
    sdraw.line([(24, scrub_y), (bw - 24, scrub_y)], fill=(45, 52, 65), width=2)
    # Active scrub progress (42% played)
    prog_x = int(24 + (bw - 48) * 0.42)
    sdraw.line([(24, scrub_y), (prog_x, scrub_y)], fill=COLOR_ICY_BLUE, width=3)
    sdraw.ellipse([(prog_x - 5, scrub_y - 5), (prog_x + 5, scrub_y + 5)], fill=COLOR_WHITE)
    
    sdraw.text((24, scrub_y + 8), "01:42 / 04:00", font=font_mono_xs, fill=COLOR_SILVER)
    draw_letterspaced(sdraw, (bw - 24, scrub_y + 8), track_meta, font_mono_xs, COLOR_MUTED_SILVER, spacing=1, align="right")
    
    # Inner border outline
    sdraw.rectangle([(0, 0), (bw - 1, bh - 1)], outline=(50, 58, 72), width=1)
    
    # Composite stage onto base image
    base_img.paste(stage, (bx0, by0))

def save_and_export_post(img_4_5, post_id, file_stem, make_reel=False, reel_img=None):
    # Save 4:5 PNG and JPG
    png_path = os.path.join(OUTPUT_POSTS, f"{file_stem}.png")
    jpg_path = os.path.join(OUTPUT_POSTS, f"{file_stem}.jpg")
    img_4_5.save(png_path, "PNG")
    img_4_5.save(jpg_path, "JPEG", quality=96, subsampling=0)
    
    # Save 1:1 Profile Crop (centered Y=135..1215)
    sq_crop = img_4_5.crop((0, 135, 1080, 1215))
    sq_path = os.path.join(OUTPUT_POSTS, f"{file_stem}_sq.jpg")
    sq_crop.save(sq_path, "JPEG", quality=96, subsampling=0)
    
    # Sync to public directory
    public_png = os.path.join(PUBLIC_POSTS, f"{file_stem}.png")
    public_jpg = os.path.join(PUBLIC_POSTS, f"{file_stem}.jpg")
    public_sq = os.path.join(PUBLIC_POSTS, f"{file_stem}_sq.jpg")
    img_4_5.save(public_png, "PNG")
    img_4_5.save(public_jpg, "JPEG", quality=96, subsampling=0)
    sq_crop.save(public_sq, "JPEG", quality=96, subsampling=0)
    
    if make_reel and reel_img:
        reel_png = os.path.join(OUTPUT_POSTS, f"{file_stem}_reel.png")
        reel_jpg = os.path.join(OUTPUT_POSTS, f"{file_stem}_reel.jpg")
        pub_reel_png = os.path.join(PUBLIC_POSTS, f"{file_stem}_reel.png")
        pub_reel_jpg = os.path.join(PUBLIC_POSTS, f"{file_stem}_reel.jpg")
        reel_img.save(reel_png, "PNG")
        reel_img.save(reel_jpg, "JPEG", quality=96, subsampling=0)
        reel_img.save(pub_reel_png, "PNG")
        reel_img.save(pub_reel_jpg, "JPEG", quality=96, subsampling=0)
    print(f"✓ Generated Post {post_id}: {file_stem}")

# ==============================================================================
# POST DEFINITIONS (15 DISTINCT CREATIVE ARCHETYPES)
# ==============================================================================

def gen_post_01():
    """
    POST 01 — THE FIRST SIGNAL
    Archetype: A. Full Artwork Composition
    Family: Sculptural Liquid Chrome (RUPTURE_M15)
    A mysterious opening visual: monumental liquid mercury glyph with fluid tension necks.
    Minimal typography anchored in the lower safe area.
    """
    base = load_master_artwork("RUPTURE_M15_v1.jpg", (1080, 1350), scale=1.06, offset=(0, -70))
    base = apply_gradient_overlay(base, direction="bottom", height_px=480, max_alpha=220)
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 01", "FULL ARTWORK", "SIGNAL 001 // FREQ 142.0 MHz")
    draw_footer_meta(draw, "SCULPTURAL LIQUID CHROME // ARCHETYPE A", "INITIAL TRANSMISSION")
    
    font_mono = get_font(18, "mono")
    font_bold = get_font(64, "condensed_bold")
    font_sub = get_font(22, "regular")
    
    cy = 870
    draw_letterspaced(draw, (540, cy), "ANOMALY IN THE SOUNDSCAPE", font_mono, COLOR_ICY_BLUE, spacing=4, align="center")
    draw.line([(420, cy + 30), (660, cy + 30)], fill=COLOR_ICY_BLUE, width=1)
    draw_letterspaced(draw, (540, cy + 46), "SOMETHING IS SHIFTING.", font_bold, COLOR_WHITE, spacing=1, align="center")
    draw_letterspaced(draw, (540, cy + 128), "NOT EVERYTHING NEEDS TO FOLLOW THE PATTERN.", font_sub, COLOR_SILVER, spacing=2, align="center")
    draw_letterspaced(draw, (540, cy + 168), "A NEW FREQUENCY IS ENTERING THE UNDERGROUND.", font_mono, COLOR_SLATE, spacing=2, align="center")
    
    save_and_export_post(img, "01", "RUPTURE_IG_POST_01")

def gen_post_02():
    """
    POST 02 — THE MANIFESTO
    Archetype: D. Typography-Led Composition
    Family: Folded Liquid Surfaces (RUPTURE_M38 - razor-thin 110px metallic header/footer accent rule)
    Swiss/German editorial grid on deep graphite void. No full-bleed art.
    """
    img = Image.new("RGB", (1080, 1350), COLOR_DEEP_VOID)
    
    # Thin metallic folded razor-sheared accent strips (only 110px high)
    top_frag = load_master_fragment("RUPTURE_M38_v1.jpg", (0.0, 0.4, 1.0, 0.6), target_size=(1080, 110), fade_edges=["bottom"])
    bot_frag = load_master_fragment("RUPTURE_M38_v1.jpg", (0.0, 0.2, 1.0, 0.4), target_size=(1080, 110), fade_edges=["top"])
    img.paste(top_frag, (0, 112), top_frag)
    img.paste(bot_frag, (0, 1130), bot_frag)
    
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 02", "TYPOGRAPHY-LED", "FOUNDATIONAL CODE")
    draw_footer_meta(draw, "EDITORIAL MANIFESTO // GRAPHITE VOID", "RUPTURE COLLECTIVE // 2026")
    
    font_hero = get_font(72, "condensed_black")
    font_mono_head = get_font(18, "mono")
    font_mono_bold = get_font(20, "mono")
    font_body = get_font(21, "regular")
    font_num = get_font(34, "bold")
    
    # Header statement
    draw_letterspaced(draw, (84, 250), "WE DO NOT REPEAT.", font_hero, COLOR_WHITE, spacing=1)
    draw_letterspaced(draw, (84, 326), "WE DO NOT CONFORM.", font_hero, COLOR_SILVER, spacing=1)
    draw.line([(84, 420), (996, 420)], fill=(45, 52, 65), width=1)
    
    # 4 Manifesto Points in precision editorial columns
    points = [
        ("01", "BREAKING AWAY FROM THE PREDICTABLE", "Rejecting commercial club formulas, VIP tables, and pre-packaged drops."),
        ("02", "ACOUSTIC RIGIDITY & HYPNOTIC CONTINUITY", "Curating fast, dark, rolling rhythms with absolute sound system integrity."),
        ("03", "AN INCLUSIVE, LIBERATED DANCEFLOOR", "Built on bodily autonomy, radical safety, mutual respect, and complete freedom."),
        ("04", "ZERO COMPROMISE. NO NOSTALGIA.", "Forward-leaning electronic sound. Leave your ego outside the door.")
    ]
    
    start_y = 450
    for idx, (num, title, body) in enumerate(points):
        py = start_y + idx * 160
        # Number badge
        draw.text((84, py), f"[{num}]", font=font_num, fill=COLOR_ICY_BLUE)
        # Title
        draw.text((160, py + 4), title, font=font_mono_bold, fill=COLOR_WHITE)
        # Body
        draw.text((160, py + 36), body, font=font_body, fill=COLOR_MUTED_SILVER)
        if idx < 3:
            draw.line([(160, py + 120), (996, py + 120)], fill=(28, 32, 40), width=1)
            
    save_and_export_post(img, "02", "RUPTURE_IG_POST_02")

def gen_post_03():
    """
    POST 03 — THE IDENTITY
    Archetype: B. Artwork Fragments & Framing (Asymmetrical)
    Family: Sculptural Liquid Chrome (RUPTURE_M58 - Cantilevered Aerodynamic Fluid Dagger)
    Chrome blade cuts in from top-right corner; colossal RUPTURE anchors bottom-left.
    """
    img = Image.new("RGB", (1080, 1350), COLOR_VOID)
    
    # Asymmetric chrome dagger entering from top-right corner (approx 550x580)
    dagger = load_master_fragment("RUPTURE_M58_v1.jpg", (0.2, 0.0, 1.0, 0.8), target_size=(620, 640), fade_edges=["left", "bottom"])
    img.paste(dagger, (460, 110), dagger)
    
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 03", "ARTWORK FRAMING", "IDENTITY LOCK // BRAND DNA")
    draw_footer_meta(draw, "ASYMMETRICAL SCULPTURAL FRAGMENT", "FOUNDED IN MAURITIUS")
    
    font_massive = get_font(132, "condensed_black")
    font_mono = get_font(20, "mono")
    font_sub = get_font(26, "light")
    font_meta = get_font(16, "mono")
    
    # Left column content
    lx = 84
    draw.text((lx, 260), "SOUND · ARCHITECTURE · FORM", font=font_mono, fill=COLOR_ICY_BLUE)
    draw.line([(lx, 296), (lx + 280, 296)], fill=COLOR_ICY_BLUE, width=1)
    
    # Description block
    desc_lines = [
        "A platform for forward-thinking",
        "underground electronic music.",
        "Operating at the intersection of",
        "industrial architecture and",
        "hypnotic acoustic pressure."
    ]
    for i, line in enumerate(desc_lines):
        draw.text((lx, 330 + i * 36), line, font=font_sub, fill=COLOR_SILVER)
        
    # Technical specs matrix box in middle-left
    draw.rectangle([(lx, 560), (lx + 380, 720)], outline=(40, 48, 60), width=1)
    draw.text((lx + 20, 580), "COLLECTIVE SPECIFICATION:", font=font_mono, fill=COLOR_WHITE)
    specs = [
        "BPM RANGE: 138 — 146",
        "LOW FREQ: 25 HZ TUNED",
        "POLICY: NO VIP / NO CAMERAS",
        "LOCATION: DECOMMISSIONED SILOS"
    ]
    for j, s in enumerate(specs):
        draw.text((lx + 20, 614 + j * 24), s, font=font_meta, fill=COLOR_MUTED_SILVER)
        
    # Colossal RUPTURE logotype anchoring bottom
    draw_letterspaced(draw, (lx, 940), "RUPTURE", font_massive, COLOR_WHITE, spacing=2)
    draw_letterspaced(draw, (lx, 1070), "UNDERGROUND ELECTRONIC COLLECTIVE", font_mono, COLOR_SILVER, spacing=4)
    draw_letterspaced(draw, (lx, 1104), "MAURITIUS · CHAPTER I · MMXXVI", font_meta, COLOR_SLATE, spacing=2)
    
    save_and_export_post(img, "03", "RUPTURE_IG_POST_03")

def gen_post_04():
    """
    POST 04 — SAVE THE DATE
    Archetype: B/F. Artwork Fragments & Framing (Top & Bottom Planar Plates)
    Family: Folded Liquid Surfaces (RUPTURE_M23 - Horizontal Razor-Sheared Chrome Planes)
    Two horizontal plates top & bottom; colossal date lock suspended in open center void.
    """
    img = Image.new("RGB", (1080, 1350), COLOR_VOID)
    
    # Top and bottom liquid metal planar plates
    top_plate = load_master_fragment("RUPTURE_M23_v1.jpg", (0.0, 0.0, 1.0, 0.35), target_size=(1080, 240), fade_edges=["bottom"])
    bot_plate = load_master_fragment("RUPTURE_M23_v1.jpg", (0.0, 0.65, 1.0, 1.0), target_size=(1080, 250), fade_edges=["top"])
    img.paste(top_plate, (0, 110), top_plate)
    img.paste(bot_plate, (0, 1000), bot_plate)
    
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 04", "ARTWORK FRAMING", "EVENT ANNOUNCEMENT")
    draw_footer_meta(draw, "HORIZONTAL PLANAR CHROME SHELVES", "MARK YOUR CALENDAR")
    
    font_giant = get_font(116, "condensed_bold")
    font_mono = get_font(22, "mono")
    font_mono_lg = get_font(28, "mono")
    font_sub = get_font(26, "bold")
    
    # Central Date Lock Box
    draw_letterspaced(draw, (540, 410), "SAVE THE DATE", font_mono, COLOR_ICY_BLUE, spacing=6, align="center")
    draw.line([(380, 444), (700, 444)], fill=COLOR_ICY_BLUE, width=1)
    
    draw_letterspaced(draw, (540, 480), "28 · 11 · 2026", font_giant, COLOR_WHITE, spacing=4, align="center")
    draw_letterspaced(draw, (540, 610), "SATURDAY // 22:00 — 06:00", font_mono_lg, COLOR_SILVER, spacing=3, align="center")
    
    # Event title bar
    draw.rectangle([(160, 690), (920, 780)], outline=(55, 64, 80), width=1)
    draw_letterspaced(draw, (540, 715), "RUPTURE 01 // HYDRAULIC VOID", font_sub, COLOR_WHITE, spacing=2, align="center")
    draw_letterspaced(draw, (540, 748), "BLACK RIVER DISTRICT · MAURITIUS", font_mono, COLOR_MUTED_SILVER, spacing=2, align="center")
    
    # Key notes
    draw_letterspaced(draw, (540, 830), "VENUE REVEAL DISPATCHED TO TICKET HOLDERS ONLY", font_mono, COLOR_SLATE, spacing=2, align="center")
    draw_letterspaced(draw, (540, 866), "TICKET PROTOCOL OPENS NEXT WEEK", font_mono, COLOR_SLATE, spacing=2, align="center")
    
    save_and_export_post(img, "04", "RUPTURE_IG_POST_04")

def gen_post_05():
    """
    POST 05 — THE MAIN EVENT POSTER
    Archetype: A. Full Artwork Composition
    Family: Sculptural Liquid Chrome (RUPTURE_M52) + Folded Strata base (RUPTURE_M21)
    Monumental hero promotional poster with complete verified lineup, date, venue, ticketing.
    Strictly silver/chrome/black with pale cyan coordinate stamp.
    """
    base = load_master_artwork("RUPTURE_M52_v1.jpg", (1080, 1350), scale=1.05, offset=(0, -90))
    base = apply_gradient_overlay(base, direction="bottom", height_px=520, max_alpha=230)
    base = apply_gradient_overlay(base, direction="top", height_px=220, max_alpha=160)
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 05", "HERO POSTER", "RUPTURE 01 // OFFICIAL POSTER")
    draw_footer_meta(draw, "SCULPTURAL LIQUID CHROME // MAIN CAMPAIGN ASSET", "TICKETS: RUPTURE.MU")
    
    font_super = get_font(84, "condensed_black")
    font_bold = get_font(32, "bold")
    font_mono_bold = get_font(22, "mono")
    font_mono = get_font(18, "mono")
    font_body = get_font(20, "regular")
    
    # Upper Branding Title
    draw_letterspaced(draw, (540, 160), "RUPTURE COLLECTIVE PRESENTS", font_mono, COLOR_ICY_BLUE, spacing=4, align="center")
    draw_letterspaced(draw, (540, 200), "HYDRAULIC VOID", font_super, COLOR_WHITE, spacing=2, align="center")
    draw_letterspaced(draw, (540, 290), "EDITION 01 · 8 HOURS OF UNCOMPROMISING TECHNO", font_mono, COLOR_SILVER, spacing=2, align="center")
    
    # Lower Lineup Box (solid dark panel with hairline border)
    by = 770
    draw.rectangle([(84, by), (996, 1200)], fill=(12, 14, 18, 230), outline=(48, 56, 70), width=1)
    
    # Date & Venue Row
    draw_letterspaced(draw, (540, by + 24), "SATURDAY · 28 NOVEMBER 2026 · 22:00 — 06:00", font_mono_bold, COLOR_WHITE, spacing=2, align="center")
    draw_letterspaced(draw, (540, by + 56), "[THE INDUSTRIAL SILO] · BLACK RIVER DISTRICT · MAURITIUS", font_mono, COLOR_ICY_BLUE, spacing=2, align="center")
    draw.line([(120, by + 92), (960, by + 92)], fill=(40, 48, 60), width=1)
    
    # Structured Lineup
    draw.text((120, by + 110), "HEADLINER [LIVE MODULAR HARDWARE]:", font=font_mono, fill=COLOR_MUTED_SILVER)
    draw.text((120, by + 134), "[ARTIST 01: MODULAR LIVE ACT]", font=font_bold, fill=COLOR_WHITE)
    
    draw.text((120, by + 185), "SPECIAL GUEST [HYPNOTIC TECHNO]:", font=font_mono, fill=COLOR_MUTED_SILVER)
    draw.text((120, by + 209), "[ARTIST 02: HYPNOTIC SELECTOR]", font=font_bold, fill=COLOR_WHITE)
    
    draw.text((120, by + 260), "COLLECTIVE RESIDENTS:", font=font_mono, fill=COLOR_MUTED_SILVER)
    draw.text((120, by + 284), "[ARTIST 03: INDUSTRIAL ACT]   ·   [ARTIST 04: AMBIENT INTRO]", font=font_body, fill=COLOR_SILVER)
    
    draw.line([(120, by + 330), (960, by + 330)], fill=(40, 48, 60), width=1)
    draw.text((120, by + 346), "STRICTLY LIMITED CAPACITY: 350 TICKETS · CUSTOM HORN SYSTEM · SAFER SPACE", font=font_mono, fill=COLOR_SLATE)
    draw_letterspaced(draw, (960, by + 346), "TICKETS: RUPTURE.MU", font_mono_bold, COLOR_ICY_BLUE, spacing=1, align="right")
    
    save_and_export_post(img, "05", "RUPTURE_IG_POST_05")

def gen_post_06():
    """
    POST 06 — THE LINEUP REVEAL
    Archetype: D. Typography-Led Composition
    Family: Folded Liquid Surfaces (RUPTURE_M09 - narrow vertical 12% chrome accent strip along left)
    Strict Swiss typographic schedule. No full-bleed background.
    """
    img = Image.new("RGB", (1080, 1350), COLOR_DEEP_VOID)
    
    # Vertical metallic sheared accent strip along left margin
    strip = load_master_fragment("RUPTURE_M09_v1.jpg", (0.2, 0.0, 0.45, 1.0), target_size=(130, 1130), fade_edges=["right"])
    img.paste(strip, (64, 110), strip)
    
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 06", "TYPOGRAPHY-LED", "OFFICIAL ARTIST ROSTER")
    draw_footer_meta(draw, "EDITORIAL SCHEDULE // 8 HOURS", "TIME SLOTS SUBJECT TO ACOUSTIC LOCK")
    
    font_hero = get_font(60, "condensed_black")
    font_mono = get_font(18, "mono")
    font_bold = get_font(28, "bold")
    font_body = get_font(20, "regular")
    
    tx = 240
    draw_letterspaced(draw, (tx, 160), "OFFICIAL LINEUP", font_hero, COLOR_WHITE, spacing=2)
    draw.text((tx, 230), "EDITION 01 // HYDRAULIC VOID // 28.11.2026", font=font_mono, fill=COLOR_ICY_BLUE)
    draw.line([(tx, 270), (996, 270)], fill=(45, 52, 65), width=1)
    
    slots = [
        ("22:00 — 23:30", "OPENING ATMOSPHERICS", "[ARTIST 04: AMBIENT / INTRO]", "Sub-bass pulse, textural drone, spatial room tuning"),
        ("23:30 — 01:00", "RESIDENT SELECTION", "[ARTIST 03: RESIDENT / INDUSTRIAL]", "Fast, mechanical, driving warehouse techno (140 BPM)"),
        ("01:00 — 02:30", "HEADLINER // HARDWARE LIVE", "[ARTIST 01: MODULAR LIVE ACT]", "Raw analog synthesis, Eurorack modular, zero laptops"),
        ("02:30 — 04:30", "SPECIAL GUEST // HYPNOTIC SET", "[ARTIST 02: HYPNOTIC SELECTOR]", "Deep hypnotic groove, driving polyrhythms, vinyl selector"),
        ("04:30 — 06:00", "CLOSING PROTOCOL", "[RESIDENT B2B SPECIAL GUEST]", "Relentless physical momentum into sunrise")
    ]
    
    start_y = 300
    for i, (time, category, artist, desc) in enumerate(slots):
        sy = start_y + i * 170
        is_headline = (i == 2)
        # Time badge
        draw.text((tx, sy), time, font=font_mono, fill=COLOR_ICY_BLUE if is_headline else COLOR_MUTED_SILVER)
        draw.text((tx + 180, sy), f"// {category}", font=font_mono, fill=COLOR_SLATE)
        # Artist Name
        draw.text((tx, sy + 30), artist, font=font_bold, fill=COLOR_WHITE if is_headline else COLOR_SILVER)
        # Description
        draw.text((tx, sy + 68), desc, font=font_body, fill=COLOR_SLATE)
        if i < 4:
            draw.line([(tx, sy + 130), (996, sy + 130)], fill=(28, 32, 40), width=1)
            
    save_and_export_post(img, "06", "RUPTURE_IG_POST_06")

def gen_post_07():
    """
    POST 07 — DJ SPOTLIGHT 01: [ARTIST 01: MODULAR LIVE ACT]
    Archetype: C. Cinematic DJ Video / Framing
    Family: Folded Liquid Surfaces (RUPTURE_M37 - Orthogonal Planar Fins in opposite corners)
    Cinematic DJ video stage occupying 78% of the frame with live modular Eurorack performance,
    audio visualizer, scrub bar, and timecode HUD.
    """
    img = Image.new("RGB", (1080, 1350), COLOR_VOID)
    
    # Opposite corner chrome frames
    corner_tl = load_master_fragment("RUPTURE_M37_v1.jpg", (0.0, 0.0, 0.45, 0.4), target_size=(320, 240), fade_edges=["right", "bottom"])
    corner_br = load_master_fragment("RUPTURE_M37_v1.jpg", (0.55, 0.6, 1.0, 1.0), target_size=(340, 260), fade_edges=["left", "top"])
    img.paste(corner_tl, (64, 110), corner_tl)
    img.paste(corner_br, (676, 980), corner_br)
    
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 07", "CINEMATIC DJ VIDEO", "ARTIST SPOTLIGHT 01")
    draw_footer_meta(draw, "LIVE HARDWARE MODULAR PERFORMANCE", "LISTEN TO PREVIEW MIX // RUPTURE.MU/SOUND")
    
    # Center Video Stage Box (Y=180 to Y=1060 -> 880px high, width 952px)
    stage_box = (64, 180, 1016, 1060)
    draw_cinematic_dj_stage(
        draw, img, stage_box,
        artist_title="[ARTIST 01: MODULAR LIVE ACT]",
        slot_info="01:00 — 02:30",
        track_meta="UNRELEASED LIVE PATCH [142 BPM]",
        seed=101
    )
    
    # Lower Artist Identity Block (beneath video stage)
    draw = ImageDraw.Draw(img)  # Refresh draw after pasting
    font_bold = get_font(34, "bold")
    font_mono = get_font(18, "mono")
    font_desc = get_font(20, "regular")
    
    draw.text((64, 1080), "[ARTIST 01: MODULAR LIVE ACT]", font=font_bold, fill=COLOR_WHITE)
    draw_letterspaced(draw, (1016, 1084), "LIVE HARDWARE // 01:00 — 02:30", font_mono, COLOR_ICY_BLUE, spacing=1, align="right")
    draw.text((64, 1124), "Pure analog synthesis. No laptops, no pre-rendered stems. Direct hardware modulation.", font=font_desc, fill=COLOR_MUTED_SILVER)
    draw.text((64, 1154), "Exclusive live rehearsal excerpt recorded for RUPTURE Studio. Sound system calibrated.", font=font_mono, fill=COLOR_SLATE)
    
    # Reel Concept (9:16 vertical 1080x1920)
    reel_img = Image.new("RGB", (1080, 1920), COLOR_VOID)
    reel_draw = ImageDraw.Draw(reel_img)
    draw_technical_frame(reel_draw, 1080, 1920, margin=54, crop_ticks=False)
    draw_header_meta(reel_draw, "POST 07", "REEL / STORY (9:16)", "ARTIST SPOTLIGHT 01")
    draw_footer_meta(reel_draw, "CINEMATIC VIDEO FEED // 1080x1920", "SWIPE UP FOR TICKETS", y_line=1800, y_text=1825)
    # Scaled vertical video stage in center
    r_stage_box = (64, 340, 1016, 1540)
    draw_cinematic_dj_stage(reel_draw, reel_img, r_stage_box, "[ARTIST 01]", "01:00 — 02:30", "142 BPM LIVE", seed=101)
    r_corner = load_master_fragment("RUPTURE_M37_v1.jpg", (0.0, 0.0, 0.5, 0.5), target_size=(360, 320), fade_edges=["right", "bottom"])
    reel_img.paste(r_corner, (64, 200), r_corner)
    reel_draw = ImageDraw.Draw(reel_img)
    reel_draw.text((64, 1570), "[ARTIST 01: MODULAR LIVE ACT]", font=font_bold, fill=COLOR_WHITE)
    reel_draw.text((64, 1616), "HEADLINING RUPTURE 01 // HYDRAULIC VOID", font=font_mono, fill=COLOR_ICY_BLUE)
    reel_draw.text((64, 1650), "28.11.2026 · SILO A · BLACK RIVER · MAURITIUS", font=font_mono, fill=COLOR_SLATE)
    
    save_and_export_post(img, "07", "RUPTURE_IG_POST_07", make_reel=True, reel_img=reel_img)

def gen_post_08():
    """
    POST 08 — DJ SPOTLIGHT 02: [ARTIST 02: HYPNOTIC SELECTOR]
    Archetype: C. Cinematic DJ Video / Framing
    Family: Sculptural Liquid Chrome (RUPTURE_M74 - Asymmetrical fluid chrome ribbon along left edge)
    Cinematic DJ video stage with vinyl turntable selector in dark haze.
    """
    img = Image.new("RGB", (1080, 1350), COLOR_VOID)
    
    # Asymmetrical sculptural liquid chrome ribbon framing left edge
    ribbon = load_master_fragment("RUPTURE_M74_v1.jpg", (0.0, 0.1, 0.5, 0.9), target_size=(240, 880), fade_edges=["right"])
    img.paste(ribbon, (64, 180), ribbon)
    
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 08", "CINEMATIC DJ VIDEO", "ARTIST SPOTLIGHT 02")
    draw_footer_meta(draw, "SPECIAL GUEST // HYPNOTIC SELECTOR", "TICKETS & LINEUP // RUPTURE.MU")
    
    # Video Stage occupying the right 75% of the frame (X=280 to X=1016, Y=180 to Y=1060)
    stage_box = (270, 180, 1016, 1060)
    draw_cinematic_dj_stage(
        draw, img, stage_box,
        artist_title="[ARTIST 02: HYPNOTIC SELECTOR]",
        slot_info="02:30 — 04:30",
        track_meta="HYPNOTIC VINYL CUT // D MINOR [140 BPM]",
        seed=202
    )
    
    # Lower Artist Identity Block
    draw = ImageDraw.Draw(img)
    font_bold = get_font(34, "bold")
    font_mono = get_font(18, "mono")
    font_desc = get_font(20, "regular")
    
    draw.text((64, 1080), "[ARTIST 02: HYPNOTIC SELECTOR]", font=font_bold, fill=COLOR_WHITE)
    draw_letterspaced(draw, (1016, 1084), "HYPNOTIC GROOVE // 02:30 — 04:30", font_mono, COLOR_ICY_BLUE, spacing=1, align="right")
    draw.text((64, 1124), "Master of deep, hypnotic, relentless groove. Vinyl selection pulling the floor into collective trance.", font=font_desc, fill=COLOR_MUTED_SILVER)
    draw.text((64, 1154), "Peak-time 2-hour set tuned directly to the acoustic resonance of the decommissioned silo.", font=font_mono, fill=COLOR_SLATE)
    
    # Reel Concept (9:16 vertical 1080x1920)
    reel_img = Image.new("RGB", (1080, 1920), COLOR_VOID)
    reel_draw = ImageDraw.Draw(reel_img)
    draw_technical_frame(reel_draw, 1080, 1920, margin=54, crop_ticks=False)
    draw_header_meta(reel_draw, "POST 08", "REEL / STORY (9:16)", "ARTIST SPOTLIGHT 02")
    draw_footer_meta(reel_draw, "CINEMATIC VIDEO FEED // 1080x1920", "SWIPE UP FOR TICKETS", y_line=1800, y_text=1825)
    r_stage_box = (64, 340, 1016, 1540)
    draw_cinematic_dj_stage(reel_draw, reel_img, r_stage_box, "[ARTIST 02]", "02:30 — 04:30", "140 BPM VINYL", seed=202)
    r_ribbon = load_master_fragment("RUPTURE_M74_v1.jpg", (0.0, 0.1, 0.5, 0.9), target_size=(220, 600), fade_edges=["right"])
    reel_img.paste(r_ribbon, (64, 360), r_ribbon)
    reel_draw = ImageDraw.Draw(reel_img)
    reel_draw.text((64, 1570), "[ARTIST 02: HYPNOTIC SELECTOR]", font=font_bold, fill=COLOR_WHITE)
    reel_draw.text((64, 1616), "SPECIAL GUEST // RUPTURE 01: HYDRAULIC VOID", font=font_mono, fill=COLOR_ICY_BLUE)
    reel_draw.text((64, 1650), "28.11.2026 · SILO A · 02:30 — 04:30", font=font_mono, fill=COLOR_SLATE)
    
    save_and_export_post(img, "08", "RUPTURE_IG_POST_08", make_reel=True, reel_img=reel_img)

def gen_post_09():
    """
    POST 09 — DJ SPOTLIGHT 03: [ARTIST 03: RESIDENT / INDUSTRIAL]
    Archetype: C. Cinematic DJ Video / Framing
    Family: Sculptural Liquid Chrome (RUPTURE_M17 - High-velocity sweeping chrome blade below stage)
    Cinematic DJ video stage with industrial driving performance.
    """
    img = Image.new("RGB", (1080, 1350), COLOR_VOID)
    
    # Chrome blade cutting through lower boundary
    blade = load_master_fragment("RUPTURE_M17_v1.jpg", (0.1, 0.4, 0.9, 0.95), target_size=(1080, 220), fade_edges=["top"])
    img.paste(blade, (0, 960), blade)
    
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 09", "CINEMATIC DJ VIDEO", "ARTIST SPOTLIGHT 03")
    draw_footer_meta(draw, "RESIDENT SPOTLIGHT // INDUSTRIAL TECHNO", "FULL PREVIEW ON SOUNDCLOUD")
    
    # Video Stage occupying Y=180 to Y=960 (width 952px)
    stage_box = (64, 180, 1016, 960)
    draw_cinematic_dj_stage(
        draw, img, stage_box,
        artist_title="[ARTIST 03: RESIDENT / INDUSTRIAL]",
        slot_info="23:30 — 01:00",
        track_meta="RUPTURE RESIDENT SET // 144 BPM INDUSTRIAL",
        seed=303
    )
    
    draw = ImageDraw.Draw(img)
    font_bold = get_font(34, "bold")
    font_mono = get_font(18, "mono")
    font_desc = get_font(20, "regular")
    
    draw.text((64, 1000), "[ARTIST 03: RESIDENT / INDUSTRIAL]", font=font_bold, fill=COLOR_WHITE)
    draw_letterspaced(draw, (1016, 1004), "RESIDENT PROFILE // 23:30 — 01:00", font_mono, COLOR_ICY_BLUE, spacing=1, align="right")
    draw.text((64, 1044), "Driving, percussive, mechanical underground techno setting the sonic foundation.", font=font_desc, fill=COLOR_MUTED_SILVER)
    draw.text((64, 1074), "Pacing the transition from ambient opening to modular headline live performance.", font=font_mono, fill=COLOR_SLATE)
    
    # Reel Concept (9:16 vertical 1080x1920)
    reel_img = Image.new("RGB", (1080, 1920), COLOR_VOID)
    reel_draw = ImageDraw.Draw(reel_img)
    draw_technical_frame(reel_draw, 1080, 1920, margin=54, crop_ticks=False)
    draw_header_meta(reel_draw, "POST 09", "REEL / STORY (9:16)", "ARTIST SPOTLIGHT 03")
    draw_footer_meta(reel_draw, "CINEMATIC VIDEO FEED // 1080x1920", "SWIPE UP FOR TICKETS", y_line=1800, y_text=1825)
    r_stage_box = (64, 340, 1016, 1540)
    draw_cinematic_dj_stage(reel_draw, reel_img, r_stage_box, "[ARTIST 03]", "23:30 — 01:00", "144 BPM INDUSTRIAL", seed=303)
    r_blade = load_master_fragment("RUPTURE_M17_v1.jpg", (0.1, 0.4, 0.9, 0.95), target_size=(1080, 240), fade_edges=["top"])
    reel_img.paste(r_blade, (0, 1420), r_blade)
    reel_draw = ImageDraw.Draw(reel_img)
    reel_draw.text((64, 1670), "[ARTIST 03: RESIDENT / INDUSTRIAL]", font=font_bold, fill=COLOR_WHITE)
    reel_draw.text((64, 1716), "RESIDENT SPOTLIGHT // RUPTURE 01", font=font_mono, fill=COLOR_ICY_BLUE)
    reel_draw.text((64, 1750), "28.11.2026 · SILO A · 23:30 — 01:00", font=font_mono, fill=COLOR_SLATE)
    
    save_and_export_post(img, "09", "RUPTURE_IG_POST_09", make_reel=True, reel_img=reel_img)

def gen_post_10():
    """
    POST 10 — THE SOUND
    Archetype: E. Cropped Macro Artwork
    Family: Sculptural Liquid Chrome (RUPTURE_M79 - Extreme macro crop of fluid mercury tension cells)
    Acoustic manifesto on low-end engineering and acoustic rigidity.
    """
    # Macro crop 3.2x scaled to highlight metallic cell tension
    macro = load_master_artwork("RUPTURE_M79_v1.jpg", (1080, 1350), scale=2.8, offset=(120, -140))
    macro = apply_gradient_overlay(macro, direction="bottom", height_px=550, max_alpha=230)
    macro = apply_gradient_overlay(macro, direction="top", height_px=240, max_alpha=160)
    img = macro.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 10", "CROPPED MACRO", "ACOUSTIC SPECIFICATION")
    draw_footer_meta(draw, "25 HZ TUNED // POINT-SOURCE HORNS", "SOUND IS NOT ENTERTAINMENT · IT IS ARCHITECTURE")
    
    font_hero = get_font(72, "condensed_black")
    font_mono = get_font(20, "mono")
    font_bold = get_font(26, "bold")
    font_body = get_font(21, "regular")
    
    cy = 760
    draw_letterspaced(draw, (84, cy), "25 HZ ACOUSTIC RIGIDITY.", font_hero, COLOR_WHITE, spacing=1)
    draw_letterspaced(draw, (84, cy + 82), "PHYSICAL BASS YOU FEEL IN YOUR CHEST.", font_mono, COLOR_ICY_BLUE, spacing=2)
    draw.line([(84, cy + 120), (996, cy + 120)], fill=(45, 52, 65), width=1)
    
    specs = [
        ("CUSTOM HORN ARRAYS", "Point-source acoustic displacement designed specifically for reinforced concrete enclosures."),
        ("ZERO COMPRESSION", "Preserving dynamic transients. We do not brickwall limit the signal. Raw visceral headroom."),
        ("FREQUENCY DIAL", "Tuned between 25 Hz sub-frequencies and 144 BPM kinetic momentum for sustained trance state.")
    ]
    for idx, (title, desc) in enumerate(specs):
        py = cy + 140 + idx * 92
        draw.text((84, py), f"// {title}", font=font_bold, fill=COLOR_SILVER)
        draw.text((84, py + 30), desc, font=font_body, fill=COLOR_MUTED_SILVER)
        
    save_and_export_post(img, "10", "RUPTURE_IG_POST_10")

def gen_post_11():
    """
    POST 11 — THE CODE
    Archetype: D. Typography-Led Composition
    Family: Folded Liquid Surfaces (RUPTURE_M80 - Subtle metallic corner brackets)
    Clean Swiss/German editorial layout. 4 dancefloor principles. Zero clutter.
    """
    img = Image.new("RGB", (1080, 1350), COLOR_DEEP_VOID)
    
    # Corner metallic brackets
    tl = load_master_fragment("RUPTURE_M80_v1.jpg", (0.0, 0.0, 0.35, 0.35), target_size=(160, 160), fade_edges=["right", "bottom"])
    br = load_master_fragment("RUPTURE_M80_v1.jpg", (0.65, 0.65, 1.0, 1.0), target_size=(160, 160), fade_edges=["left", "top"])
    img.paste(tl, (64, 110), tl)
    img.paste(br, (856, 1070), br)
    
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 11", "TYPOGRAPHY-LED", "DANCEFLOOR ETHICS")
    draw_footer_meta(draw, "COLLECTIVE CODE // ZERO TOLERANCE", "MUTUAL RESPECT · COMPLETE FREEDOM")
    
    font_hero = get_font(68, "condensed_black")
    font_num = get_font(36, "bold")
    font_rule_title = get_font(24, "mono")
    font_body = get_font(20, "regular")
    
    draw_letterspaced(draw, (84, 210), "THE CODE OF CONDUCT.", font_hero, COLOR_WHITE, spacing=1)
    draw_letterspaced(draw, (84, 286), "A DANCEFLOOR BUILT ON DIGNITY AND FREEDOM.", get_font(20, "mono"), COLOR_ICY_BLUE, spacing=2)
    draw.line([(84, 330), (996, 330)], fill=(45, 52, 65), width=1)
    
    rules = [
        ("01", "NO PHONES. NO CAMERAS ON THE FLOOR.",
         "Keep your phone in your pocket. Live the moment directly. Anyone filming the crowd will be asked to leave immediately."),
        ("02", "ZERO HARASSMENT OR DISCRIMINATION.",
         "Absolute zero tolerance for racism, sexism, homophobia, transphobia, or non-consensual physical contact. Immediate removal."),
        ("03", "BODILY AUTONOMY & RADICAL SAFETY.",
         "Wear what you want or what makes you feel liberated. Look out for the people around you. Our safety team is always present."),
        ("04", "COME FOR THE SOUND. LEAVE YOUR EGO OUTSIDE.",
         "No VIP areas. No backstage elitism. We are all equal on the concrete floor under the same frequency.")
    ]
    
    start_y = 360
    for idx, (num, title, body) in enumerate(rules):
        py = start_y + idx * 190
        draw.text((84, py), num, font=font_num, fill=COLOR_ICY_BLUE)
        draw.text((150, py + 4), title, font=font_rule_title, fill=COLOR_WHITE)
        draw.text((150, py + 40), body, font=font_body, fill=COLOR_MUTED_SILVER)
        if idx < 3:
            draw.line([(150, py + 140), (996, py + 140)], fill=(28, 32, 40), width=1)
            
    save_and_export_post(img, "11", "RUPTURE_IG_POST_11")

def gen_post_12():
    """
    POST 12 — THE VENUE / EXPERIENCE
    Archetype: F. Mixed-Media / Architectural
    Family: Folded Liquid Surfaces (RUPTURE_M34 - Stepped fluid obsidian & chrome terraces)
    Architectural reveal of the industrial concrete silo cathedral, framed by brutalist liquid metal shelves.
    """
    img = Image.new("RGB", (1080, 1350), COLOR_VOID)
    
    # Lower brutalist stepped chrome fluid terraces framing the bottom 450px
    terraces = load_master_fragment("RUPTURE_M34_v1.jpg", (0.0, 0.45, 1.0, 1.0), target_size=(1080, 480), fade_edges=["top"])
    img.paste(terraces, (0, 770), terraces)
    
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 12", "MIXED-MEDIA / VENUE", "SPACE REVEAL // SILO A")
    draw_footer_meta(draw, "INDUSTRIAL CONCRETE CATHERAL", "EXACT GPS APPROACH DISPATCHED VIA SMS")
    
    # Center Architectural Silhouette Container (desaturated industrial concrete geometry)
    arch_box = (64, 180, 1016, 760)
    ax0, ay0, ax1, ay1 = arch_box
    arch_w, arch_h = ax1 - ax0, ay1 - ay0
    arch_img = Image.new("RGBA", (arch_w, arch_h), (14, 16, 20, 255))
    adraw = ImageDraw.Draw(arch_img)
    
    # Monolithic concrete silos geometry (monochrome industrial architectural render)
    silo_w = int(arch_w * 0.38)
    # Silo 1
    adraw.rectangle([(int(arch_w * 0.1), int(arch_h * 0.15)), (int(arch_w * 0.1) + silo_w, arch_h)], fill=(28, 32, 40))
    # Silo 2 (central dominant)
    adraw.rectangle([(int(arch_w * 0.34), int(arch_h * 0.05)), (int(arch_w * 0.34) + silo_w + 40, arch_h)], fill=(34, 40, 50))
    # Silo 3
    adraw.rectangle([(int(arch_w * 0.62), int(arch_h * 0.2)), (int(arch_w * 0.62) + silo_w, arch_h)], fill=(25, 29, 36))
    
    # Atmospheric industrial haze & concrete texture lines
    for i in range(16):
        adraw.line([(0, i * 36), (arch_w, i * 36)], fill=(50, 58, 70, 35), width=1)
    adraw.rectangle([(0, 0), (arch_w - 1, arch_h - 1)], outline=(60, 70, 85), width=1)
    
    # Overlay coordinates on architectural image
    font_mono = get_font(18, "mono")
    adraw.text((24, 24), "LOCATION SPEC: DECOMMISSIONED INDUSTRIAL SILO", font=font_mono, fill=COLOR_WHITE)
    adraw.text((24, 52), "BLACK RIVER DISTRICT · 20.3541° S · 57.3682° E", font=font_mono, fill=COLOR_ICY_BLUE)
    
    img.paste(arch_img, (ax0, ay0))
    
    # Lower Information Block over folded terraces
    draw = ImageDraw.Draw(img)
    font_hero = get_font(60, "condensed_black")
    font_bold = get_font(26, "bold")
    font_desc = get_font(20, "regular")
    
    draw_letterspaced(draw, (84, 800), "THE INDUSTRIAL SILO.", font_hero, COLOR_WHITE, spacing=1)
    draw.text((84, 874), "RAW CONCRETE. 18-METRE NATURAL REVERB HEIGHT. OPEN-AIR COOLING YARD.", font=font_mono, fill=COLOR_ICY_BLUE)
    draw.line([(84, 910), (996, 910)], fill=(50, 60, 75), width=1)
    
    details = [
        "A decommissioned industrial grain silo secured for temporary sonic transformation.",
        "Acoustically tuned with acoustic baffles to contain sub-frequencies within physical walls.",
        "Exact GPS pinpoint pin sent 24h prior to ticket holders. Monitored secure parking on-site."
    ]
    for idx, d in enumerate(details):
        draw.text((84, 930 + idx * 34), f"· {d}", font=font_desc, fill=COLOR_SILVER)
        
    save_and_export_post(img, "12", "RUPTURE_IG_POST_12")

def gen_post_13():
    """
    POST 13 — THE COUNTDOWN (7 DAYS)
    Archetype: E. Cropped Macro Artwork
    Family: Sculptural Liquid Chrome (RUPTURE_M137 - Macro razor edge)
    Massive white '07' dominating upper frame, macro chrome razor blade slicing void.
    """
    img = Image.new("RGB", (1080, 1350), COLOR_VOID)
    
    # Macro razor-edge chrome blade cutting through center-right
    blade = load_master_fragment("RUPTURE_M137_v1.jpg", (0.0, 0.0, 1.0, 0.7), target_size=(780, 780), fade_edges=["left", "bottom"])
    img.paste(blade, (300, 180), blade)
    
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 13", "CROPPED MACRO", "T-MINUS 168 HOURS")
    draw_footer_meta(draw, "7 DAYS REMAINING // FINAL TICKETS", "RUPTURE.MU/TICKETS")
    
    font_giant_num = get_font(280, "condensed_black")
    font_hero = get_font(72, "condensed_black")
    font_mono_lg = get_font(26, "mono")
    font_mono = get_font(20, "mono")
    font_sub = get_font(24, "regular")
    
    # Massive 07 numeral in solid white
    draw.text((84, 170), "07", font=font_giant_num, fill=COLOR_WHITE)
    
    # Text block anchored below numeral
    draw_letterspaced(draw, (84, 520), "DAYS REMAINING.", font_hero, COLOR_WHITE, spacing=2)
    draw_letterspaced(draw, (84, 600), "SATURDAY 28 NOVEMBER · SILO A", font_mono_lg, COLOR_ICY_BLUE, spacing=2)
    draw.line([(84, 650), (996, 650)], fill=(45, 52, 65), width=1)
    
    # Capacity countdown box
    draw.rectangle([(84, 680), (620, 840)], fill=(16, 18, 24, 240), outline=(55, 65, 80), width=1)
    draw.text((108, 706), "TICKET STATUS // FINAL ALLOCATION:", font=font_mono, fill=COLOR_MUTED_SILVER)
    draw.text((108, 742), "LAST 40 TICKETS AVAILABLE", font=get_font(32, "bold"), fill=COLOR_WHITE)
    draw.text((108, 792), "NO DOOR SALES. CAPACITY CAPPED AT 350.", font=font_mono, fill=COLOR_ICY_BLUE)
    
    draw.text((84, 880), "Sound system engineering complete. The room is calibrated for 142 BPM.", font=font_sub, fill=COLOR_SILVER)
    draw.text((84, 916), "Arrival logistics and shuttle timetable dispatched via email to all ticket holders.", font=font_mono, fill=COLOR_SLATE)
    
    save_and_export_post(img, "13", "RUPTURE_IG_POST_13")

def gen_post_14():
    """
    POST 14 — FINAL INFORMATION & LOGISTICS
    Archetype: D/F. Mixed-Media / Practical Guide
    Family: Sculptural Liquid Chrome (RUPTURE_M130 - Top and bottom telemetry chrome tabs)
    Clean, mobile-readable practical guide for party-goers. Structured info modules.
    """
    img = Image.new("RGB", (1080, 1350), COLOR_DEEP_VOID)
    
    # Slim chrome header tab (70px) and footer tab (80px)
    top_tab = load_master_fragment("RUPTURE_M130_v1.jpg", (0.0, 0.0, 1.0, 0.25), target_size=(1080, 80), fade_edges=["bottom"])
    bot_tab = load_master_fragment("RUPTURE_M130_v1.jpg", (0.0, 0.75, 1.0, 1.0), target_size=(1080, 90), fade_edges=["top"])
    img.paste(top_tab, (0, 110), top_tab)
    img.paste(bot_tab, (0, 1150), bot_tab)
    
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 14", "PRACTICAL GUIDE", "OPERATIONAL LOGISTICS")
    draw_footer_meta(draw, "ESSENTIAL EVENT BRIEFING", "DOORS 22:00 · ZERO SINGLE-USE PLASTIC")
    
    font_hero = get_font(54, "condensed_black")
    font_mono_bold = get_font(20, "mono")
    font_mono = get_font(17, "mono")
    font_body = get_font(19, "regular")
    
    draw_letterspaced(draw, (84, 210), "FINAL EVENT INFORMATION.", font_hero, COLOR_WHITE, spacing=1)
    draw.text((84, 276), "EVERYTHING YOU NEED TO KNOW BEFORE ARRIVING ON SATURDAY.", font=font_mono, fill=COLOR_ICY_BLUE)
    draw.line([(84, 310), (996, 310)], fill=(45, 52, 65), width=1)
    
    sections = [
        ("01 // TIMETABLE & ADMISSION", [
            "22:00 — DOORS OPEN // OPENING ATMOSPHERICS",
            "01:00 — [ARTIST 01: MODULAR LIVE ACT]",
            "02:00 — STRICT ENTRY CURFEW (NO ADMISSION AFTER 02:00)",
            "06:00 — EVENT CLOSE // MORNING SHUTTLES DEPART"
        ]),
        ("02 // LOCATION & ACCESS", [
            "SILO A · BLACK RIVER INDUSTRIAL DISTRICT",
            "EXACT GPS DISPATCHED TO TICKET HOLDERS VIA SMS ON FRIDAY 18:00",
            "FREE SECURE PARKING MONITORED BY EVENT SECURITY",
            "PLEASE CARPOOL OR USE DESIGNATED SHUTTLE BUSES"
        ]),
        ("03 // BAR & PAYMENT PROTOCOL", [
            "100% CASHLESS BAR: CONTACTLESS CARDS / MCB JUICE ONLY",
            "FREE HYDRATION STATIONS THROUGHOUT THE VENUE (BRING REUSABLE BOTTLE)",
            "ZERO SINGLE-USE PLASTICS PERMITTED ON SITE"
        ]),
        ("04 // SAFER SPACE TEAM", [
            "DESIGNATED WELFARE AND SAFER SPACE MONITORS IN HIGH-VIS BANDS",
            "IF YOU FEEL UNCOMFORTABLE AT ANY POINT, APPROACH ANY TEAM MEMBER",
            "RESPECT THE FLOOR. RESPECT THE ARTISTS. LOOK AFTER EACH OTHER."
        ])
    ]
    
    start_y = 330
    for idx, (title, items) in enumerate(sections):
        sy = start_y + idx * 200
        # Box container
        draw.rectangle([(84, sy), (996, sy + 180)], fill=(14, 16, 22, 230), outline=(42, 50, 62), width=1)
        draw.text((108, sy + 16), title, font=font_mono_bold, fill=COLOR_ICY_BLUE)
        draw.line([(108, sy + 44), (972, sy + 44)], fill=(30, 36, 45), width=1)
        for j, item in enumerate(items):
            draw.text((108, sy + 56 + j * 26), f"· {item}", font=font_mono, fill=COLOR_SILVER)
            
    save_and_export_post(img, "14", "RUPTURE_IG_POST_14")

def gen_post_15():
    """
    POST 15 — TONIGHT
    Archetype: A. Full Artwork Composition
    Family: Sculptural Liquid Chrome (RUPTURE_M88 - Monolithic Asymmetrical Möbius Fluid Ribbon)
    Colossal white TONIGHT set against fluid chrome void. Minimal final cinematic teaser.
    """
    base = load_master_artwork("RUPTURE_M88_v1.jpg", (1080, 1350), scale=1.06, offset=(0, -80))
    base = apply_gradient_overlay(base, direction="bottom", height_px=500, max_alpha=220)
    base = apply_gradient_overlay(base, direction="top", height_px=240, max_alpha=160)
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 15", "FULL ARTWORK", "TRANSMISSION FINAL // TONIGHT")
    draw_footer_meta(draw, "DOORS OPEN 22:00 // FINAL ENTRY 02:00", "SEE YOU ON THE DANCEFLOOR")
    
    font_colossal = get_font(136, "condensed_black")
    font_mono_lg = get_font(26, "mono")
    font_mono = get_font(20, "mono")
    
    # Upper Monolith Header
    draw_letterspaced(draw, (540, 170), "RUPTURE 01: HYDRAULIC VOID", font_mono, COLOR_ICY_BLUE, spacing=4, align="center")
    
    # Center Colossal TONIGHT
    cy = 850
    draw_letterspaced(draw, (540, cy), "TONIGHT", font_colossal, COLOR_WHITE, spacing=4, align="center")
    draw_letterspaced(draw, (540, cy + 140), "DOORS OPEN 22:00 // SILO A", font_mono_lg, COLOR_SILVER, spacing=3, align="center")
    draw.line([(320, cy + 186), (760, cy + 186)], fill=COLOR_ICY_BLUE, width=1)
    
    draw_letterspaced(draw, (540, cy + 204), "STRICTLY SOLD OUT // NO TICKETS AT THE DOOR", font_mono, COLOR_WHITE, spacing=2, align="center")
    draw_letterspaced(draw, (540, cy + 240), "NO PHONES ON THE DANCEFLOOR · LEAVE YOUR EGO OUTSIDE", font_mono, COLOR_SLATE, spacing=2, align="center")
    
    # Reel Concept (9:16 vertical 1080x1920)
    reel_img = Image.new("RGB", (1080, 1920), COLOR_VOID)
    r_base = load_master_artwork("RUPTURE_M88_v1.jpg", (1080, 1920), scale=1.12, offset=(0, -100))
    r_base = apply_gradient_overlay(r_base, direction="bottom", height_px=700, max_alpha=240)
    r_base = apply_gradient_overlay(r_base, direction="top", height_px=350, max_alpha=180)
    reel_img.paste(r_base, (0, 0))
    reel_draw = ImageDraw.Draw(reel_img)
    draw_technical_frame(reel_draw, 1080, 1920, margin=54, crop_ticks=False)
    draw_header_meta(reel_draw, "POST 15", "REEL / STORY (9:16)", "RUPTURE 01 // TONIGHT")
    draw_footer_meta(reel_draw, "TRANSMISSION FINAL // SILO A", "DOORS OPEN 22:00", y_line=1800, y_text=1825)
    
    rcy = 1250
    draw_letterspaced(reel_draw, (540, rcy), "TONIGHT", font_colossal, COLOR_WHITE, spacing=4, align="center")
    draw_letterspaced(reel_draw, (540, rcy + 150), "DOORS 22:00 // SILO A // BLACK RIVER", font_mono_lg, COLOR_SILVER, spacing=3, align="center")
    draw_letterspaced(reel_draw, (540, rcy + 210), "STRICTLY SOLD OUT · ZERO TICKETS AT DOOR", font_mono, COLOR_ICY_BLUE, spacing=2, align="center")
    
    save_and_export_post(img, "15", "RUPTURE_IG_POST_15", make_reel=True, reel_img=reel_img)

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

def main():
    print("🚀 Starting RUPTURE Complete Visual Reset Campaign Generation...")
    gen_post_01()
    gen_post_02()
    gen_post_03()
    gen_post_04()
    gen_post_05()
    gen_post_06()
    gen_post_07()
    gen_post_08()
    gen_post_09()
    gen_post_10()
    gen_post_11()
    gen_post_12()
    gen_post_13()
    gen_post_14()
    gen_post_15()
    print("✨ All 15 Campaign Posts Generated Successfully across 4:5, 1:1, and 9:16!")

if __name__ == "__main__":
    main()
