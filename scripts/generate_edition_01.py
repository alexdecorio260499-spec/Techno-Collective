#!/usr/bin/env python3
"""
RUPTURE Studio — Edition 01 Campaign Generator
Visual Direction:
  - Primary Family: Sculptural Liquid Chrome
  - Secondary Family: Folded Liquid Surfaces
  - Strictly Inactive: Pearlescent Silver Fluid, Translucent Glass Membrane, Reflective Globes & Rings
Outputs to:
  - campaign/editions/edition_01_hydraulic_void/posts/
  - public/campaign/editions/edition_01_hydraulic_void/posts/
"""

import os
import sys
import json
from PIL import Image, ImageDraw, ImageFont

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

FONT_HELVETICA_TTC = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_MONO_TTF = "/System/Library/Fonts/SFNSMono.ttf"

def get_font(size, weight="regular"):
    idx_map = { "regular": 0, "bold": 1, "condensed_bold": 4, "light": 7, "condensed_black": 9 }
    if weight == "mono":
        if os.path.exists(FONT_MONO_TTF):
            return ImageFont.truetype(FONT_MONO_TTF, size)
        return ImageFont.load_default()
    idx = idx_map.get(weight, 0)
    try:
        return ImageFont.truetype(FONT_HELVETICA_TTC, size, index=idx)
    except Exception:
        return ImageFont.load_default()

COLOR_WHITE = (255, 255, 255)
COLOR_OFFWHITE = (235, 238, 242)
COLOR_SILVER = (195, 202, 212)
COLOR_SLATE = (110, 118, 132)
COLOR_DARK_SLATE = (45, 50, 60)
COLOR_CHARCOAL = (24, 26, 32)
COLOR_VOID = (8, 9, 12)

COLOR_PALE_CYAN = (122, 231, 255)
COLOR_ICY_BLUE = (94, 197, 255)
COLOR_LAVENDER = (196, 181, 253)
COLOR_ULTRAVIOLET = (154, 112, 255)
COLOR_MOLTEN_RED = (255, 51, 68)

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

def apply_gradient_overlay(base_img, direction="bottom", height_px=550, max_alpha=220, color=(8, 9, 12)):
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

def draw_technical_frame(draw, width=1080, height=1350, margin=54, color=COLOR_DARK_SLATE, corner_len=24):
    left, top = margin, margin
    right, bottom = width - margin, height - margin
    draw.line([(left, top), (left + corner_len, top)], fill=color, width=1)
    draw.line([(left, top), (left, top + corner_len)], fill=color, width=1)
    draw.line([(right, top), (right - corner_len, top)], fill=color, width=1)
    draw.line([(right, top), (right, top + corner_len)], fill=color, width=1)
    draw.line([(left, bottom), (left + corner_len, bottom)], fill=color, width=1)
    draw.line([(left, bottom), (left, bottom - corner_len)], fill=color, width=1)
    draw.line([(right, bottom), (right - corner_len, bottom)], fill=color, width=1)
    draw.line([(right, bottom), (right, bottom - corner_len)], fill=color, width=1)
    draw.line([(left - 10, 135), (left, 135)], fill=(65, 70, 80), width=1)
    draw.line([(right, 135), (right + 10, 135)], fill=(65, 70, 80), width=1)
    draw.line([(left - 10, 1215), (left, 1215)], fill=(65, 70, 80), width=1)
    draw.line([(right, 1215), (right + 10, 1215)], fill=(65, 70, 80), width=1)

def draw_header_meta(draw, post_num, family_label, right_tag="RUPTURE // EDITION 01"):
    font_mono = get_font(18, "mono")
    font_bold = get_font(20, "bold")
    draw.text((64, 68), "RUPTURE", font=font_bold, fill=COLOR_WHITE)
    draw.text((195, 70), f"// {post_num} · {family_label}", font=font_mono, fill=COLOR_SLATE)
    draw_letterspaced(draw, (1080 - 64, 70), right_tag, font_mono, COLOR_SILVER, spacing=1, align="right")
    draw.line([(64, 108), (1080 - 64, 108)], fill=(40, 45, 55), width=1)

def draw_footer_meta(draw, left_tag="CHAPTER I: CHROME & FOLDED SURFACES", right_tag="LINK IN BIO // RUPTURE.MU"):
    font_mono = get_font(16, "mono")
    draw.line([(64, 1242), (1080 - 64, 1242)], fill=(40, 45, 55), width=1)
    draw.text((64, 1262), left_tag, font=font_mono, fill=COLOR_SLATE)
    draw_letterspaced(draw, (1080 - 64, 1262), right_tag, font_mono, COLOR_SLATE, spacing=1, align="right")

