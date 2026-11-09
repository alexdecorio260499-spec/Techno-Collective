#!/usr/bin/env python3
"""
KHAOS Mauritius — Universal Campaign Edition Post Renderer & Asset Generator
Generates a reference-led, 15-post Instagram campaign based on uploaded visual explorations:
  - 100% NEW ORIGINAL ARTWORKS (khaos_artwork_01.jpg to khaos_artwork_15.jpg)
  - ZERO reuse or recycling of previous approved library artworks
  - Custom fractured geometric KHAOS typographic engine (System Fracture & Glitch Architecture)
  - Strict monochromatic chrome/silver/graphite/black palette with subtle icy blue (#7ae7ff)
  - Layout diversity: Full Artworks, Fragments, Typography-Led, Macro, and Cinematic DJ Stage HUDs
  - Outputs: 1080x1350 (4:5 feed), 1080x1080 (1:1 safe crop), and 1080x1920 (9:16 vertical reels)
  - 3-column Instagram Grid preview export
  - Complete edition_data.json and editions_manifest.json integration
"""

import os
import sys
import json
import math
import random
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

# Ensure scripts dir is on python path
SCRIPTS_DIR = os.path.dirname(__file__)
if SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, SCRIPTS_DIR)

from khaos_typography import render_fractured_text, get_text_width

ROOT = os.path.abspath(os.path.join(SCRIPTS_DIR, ".."))
KHAOS_ARTWORKS_DIR = os.path.join(ROOT, "artworks", "khaos_new")
OUT_DIR = os.path.join(ROOT, "campaign", "editions", "edition_khaos_01_system_fracture")
POSTS_DIR = os.path.join(OUT_DIR, "posts")
PUBLIC_POSTS_DIR = os.path.join(ROOT, "public", "campaign", "editions", "edition_khaos_01_system_fracture", "posts")
ASSETS_DIR = os.path.join(ROOT, "public", "campaign", "khaos_assets")
ARTIFACTS_DIR = "/Users/alex/.gemini/antigravity/brain/caf6c4ea-9b06-4d9f-9428-74b197be24de"

os.makedirs(POSTS_DIR, exist_ok=True)
os.makedirs(PUBLIC_POSTS_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)

# Fonts
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
    if os.path.exists(FONT_HELVETICA_TTC):
        try:
            return ImageFont.truetype(FONT_HELVETICA_TTC, size, index=idx)
        except Exception:
            pass
    return ImageFont.load_default()

# Colors
COLOR_WHITE = (255, 255, 255)
COLOR_OFFWHITE = (235, 238, 242)
COLOR_SILVER = (195, 202, 212)
COLOR_MUTED_SILVER = (150, 158, 172)
COLOR_SLATE = (110, 118, 132)
COLOR_DARK_SLATE = (45, 50, 60)
COLOR_CHARCOAL = (24, 26, 32)
COLOR_VOID = (5, 5, 5)
COLOR_GRAPHITE = (14, 16, 20)

COLOR_ICY_BLUE = (122, 231, 255)
COLOR_CYAN_TINT = (168, 240, 255)
COLOR_PEARL = (214, 218, 223)

def draw_letterspaced(draw, xy, text, font, fill, spacing=2, align="left"):
    if spacing <= 0 or len(text) <= 1:
        draw.text(xy, text, font=font, fill=fill)
        return
    total_w = sum(draw.textbbox((0, 0), ch, font=font)[2] for ch in text) + spacing * (len(text) - 1)
    start_x, start_y = xy
    if align == "center":
        start_x -= total_w // 2
    elif align == "right":
        start_x -= total_w
    curr_x = start_x
    for ch in text:
        draw.text((curr_x, start_y), ch, font=font, fill=fill)
        ch_w = draw.textbbox((0, 0), ch, font=font)[2]
        curr_x += ch_w + spacing

def draw_crosshair(draw, x, y, size=14, color=COLOR_SLATE, width=1):
    draw.line([(x - size, y), (x + size, y)], fill=color, width=width)
    draw.line([(x, y - size), (x, y + size)], fill=color, width=width)