def draw_translucent_panel(base_img, xy, fill_color=(10, 12, 16, 210), border_color=None):
    overlay = Image.new("RGBA", base_img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle(xy, fill=fill_color)
    if border_color:
        d.rectangle(xy, outline=border_color, width=1)
    return Image.alpha_composite(base_img.convert("RGBA"), overlay)

# ----------------- 15 POSTS FOR EDITION 01 -----------------

def gen_post_01():
    # POST 01: The First Signal (Family: Sculptural Liquid Chrome)
    base = load_master_artwork("RUPTURE_M15_v1.jpg", (1080, 1350), scale=1.08, offset=(0, -60))
    base = apply_gradient_overlay(base, direction="bottom", height_px=450, max_alpha=200)
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 01", "SCULPTURAL CHROME", "SIGNAL 001 // FREQ 142.0 MHz")
    draw_footer_meta(draw, "SCULPTURAL CHROME + FOLDED SURFACES", "INITIAL TRANSMISSION")
    
    font_mono = get_font(20, "mono")
    font_bold = get_font(68, "condensed_bold")
    font_sub = get_font(24, "regular")
    
    cy = 820
    draw_letterspaced(draw, (540, cy), "ANOMALY IN THE SOUNDSCAPE", font_mono, COLOR_PALE_CYAN, spacing=4, align="center")
    draw.line([(420, cy + 34), (660, cy + 34)], fill=COLOR_PALE_CYAN, width=1)
    draw_letterspaced(draw, (540, cy + 50), "SOMETHING IS SHIFTING.", font_bold, COLOR_WHITE, spacing=1, align="center")
    draw_letterspaced(draw, (540, cy + 135), "NOT EVERYTHING NEEDS TO FOLLOW THE PATTERN.", font_sub, COLOR_SILVER, spacing=2, align="center")
    draw_letterspaced(draw, (540, cy + 195), "LAT -20.3541° / LON 57.3682° · STAND BY", font_mono, (85, 95, 110), spacing=2, align="center")
    return img

def gen_post_02():
    # POST 02: The Manifesto (Family: Folded Liquid Surfaces)
    base = load_master_artwork("RUPTURE_M23_v1.jpg", (1080, 1350), scale=1.05, offset=(0, 260))
    base = apply_gradient_overlay(base, direction="top", height_px=750, max_alpha=245)
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 02", "FOLDED SURFACES", "DOC REF: RUP-M01")
    draw_footer_meta(draw, "RUPTURE COLLECTIVE // FOUNDED 2026", "A CULTURE OF FREEDOM")
    
    font_mono = get_font(18, "mono")
    font_title = get_font(72, "condensed_bold")
    font_body = get_font(25, "regular")
    font_item = get_font(22, "bold")
    
    y = 200
    draw_letterspaced(draw, (80, y), "OUR ETHOS // OUR PURPOSE", font_mono, COLOR_PALE_CYAN, spacing=3)
    y += 40
    draw.text((80, y), "WE DO NOT REPEAT.", font=font_title, fill=COLOR_WHITE)
    y += 76
    draw.text((80, y), "WE DO NOT CONFORM.", font=font_title, fill=COLOR_SILVER)
    y += 105
    draw.line([(80, y), (1000, y)], fill=(60, 68, 82), width=1)
    
    manifesto_points = [
        ("01", "BREAKING AWAY FROM THE PREDICTABLE", "Rejecting commercial club templates, VIP tables, and commercial electronic cliches."),
        ("02", "A SPACE FOR HYPNOTIC & DRIVING TECHNO", "Fast, dark, groove-laden rhythms curated with uncompromising sonic integrity."),
        ("03", "AN INCLUSIVE, LIBERATED COMMUNITY", "A dancefloor built on safety, mutual respect, zero judgement, and complete expression."),
        ("04", "NO BOUNDARIES. NO EXPECTATIONS.", "Come for the music. Leave your ego at the door.")
    ]
    y += 35
    for num, headline, desc in manifesto_points:
        draw.text((80, y), f"[{num}]", font=font_mono, fill=COLOR_PALE_CYAN)
        draw.text((140, y), headline, font=font_item, fill=COLOR_WHITE)
        draw.text((140, y + 32), desc, font=font_body, fill=COLOR_SILVER)
        y += 92
    return img

def gen_post_03():
    # POST 03: The Name / Identity (Family: Folded Liquid Surfaces)
    base = load_master_artwork("RUPTURE_M21_v1.jpg", (1080, 1350), scale=1.15, offset=(0, 0))
    base = draw_translucent_panel(base, (64, 460, 1016, 820), fill_color=(8, 10, 14, 185), border_color=(45, 55, 70, 255))
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 03", "FOLDED SURFACES", "RUPTURE BRAND LAUNCH")
    draw_footer_meta(draw, "MAURITIUS · UNDERGROUND ELECTRONIC MUSIC", "EST. 2026")
    
    font_logo = get_font(128, "condensed_black")
    font_sub = get_font(28, "condensed_bold")
    font_mono = get_font(18, "mono")
    
    cy = 505
    draw_letterspaced(draw, (540, cy), "R U P T U R E", font_logo, COLOR_WHITE, spacing=14, align="center")
    draw.line([(240, cy + 145), (840, cy + 145)], fill=COLOR_PALE_CYAN, width=1)
    draw_letterspaced(draw, (540, cy + 165), "UNDERGROUND TECHNO COLLECTIVE", font_sub, COLOR_PALE_CYAN, spacing=5, align="center")
    draw_letterspaced(draw, (540, cy + 225), "MAURITIUS · CONCEPT 03: LIQUID GEOMETRY · EST. 2026", font_mono, COLOR_SILVER, spacing=2, align="center")
    return img

def gen_post_04():
    # POST 04: Save The Date (Family: Folded Liquid Surfaces)
    base = load_master_artwork("RUPTURE_M37_v1.jpg", (1080, 1350), scale=1.1, offset=(0, -40))
    base = apply_gradient_overlay(base, direction="bottom", height_px=550, max_alpha=220)
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 04", "FOLDED SURFACES", "SAVE THE DATE")
    draw_footer_meta(draw, "LIMITED CAPACITY (400) // REGISTER FOR ACCESS", "RUPTURE.MU")
    
    font_badge = get_font(20, "mono")
    font_edition = get_font(32, "condensed_bold")
    font_hero = get_font(96, "condensed_black")
    font_date = get_font(48, "bold")
    font_body = get_font(24, "regular")
    font_mono = get_font(18, "mono")
    
    y = 220
    draw.rectangle([(80, y), (310, y + 42)], outline=COLOR_ICY_BLUE, width=1)
    draw.text((100, y + 10), "SAVE THE DATE", font=font_badge, fill=COLOR_ICY_BLUE)
    y += 75
    draw_letterspaced(draw, (80, y), "RUPTURE PRESENTS // EDITION 01", font_edition, COLOR_SILVER, spacing=2)
    y += 50
    draw.text((80, y), "HYDRAULIC", font=font_hero, fill=COLOR_WHITE)
    y += 98
    draw.text((80, y), "VOID", font=font_hero, fill=COLOR_WHITE)
    y += 180
    draw.line([(80, y), (1000, y)], fill=(60, 70, 85), width=1)
    y += 35
    draw.text((80, y), "DATE: [FRIDAY DD . MM . YYYY]", font=font_date, fill=COLOR_WHITE)
    y += 62
    draw.text((80, y), "LOCATION: [SECRET INDUSTRIAL QUARRY // NORTH COAST, MAURITIUS]", font=font_body, fill=COLOR_SILVER)
    y += 38
    draw_letterspaced(draw, (80, y), "HOURS: 22:00 — 06:00 // 8 HOURS OF SOUND // FULL LINEUP NEXT", font_mono, COLOR_ICY_BLUE, spacing=1)
    return img

def gen_post_05():
    # POST 05: The Main Event Poster (Hero / Family: Folded Liquid Surfaces with Molten Crimson 1/2)
    base = load_master_artwork("RUPTURE_M43_v1.jpg", (1080, 1350), scale=1.05, offset=(0, 0))
    base = draw_translucent_panel(base, (64, 180, 1016, 420), fill_color=(8, 10, 14, 180), border_color=(45, 55, 70, 255))
    base = draw_translucent_panel(base, (64, 820, 1016, 1190), fill_color=(8, 10, 14, 210), border_color=(45, 55, 70, 255))
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 05", "FOLDED SURFACES (HERO)", "OFFICIAL EVENT POSTER")
    draw_footer_meta(draw, "PRESALE ONLY · NO DOOR TICKETS · 18+ STRICT", "SECURE PASSES AT RUPTURE.MU")
    
    font_mono = get_font(18, "mono")
    font_title = get_font(104, "condensed_black")
    font_lineup = get_font(52, "bold")
    font_details = get_font(23, "regular")
    
    y = 205
    draw_letterspaced(draw, (90, y), "RUPTURE // EDITION 01 — AN UNDERGROUND TECHNO GATHERING", font_mono, COLOR_PALE_CYAN, spacing=1)
    y += 36
    draw.text((90, y), "HYDRAULIC VOID", font=font_title, fill=COLOR_WHITE)
    y += 118
    # Molten Crimson Caustic Slit (Restrained Red 1/2)
    draw.line([(90, y), (990, y)], fill=COLOR_MOLTEN_RED, width=3)
    draw.text((90, y + 10), "4 ARTISTS · 8 HOURS · HIGH-PERFORMANCE CUSTOM ACOUSTICS", font=font_mono, fill=COLOR_SILVER)
    
    y = 470
    draw.rectangle([(90, y), (310, y + 36)], outline=COLOR_MOLTEN_RED, width=1)
    draw.text((105, y + 8), "OFFICIAL LINEUP", font=font_mono, fill=COLOR_MOLTEN_RED)
    y += 55
    artists = ["[ARTIST 01]", "[ARTIST 02]", "[ARTIST 03]", "[ARTIST 04]"]
    for i, a in enumerate(artists):
        draw.text((90, y), a, font=font_lineup, fill=COLOR_WHITE)
        draw.text((480, y + 16), f"// ACT 0{i+1}", font=font_mono, fill=COLOR_SLATE)
        y += 66
        
    y = 850
    draw_letterspaced(draw, (90, y), "EVENT SPECIFICATIONS & PROTOCOL", font_mono, COLOR_PALE_CYAN, spacing=2)
    y += 36
    draw.line([(90, y), (990, y)], fill=(50, 58, 70), width=1)
    y += 24
    draw.text((90, y), "DATE: [FRIDAY DD . MM . YYYY] · DOORS: 22:00 — 06:00", font=font_details, fill=COLOR_WHITE)
    y += 36
    draw.text((90, y), "VENUE: [SECRET INDUSTRIAL QUARRY / FORMER SILO, MAURITIUS]", font=font_details, fill=COLOR_SILVER)
    y += 36
    draw.text((90, y), "ACCESS: STRICTLY LIMITED TO 400 DANCERS · ADVANCE TICKETS ONLY", font=font_details, fill=COLOR_SILVER)
    y += 36
    draw_letterspaced(draw, (90, y), "TICKETS: PRESALE LINK IN BIO // NO RECORDING ON DANCEFLOOR", font_mono, COLOR_PALE_CYAN, spacing=1)
    return img

def gen_post_06():
    # POST 06: The Lineup (Family: Sculptural Liquid Chrome)
    base = load_master_artwork("RUPTURE_M28_v1.jpg", (1080, 1350), scale=1.05, offset=(0, 240))
    base = apply_gradient_overlay(base, direction="top", height_px=700, max_alpha=240)
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 06", "SCULPTURAL CHROME", "CURATED ARTIST PROGRAM")
    draw_footer_meta(draw, "TIMETABLE RELEASED EVENT WEEK", "TICKETS: RUPTURE.MU")
    
    font_mono = get_font(18, "mono")
    font_title = get_font(84, "condensed_black")
    font_artist = get_font(46, "bold")
    font_spec = get_font(20, "mono")
    
    y = 190
    draw_letterspaced(draw, (80, y), "RUPTURE 001 // THE SOUND ARCHITECTURE", font_mono, COLOR_ICY_BLUE, spacing=2)
    y += 36
    draw.text((80, y), "THE LINEUP", font=font_title, fill=COLOR_WHITE)
    y += 105
    draw.line([(80, y), (1000, y)], fill=(60, 70, 85), width=1)
    
    lineup_data = [
        ("01", "[ARTIST 01]", "HARDWARE LIVE SET · 142 BPM · MODULAR SYNTHESIS"),
        ("02", "[ARTIST 02]", "HYPNOTIC & DRIVING · DEEP SUB-BASS VINYL RIG"),
        ("03", "[ARTIST 03]", "RAW INDUSTRIAL GROOVE · FAST KINETIC TECHNO"),
        ("04", "[ARTIST 04]", "CLOSING RITUAL · RELENTLESS DRIVING PERCUSSION")
    ]
    y += 30
    for idx, name, spec in lineup_data:
        draw.text((80, y), f"ACT {idx}", font=font_mono, fill=COLOR_ICY_BLUE)
        draw.text((200, y - 4), name, font=font_artist, fill=COLOR_WHITE)
        draw.text((200, y + 44), spec, font=font_spec, fill=COLOR_SILVER)
        y += 102
        draw.line([(80, y - 16), (1000, y - 16)], fill=(35, 42, 52), width=1)
    return img

def gen_post_07(artist_name="[ARTIST 01]", act_num="01", genre="MODULAR LIVE ACT · 142 BPM", 
                 bio="Pioneering raw analog modular tension and physical sub-bass dynamics. An uninterrupted hardware performance pushing acoustic frequencies."):
    # POST 07: Artist Spotlight (Family: Sculptural Liquid Chrome — using RUPTURE_M74 mercury glyph!)
    base = load_master_artwork("RUPTURE_M74_v1.jpg", (1080, 1350), scale=1.1, offset=(100, 0))
    base = draw_translucent_panel(base, (64, 180, 1016, 1180), fill_color=(8, 10, 14, 190), border_color=(45, 55, 70, 255))
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 07", "SCULPTURAL CHROME", f"SERIES: ACT {act_num} OF 04")
    draw_footer_meta(draw, "LISTEN TO EXCLUSIVE PODCAST: RUPTURE.MU/SOUND", "RUPTURE 001")
    
    font_mono = get_font(18, "mono")
    font_badge = get_font(20, "mono")
    font_name = get_font(90, "condensed_black")
    font_genre = get_font(28, "condensed_bold")
    font_body = get_font(24, "regular")
    
    y = 220
    draw.rectangle([(90, y), (360, y + 38)], outline=COLOR_ICY_BLUE, width=1)
    draw.text((105, y + 9), f"ARTIST SPOTLIGHT // {act_num}", font=font_badge, fill=COLOR_ICY_BLUE)
    y += 70
    draw.text((90, y), artist_name, font=font_name, fill=COLOR_WHITE)
    y += 115
    draw.line([(90, y), (990, y)], fill=COLOR_ICY_BLUE, width=2)
    y += 30
    draw_letterspaced(draw, (90, y), genre, font_genre, COLOR_PALE_CYAN, spacing=2)
    y += 65
    draw_letterspaced(draw, (90, y), "SONIC PROFILE & DIRECTION", font_mono, COLOR_SILVER, spacing=2)
    y += 36
    words = bio.split(" ")
    lines = []
    curr = ""
    for w in words:
        if len(curr + " " + w) > 54:
            lines.append(curr)
            curr = w
        else:
            curr = curr + " " + w if curr else w
    if curr:
        lines.append(curr)
    for l in lines:
        draw.text((90, y), l, font=font_body, fill=COLOR_OFFWHITE)
        y += 38
    y += 45
    draw.line([(90, y), (990, y)], fill=(45, 52, 65), width=1)
    y += 25
    draw.text((90, y), f"SET TYPE: HARDWARE LIVE (90 MIN) · TIMETABLE SLOT: [01:00 — 02:30]", font=font_mono, fill=COLOR_SILVER)
    y += 32
    draw.text((90, y), "SOUND DIRECTION: FAST, DRIVING, HYPNOTIC, UNAPOLOGETIC", font=font_mono, fill=COLOR_PALE_CYAN)
    return img

def gen_post_08():
    # POST 08: The Sound (Family: Sculptural Liquid Chrome — using RUPTURE_M54 curling mercury tidal wave!)
    base = load_master_artwork("RUPTURE_M54_v1.jpg", (1080, 1350), scale=1.08, offset=(0, 0))
    base = apply_gradient_overlay(base, direction="bottom", height_px=650, max_alpha=230)
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 08", "SCULPTURAL CHROME", "ACOUSTIC PHILOSOPHY")
    draw_footer_meta(draw, "CUSTOM ACOUSTIC REINFORCEMENT", "25 Hz — 20,000 Hz")
    
    font_mono = get_font(20, "mono")
    font_hero = get_font(84, "condensed_black")
    font_sub = get_font(26, "regular")
    
    y = 520
    draw_letterspaced(draw, (80, y), "ACOUSTIC SPECIFICATION & PRINCIPLES", font_mono, COLOR_ICY_BLUE, spacing=2)
    y += 40
    draw.text((80, y), "NO SHORTCUTS.", font=font_hero, fill=COLOR_WHITE)
    y += 92
    draw.text((80, y), "NO COMPROMISES.", font=font_hero, fill=COLOR_WHITE)
    y += 92
    draw.text((80, y), "JUST THE SOUND.", font=font_hero, fill=COLOR_ICY_BLUE)
    y += 130
    draw.line([(80, y), (1000, y)], fill=(60, 70, 85), width=1)
    y += 28
    draw.text((80, y), "FAST. HYPNOTIC. DRIVING. GROOVY TECHNO.", font=font_sub, fill=COLOR_OFFWHITE)
    y += 38
    draw.text((80, y), "A custom-tuned high-fidelity multi-point sound system engineered specifically", font=font_sub, fill=COLOR_SILVER)
    y += 34
    draw.text((80, y), "for physical sub-bass resonance, clarity at high pressure, and zero distortion.", font=font_sub, fill=COLOR_SILVER)
    return img

def gen_post_09():
    # POST 09: The Rules / The Code (Family: Folded Liquid Surfaces — using RUPTURE_M80 stepped obsidian terraces!)
    base = load_master_artwork("RUPTURE_M80_v1.jpg", (1080, 1350), scale=1.05, offset=(0, 200))
    base = apply_gradient_overlay(base, direction="top", height_px=800, max_alpha=245)
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 09", "FOLDED SURFACES", "DANCEFLOOR PRINCIPLES")
    draw_footer_meta(draw, "AWARENESS TEAM PRESENT THROUGHOUT", "SAFE SPACE CHARTER")
    
    font_mono = get_font(18, "mono")
    font_title = get_font(76, "condensed_bold")
    font_rule = get_font(21, "bold")
    font_desc = get_font(19, "regular")
    
    y = 190
    draw_letterspaced(draw, (80, y), "COMMUNITY STANDARD // NON-NEGOTIABLE", font_mono, COLOR_PALE_CYAN, spacing=2)
    y += 36
    draw.text((80, y), "THE CODE", font=font_title, fill=COLOR_WHITE)
    y += 90
    draw.line([(80, y), (1000, y)], fill=(55, 65, 80), width=1)
    
    rules = [
        ("01", "RESPECT EVERYONE", "Zero tolerance for racism, sexism, homophobia, transphobia or discrimination."),
        ("02", "CONSENT IS MANDATORY", "Non-negotiable. Any unwanted physical or verbal violation results in immediate removal."),
        ("03", "NO PHOTOS · NO FLASH", "Protect the sacred atmosphere. Put your phone away and experience the sound together."),
        ("04", "NO JUDGEMENT", "Dress as you want. Dance as you want. Absolute freedom of personal expression."),
        ("05", "LOOK OUT FOR EACH OTHER", "If someone appears unwell, overwhelmed, or unsafe, notify our Awareness Team immediately."),
        ("06", "COME FOR THE MUSIC", "Leave your ego outside. The dancefloor is a collective sanctuary.")
    ]
    y += 25
    for num, headline, desc in rules:
        draw.text((80, y), f"[{num}]", font=font_mono, fill=COLOR_PALE_CYAN)
        draw.text((140, y), headline, font=font_rule, fill=COLOR_WHITE)
        draw.text((140, y + 26), desc, font=font_desc, fill=COLOR_SILVER)
        y += 68
    y += 15
    draw.rectangle([(80, y), (1000, y + 42)], fill=(20, 24, 32), outline=COLOR_PALE_CYAN, width=1)
    draw.text((100, y + 12), "AWARENESS CREW IDENTIFIABLE BY PINK ARMBANDS WILL BE ACTIVE ALL NIGHT.", font=font_mono, fill=COLOR_PALE_CYAN)
    return img

def gen_post_10():
    # POST 10: The Experience (Family: Folded Liquid Surfaces — using RUPTURE_M73 razor-sheared planes with ultraviolet!)
    base = load_master_artwork("RUPTURE_M73_v1.jpg", (1080, 1350), scale=1.08, offset=(0, 0))
    base = apply_gradient_overlay(base, direction="bottom", height_px=550, max_alpha=215)
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 10", "FOLDED SURFACES", "ATMOSPHERE & LIGHT")
    draw_footer_meta(draw, "SPATIAL ARCHITECTURE BY RUPTURE", "IMMERSIVE ENVIRONMENT")
    
    font_mono = get_font(18, "mono")
    font_hero = get_font(60, "condensed_bold")
    font_body = get_font(24, "regular")
    
    y = 660
    draw_letterspaced(draw, (80, y), "SENSORY ARCHITECTURE // LIGHT & VOID", font_mono, COLOR_ULTRAVIOLET, spacing=2)
    y += 40
    draw.text((80, y), "MONOCHROMATIC LIGHT.", font=font_hero, fill=COLOR_WHITE)
    y += 72
    draw.text((80, y), "DENSE HAZE.", font=font_hero, fill=COLOR_SILVER)
    y += 72
    draw.text((80, y), "PURE KINETIC MOMENTUM.", font=font_hero, fill=COLOR_ULTRAVIOLET)
    y += 105
    draw.line([(80, y), (1000, y)], fill=(60, 68, 85), width=1)
    y += 25
    draw.text((80, y), "No strobe overload. No distracting LED walls. No generic club gimmicks.", font=font_body, fill=COLOR_OFFWHITE)
    y += 36
    draw.text((80, y), "An architectural lighting environment designed to dissolve physical boundaries", font=font_body, fill=COLOR_SILVER)
    y += 34
    draw.text((80, y), "and sync directly with the hypnotic drive of the sound.", font=font_body, fill=COLOR_SILVER)
    return img

def gen_post_11():
    # POST 11: Venue / Location Reveal (Family: Folded Liquid Surfaces — using RUPTURE_M85 brutalist fluid terraces!)
    base = load_master_artwork("RUPTURE_M85_v1.jpg", (1080, 1350), scale=1.05, offset=(0, 240))
    base = apply_gradient_overlay(base, direction="top", height_px=750, max_alpha=240)
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 11", "FOLDED SURFACES", "SECRET LOCATION REVEAL")
    draw_footer_meta(draw, "PRIVATE PROPERTY // ENTRY ONLY WITH VALID TICKET", "COORDINATES ENCRYPTED")
    
    font_mono = get_font(18, "mono")
    font_title = get_font(84, "condensed_black")
    font_sub = get_font(32, "condensed_bold")
    font_body = get_font(23, "regular")
    
    y = 190
    draw_letterspaced(draw, (80, y), "LOCATION DISPATCH // INDUSTRIAL ARCHITECTURE", font_mono, COLOR_ICY_BLUE, spacing=2)
    y += 36
    draw.text((80, y), "[THE INDUSTRIAL SILO]", font=font_title, fill=COLOR_WHITE)
    y += 98
    draw_letterspaced(draw, (80, y), "BLACK RIVER DISTRICT · MAURITIUS", font_sub, COLOR_SILVER, spacing=3)
    y += 65
    draw.rectangle([(80, y), (560, y + 42)], outline=COLOR_ICY_BLUE, width=1)
    draw.text((96, y + 11), "GPS: -20.3541° S · 57.3682° E", font=font_mono, fill=COLOR_ICY_BLUE)
    y += 75
    draw.line([(80, y), (1000, y)], fill=(55, 65, 80), width=1)
    y += 28
    draw.text((80, y), "A decommissioned raw concrete silo structure transformed for one night only.", font=font_body, fill=COLOR_OFFWHITE)
    y += 36
    draw.text((80, y), "Features high-volume acoustic chambers, industrial ventilation, an outdoor", font=font_body, fill=COLOR_SILVER)
    y += 34
    draw.text((80, y), "recovery courtyard, and secure on-site parking.", font=font_body, fill=COLOR_SILVER)
    y += 48
    draw_letterspaced(draw, (80, y), "EXACT PINPOINT & SHUTTLE DETAILS EMAILED TO TICKET HOLDERS 24H PRIOR.", font_mono, COLOR_PALE_CYAN, spacing=1)
    return img

def gen_post_12(days_left=7):
    # POST 12: The Countdown (Family: Sculptural Liquid Chrome — using RUPTURE_M58 aerodynamic chrome dagger!)
    base = load_master_artwork("RUPTURE_M58_v1.jpg", (1080, 1350), scale=1.08, offset=(0, 0))
    base = apply_gradient_overlay(base, direction="bottom", height_px=550, max_alpha=220)
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 12", "SCULPTURAL CHROME", f"T-MINUS {days_left} DAYS")
    draw_footer_meta(draw, "FINAL PASSES REMAINING // RUPTURE.MU", "RUPTURE 001")
    
    font_mono = get_font(20, "mono")
    font_num = get_font(150, "condensed_black")
    font_state = get_font(44, "condensed_bold")
    font_sub = get_font(24, "regular")
    
    y = 520
    draw_letterspaced(draw, (80, y), "COUNTDOWN SEQUENCE INITIATED", font_mono, COLOR_ICY_BLUE, spacing=2)
    y += 30
    draw.text((80, y), f"{days_left} DAYS", font=font_num, fill=COLOR_WHITE)
    y += 165
    draw_letterspaced(draw, (80, y), "THE FREQUENCY IS CHANGING.", font_state, COLOR_ICY_BLUE, spacing=2)
    y += 75
    draw.line([(80, y), (1000, y)], fill=(60, 70, 85), width=1)
    y += 25
    draw.text((80, y), "DATE: [FRIDAY DD . MM . YYYY] · DOORS: 22:00 SHARP", font=font_sub, fill=COLOR_OFFWHITE)
    y += 36
    draw.text((80, y), "VENUE: [SECRET INDUSTRIAL SILO, MAURITIUS]", font=font_sub, fill=COLOR_SILVER)
    y += 36
    draw_letterspaced(draw, (80, y), "LESS THAN ONE WEEK UNTIL THE RUPTURE OCCURS.", font_mono, COLOR_PALE_CYAN, spacing=1)
    return img

def gen_post_13():
    # POST 13: Last Tickets / Reminder (Family: Folded Liquid Surfaces with Molten Crimson 2/2)
    base = load_master_artwork("RUPTURE_M138_v1.jpg", (1080, 1350), scale=1.05, offset=(0, 0))
    base = apply_gradient_overlay(base, direction="bottom", height_px=550, max_alpha=225)
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 13", "FOLDED SURFACES", "CAPACITY ALERT")
    draw_footer_meta(draw, "STRICT LIMIT 400 DANCERS · NO DOOR SALES", "SECURE NOW: RUPTURE.MU")
    
    font_mono = get_font(18, "mono")
    font_pill = get_font(20, "mono")
    font_title = get_font(92, "condensed_black")
    font_tier = get_font(24, "bold")
    font_callout = get_font(23, "regular")
    
    y = 520
    draw.rectangle([(80, y), (380, y + 40)], outline=COLOR_MOLTEN_RED, width=1)
    draw.text((95, y + 10), "● FINAL ALLOCATION ACTIVE", font=font_pill, fill=COLOR_MOLTEN_RED)
    y += 65
    draw.text((80, y), "LAST TICKETS", font=font_title, fill=COLOR_WHITE)
    y += 105
    draw.line([(80, y), (1000, y)], fill=COLOR_MOLTEN_RED, width=2)
    y += 30
    draw.text((80, y), "TIER 01 (EARLY ACCESS): SOLD OUT", font=font_tier, fill=COLOR_SLATE)
    y += 36
    draw.text((80, y), "TIER 02 (GENERAL RELEASE): SOLD OUT", font=font_tier, fill=COLOR_SLATE)
    y += 36
    draw.text((80, y), "TIER 03 (FINAL RELEASE): LESS THAN 15% REMAINING", font=font_tier, fill=COLOR_WHITE)
    y += 60
    draw.rectangle([(80, y), (1000, y + 74)], fill=(15, 18, 24), outline=(60, 70, 85), width=1)
    draw.text((100, y + 14), "STRICT CAPACITY: 400 DANCERS. FOR SAFETY AND DANCEFLOOR COMFORT,", font=font_callout, fill=COLOR_SILVER)
    draw.text((100, y + 42), "NO TICKETS WILL BE AVAILABLE AT THE DOOR UNDER ANY CIRCUMSTANCES.", font=font_callout, fill=COLOR_WHITE)
    return img

def gen_post_14():
    # POST 14: Final Information (Family: Sculptural Liquid Chrome — using RUPTURE_M45 chiseled chrome obelisk!)
    base = load_master_artwork("RUPTURE_M45_v1.jpg", (1080, 1350), scale=1.05, offset=(-180, 0))
    base = draw_translucent_panel(base, (64, 180, 1016, 1180), fill_color=(8, 10, 14, 215), border_color=(45, 55, 70, 255))
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 14", "SCULPTURAL CHROME", "PRACTICAL EVENT GUIDE")
    draw_footer_meta(draw, "AWARENESS CREW ON SITE THROUGHOUT", "RUPTURE 001 // MAURITIUS")
    
    font_mono = get_font(18, "mono")
    font_title = get_font(78, "condensed_bold")
    font_section = get_font(22, "bold")
    font_body = get_font(20, "regular")
    
    y = 205
    draw_letterspaced(draw, (90, y), "EVERYTHING YOU NEED TO KNOW BEFORE ARRIVING", font_mono, COLOR_PALE_CYAN, spacing=2)
    y += 36
    draw.text((90, y), "FINAL INFORMATION", font=font_title, fill=COLOR_WHITE)
    y += 90
    draw.line([(90, y), (990, y)], fill=(55, 65, 80), width=1)
    
    sections = [
        ("[ TIMETABLE ]", "Doors open: 22:00 sharp · Curfew: 06:00 · First artist on at 22:30.\nPlease arrive before 00:00 to avoid admission delays."),
        ("[ VENUE & ACCESS ]", "Secret venue location has been dispatched to all ticket holders via email.\nFollow signs on the approach road. Free secure parking on site."),
        ("[ ENTRY PROTOCOL ]", "Digital QR code tickets only (download in advance — low network area).\n18+ strictly enforced. Physical government photo ID mandatory."),
        ("[ CASHLESS BAR & CARE ]", "Cards and mobile pay only. Complimentary water refill stations.\nComplimentary high-fidelity earplugs available at the Info Desk.")
    ]
    y += 24
    for title, content in sections:
        draw.text((90, y), title, font=font_section, fill=COLOR_PALE_CYAN)
        y += 30
        for line in content.split("\n"):
            draw.text((90, y), line, font=font_body, fill=COLOR_OFFWHITE)
            y += 28
        y += 18
        draw.line([(90, y - 8), (990, y - 8)], fill=(35, 42, 54), width=1)
    return img

def gen_post_15():
    # POST 15: Tomorrow / Tonight (Family: Sculptural Liquid Chrome — using RUPTURE_M17 sweeping ribbons!)
    base = load_master_artwork("RUPTURE_M17_v1.jpg", (1080, 1350), scale=1.1, offset=(0, 0))
    base = apply_gradient_overlay(base, direction="bottom", height_px=550, max_alpha=200)
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw)
    draw_header_meta(draw, "POST 15", "SCULPTURAL CHROME", "TRANSMISSION COMPLETE")
    draw_footer_meta(draw, "DOORS OPEN 22:00 SHARP // [SECRET SILO]", "THE SHIFT OCCURS")
    
    font_mono = get_font(20, "mono")
    font_huge = get_font(138, "condensed_black")
    font_sub = get_font(38, "condensed_bold")
    font_details = get_font(24, "regular")
    
    y = 680
    draw_letterspaced(draw, (80, y), "THE WAIT IS OVER // ZERO DISTRACTIONS", font_mono, COLOR_PALE_CYAN, spacing=2)
    y += 35
    draw.text((80, y), "TONIGHT.", font=font_huge, fill=COLOR_WHITE)
    y += 155
    draw_letterspaced(draw, (80, y), "SEE YOU ON THE OTHER SIDE.", font_sub, COLOR_ICY_BLUE, spacing=3)
    y += 55
    draw.line([(80, y), (1000, y)], fill=(60, 70, 85), width=1)
    y += 25
    draw.text((80, y), "DOORS OPEN 22:00 · ARRIVE EARLY · RESPECT THE DANCEFLOOR", font=font_details, fill=COLOR_SILVER)
    return img

# ----------------- REUSABLE TEMPLATES FOR EDITION 01 -----------------
def generate_edition_01_templates():
    # Act 02 spotlight (Sculptural chrome)
    p2 = gen_post_07(artist_name="[ARTIST 02]", act_num="02", genre="HYPNOTIC & DRIVING · VINYL SETUP",
                     bio="Deep hypnotic grooves and undulating sub-bass frequencies. A mastery of vinyl momentum designed for late-night dancefloor meditation.")
    p2.save(os.path.join(OUTPUT_TEMPLATES, "ARTIST_SPOTLIGHT_ACT_02.png"))
    p2.save(os.path.join(OUTPUT_TEMPLATES, "ARTIST_SPOTLIGHT_ACT_02.jpg"), quality=95)
    p2.save(os.path.join(PUBLIC_TEMPLATES, "ARTIST_SPOTLIGHT_ACT_02.png"))
    p2.save(os.path.join(PUBLIC_TEMPLATES, "ARTIST_SPOTLIGHT_ACT_02.jpg"), quality=95)

    # Act 03 spotlight
    p3 = gen_post_07(artist_name="[ARTIST 03]", act_num="03", genre="RAW INDUSTRIAL GROOVE · 144 BPM",
                     bio="Fast, relentless, and unsparing. Layered analog percussion and distorted kick dynamics driving the energy into peak hour.")
    p3.save(os.path.join(OUTPUT_TEMPLATES, "ARTIST_SPOTLIGHT_ACT_03.png"))
    p3.save(os.path.join(OUTPUT_TEMPLATES, "ARTIST_SPOTLIGHT_ACT_03.jpg"), quality=95)
    p3.save(os.path.join(PUBLIC_TEMPLATES, "ARTIST_SPOTLIGHT_ACT_03.png"))
    p3.save(os.path.join(PUBLIC_TEMPLATES, "ARTIST_SPOTLIGHT_ACT_03.jpg"), quality=95)

    # Countdown variants
    c3 = gen_post_12(days_left=3)
    c3.save(os.path.join(OUTPUT_TEMPLATES, "COUNTDOWN_3_DAYS.png"))
    c3.save(os.path.join(OUTPUT_TEMPLATES, "COUNTDOWN_3_DAYS.jpg"), quality=95)
    c3.save(os.path.join(PUBLIC_TEMPLATES, "COUNTDOWN_3_DAYS.png"))
    c3.save(os.path.join(PUBLIC_TEMPLATES, "COUNTDOWN_3_DAYS.jpg"), quality=95)