def load_khaos_artwork(post_num, target_size=(1080, 1350), scale=1.05, offset=(0, 0)):
    """Loads strictly the newly generated artwork for this post."""
    filename = f"khaos_artwork_{post_num:02d}.jpg"
    path = os.path.join(KHAOS_ARTWORKS_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing newly generated KHAOS artwork: {path}")
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    tw, th = target_size
    scale_factor = max(tw / w, th / h) * scale
    nw, nh = int(w * scale_factor), int(h * scale_factor)
    img_resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2 + offset[0]
    top = (nh - th) // 2 + offset[1]
    return img_resized.crop((left, top, left + tw, top + th))

def apply_gradient_overlay(base_img, direction="bottom", height_px=480, max_alpha=230):
    w, h = base_img.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    if direction == "bottom":
        start_y = h - height_px
        for y in range(start_y, h):
            alpha = int(max_alpha * ((y - start_y) / float(height_px)) ** 1.3)
            d.line([(0, y), (w, y)], fill=(5, 5, 5, min(255, alpha)))
    elif direction == "top":
        for y in range(0, height_px):
            alpha = int(max_alpha * (1.0 - (y / float(height_px))) ** 1.3)
            d.line([(0, y), (w, y)], fill=(5, 5, 5, min(255, alpha)))
    return Image.alpha_composite(base_img.convert("RGBA"), overlay)

def create_horizontal_scanlines(width, height, intensity=35, gap=4):
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for y in range(0, height, gap):
        d.line([(0, y), (width, y)], fill=(0, 0, 0, intensity))
    return overlay

def render_khaos_wordmark(width=720, height=160, style="fracture", seed=42):
    return render_fractured_text("KHAOS", height=height, style=style, tracking=6, seed=seed)

def render_cinematic_dj_stage(base_img, box, artist_name, time_slot, bpm_text, seed=42, is_reel=False):
    bx1, by1, bx2, by2 = box
    bw = bx2 - bx1
    bh = by2 - by1
    
    stage = Image.new("RGBA", (bw, bh), (10, 12, 16, 255))
    sdraw = ImageDraw.Draw(stage)
    
    # Ambient stage atmosphere & dual spotlight cones
    for sy in range(bh):
        f = sy / float(bh)
        sdraw.line([(0, sy), (bw, sy)], fill=(int(8 + 18 * f), int(10 + 20 * f), int(16 + 28 * f), 255))
        
    # Blue/cyan laser cones
    cone_poly_l = [(int(bw * 0.08), 0), (int(bw * 0.44), bh), (int(bw * 0.20), bh)]
    sdraw.polygon(cone_poly_l, fill=(24, 60, 90, 85))
    cone_poly_r = [(int(bw * 0.92), 0), (int(bw * 0.56), bh), (int(bw * 0.80), bh)]
    sdraw.polygon(cone_poly_r, fill=(20, 50, 80, 80))
    
    # Center spotlight
    sdraw.ellipse([(int(bw * 0.28), int(bh * 0.15)), (int(bw * 0.72), int(bh * 0.85))], fill=(30, 45, 65, 120))
    
    # DJ Console Table
    dj_cx = bw // 2
    tbl_y = int(bh * 0.76)
    sdraw.rectangle([(int(bw * 0.12), tbl_y), (int(bw * 0.88), tbl_y + 85)], fill=(16, 18, 24, 240))
    sdraw.line([(int(bw * 0.12), tbl_y), (int(bw * 0.88), tbl_y)], fill=(70, 78, 92), width=2)
    
    # Modular synths, knobs, LED indicators
    for k in range(24):
        kx = int(bw * 0.16) + k * 20
        ky = tbl_y + 16 + (k % 3) * 18
        sdraw.ellipse([(kx, ky), (kx + 6, ky + 6)], fill=(120, 130, 145))
        if k % 4 == 0:
            sdraw.ellipse([(kx + 1, ky + 1), (kx + 4, ky + 4)], fill=COLOR_ICY_BLUE)
            
    # Performer silhouette
    sdraw.ellipse([(dj_cx - 46, tbl_y - 170), (dj_cx + 46, tbl_y - 80)], fill=(14, 16, 20))  # Head
    sdraw.arc([(dj_cx - 50, tbl_y - 160), (dj_cx + 50, tbl_y - 105)], start=160, end=380, fill=(180, 190, 205), width=4)
    shoulder_poly = [
        (dj_cx - 120, tbl_y),
        (dj_cx - 85, tbl_y - 95),
        (dj_cx - 35, tbl_y - 75),
        (dj_cx + 35, tbl_y - 75),
        (dj_cx + 85, tbl_y - 95),
        (dj_cx + 120, tbl_y),
    ]
    sdraw.polygon(shoulder_poly, fill=(12, 14, 18))
    sdraw.line([(dj_cx - 75, tbl_y - 65), (dj_cx - 35, tbl_y + 10)], fill=(20, 22, 28), width=20)
    sdraw.line([(dj_cx + 75, tbl_y - 65), (dj_cx + 45, tbl_y + 10)], fill=(20, 22, 28), width=20)
    
    # Stage scanline overlay
    scan = create_horizontal_scanlines(bw, bh, intensity=25, gap=4)
    stage = Image.alpha_composite(stage, scan)
    sdraw = ImageDraw.Draw(stage)
    
    # Technical HUD Header
    sdraw.line([(20, 36), (bw - 20, 36)], fill=(50, 58, 70), width=1)
    sdraw.ellipse([(24, 18), (34, 28)], fill=COLOR_WHITE)
    sdraw.text((42, 16), "● LIVE STREAM // 4K 60FPS // KHAOS SILO", font=get_font(13, "mono"), fill=COLOR_WHITE)
    sdraw.text((bw - 190, 16), f"{bpm_text} // {time_slot}", font=get_font(13, "mono"), fill=COLOR_ICY_BLUE)
    
    # Audio Waveform Telemetry
    for wx in range(bw - 250, bw - 20, 4):
        wh = int(abs(math.sin(wx * 0.12 + seed)) * 14) + 2
        sdraw.line([(wx, 26 - wh // 2), (wx, 26 + wh // 2)], fill=COLOR_ICY_BLUE, width=2)
        
    # Artist Name banner at stage bottom
    sdraw.rectangle([(20, bh - 54), (bw - 20, bh - 16)], fill=(8, 10, 14, 210), outline=(50, 58, 70), width=1)
    sdraw.text((36, bh - 44), f"ARTIST // {artist_name.upper()}", font=get_font(15, "bold"), fill=COLOR_WHITE)
    sdraw.text((bw - 160, bh - 42), "PCM 24-BIT 96KHZ", font=get_font(12, "mono"), fill=COLOR_SLATE)
    
    base_img.paste(stage, (bx1, by1), stage)

# -------------------------------------------------------------
# POST BUILDERS (01 to 15)
# -------------------------------------------------------------

def build_post_01(is_reel=False):
    """01 — THE FIRST SIGNAL (Signal Anomaly / Glitch Interference)"""
    target_size = (1080, 1920) if is_reel else (1080, 1350)
    w, h = target_size
    img = load_khaos_artwork(1, target_size, scale=1.10, offset=(0, -40))
    img = apply_gradient_overlay(img, "bottom", height_px=int(h * 0.45), max_alpha=240)
    
    # Horizontal glitch displacement across center
    scan = create_horizontal_scanlines(w, h, intensity=40, gap=3)
    img = Image.alpha_composite(img, scan)
    draw = ImageDraw.Draw(img)
    
    font_mono = get_font(16, "mono")
    
    # Header
    draw_letterspaced(draw, (64, 68), "KHAOS // 01", font_mono, COLOR_WHITE, spacing=2)
    draw_crosshair(draw, 195, 77, size=10, color=COLOR_ICY_BLUE)
    draw_letterspaced(draw, (220, 70), "SIGNAL ANOMALY", font_mono, COLOR_ICY_BLUE, spacing=2)
    draw_letterspaced(draw, (w - 64, 68), "SAT. 28.11 // MAURITIUS", font_mono, COLOR_SLATE, spacing=1, align="right")
    
    # Crosshairs
    draw_crosshair(draw, 64, 180, size=14, color=COLOR_DARK_SLATE)
    draw_crosshair(draw, w - 64, 180, size=14, color=COLOR_DARK_SLATE)
    
    # Center message rendered with custom typography
    cy = int(h * 0.65)
    headline_img = render_fractured_text("SOMETHING IS SHIFTING", height=52, style="fracture", tracking=4)
    img.paste(headline_img, (64, cy - 85), headline_img)
    
    draw = ImageDraw.Draw(img)
    draw.line([(64, cy - 10), (w - 64, cy - 10)], fill=(50, 58, 70), width=1)
    draw_letterspaced(draw, (64, cy + 12), "NOT EVERYTHING NEEDS TO FOLLOW THE PATTERN.", get_font(22, "regular"), COLOR_SILVER, spacing=1)
    draw_letterspaced(draw, (64, cy + 50), "A NEW FREQUENCY IS ENTERING THE MAURITIAN UNDERGROUND.", font_mono, COLOR_SLATE, spacing=1)
    
    # Signature Wordmark
    wordmark = render_khaos_wordmark(800, 160, style="glitch", seed=77)
    img.paste(wordmark, ((w - 800) // 2, cy + 105), wordmark)
    draw = ImageDraw.Draw(img)
    
    # Footer
    draw_letterspaced(draw, (64, h - 68), "KHAOS COLLECTIVE // TRANSMISSION 001", font_mono, (90, 100, 115), spacing=2)
    draw_letterspaced(draw, (w - 64, h - 68), "FREQ 142.0 MHZ // 25 HZ SUB RIG", font_mono, COLOR_SLATE, spacing=1, align="right")
    return img

def build_post_02(is_reel=False):
    """02 — THE MANIFESTO (Typography-Led Composition)"""
    target_size = (1080, 1920) if is_reel else (1080, 1350)
    w, h = target_size
    img = Image.new("RGBA", target_size, (6, 7, 10, 255))
    
    # Metallic framing rules from newly generated artwork 02
    band_h = 130
    top_band = load_khaos_artwork(2, (w, band_h), scale=1.5, offset=(0, -80))
    bot_band = load_khaos_artwork(2, (w, band_h), scale=1.5, offset=(0, 120))
    img.paste(top_band, (0, 0))
    img.paste(bot_band, (0, h - band_h))
    
    draw = ImageDraw.Draw(img)
    draw.line([(0, band_h), (w, band_h)], fill=(70, 80, 95), width=2)
    draw.line([(0, h - band_h), (w, h - band_h)], fill=(70, 80, 95), width=2)
    
    font_mono = get_font(16, "mono")
    font_body = get_font(21, "regular")
    
    # Header
    draw_letterspaced(draw, (64, 150), "KHAOS // 02", font_mono, COLOR_WHITE, spacing=2)
    draw_crosshair(draw, 195, 159, size=10, color=COLOR_ICY_BLUE)
    draw_letterspaced(draw, (220, 152), "PHILOSOPHY & PURPOSE", font_mono, COLOR_ICY_BLUE, spacing=2)
    draw_letterspaced(draw, (w - 64, 150), "SAT. 28.11 // MAURITIUS", font_mono, COLOR_SLATE, spacing=1, align="right")
    
    # Headlines in custom typography
    hl1 = render_fractured_text("WE BREAK CONVENTIONS", height=48, style="fracture")
    img.paste(hl1, (64, 215), hl1)
    hl2 = render_fractured_text("WE CHALLENGE REPETITION", height=48, style="solid", tint=(190, 198, 210))
    img.paste(hl2, (64, 280), hl2)
    
    draw = ImageDraw.Draw(img)
    draw.line([(64, 355), (w - 64, 355)], fill=(45, 55, 68), width=1)
    draw_letterspaced(draw, (64, 375), "THE KHAOS MANIFESTO // 4 CORE TENETS", font_mono, COLOR_ICY_BLUE, spacing=3)
    
    tenets = [
        ("[01]", "DESTRUCTION OF THE PREDICTABLE", "Rejecting commercial club formulas, VIP divisions, and playlist conformity."),
        ("[02]", "ACOUSTIC RIGIDITY & CONTINUITY", "Curating fast, dark, hypnotic rhythms with uncompromised 25 Hz sub-bass integrity."),
        ("[03]", "A RADICAL DANCEFLOOR SANCTUARY", "A community built on bodily autonomy, radical safety, mutual respect, and pure freedom."),
        ("[04]", "ZERO COMPROMISE. NO NOSTALGIA", "Forward-leaning electronic sound. Leave your ego outside the door.")
    ]
    
    start_y = 430
    step_y = 150 if not is_reel else 210
    for i, (num, title, desc) in enumerate(tenets):
        y = start_y + i * step_y
        num_img = render_fractured_text(num, height=24, style="solid", tint=COLOR_ICY_BLUE)
        img.paste(num_img, (64, y), num_img)
        
        draw = ImageDraw.Draw(img)
        draw.text((150, y - 2), title, font=get_font(22, "bold"), fill=COLOR_WHITE)
        draw.text((150, y + 34), desc, font=font_body, fill=COLOR_MUTED_SILVER)
        draw.line([(64, y + 100), (w - 64, y + 100)], fill=(30, 36, 46), width=1)
        
    draw = ImageDraw.Draw(img)
    draw_letterspaced(draw, (64, h - 165), "KHAOS COLLECTIVE · MAURITIUS · EST. 2026", font_mono, COLOR_SLATE, spacing=2)
    draw_crosshair(draw, w - 64, h - 160, size=12, color=COLOR_SLATE)
    return img

def build_post_03(is_reel=False):
    """03 — THE IDENTITY (Signature Brand Monolith)"""
    target_size = (1080, 1920) if is_reel else (1080, 1350)
    w, h = target_size
    img = Image.new("RGBA", target_size, (5, 5, 5, 255))
    
    # Liquid chrome torus ribbons from newly generated artwork 03 entering corners
    corner_nw = load_khaos_artwork(3, (460, 460), scale=1.3).crop((0, 0, 460, 460))
    corner_se = load_khaos_artwork(3, (460, 460), scale=1.3).rotate(180)
    img.paste(corner_nw, (0, 0), corner_nw)
    img.paste(corner_se, (w - 460, h - 460), corner_se)
    
    draw = ImageDraw.Draw(img)
    font_mono = get_font(16, "mono")
    
    # Header
    draw_letterspaced(draw, (64, 68), "KHAOS // 03", font_mono, COLOR_WHITE, spacing=2)
    draw_crosshair(draw, 195, 77, size=10, color=COLOR_ICY_BLUE)
    draw_letterspaced(draw, (220, 70), "BRAND IDENTITY", font_mono, COLOR_ICY_BLUE, spacing=2)
    draw_letterspaced(draw, (w - 64, 68), "SAT. 28.11 // MAURITIUS", font_mono, COLOR_SLATE, spacing=1, align="right")
    
    # Corner registration marks
    draw_crosshair(draw, 64, 180, size=18, color=COLOR_SLATE)
    draw_crosshair(draw, w - 64, 180, size=18, color=COLOR_SLATE)
    draw_crosshair(draw, 64, h - 180, size=18, color=COLOR_SLATE)
    draw_crosshair(draw, w - 64, h - 180, size=18, color=COLOR_SLATE)
    
    # Central Monumental Wordmark
    cy = h // 2
    wordmark = render_khaos_wordmark(860, 185, style="fracture")
    img.paste(wordmark, ((w - 860) // 2, cy - 130), wordmark)
    
    # Subtitle in custom typography
    sub_img = render_fractured_text("TECHNO COLLECTIVE", height=34, style="solid", tracking=6)
    img.paste(sub_img, ((w - sub_img.width) // 2, cy + 90), sub_img)
    
    draw = ImageDraw.Draw(img)
    draw_letterspaced(draw, (w // 2, cy + 155), "MORE THAN A PARTY", get_font(20, "light"), COLOR_SILVER, spacing=4, align="center")
    draw_letterspaced(draw, (w // 2, cy + 195), "SOUND · MOVEMENT · UNITY", font_mono, COLOR_ICY_BLUE, spacing=4, align="center")
    
    # Footer
    draw_letterspaced(draw, (64, h - 68), "KHAOS UNDERGROUND ELECTRONIC CULTURE", font_mono, COLOR_SLATE, spacing=2)
    draw_letterspaced(draw, (w - 64, h - 68), "MAURITIUS · 20.3541° S · 57.3682° E", font_mono, COLOR_SLATE, spacing=1, align="right")
    return img

def build_post_04(is_reel=False):
    """04 — SAVE THE DATE (Sculptural Chrome Pillar & Fractured Display)"""
    target_size = (1080, 1920) if is_reel else (1080, 1350)
    w, h = target_size
    img = load_khaos_artwork(4, target_size, scale=1.12, offset=(0, 20))
    img = apply_gradient_overlay(img, "bottom", height_px=int(h * 0.40), max_alpha=240)
    img = apply_gradient_overlay(img, "top", height_px=int(h * 0.25), max_alpha=220)
    
    draw = ImageDraw.Draw(img)
    font_mono = get_font(16, "mono")
    
    # Header
    draw_letterspaced(draw, (64, 68), "KHAOS // 04", font_mono, COLOR_WHITE, spacing=2)
    draw_crosshair(draw, 195, 77, size=10, color=COLOR_ICY_BLUE)
    draw_letterspaced(draw, (220, 70), "CALENDAR LOCK", font_mono, COLOR_ICY_BLUE, spacing=2)
    draw_letterspaced(draw, (w - 64, 68), "SAT. 28.11 // MAURITIUS", font_mono, COLOR_SLATE, spacing=1, align="right")
    
    # Centered "SAVE THE DATE" in custom typography
    cy = int(h * 0.44)
    save_img = render_fractured_text("SAVE", height=78, style="fracture")
    the_img = render_fractured_text("THE", height=78, style="fracture")
    date_img = render_fractured_text("DATE", height=78, style="fracture")
    img.paste(save_img, ((w - save_img.width) // 2, cy - 120), save_img)
    img.paste(the_img, ((w - the_img.width) // 2, cy - 35), the_img)
    img.paste(date_img, ((w - date_img.width) // 2, cy + 50), date_img)
    
    # Bottom date banner with custom fractured numerals
    draw = ImageDraw.Draw(img)
    draw.line([(64, h - 235), (w - 64, h - 235)], fill=(60, 70, 85), width=1)
    
    date_num_img = render_fractured_text("28 . 11 . 2026", height=42, style="solid", tint=COLOR_WHITE, tracking=5)
    img.paste(date_num_img, ((w - date_num_img.width) // 2, h - 215), date_num_img)
    
    draw = ImageDraw.Draw(img)
    draw_letterspaced(draw, (w // 2, h - 150), "SECRET INDUSTRIAL SILO // BLACK RIVER DISTRICT", font_mono, COLOR_ICY_BLUE, spacing=3, align="center")
    draw_letterspaced(draw, (w // 2, h - 110), "CAPACITY RESTRICTED TO 350 DANCERS · PRE-REGISTRATION ESSENTIAL", font_mono, COLOR_SLATE, spacing=1, align="center")
    return img

def build_post_05(is_reel=False):
    """05 — MAIN EVENT POSTER (Hero Biomechanical Sculpture)"""
    target_size = (1080, 1920) if is_reel else (1080, 1350)
    w, h = target_size
    img = load_khaos_artwork(5, target_size, scale=1.06, offset=(0, -60))
    img = apply_gradient_overlay(img, "bottom", height_px=int(h * 0.48), max_alpha=245)
    
    draw = ImageDraw.Draw(img)
    font_mono = get_font(16, "mono")
    
    # Header
    draw_letterspaced(draw, (64, 68), "KHAOS COLLECTIVE PRESENTS", font_mono, COLOR_WHITE, spacing=2)
    draw_letterspaced(draw, (w - 64, 68), "EDITION 01 // DEBUT RITUAL", font_mono, COLOR_ICY_BLUE, spacing=1, align="right")
    
    # Wordmark
    cy = int(h * 0.58)
    wordmark = render_khaos_wordmark(860, 185, style="fracture")
    img.paste(wordmark, ((w - 860) // 2, cy - 80), wordmark)
    
    # Event Subtitle in custom fractured type
    title_img = render_fractured_text("SYSTEM FRACTURE", height=44, style="fracture", tint=COLOR_WHITE)
    img.paste(title_img, ((w - title_img.width) // 2, cy + 120), title_img)
    
    draw = ImageDraw.Draw(img)
    draw_letterspaced(draw, (w // 2, cy + 180), "SATURDAY 28 NOVEMBER 2026 · DOORS 22:00", font_mono, COLOR_ICY_BLUE, spacing=2, align="center")
    
    # Lineup strip
    draw.rectangle([(64, cy + 220), (w - 64, cy + 285)], fill=(12, 14, 18, 220), outline=(50, 60, 75), width=1)
    draw_letterspaced(draw, (w // 2, cy + 242), "ARTIST 01  ·  ARTIST 02 [LIVE]  ·  ARTIST 03  ·  ARTIST 04", get_font(21, "bold"), COLOR_WHITE, spacing=2, align="center")
    
    # Footer Specs
    draw_letterspaced(draw, (64, h - 68), "THE INDUSTRIAL SILO · BLACK RIVER · MAURITIUS", font_mono, COLOR_SLATE, spacing=2)
    draw_letterspaced(draw, (w - 64, h - 68), "142 BPM · 25 HZ SUB RIG · NO DOOR SALES", font_mono, COLOR_ICY_BLUE, spacing=1, align="right")
    return img

def build_post_06(is_reel=False):
    """06 — LINEUP REVEAL (Stratified Metallic Sheets & Hierarchy)"""
    target_size = (1080, 1920) if is_reel else (1080, 1350)
    w, h = target_size
    img = Image.new("RGBA", target_size, (6, 7, 10, 255))
    
    # Folded liquid metallic sheets framing top and bottom borders from artwork 06
    band_h = 200 if not is_reel else 260
    top_band = load_khaos_artwork(6, (w, band_h), scale=1.3, offset=(0, -60))
    bot_band = load_khaos_artwork(6, (w, band_h), scale=1.3, offset=(0, 60))
    img.paste(top_band, (0, 0))
    img.paste(bot_band, (0, h - band_h))
    
    draw = ImageDraw.Draw(img)
    draw.line([(0, band_h), (w, band_h)], fill=(70, 80, 95), width=2)
    draw.line([(0, h - band_h), (w, h - band_h)], fill=(70, 80, 95), width=2)
    
    font_mono = get_font(16, "mono")
    
    # Lineup Header
    draw_letterspaced(draw, (64, band_h + 30), "KHAOS // 06", font_mono, COLOR_WHITE, spacing=2)
    draw_crosshair(draw, 195, band_h + 39, size=10, color=COLOR_ICY_BLUE)
    draw_letterspaced(draw, (220, band_h + 32), "FULL SOUND CURATION", font_mono, COLOR_ICY_BLUE, spacing=2)
    draw_letterspaced(draw, (w - 64, band_h + 30), "SAT. 28.11 // MAURITIUS", font_mono, COLOR_SLATE, spacing=1, align="right")
    
    # Headline in custom typography
    title_img = render_fractured_text("THE LINEUP", height=48, style="fracture")
    img.paste(title_img, (64, band_h + 80), title_img)
    
    draw = ImageDraw.Draw(img)
    draw.line([(64, band_h + 145), (w - 64, band_h + 145)], fill=(45, 55, 68), width=1)
    
    artists = [
        ("01", "ARTIST 01", "[HEADLINER]", "Hypnotic, driving underground techno. Precision drum architecture.", "01:30 — 03:30"),
        ("02", "ARTIST 02", "[LIVE HARDWARE]", "Modular synthesizer improvisations, raw analog distortion & acid lines.", "00:00 — 01:30"),
        ("03", "ARTIST 03", "[INDUSTRIAL GROOVE]", "High-velocity industrial groove & hypnotic closing pressure.", "03:30 — 06:00"),
        ("04", "ARTIST 04", "[RESIDENT RITUAL]", "Deep textural ambient prelude & rhythmic frequency calibration.", "22:00 — 00:00")
    ]
    
    start_y = band_h + 175
    step_y = 125 if not is_reel else 165
    for i, (idx, name, role, desc, slot) in enumerate(artists):
        y = start_y + i * step_y
        num_img = render_fractured_text(f"[{idx}]", height=22, style="solid", tint=COLOR_ICY_BLUE)
        img.paste(num_img, (64, y), num_img)
        
        name_img = render_fractured_text(name, height=28, style="solid", tint=COLOR_WHITE)
        img.paste(name_img, (140, y - 4), name_img)
        
        draw = ImageDraw.Draw(img)
        draw.text((360, y + 2), role, font=get_font(16, "mono"), fill=COLOR_SILVER)
        draw_letterspaced(draw, (w - 64, y + 2), slot, font_mono, COLOR_ICY_BLUE, spacing=1, align="right")
        draw.text((140, y + 36), desc, font=get_font(18, "regular"), fill=COLOR_MUTED_SILVER)
        draw.line([(64, y + 75), (w - 64, y + 75)], fill=(30, 36, 46), width=1)
        
    draw = ImageDraw.Draw(img)
    draw_letterspaced(draw, (64, h - band_h - 40), "SOUND SYSTEM INTEGRITY // 25 HZ SUB-BASS REINFORCEMENT", font_mono, COLOR_SLATE, spacing=2)
    return img

def build_post_07(is_reel=False):
    """07 — DJ SPOTLIGHT 01 — HEADLINER (Cinematic DJ Stage & Visor Frame)"""
    target_size = (1080, 1920) if is_reel else (1080, 1350)
    w, h = target_size
    img = load_khaos_artwork(7, target_size, scale=1.08, offset=(0, 0))
    img = apply_gradient_overlay(img, "bottom", height_px=int(h * 0.40), max_alpha=240)
    img = apply_gradient_overlay(img, "top", height_px=int(h * 0.35), max_alpha=240)
    
    if not is_reel:
        stage_box = (64, 280, w - 64, 980)
    else:
        stage_box = (64, 460, w - 64, 1420)
    render_cinematic_dj_stage(img, stage_box, "ARTIST 01", "01:30 — 03:30", "142 BPM", seed=101, is_reel=is_reel)
    
    draw = ImageDraw.Draw(img)
    font_mono = get_font(16, "mono")
    
    # Header
    draw_letterspaced(draw, (64, 68), "KHAOS // 07", font_mono, COLOR_WHITE, spacing=2)
    draw_crosshair(draw, 195, 77, size=10, color=COLOR_ICY_BLUE)
    draw_letterspaced(draw, (220, 70), "HEADLINER SPOTLIGHT", font_mono, COLOR_ICY_BLUE, spacing=2)
    draw_letterspaced(draw, (w - 64, 68), "SAT. 28.11 // MAURITIUS", font_mono, COLOR_SLATE, spacing=1, align="right")
    
    # Footer Details
    fy = stage_box[3] + 45
    name_img = render_fractured_text("ARTIST 01 // HEADLINE SET", height=38, style="fracture")
    img.paste(name_img, (64, fy), name_img)
    
    draw = ImageDraw.Draw(img)
    draw_letterspaced(draw, (64, fy + 48), "FAST HYPNOTIC CONTINUITY · LIVE HARDWARE AUDIO PROCESSORS", font_mono, COLOR_ICY_BLUE, spacing=1)
    draw_letterspaced(draw, (64, fy + 80), "PIONEER CDJ-3000 / DJM-V10 / EVENTIDE H90 / BOSS RE-20", font_mono, COLOR_SLATE, spacing=1)
    draw_letterspaced(draw, (w - 64, fy + 48), "01:30 — 03:30 // SILO A", font_mono, COLOR_WHITE, spacing=2, align="right")
    return img

def build_post_08(is_reel=False):
    """08 — DJ SPOTLIGHT 02 — LIVE HARDWARE (Helical Loop & Glitch Stage)"""
    target_size = (1080, 1920) if is_reel else (1080, 1350)
    w, h = target_size
    img = load_khaos_artwork(8, target_size, scale=1.1, offset=(0, 0))
    scan = create_horizontal_scanlines(w, h, intensity=40, gap=3)
    img = Image.alpha_composite(img, scan)
    
    if not is_reel:
        stage_box = (64, 280, w - 64, 980)
    else:
        stage_box = (64, 460, w - 64, 1420)
    render_cinematic_dj_stage(img, stage_box, "ARTIST 02 [LIVE]", "00:00 — 01:30", "140 BPM", seed=202, is_reel=is_reel)
    
    draw = ImageDraw.Draw(img)
    font_mono = get_font(16, "mono")
    
    # Header
    draw_letterspaced(draw, (64, 68), "KHAOS // 08", font_mono, COLOR_WHITE, spacing=2)
    draw_crosshair(draw, 195, 77, size=10, color=COLOR_ICY_BLUE)
    draw_letterspaced(draw, (220, 70), "LIVE MODULAR PERFORMANCE", font_mono, COLOR_ICY_BLUE, spacing=2)
    draw_letterspaced(draw, (w - 64, 68), "SAT. 28.11 // MAURITIUS", font_mono, COLOR_SLATE, spacing=1, align="right")
    
    fy = stage_box[3] + 45
    name_img = render_fractured_text("ARTIST 02 // LIVE HARDWARE", height=38, style="glitch")
    img.paste(name_img, (64, fy), name_img)
    
    draw = ImageDraw.Draw(img)
    draw_letterspaced(draw, (64, fy + 48), "HARDWARE: ELEKTRON OCTATRACK · ERICA SYNTHS SYNTHRX · ROLAND TR-909", font_mono, COLOR_ICY_BLUE, spacing=1)
    draw_letterspaced(draw, (64, fy + 80), "PURE ANALOG IMPROVISATION · ZERO LAPTOPS · 100% HARDWARE SIGNAL", font_mono, COLOR_SLATE, spacing=1)
    return img

def build_post_09(is_reel=False):
    """09 — DJ SPOTLIGHT 03 — CLOSING RITUAL (Sculptural Blade Framing)"""
    target_size = (1080, 1920) if is_reel else (1080, 1350)
    w, h = target_size
    img = Image.new("RGBA", target_size, (6, 7, 10, 255))
    
    # Asymmetric liquid chrome blade from artwork 09 on right margin
    blade = load_khaos_artwork(9, (520, h), scale=1.2, offset=(30, 0))
    img.paste(blade, (w - 480, 0))
    
    if not is_reel:
        stage_box = (64, 280, w - 240, 980)
    else:
        stage_box = (64, 460, w - 240, 1420)
    render_cinematic_dj_stage(img, stage_box, "ARTIST 03", "03:30 — 06:00", "144 BPM", seed=303, is_reel=is_reel)
    
    draw = ImageDraw.Draw(img)
    font_mono = get_font(16, "mono")
    
    # Header
    draw_letterspaced(draw, (64, 68), "KHAOS // 09", font_mono, COLOR_WHITE, spacing=2)
    draw_crosshair(draw, 195, 77, size=10, color=COLOR_ICY_BLUE)
    draw_letterspaced(draw, (220, 70), "CLOSING RITUAL", font_mono, COLOR_ICY_BLUE, spacing=2)
    draw_letterspaced(draw, (w - 64, 68), "SAT. 28.11 // MAURITIUS", font_mono, COLOR_SLATE, spacing=1, align="right")
    
    fy = stage_box[3] + 45
    name_img = render_fractured_text("ARTIST 03 // CLOSING PRESSURE", height=36, style="fracture")
    img.paste(name_img, (64, fy), name_img)
    
    draw = ImageDraw.Draw(img)
    draw_letterspaced(draw, (64, fy + 48), "INDUSTRIAL GROOVE & RELENTLESS VELOCITY // 144 BPM", font_mono, COLOR_ICY_BLUE, spacing=1)
    draw_letterspaced(draw, (64, fy + 80), "CARRYING THE DANCEFLOOR INTO THE DAWN AT SILO A", font_mono, COLOR_SLATE, spacing=1)
    return img

def build_post_10(is_reel=False):
    """10 — THE SOUND (Kinetic Cymatic Chrome Waves & Acoustic Specs)"""
    target_size = (1080, 1920) if is_reel else (1080, 1350)
    w, h = target_size
    img = load_khaos_artwork(10, target_size, scale=1.1, offset=(0, -20))
    img = apply_gradient_overlay(img, "bottom", height_px=int(h * 0.45), max_alpha=240)
    
    draw = ImageDraw.Draw(img)
    font_mono = get_font(16, "mono")
    
    # Header
    draw_letterspaced(draw, (64, 68), "KHAOS // 10", font_mono, COLOR_WHITE, spacing=2)
    draw_crosshair(draw, 195, 77, size=10, color=COLOR_ICY_BLUE)
    draw_letterspaced(draw, (220, 70), "ACOUSTIC RIGIDITY", font_mono, COLOR_ICY_BLUE, spacing=2)
    draw_letterspaced(draw, (w - 64, 68), "SAT. 28.11 // MAURITIUS", font_mono, COLOR_SLATE, spacing=1, align="right")
    
    # Sound frequency matrix
    cy = int(h * 0.60)
    title_img = render_fractured_text("THE SOUND", height=54, style="fracture")
    img.paste(title_img, (64, cy - 85), title_img)
    
    sub_img = render_fractured_text("FAST . HYPNOTIC . GROOVY . DRIVING", height=24, style="solid", tint=COLOR_ICY_BLUE)
    img.paste(sub_img, (64, cy - 15), sub_img)
    
    draw = ImageDraw.Draw(img)
    draw.line([(64, cy + 25), (w - 64, cy + 25)], fill=(50, 60, 75), width=1)
    
    draw_crosshair(draw, 64, cy + 65, size=12, color=COLOR_ICY_BLUE)
    draw_letterspaced(draw, (95, cy + 57), "LOW FREQUENCY RESPONSE: 25 HZ // SUB-BASS PRESSURE", font_mono, COLOR_ICY_BLUE, spacing=2)
    
    draw_crosshair(draw, 64, cy + 110, size=12, color=COLOR_ICY_BLUE)
    draw_letterspaced(draw, (95, cy + 102), "TEMPO RANGE: 140 — 146 BPM // NON-STOP CONTINUITY", font_mono, COLOR_WHITE, spacing=2)
    
    draw_crosshair(draw, 64, cy + 155, size=12, color=COLOR_ICY_BLUE)
    draw_letterspaced(draw, (95, cy + 147), "SOUND SYSTEM: CUSTOM TUNED MULTI-POINT CONCRETE STACK", font_mono, COLOR_SLATE, spacing=2)
    
    draw_letterspaced(draw, (64, h - 68), "ACOUSTIC ENGINEERING COMPLETE // CALIBRATED FOR THE VOID", font_mono, COLOR_SLATE, spacing=2)
    return img

def build_post_11(is_reel=False):
    """11 — THE CODE (Cultural Code / Community Manifesto)"""
    target_size = (1080, 1920) if is_reel else (1080, 1350)
    w, h = target_size
    img = Image.new("RGBA", target_size, (5, 5, 5, 255))
    
    # Monolithic tectonic chrome slab from artwork 11 as right accent
    monolith = load_khaos_artwork(11, (440, h), scale=1.1, offset=(0, 0))
    img.paste(monolith, (w - 420, 0))
    
    draw = ImageDraw.Draw(img)
    draw.rectangle([(32, 32), (w - 32, h - 32)], outline=(35, 42, 54), width=1)
    
    font_mono = get_font(16, "mono")
    
    # Header
    draw_letterspaced(draw, (64, 68), "KHAOS // 11", font_mono, COLOR_WHITE, spacing=2)
    draw_crosshair(draw, 195, 77, size=10, color=COLOR_ICY_BLUE)
    draw_letterspaced(draw, (220, 70), "DANCEFLOOR CODE", font_mono, COLOR_ICY_BLUE, spacing=2)
    draw_letterspaced(draw, (w - 64, 68), "COMMUNITY VALUES", font_mono, COLOR_SLATE, spacing=1, align="right")
    
    title_img = render_fractured_text("THE KHAOS CODE", height=50, style="fracture")
    img.paste(title_img, (64, 140), title_img)
    
    draw = ImageDraw.Draw(img)
    draw_letterspaced(draw, (64, 210), "FOUR MANDATORY PRINCIPLES FOR ENTERING OUR SPACE", font_mono, COLOR_ICY_BLUE, spacing=2)
    draw.line([(64, 250), (w - 64, 250)], fill=(50, 60, 75), width=1)
    
    rules = [
        ("[01]", "RADICAL INCLUSIVITY & AUTONOMY", "A sanctuary for all identities, backgrounds, and bodies. Wear what you want. Be who you are. Absolute bodily autonomy."),
        ("[02]", "ZERO TOLERANCE FOR HARASSMENT", "Any racism, sexism, homophobia, transphobia, or non-consensual contact results in immediate removal and permanent ban."),
        ("[03]", "NO PHONES ON THE DANCEFLOOR", "Protect the sanctuary. Cameras and flash photography are strictly prohibited on the dancefloor. Be present in the sound."),
        ("[04]", "LEAVE YOUR EGO AT THE DOOR", "No VIP sections. No backstage hierarchy. No bottle service. We are all equals before the sound system.")
    ]
    
    start_y = 300
    step_y = 190 if not is_reel else 250
    for idx, (num, title, body) in enumerate(rules):
        y = start_y + idx * step_y
        num_img = render_fractured_text(num, height=24, style="solid", tint=COLOR_ICY_BLUE)
        img.paste(num_img, (64, y), num_img)
        
        draw = ImageDraw.Draw(img)
        draw.text((150, y - 2), title, font=get_font(23, "condensed_bold"), fill=COLOR_WHITE)
        draw.text((150, y + 34), body, font=get_font(18, "regular"), fill=COLOR_MUTED_SILVER)
        draw.line([(64, y + 125), (w - 64, y + 125)], fill=(25, 30, 40), width=1)
        
    draw = ImageDraw.Draw(img)
    draw_letterspaced(draw, (64, h - 68), "OUR CARE TEAM IS PRESENT ALL NIGHT · SEEK ASSISTANCE AT ANY TIME", font_mono, COLOR_SLATE, spacing=1)
    return img

def build_post_12(is_reel=False):
    """12 — THE VENUE / EXPERIENCE (Brutalist Cavern Archway & Blueprint)"""
    target_size = (1080, 1920) if is_reel else (1080, 1350)
    w, h = target_size
    img = load_khaos_artwork(12, target_size, scale=1.08, offset=(0, 0))
    img = apply_gradient_overlay(img, "bottom", height_px=int(h * 0.45), max_alpha=245)
    
    draw = ImageDraw.Draw(img)
    font_mono = get_font(16, "mono")
    
    # Header
    draw_letterspaced(draw, (64, 68), "KHAOS // 12", font_mono, COLOR_WHITE, spacing=2)
    draw_crosshair(draw, 195, 77, size=10, color=COLOR_ICY_BLUE)
    draw_letterspaced(draw, (220, 70), "VENUE ARCHITECTURE", font_mono, COLOR_ICY_BLUE, spacing=2)
    draw_letterspaced(draw, (w - 64, 68), "SAT. 28.11 // MAURITIUS", font_mono, COLOR_SLATE, spacing=1, align="right")
    
    cy = int(h * 0.58)
    title_img = render_fractured_text("THE INDUSTRIAL SILO", height=50, style="fracture")
    img.paste(title_img, (64, cy - 65), title_img)
    
    draw = ImageDraw.Draw(img)
    draw_letterspaced(draw, (64, cy + 10), "RAW CONCRETE. 18-METRE NATURAL REVERB HEIGHT. OPEN-AIR COOLING YARD.", font_mono, COLOR_ICY_BLUE, spacing=1)
    draw.line([(64, cy + 45), (w - 64, cy + 45)], fill=(50, 60, 75), width=1)
    
    specs = [
        "COORDINATES: 20.3541° S · 57.3682° E (BLACK RIVER DISTRICT)",
        "ACOUSTIC TREATMENT: 4-POINT CUSTOM SUB INTEGRATION",
        "LOGISTICS: DEDICATED SHUTTLE TRANSIT FROM NORTH & WEST HUBS",
        "STRICT POLICY: ZERO PRIVATE VEHICLE ACCESS ON-SITE"
    ]
    for idx, sp in enumerate(specs):
        draw_crosshair(draw, 64, cy + 85 + idx * 45, size=8, color=COLOR_ICY_BLUE)
        draw_letterspaced(draw, (85, cy + 77 + idx * 45), sp, font_mono, COLOR_SILVER, spacing=1)
        
    draw_letterspaced(draw, (64, h - 68), "SECRET LOCATION MAP DISPATCHED VIA EMAIL TO TICKET HOLDERS", font_mono, COLOR_SLATE, spacing=1)
    return img

def build_post_13(is_reel=False):
    """13 — COUNTDOWN (Fractured Sphere & Colossal Countdown)"""
    target_size = (1080, 1920) if is_reel else (1080, 1350)
    w, h = target_size
    img = load_khaos_artwork(13, target_size, scale=1.1, offset=(0, 20))
    img = apply_gradient_overlay(img, "bottom", height_px=int(h * 0.45), max_alpha=240)
    
    scan = create_horizontal_scanlines(w, h, intensity=40, gap=3)
    img = Image.alpha_composite(img, scan)
    draw = ImageDraw.Draw(img)
    
    font_mono = get_font(16, "mono")
    
    # Header
    draw_letterspaced(draw, (64, 68), "KHAOS // 13", font_mono, COLOR_WHITE, spacing=2)
    draw_crosshair(draw, 195, 77, size=10, color=COLOR_ICY_BLUE)
    draw_letterspaced(draw, (220, 70), "COUNTDOWN SEQUENCE", font_mono, COLOR_ICY_BLUE, spacing=2)
    draw_letterspaced(draw, (w - 64, 68), "SAT. 28.11 // MAURITIUS", font_mono, COLOR_SLATE, spacing=1, align="right")
    
    # Colossal 07 in custom fractured typography
    num_07 = render_fractured_text("07", height=240 if not is_reel else 300, style="glitch", tint=COLOR_WHITE)
    img.paste(num_07, (64, 180), num_07)
    
    days_img = render_fractured_text("DAYS REMAINING", height=54, style="fracture", tint=COLOR_WHITE)
    img.paste(days_img, (64, 460 if not is_reel else 540), days_img)
    
    draw = ImageDraw.Draw(img)
    draw_letterspaced(draw, (64, 540 if not is_reel else 620), "SATURDAY 28 NOVEMBER · SILO A", get_font(26, "mono"), COLOR_ICY_BLUE, spacing=2)
    
    draw.rectangle([(64, 620 if not is_reel else 700), (w - 64, 720 if not is_reel else 800)], fill=(12, 14, 18, 220), outline=(50, 60, 75), width=1)
    draw.text((90, 644 if not is_reel else 724), "TICKET ALLOCATION // FINAL RELEASE:", font=font_mono, fill=COLOR_MUTED_SILVER)
    draw.text((90, 676 if not is_reel else 756), "85% ALLOCATION CLAIMED · STRICTLY ZERO DOOR SALES · CAPACITY 350", font=font_mono, fill=COLOR_ICY_BLUE)
    
    draw_letterspaced(draw, (64, h - 68), "SOUND SYSTEM CALIBRATED AT 142 BPM · PREPARE YOUR MIND", font_mono, COLOR_SLATE, spacing=1)
    return img

def build_post_14(is_reel=False):
    """14 — FINAL INFORMATION (Precision Chrome Beams & Logistics)"""
    target_size = (1080, 1920) if is_reel else (1080, 1350)
    w, h = target_size
    img = Image.new("RGBA", target_size, (6, 7, 10, 255))
    
    # Structural chrome divider beams from artwork 14
    beams = load_khaos_artwork(14, target_size, scale=1.0)
    img.paste(beams, (0, 0), beams)
    
    draw = ImageDraw.Draw(img)
    font_mono = get_font(16, "mono")
    
    # Header
    draw_letterspaced(draw, (64, 68), "KHAOS // 14", font_mono, COLOR_WHITE, spacing=2)
    draw_crosshair(draw, 195, 77, size=10, color=COLOR_ICY_BLUE)
    draw_letterspaced(draw, (220, 70), "PRACTICAL GUIDE", font_mono, COLOR_ICY_BLUE, spacing=2)
    draw_letterspaced(draw, (w - 64, 68), "SAT. 28.11 // MAURITIUS", font_mono, COLOR_SLATE, spacing=1, align="right")
    
    title_img = render_fractured_text("FINAL INFORMATION", height=46, style="fracture")
    img.paste(title_img, (64, 130), title_img)
    
    draw = ImageDraw.Draw(img)
    draw_letterspaced(draw, (64, 195), "EVERYTHING YOU NEED TO KNOW BEFORE ENTERING SILO A", font_mono, COLOR_ICY_BLUE, spacing=2)
    draw.line([(64, 230), (w - 64, 230)], fill=(50, 60, 75), width=1)
    
    sections = [
        ("01", "HOURS & TIMETABLE", [
            "DOORS OPEN: 22:00 SHARP // FIRST SET 22:30",
            "CURFEW: 06:00 // LAST ADMISSION 01:30"
        ]),
        ("02", "TRANSIT & SHUTTLES", [
            "SHUTTLE PICKUPS: GRAND BAIE (21:30) & FLIC-EN-FLAC (22:00)",
            "RETURN TRANSIT EVERY 45 MIN FROM 04:30 TO 06:30"
        ]),
        ("03", "ENTRY REQUIREMENTS", [
            "GOVERNMENT ID + DIGITAL QR CODE MATCHING TICKET HOLDER",
            "STRICT 18+ ADMISSION // ZERO TOLERANCE FOR WEAPONS OR CONTRABAND"
        ]),
        ("04", "CARE & DANCEFLOOR SAFETY", [
            "FREE HYDRATION STATIONS THROUGHOUT THE VENUE",
            "EARPLUGS PROVIDED AT ENTRANCE // SANCTUARY CARE CREW ON SITE"
        ])
    ]
    
    start_y = 270
    step_y = 200 if not is_reel else 260
    for idx, (num, title, items) in enumerate(sections):
        y = start_y + idx * step_y
        draw.rectangle([(64, y), (w - 64, y + 160)], fill=(12, 14, 18, 220), outline=(35, 42, 54), width=1)
        draw.text((90, y + 20), f"[{num}]  {title}", font=get_font(20, "condensed_bold"), fill=COLOR_ICY_BLUE)
        for j, item in enumerate(items):
            draw.text((90, y + 65 + j * 32), f"· {item}", font=font_mono, fill=COLOR_WHITE)
            
    draw_letterspaced(draw, (64, h - 68), "PREPARE TO DISCONNECT · NO CAMERAS ON DANCEFLOOR", font_mono, COLOR_SLATE, spacing=1)
    return img

def build_post_15(is_reel=False):
    """15 — TONIGHT (Liquid Chrome Corona Bloom & Climax)"""
    target_size = (1080, 1920) if is_reel else (1080, 1350)
    w, h = target_size
    img = load_khaos_artwork(15, target_size, scale=1.06, offset=(0, -40))
    img = apply_gradient_overlay(img, "bottom", height_px=int(h * 0.50), max_alpha=245)
    
    draw = ImageDraw.Draw(img)
    font_mono = get_font(18, "mono")
    
    # Header
    draw_letterspaced(draw, (w // 2, 90), "KHAOS 01 // SYSTEM FRACTURE", font_mono, COLOR_ICY_BLUE, spacing=4, align="center")
    
    # Center colossal TONIGHT in custom fractured type
    cy = int(h * 0.56)
    tonight_img = render_fractured_text("TONIGHT", height=120 if not is_reel else 145, style="fracture")
    img.paste(tonight_img, ((w - tonight_img.width) // 2, cy - 70), tonight_img)
    
    draw = ImageDraw.Draw(img)
    draw_letterspaced(draw, (w // 2, cy + 85), "DOORS OPEN 22:00 // SILO A", get_font(24, "mono"), COLOR_SILVER, spacing=3, align="center")
    draw_letterspaced(draw, (w // 2, cy + 145), "STRICTLY SOLD OUT // NO TICKETS AT THE DOOR", font_mono, COLOR_WHITE, spacing=2, align="center")
    draw_letterspaced(draw, (w // 2, cy + 185), "NO PHONES ON THE DANCEFLOOR · LEAVE YOUR EGO OUTSIDE", font_mono, COLOR_SLATE, spacing=2, align="center")
    
    # Wordmark footer
    wordmark = render_khaos_wordmark(640, 135, style="fracture")
    img.paste(wordmark, ((w - 640) // 2, h - 180), wordmark)
    return img

POST_BUILDERS = {
    1: build_post_01,
    2: build_post_02,
    3: build_post_03,
    4: build_post_04,
    5: build_post_05,
    6: build_post_06,
    7: build_post_07,
    8: build_post_08,
    9: build_post_09,
    10: build_post_10,
    11: build_post_11,
    12: build_post_12,
    13: build_post_13,
    14: build_post_14,
    15: build_post_15
}

REEL_POST_IDS = [1, 4, 7, 8, 9, 10, 13, 15]

def crop_1x1_square(img_4x5):
    w, h = img_4x5.size
    sq_size = min(w, h)
    top = (h - sq_size) // 2
    return img_4x5.crop((0, top, w, top + sq_size))

def export_reusable_assets():
    print("Exporting reusable KHAOS graphic elements...")
    wm_fracture = render_khaos_wordmark(1080, 240, style="fracture")
    wm_fracture.save(os.path.join(ASSETS_DIR, "khaos_wordmark_fractured.png"))
    wm_fracture.save(os.path.join(ARTIFACTS_DIR, "khaos_wordmark_fractured.png"))
    
    wm_glitch = render_khaos_wordmark(1080, 240, style="glitch")
    wm_glitch.save(os.path.join(ASSETS_DIR, "khaos_wordmark_glitch.png"))
    wm_glitch.save(os.path.join(ARTIFACTS_DIR, "khaos_wordmark_glitch.png"))
    
    wm_solid = render_khaos_wordmark(1080, 240, style="solid")
    wm_solid.save(os.path.join(ASSETS_DIR, "khaos_wordmark_solid.png"))
    wm_solid.save(os.path.join(ARTIFACTS_DIR, "khaos_wordmark_solid.png"))
    
    ch_img = Image.new("RGBA", (400, 400), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(ch_img)
    draw_crosshair(cdraw, 200, 200, size=50, color=COLOR_WHITE, width=2)
    draw_crosshair(cdraw, 100, 100, size=25, color=COLOR_ICY_BLUE, width=1)
    draw_crosshair(cdraw, 300, 100, size=25, color=COLOR_ICY_BLUE, width=1)
    draw_crosshair(cdraw, 100, 300, size=25, color=COLOR_ICY_BLUE, width=1)
    draw_crosshair(cdraw, 300, 300, size=25, color=COLOR_ICY_BLUE, width=1)
    ch_img.save(os.path.join(ASSETS_DIR, "khaos_crosshairs_set.png"))
    ch_img.save(os.path.join(ARTIFACTS_DIR, "khaos_crosshairs_set.png"))
    
    scan = create_horizontal_scanlines(1080, 1350, intensity=50, gap=4)
    scan.save(os.path.join(ASSETS_DIR, "khaos_scanlines_overlay.png"))
    scan.save(os.path.join(ARTIFACTS_DIR, "khaos_scanlines_overlay.png"))
    print("Reusable assets saved.")

def generate_edition_metadata():
    print("Compiling KHAOS edition metadata...")
    posts = [
        {
            "id": "01",
            "fileStem": "KHAOS_IG_POST_01",
            "phase": "PHASE 1 — INTRODUCING KHAOS",
            "title": "THE FIRST SIGNAL",
            "date": "10 WEEKS OUT // FRIDAY 20:00",
            "archetype": "Signal Anomaly / Glitch Interference",
            "archetypeDescription": "Mysterious opening transmission introducing the KHAOS identity. Liquid chrome ribbon cutting through a digital scanline matrix in deep obsidian space.",
            "artworkUsage": "Dynamic liquid chrome ribbon with horizontal scanline interference blocks.",
            "reelAvailable": True,
            "typography": "Custom KHAOS Glitch Wordmark + Fractured Geometric Alphabet + SFNSMono",
            "safeArea": "Centered glyph and title securely within Y=200..1050; tick marks for 1:1 Instagram profile crop.",
            "caption": "Signal 001.\n\nAn anomaly detected in the soundscape.\n\nNot everything needs to follow the predictable pattern. A new frequency is entering the Mauritian underground.\n\nNo announcements yet. Just a shift in atmospheric pressure.\n\nSound is arriving.\n\n// KHAOS COLLECTIVE\n// CHAPTER I: SYSTEM FRACTURE\n// FREQ 142.0 MHz\n\n#khaoscollective #undergroundtechno #mauritiustechno #hypnotictechno #systemfracture #glitcharchitecture #liquidchrome"
        },
        {
            "id": "02",
            "fileStem": "KHAOS_IG_POST_02",
            "phase": "PHASE 1 — INTRODUCING KHAOS",
            "title": "THE MANIFESTO",
            "date": "9 WEEKS OUT // TUESDAY 19:00",
            "archetype": "Typography-Led Composition",
            "archetypeDescription": "Modernist Swiss editorial typography on deep graphite void. Abstract metallic artwork is restrained strictly to razor-thin 130px accent rules at top and bottom.",
            "artworkUsage": "Razor-thin sheared metallic boundary rules framing editorial text.",
            "reelAvailable": False,
            "typography": "Custom KHAOS Fractured Alphabet + SFNSMono 16pt + Regular 21pt",
            "safeArea": "Manifesto tenets [01] to [04] structured cleanly within central safe bounds.",
            "caption": "We challenge repetition. We break conventions.\n\nOur manifesto:\n\n[01] DESTRUCTION OF THE PREDICTABLE.\nRejecting commercial club formulas, VIP divisions, and playlist conformity.\n\n[02] ACOUSTIC RIGIDITY & HYPNOTIC CONTINUITY.\nCurating fast, dark, groove-laden rhythms with absolute 25 Hz sub-bass integrity.\n\n[03] A RADICAL DANCEFLOOR SANCTUARY.\nA community built on bodily autonomy, radical safety, mutual respect, and pure freedom.\n\n[04] ZERO COMPROMISE. NO NOSTALGIA.\nForward-leaning electronic sound. Leave your ego outside the door.\n\nThis is our foundation.\n\n#khaosmanifesto #undergroundculture #technocollective #mauritiuselectronic #noharassment #saferspace #puretechno"
        },
        {
            "id": "03",
            "fileStem": "KHAOS_IG_POST_03",
            "phase": "PHASE 1 — INTRODUCING KHAOS",
            "title": "THE IDENTITY",
            "date": "8 WEEKS OUT // FRIDAY 20:00",
            "archetype": "Signature Brand Monolith",
            "archetypeDescription": "Signature monolithic KHAOS wordmark centered in pure obsidian negative space, flanked by liquid chrome corner accents.",
            "artworkUsage": "Liquid chrome ribbons entering from 4 corners, leaving central 70% void.",
            "reelAvailable": False,
            "typography": "Custom KHAOS Fractured Wordmark (860px) + Fractured Alphabet + SFNSMono",
            "safeArea": "Central monolithic wordmark and motto framed with 64px padding.",
            "caption": "KHAOS.\n\nMore than an event. More than a party.\n\nAn uncompromising underground techno collective based in Mauritius.\n\nSound. Movement. Unity.\n\nFollow the signal.\n\n#khaos #technocollective #brandidentity #undergroundtechno #mauritiusnightlife #electronicmusic"
        },
        {
            "id": "04",
            "fileStem": "KHAOS_IG_POST_04",
            "phase": "PHASE 2 — EVENT ANNOUNCEMENT",
            "title": "SAVE THE DATE",
            "date": "7 WEEKS OUT // SUNDAY 18:00",
            "archetype": "Sculptural Loop & Fractured Display",
            "archetypeDescription": "Monolithic vertical liquid chrome pillar with tectonic fissures, featuring fractured SAVE THE DATE lettering and custom date numerals.",
            "artworkUsage": "Fluid chrome monolithic pillar with specular refraction.",
            "reelAvailable": True,
            "typography": "Custom Fractured Display + Fractured Numerals 28.11.2026 + SFNSMono",
            "safeArea": "Central circular loop and date block centered within 1080x1080 grid crop.",
            "caption": "Lock the date.\n\nSaturday 28 November 2026.\n\nKHAOS 01: SYSTEM FRACTURE.\n\nSecret industrial location // Black River District.\nCapacity restricted to 350 dancers.\n\nPre-registration opens next week.\n\n#savethedate #khaos01 #mauritiustechno #blackriver #industrialtechno #technoevent"
        },
        {
            "id": "05",
            "fileStem": "KHAOS_IG_POST_05",
            "phase": "PHASE 2 — EVENT ANNOUNCEMENT",
            "title": "MAIN EVENT POSTER",
            "date": "6 WEEKS OUT // FRIDAY 19:00",
            "archetype": "Full Artwork Hero Event Poster",
            "archetypeDescription": "Centerpiece promotional event poster featuring a monumental biomechanical liquid chrome sculpture with full artist billing and ticket release protocol.",
            "artworkUsage": "Monumental liquid chrome crest anchoring the primary event announcement.",
            "reelAvailable": False,
            "typography": "Custom KHAOS Wordmark + Fractured Event Title + SFNSMono 16pt",
            "safeArea": "All critical event billing and artist names securely inside Y=240..1120.",
            "caption": "KHAOS COLLECTIVE PRESENTS:\n\nKHAOS 01: SYSTEM FRACTURE\n\nSaturday 28 November 2026\nDoors open 22:00\n\nLINEUP:\n· ARTIST 01 [International Headliner]\n· ARTIST 02 [Live Hardware Modular]\n· ARTIST 03 [Industrial Groove]\n· ARTIST 04 [Resident Opening Ritual]\n\nLocation: The Industrial Silo, Black River District\nSound System: 25 Hz Custom Tuned Multi-Point Concrete Stack\n\nPrivate ticket access link dispatched to registered members.\n\n#khaos #technoposter #mauritiusevents #undergroundrave #systemfracture #hypnotictechno"
        },
        {
            "id": "06",
            "fileStem": "KHAOS_IG_POST_06",
            "phase": "PHASE 2 — EVENT ANNOUNCEMENT",
            "title": "LINEUP REVEAL",
            "date": "5 WEEKS OUT // TUESDAY 18:00",
            "archetype": "Artwork Fragments & Lineup Hierarchy",
            "archetypeDescription": "Stratified horizontal liquid chrome ribbons framing top and bottom borders, leaving a clean dark obsidian void for a strong typographic artist hierarchy.",
            "artworkUsage": "Folded tectonic metallic sheets as top and bottom framing bands.",
            "reelAvailable": False,
            "typography": "Custom KHAOS Fractured Display + Fractured Numerals + SFNSMono",
            "safeArea": "All 4 artist cards positioned between Y=280..1060.",
            "caption": "The sound curation for Saturday 28 November:\n\n[01] ARTIST 01\nHypnotic, driving underground techno. Precision drum architecture and relentless momentum.\n\n[02] ARTIST 02 [LIVE]\nModular synthesizer improvisations, raw analog distortion & acid lines. Zero laptops.\n\n[03] ARTIST 03\nHigh-velocity industrial groove & hypnotic closing pressure.\n\n[04] ARTIST 04\nDeep textural ambient prelude & rhythmic frequency calibration.\n\nTickets via private allocation only.\n\n#khaoslineup #livehardware #modulartechno #undergrounddjs #mauritiustechno"
        },
        {
            "id": "07",
            "fileStem": "KHAOS_IG_POST_07",
            "phase": "PHASE 2 — EVENT ANNOUNCEMENT",
            "title": "DJ SPOTLIGHT 01 — HEADLINER",
            "date": "4 WEEKS OUT // THURSDAY 19:00",
            "archetype": "Cinematic DJ Video Integration",
            "archetypeDescription": "Cinematic live performance video window framed by liquid chrome curved visor, live audio telemetry, 142 BPM waveform HUD, and integrated typography.",
            "artworkUsage": "Fluid chrome visor and shroud framing central live performance video window.",
            "reelAvailable": True,
            "videoData": {
                "artist": "ARTIST 01",
                "role": "International Headliner",
                "bpm": "142 BPM",
                "key": "D-Minor",
                "timeSlot": "01:30 — 03:30",
                "hardware": "Pioneer CDJ-3000 / DJM-V10 / Eventide H90"
            },
            "typography": "Custom Fractured Artist Header + SFNSMono 16pt HUD",
            "safeArea": "Video viewport centered with HUD and artist details safely within bounds.",
            "caption": "Artist Spotlight 01 // ARTIST 01\n\nTaking over the peak-time ritual from 01:30 to 03:30.\n\nKnown for surgical percussive rhythm, deep sub frequencies, and uncompromising hypnotic velocity.\n\nTrack preview in reel.\n\nSaturday 28 November // The Industrial Silo.\n\n#artistspotlight #headliner #hypnotictechno #peaktime #khaos01 #djset"
        },
        {
            "id": "08",
            "fileStem": "KHAOS_IG_POST_08",
            "phase": "PHASE 2 — EVENT ANNOUNCEMENT",
            "title": "DJ SPOTLIGHT 02 — LIVE HARDWARE",
            "date": "3 WEEKS OUT // TUESDAY 19:00",
            "archetype": "Cinematic Video / Glitch Architecture",
            "archetypeDescription": "Helical liquid chrome spiral and horizontal displacement framing a modular hardware performance with live synthesizer telemetry.",
            "artworkUsage": "Helical chrome spiral and mercury droplets surrounding video frame.",
            "reelAvailable": True,
            "videoData": {
                "artist": "ARTIST 02",
                "role": "Live Modular Act",
                "bpm": "140 BPM",
                "key": "F-Minor",
                "timeSlot": "00:00 — 01:30",
                "hardware": "Elektron Octatrack DPS-1 / Erica Synths SynthrX / Roland TR-909"
            },
            "typography": "Custom Glitch Artist Header + SFNSMono 16pt",
            "safeArea": "Modular performance window framed by glitch telemetry.",
            "caption": "Artist Spotlight 02 // ARTIST 02 [LIVE]\n\nZero laptops. Zero pre-recorded sequences.\n\n90 minutes of pure live hardware improvisation using Eurorack modular, analog filters, and analog drum machines.\n\nTime slot: 00:00 — 01:30.\n\n#modulartechno #livehardware #elektron #synthrx #tr909 #analogtechno #khaoslive"
        },
        {
            "id": "09",
            "fileStem": "KHAOS_IG_POST_09",
            "phase": "PHASE 2 — EVENT ANNOUNCEMENT",
            "title": "DJ SPOTLIGHT 03 — CLOSING RITUAL",
            "date": "2.5 WEEKS OUT // FRIDAY 19:00",
            "archetype": "Asymmetric Spire Framing",
            "archetypeDescription": "Asymmetric aerodynamic liquid chrome blade cutting in from the right margin, framing a vertical performance video on the left.",
            "artworkUsage": "Asymmetrical liquid chrome blade defining right third of frame.",
            "reelAvailable": True,
            "videoData": {
                "artist": "ARTIST 03",
                "role": "Closing Ritual",
                "bpm": "144 BPM",
                "key": "A-Minor",
                "timeSlot": "03:30 — 06:00",
                "hardware": "Vinyl Turntables / AlphaTheta Euphoria / Custom Rotary"
            },
            "typography": "Custom Fractured Artist Header + SFNSMono 16pt",
            "safeArea": "Asymmetric left video container and text within safe area.",
            "caption": "Artist Spotlight 03 // ARTIST 03\n\nThe closing ritual: 03:30 to 06:00.\n\nRaw industrial momentum, heavy groove, and relentless pressure as dawn enters the silo courtyard.\n\nStay until the final frequency.\n\n#closingritual #industrialtechno #rawtechno #siloafterhours #khaosmauritius"
        },
        {
            "id": "10",
            "fileStem": "KHAOS_IG_POST_10",
            "phase": "PHASE 3 — THE CULTURE",
            "title": "THE SOUND",
            "date": "2 WEEKS OUT // TUESDAY 20:00",
            "archetype": "Acoustic Visualization & Macro Chrome",
            "archetypeDescription": "Kinetic liquid chrome cymatic wave ripples with acoustic frequency crosshairs and audio spectrum markers.",
            "artworkUsage": "Macro fluid metal ripple crest with shockwave folds.",
            "reelAvailable": True,
            "typography": "Custom Fractured Header + Solid Display + SFNSMono 16pt",
            "safeArea": "Central acoustic ripple and text within safe area.",
            "caption": "The Sound of KHAOS.\n\nFast. Hypnotic. Groovy. Driving. Dark.\n\nWe do not play generic EDM drops. We do not follow commercial radio structures.\n\nWe curate a continuous acoustic journey powered by 25 Hz sub-bass enclosures, engineered for psychological release.\n\nThe dancefloor is an instrument.\n\n#khaossound #technoaesthetics #subbass #funktionone #hypnoticgroove #puretechno"
        },
        {
            "id": "11",
            "fileStem": "KHAOS_IG_POST_11",
            "phase": "PHASE 3 — THE CULTURE",
            "title": "THE CODE",
            "date": "10 DAYS OUT // WEDNESDAY 19:00",
            "archetype": "Cultural Code / Community Manifesto",
            "archetypeDescription": "Architectural monolithic chrome block with shear fissures, hairline metallic framing borders, and custom fractured typography.",
            "artworkUsage": "Monolithic tectonic chrome block with micro-crevasses and weeping silver.",
            "reelAvailable": False,
            "typography": "Custom Fractured Header + Fractured Numerals + SFNSMono 16pt",
            "safeArea": "The 4 code principles neatly bounded inside safe margins.",
            "caption": "The KHAOS Dancefloor Code:\n\n[01] RADICAL INCLUSIVITY & AUTONOMY\nA sanctuary for all identities, backgrounds, and bodies. Wear what you want. Be who you are.\n\n[02] ZERO TOLERANCE FOR HARASSMENT\nAny racism, sexism, homophobia, transphobia, or non-consensual behavior results in immediate permanent ban.\n\n[03] NO PHONES ON THE DANCEFLOOR\nProtect the sanctuary. Cameras and flash are strictly prohibited. Be present in the sound.\n\n[04] LEAVE YOUR EGO AT THE DOOR\nNo VIP tables. No bottle service. No backstage status. We exist as one before the sound system.\n\nRespect the space. Respect each other.\n\n#dancefloorcode #saferspace #inclusiverave #technocommunity #nopartyphotos #khaosvalues"
        },
        {
            "id": "12",
            "fileStem": "KHAOS_IG_POST_12",
            "phase": "PHASE 3 — THE CULTURE",
            "title": "THE VENUE / EXPERIENCE",
            "date": "8 DAYS OUT // FRIDAY 18:00",
            "archetype": "Mixed-Media Architectural Blueprint",
            "archetypeDescription": "Subterranean brutalist cavern archway with mercury pool merged with technical GPS coordinate stamps and venue specifications.",
            "artworkUsage": "Industrial brutalist cavern perspective draped in liquid chrome.",
            "reelAvailable": False,
            "typography": "Custom Fractured Header + SFNSMono 16pt",
            "safeArea": "Coordinates and venue specs aligned inside safe margins.",
            "caption": "The Venue // The Industrial Silo\n\nLocation: Black River District · 20.3541° S · 57.3682° E\n\nRaw reinforced concrete structure with 18-metre natural reverb acoustics, open-air cooling yard, and custom multi-point sound system.\n\nDetailed access guide and private shuttle coordinates dispatched via email to all ticket holders.\n\nZero on-site private parking. Use the official shuttles.\n\n#industrialsilo #blackriver #technolocation #concreteacoustics #khaosvenue"
        },
        {
            "id": "13",
            "fileStem": "KHAOS_IG_POST_13",
            "phase": "PHASE 4 — ANTICIPATION",
            "title": "COUNTDOWN — 07 DAYS",
            "date": "7 DAYS OUT // SATURDAY 18:00",
            "archetype": "Giant Fractured Countdown & Glitch",
            "archetypeDescription": "Colossal fractured numeral 07 intersecting digital glitch scanlines and a bursting liquid chrome sphere in obsidian void.",
            "artworkUsage": "Bursting chrome sphere and suspended mercury droplets.",
            "reelAvailable": True,
            "typography": "Custom Colossal Glitch Numeral 07 + Fractured Display + SFNSMono 16pt",
            "safeArea": "Numeral 07 and ticket warning positioned within 1:1 safe crop.",
            "caption": "07 DAYS REMAINING.\n\nSaturday 28 November · The Industrial Silo.\n\nTicket status: 85% of capacity claimed.\nCapacity capped at 350 dancers. No door sales under any circumstance.\n\nSound system engineering complete. The room is calibrated for 142 BPM.\n\nClaim final tickets via link in bio.\n\n#countdown #7days #technorave #systemfracture #khaoscountdown"
        },
        {
            "id": "14",
            "fileStem": "KHAOS_IG_POST_14",
            "phase": "PHASE 4 — ANTICIPATION",
            "title": "FINAL INFORMATION",
            "date": "3 DAYS OUT // WEDNESDAY 19:00",
            "archetype": "Editorial Information Architecture",
            "archetypeDescription": "Precision-engineered structural chrome beams and joints framing 4 structured practical cards on deep void for 100% mobile readability.",
            "artworkUsage": "Structural chrome beams and knurled fluid joints.",
            "reelAvailable": False,
            "typography": "Custom Fractured Header + Bold 20pt + SFNSMono 16pt",
            "safeArea": "All 4 practical cards placed within safe mobile reading zone.",
            "caption": "Essential event logistics for Saturday 28 November:\n\n[01] TIMETABLE\nDoors open 22:00 sharp. First sound 22:30. Curfew 06:00. Arrive early to experience the full ritual.\n\n[02] SHUTTLE LOGISTICS\nPickups from Grand Baie (21:30) and Flic-en-Flac (22:00). Returns every 45 min from 04:30.\n\n[03] ADMISSION\nValid ID + digital ticket QR code required. Strict 18+ policy. Strictly no tickets sold at door.\n\n[04] CARE & SANCTUARY\nFree water stations. Earplugs at entrance. Care crew on site.\n\nPrepare your mind.\n\n#eventinfo #technologistica #shuttleinfo #mauritiustechno #khaosguide"
        },
        {
            "id": "15",
            "fileStem": "KHAOS_IG_POST_15",
            "phase": "PHASE 4 — ANTICIPATION",
            "title": "TONIGHT",
            "date": "EVENT DAY // SATURDAY 14:00",
            "archetype": "Atmospheric Cinematic Climax",
            "archetypeDescription": "Explosive liquid chrome bloom and suspended mercury droplets in obsidian void with colossal fractured TONIGHT typography.",
            "artworkUsage": "Explosive liquid chrome corona bloom in pure void.",
            "reelAvailable": True,
            "videoData": {
                "track": "KHAOS 01 SYSTEM FRACTURE (Original Signal)",
                "bpm": "142 BPM",
                "key": "D-Minor",
                "timeSlot": "DOORS 22:00 // SILO A"
            },
            "typography": "Custom Colossal Fractured TONIGHT + Fractured Wordmark + SFNSMono",
            "safeArea": "TONIGHT summons and doors text centered inside 1080x1080 crop.",
            "caption": "TONIGHT.\n\nKHAOS 01: SYSTEM FRACTURE.\n\nDoors open 22:00.\nThe Industrial Silo // Black River District.\n\nStrictly sold out. Zero door sales.\n\nNo phones on the dancefloor.\nLeave your ego outside.\n\nSee you in the sub-bass.\n\n// KHAOS COLLECTIVE\n\n#tonight #khaos01 #systemfracture #undergroundtechno #puretechno #thevoidawaits"
        }
    ]
    
    edition_meta = {
        "id": "edition_khaos_01_system_fracture",
        "editionNumber": "KH01",
        "title": "KHAOS // EDITION 01: SYSTEM FRACTURE",
        "chapter": "KHAOS Collective — Transmission 01: System Fracture & Glitch Architecture",
        "tagline": "The debut campaign for KHAOS Mauritius. Reference-led sculptural liquid chrome, folded tectonic surfaces, custom fractured typography, and glitch architecture.",
        "status": "ready",
        "basePath": "/campaign/editions/edition_khaos_01_system_fracture",
        "primaryFamily": {
            "id": "sculptural-chrome",
            "name": "Sculptural Liquid Chrome"
        },
        "secondaryFamilies": [
            {
                "id": "folded-surfaces",
                "name": "Folded Liquid Surfaces"
            }
        ],
        "inactiveFamilies": [
            "pearlescent-silver",
            "translucent-glass",
            "reflective-globes"
        ],
        "conceptSummary": "Reference-Led Debut Campaign for KHAOS Collective. Strictly monochromatic chrome, silver, graphite, and pure obsidian void with subtle icy blue accents. Developed from 20 uploaded poster explorations with 15 completely original artworks, custom System Fracture and Glitch Architecture typography, diverse layout archetypes (Full Artworks, Fragments, Typography-Led, Mixed-Media, and Cinematic Video), 1:1 safe crops, and 9:16 motion reels.",
        "postCount": len(posts),
        "createdAt": "2026-11-09T14:00:00.000Z",
        "colorSystem": "Strict Monochromatic (Liquid Chrome, Silver, Obsidian Black, Subtle Icy Blue)",
        "archetypes": [
            "Signal Anomaly / Glitch Interference",
            "Typography-Led Composition",
            "Signature Brand Monolith",
            "Sculptural Loop & Fractured Display",
            "Full Artwork Hero Event Poster",
            "Artwork Fragments & Lineup Hierarchy",
            "Cinematic DJ Video Integration",
            "Acoustic Visualization & Macro Chrome",
            "Cultural Code / Community Manifesto",
            "Mixed-Media Architectural Blueprint",
            "Giant Fractured Countdown & Glitch",
            "Editorial Information Architecture",
            "Atmospheric Cinematic Climax"
        ],
        "posts": posts
    }
    
    # Save edition_data.json as direct post array matching studio standard
    data_path = os.path.join(OUT_DIR, "edition_data.json")
    with open(data_path, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)
    print(f"Saved {data_path}")
    
    # Copy to public folder
    pub_data_path = os.path.join(PUBLIC_POSTS_DIR, "..", "edition_data.json")
    pub_data_path = os.path.abspath(pub_data_path)
    os.makedirs(os.path.dirname(pub_data_path), exist_ok=True)
    with open(pub_data_path, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)
        
    # Copy to artifact folder
    art_data_path = os.path.join(ARTIFACTS_DIR, "khaos_edition_data.json")
    with open(art_data_path, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)
    
    # Update editions manifests
    manifest_paths = [
        os.path.join(ROOT, "campaign", "editions_manifest.json"),
        os.path.join(ROOT, "public", "campaign", "editions_manifest.json")
    ]
    
    for mp in manifest_paths:
        if os.path.exists(mp):
            try:
                with open(mp, "r", encoding="utf-8") as mf:
                    mdata = json.load(mf)
                
                editions = mdata.get("editions", [])
                existing_idx = next((i for i, e in enumerate(editions) if e.get("id") == edition_meta["id"]), None)
                
                manifest_entry = {
                    "id": edition_meta["id"],
                    "editionNumber": edition_meta["editionNumber"],
                    "title": edition_meta["title"],
                    "chapter": edition_meta["chapter"],
                    "tagline": edition_meta["tagline"],
                    "status": "ready",
                    "basePath": edition_meta["basePath"],
                    "primaryFamily": edition_meta["primaryFamily"],
                    "secondaryFamilies": edition_meta["secondaryFamilies"],
                    "inactiveFamilies": edition_meta["inactiveFamilies"],
                    "conceptSummary": edition_meta["conceptSummary"],
                    "postCount": 15,
                    "colorSystem": edition_meta["colorSystem"],
                    "archetypes": edition_meta["archetypes"],
                    "createdAt": edition_meta["createdAt"]
                }
                
                if existing_idx is not None:
                    editions[existing_idx] = manifest_entry
                else:
                    editions.insert(0, manifest_entry)
                    
                mdata["editions"] = editions
                mdata["activeEditionId"] = edition_meta["id"]
                
                with open(mp, "w", encoding="utf-8") as mf:
                    json.dump(mdata, mf, indent=2, ensure_ascii=False)
                print(f"Updated manifest {mp}")
            except Exception as e:
                print(f"Error updating manifest {mp}: {e}")

def render_instagram_grid_preview():
    """Renders a realistic 3-column Instagram Grid preview showing all 15 posts."""
    print("Generating 3-column Instagram Grid preview...")
    cols = 3
    rows = 5
    cell_size = 360
    gap = 4
    header_h = 140
    
    gw = cols * cell_size + (cols - 1) * gap + 32
    gh = header_h + rows * cell_size + (rows - 1) * gap + 32
    
    grid_img = Image.new("RGBA", (gw, gh), (12, 14, 18, 255))
    gdraw = ImageDraw.Draw(grid_img)
    
    # Grid Header (Instagram profile bar)
    gdraw.text((24, 28), "KHAOS // MAURITIUS", font=get_font(20, "bold"), fill=COLOR_WHITE)
    gdraw.text((24, 56), "15 POSTS · 2.4K FOLLOWERS · UNDERGROUND ELECTRONIC CULTURE", font=get_font(13, "mono"), fill=COLOR_SLATE)
    gdraw.line([(16, 95), (gw - 16, 95)], fill=(35, 42, 54), width=1)
    
    for idx, pid in enumerate(range(1, 16)):
        r = idx // cols
        c = idx % cols
        x = 16 + c * (cell_size + gap)
        y = header_h + r * (cell_size + gap)
        
        sq_path = os.path.join(POSTS_DIR, f"KHAOS_IG_POST_{pid:02d}_sq.jpg")
        if os.path.exists(sq_path):
            sq_img = Image.open(sq_path).resize((cell_size, cell_size), Image.Resampling.LANCZOS)
            grid_img.paste(sq_img, (x, y))
            
            # Post index overlay badge
            badge_d = ImageDraw.Draw(grid_img)
            badge_d.rectangle([(x + 8, y + 8), (x + 64, y + 32)], fill=(5, 5, 5, 200), outline=(50, 60, 75))
            badge_d.text((x + 14, y + 12), f"#{pid:02d}", font=get_font(12, "mono"), fill=COLOR_ICY_BLUE)
            
            if pid in REEL_POST_IDS:
                badge_d.rectangle([(x + cell_size - 40, y + 8), (x + cell_size - 8, y + 32)], fill=(5, 5, 5, 200))
                badge_d.polygon([(x + cell_size - 30, y + 14), (x + cell_size - 30, y + 26), (x + cell_size - 18, y + 20)], fill=COLOR_WHITE)
                
    preview_path = os.path.join(OUT_DIR, "khaos_instagram_grid_preview.jpg")
    pub_preview_path = os.path.join(ROOT, "public", "campaign", "editions", "edition_khaos_01_system_fracture", "khaos_instagram_grid_preview.jpg")
    art_preview_path = os.path.join(ARTIFACTS_DIR, "khaos_instagram_grid_preview.jpg")
    
    grid_img.convert("RGB").save(preview_path, quality=95, optimize=True)
    grid_img.convert("RGB").save(pub_preview_path, quality=95, optimize=True)
    grid_img.convert("RGB").save(art_preview_path, quality=95, optimize=True)
    print(f"Grid preview saved to {preview_path}")

def render_all_posts():
    print("==================================================")
    print("RENDERING KHAOS 15-POST INSTAGRAM CAMPAIGN")
    print("==================================================")
    
    export_reusable_assets()
    generate_edition_metadata()
    
    for pid in range(1, 16):
        builder = POST_BUILDERS.get(pid)
        if not builder:
            continue
            
        print(f"Rendering Post {pid:02d}...")
        
        # 1. 4:5 Feed Flyer (1080x1350)
        img_4x5 = builder(is_reel=False)
        base_stem = f"KHAOS_IG_POST_{pid:02d}"
        
        jpg_path = os.path.join(POSTS_DIR, f"{base_stem}.jpg")
        png_path = os.path.join(POSTS_DIR, f"{base_stem}.png")
        img_4x5.convert("RGB").save(jpg_path, quality=95, optimize=True)
        img_4x5.save(png_path)
        
        # Mirror to public and artifact directories
        pub_jpg = os.path.join(PUBLIC_POSTS_DIR, f"{base_stem}.jpg")
        pub_png = os.path.join(PUBLIC_POSTS_DIR, f"{base_stem}.png")
        img_4x5.convert("RGB").save(pub_jpg, quality=95, optimize=True)
        img_4x5.save(pub_png)
        
        art_jpg = os.path.join(ARTIFACTS_DIR, f"khaos_{base_stem}.jpg")
        img_4x5.convert("RGB").save(art_jpg, quality=95, optimize=True)
        
        # 2. 1:1 Safe Crop (1080x1080)
        img_1x1 = crop_1x1_square(img_4x5)
        sq_path = os.path.join(POSTS_DIR, f"{base_stem}_sq.jpg")
        img_1x1.convert("RGB").save(sq_path, quality=95, optimize=True)
        
        pub_sq = os.path.join(PUBLIC_POSTS_DIR, f"{base_stem}_sq.jpg")
        img_1x1.convert("RGB").save(pub_sq, quality=95, optimize=True)
        
        art_sq = os.path.join(ARTIFACTS_DIR, f"khaos_{base_stem}_sq.jpg")
        img_1x1.convert("RGB").save(art_sq, quality=95, optimize=True)
        
        # 3. 9:16 Vertical Reel (1080x1920) if applicable
        if pid in REEL_POST_IDS:
            img_reel = builder(is_reel=True)
            reel_jpg_path = os.path.join(POSTS_DIR, f"{base_stem}_reel.jpg")
            reel_png_path = os.path.join(POSTS_DIR, f"{base_stem}_reel.png")
            img_reel.convert("RGB").save(reel_jpg_path, quality=95, optimize=True)
            img_reel.save(reel_png_path)
            
            pub_reel = os.path.join(PUBLIC_POSTS_DIR, f"{base_stem}_reel.jpg")
            img_reel.convert("RGB").save(pub_reel, quality=95, optimize=True)
            
            art_reel = os.path.join(ARTIFACTS_DIR, f"khaos_{base_stem}_reel.jpg")
            img_reel.convert("RGB").save(art_reel, quality=95, optimize=True)
            print(f"  -> Generated 4:5, 1:1 safe crop, and 9:16 reel for Post {pid:02d}")
        else:
            print(f"  -> Generated 4:5 and 1:1 safe crop for Post {pid:02d}")
            
    render_instagram_grid_preview()
    print("==================================================")
    print("ALL 15 KHAOS POSTS SUCCESSFULLY GENERATED!")
    print("==================================================")

if __name__ == "__main__":
    render_all_posts()