POST_CONFIGS = [
    ("RUPTURE_IG_POST_01", gen_post_01, "01", "The First Signal", "Phase 1: Introducing the Collective", "RUPTURE_M15_v1.jpg", "Sculptural Liquid Chrome"),
    ("RUPTURE_IG_POST_02", gen_post_02, "02", "The Manifesto", "Phase 1: Introducing the Collective", "RUPTURE_M23_v1.jpg", "Folded Liquid Surfaces"),
    ("RUPTURE_IG_POST_03", gen_post_03, "03", "The Name / Identity", "Phase 1: Introducing the Collective", "RUPTURE_M21_v1.jpg", "Folded Liquid Surfaces"),
    ("RUPTURE_IG_POST_04", gen_post_04, "04", "Save The Date", "Phase 2: Event Announcement", "RUPTURE_M37_v1.jpg", "Folded Liquid Surfaces"),
    ("RUPTURE_IG_POST_05", gen_post_05, "05", "The Main Event Poster", "Phase 2: Event Announcement", "RUPTURE_M43_v1.jpg", "Folded Liquid Surfaces (Molten Crimson 1/2)"),
    ("RUPTURE_IG_POST_06", gen_post_06, "06", "The Lineup", "Phase 2: Event Announcement", "RUPTURE_M28_v1.jpg", "Sculptural Liquid Chrome"),
    ("RUPTURE_IG_POST_07", gen_post_07, "07", "Artist Spotlight", "Phase 2: Event Announcement", "RUPTURE_M74_v1.jpg", "Sculptural Liquid Chrome"),
    ("RUPTURE_IG_POST_08", gen_post_08, "08", "The Sound", "Phase 3: Culture & Experience", "RUPTURE_M54_v1.jpg", "Sculptural Liquid Chrome"),
    ("RUPTURE_IG_POST_09", gen_post_09, "09", "The Rules / The Code", "Phase 3: Culture & Experience", "RUPTURE_M80_v1.jpg", "Folded Liquid Surfaces"),
    ("RUPTURE_IG_POST_10", gen_post_10, "10", "The Experience", "Phase 3: Culture & Experience", "RUPTURE_M73_v1.jpg", "Folded Liquid Surfaces"),
    ("RUPTURE_IG_POST_11", gen_post_11, "11", "Venue / Location Reveal", "Phase 3: Culture & Experience", "RUPTURE_M85_v1.jpg", "Folded Liquid Surfaces"),
    ("RUPTURE_IG_POST_12", gen_post_12, "12", "The Countdown (7 Days)", "Phase 4: Building Anticipation", "RUPTURE_M58_v1.jpg", "Sculptural Liquid Chrome"),
    ("RUPTURE_IG_POST_13", gen_post_13, "13", "Last Tickets / Reminder", "Phase 4: Building Anticipation", "RUPTURE_M138_v1.jpg", "Folded Liquid Surfaces (Molten Crimson 2/2)"),
    ("RUPTURE_IG_POST_14", gen_post_14, "14", "Final Information", "Phase 4: Building Anticipation", "RUPTURE_M45_v1.jpg", "Sculptural Liquid Chrome"),
    ("RUPTURE_IG_POST_15", gen_post_15, "15", "Tomorrow / Tonight", "Phase 4: Building Anticipation", "RUPTURE_M17_v1.jpg", "Sculptural Liquid Chrome"),
]

def main():
    print("🚀 Generating Edition 01: Hydraulic Void (Chrome + Folded Surfaces)...")
    edition_data = []
    
    for filename_stem, gen_fn, post_id, title, phase, ref_art, family in POST_CONFIGS:
        print(f"Generating Post {post_id}: {title} [{family}]...")
        img_4x5 = gen_fn()
        
        # Save 4:5 Portrait
        png_path = os.path.join(OUTPUT_POSTS, f"{filename_stem}.png")
        jpg_path = os.path.join(OUTPUT_POSTS, f"{filename_stem}.jpg")
        img_4x5.save(png_path)
        img_4x5.save(jpg_path, quality=95)
        img_4x5.save(os.path.join(PUBLIC_POSTS, f"{filename_stem}.png"))
        img_4x5.save(os.path.join(PUBLIC_POSTS, f"{filename_stem}.jpg"), quality=95)
        
        # Also mirror to default campaign/posts for backwards compatibility
        img_4x5.save(os.path.join(ROOT, "campaign", "posts", f"{filename_stem}.png"))
        img_4x5.save(os.path.join(ROOT, "campaign", "posts", f"{filename_stem}.jpg"), quality=95)
        img_4x5.save(os.path.join(ROOT, "public", "campaign", f"{filename_stem}.png"))
        img_4x5.save(os.path.join(ROOT, "public", "campaign", f"{filename_stem}.jpg"), quality=95)
        
        # Save 1:1 Square Crop (Center Y=135..1215)
        img_1x1 = img_4x5.crop((0, 135, 1080, 1215))
        img_1x1.save(os.path.join(OUTPUT_POSTS, f"{filename_stem}_sq.jpg"), quality=95)
        img_1x1.save(os.path.join(PUBLIC_POSTS, f"{filename_stem}_sq.jpg"), quality=95)
        img_1x1.save(os.path.join(ROOT, "campaign", "posts", f"{filename_stem}_sq.jpg"), quality=95)
        img_1x1.save(os.path.join(ROOT, "public", "campaign", f"{filename_stem}_sq.jpg"), quality=95)
        
        # Brain directory copy for artifact embedding
        brain_dir = "/Users/alex/.gemini/antigravity/brain/caf6c4ea-9b06-4d9f-9428-74b197be24de"
        img_4x5.save(os.path.join(brain_dir, f"{filename_stem}.jpg"), quality=95)
        img_1x1.save(os.path.join(brain_dir, f"{filename_stem}_sq.jpg"), quality=95)

    print("Generating Edition 01 template variants...")
    generate_edition_01_templates()
    print("✨ Successfully generated Edition 01 assets!")

if __name__ == "__main__":
    main()
