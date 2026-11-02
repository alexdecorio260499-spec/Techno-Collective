#!/usr/bin/env python3
"""
RUPTURE Studio — Generator for Editions 16, 17, 18, 19, and 20
Completing the remaining unexplored pairwise combinations of the 5 approved artwork families:
- Edition 16: Prismatic Chrome (Translucent Glass Membrane + Sculptural Liquid Chrome)
- Edition 17: Nacreous Strata (Folded Liquid Surfaces + Pearlescent Silver Fluid)
- Edition 18: Toroidal Fault (Reflective Globes & Rings + Folded Liquid Surfaces)
- Edition 19: Nacreous Annulus (Pearlescent Silver Fluid + Reflective Globes & Rings)
- Edition 20: Tectonic Membrane (Folded Liquid Surfaces + Translucent Glass Membrane)
"""

import os
import sys
import json
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageEnhance

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MASTERS_DIR = os.path.join(ROOT, "artworks", "masters")
BRAIN_DIR = "/Users/alex/.gemini/antigravity/brain/caf6c4ea-9b06-4d9f-9428-74b197be24de"

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
COLOR_PEARL = (214, 218, 223)
COLOR_ULTRAVIOLET = (168, 108, 255)
COLOR_MAGENTA = (255, 45, 175)
COLOR_MOLTEN_RED = (255, 45, 60)
COLOR_AMBER = (255, 165, 30)
COLOR_EMERALD = (0, 245, 145)
COLOR_COBALT = (60, 130, 255)

def apply_chromatic_grade(img, mode="silver", intensity=0.82):
    rgb = img.convert("RGB")
    gray = ImageOps.grayscale(rgb)
    
    if mode == "silver" or mode == "monochrome":
        enhancer = ImageEnhance.Contrast(rgb)
        return enhancer.enhance(1.18)
        
    elif mode == "red" or mode == "crimson":
        tint = ImageOps.colorize(gray, black=(8, 0, 2), mid=(235, 22, 42), white=(255, 238, 242))
        return Image.blend(rgb, tint, intensity)
        
    elif mode == "purple" or mode == "ultraviolet":
        tint = ImageOps.colorize(gray, black=(12, 2, 20), mid=(165, 42, 245), white=(255, 238, 255))
        return Image.blend(rgb, tint, intensity)
        
    elif mode == "cyan" or mode == "cryogenic":
        tint = ImageOps.colorize(gray, black=(0, 8, 16), mid=(0, 212, 255), white=(225, 255, 255))
        return Image.blend(rgb, tint, intensity)
        
    elif mode == "amber" or mode == "gold":
        tint = ImageOps.colorize(gray, black=(14, 5, 0), mid=(255, 150, 18), white=(255, 250, 225))
        return Image.blend(rgb, tint, intensity)
        
    elif mode == "emerald" or mode == "toxic":
        tint = ImageOps.colorize(gray, black=(0, 12, 6), mid=(0, 245, 140), white=(220, 255, 240))
        return Image.blend(rgb, tint, intensity)
        
    elif mode == "duotone_purple_cyan":
        tint = ImageOps.colorize(gray, black=(24, 2, 42), mid=(152, 42, 225), white=(85, 242, 255))
        return Image.blend(rgb, tint, intensity)
        
    elif mode == "duotone_red_amber":
        tint = ImageOps.colorize(gray, black=(24, 2, 4), mid=(225, 28, 32), white=(255, 218, 85))
        return Image.blend(rgb, tint, intensity)
        
    elif mode == "inverted_platinum":
        inv = ImageOps.invert(gray)
        plat = ImageOps.colorize(inv, black=(18, 22, 28), mid=(175, 185, 200), white=(250, 252, 255))
        return ImageEnhance.Contrast(plat).enhance(1.22)
        
    return rgb

def load_master_artwork(filename, target_size=(1080, 1350), scale=1.06, offset=(0, -20), color_mode="silver", intensity=0.82):
    path = os.path.join(MASTERS_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing master artwork: {path}")
    raw = Image.open(path).convert("RGB")
    graded = apply_chromatic_grade(raw, mode=color_mode, intensity=intensity)
    img = graded.convert("RGBA")
    
    w, h = img.size
    tw, th = target_size
    scale_factor = max(tw / w, th / h) * scale
    nw, nh = int(w * scale_factor), int(h * scale_factor)
    img_resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2 + offset[0]
    top = (nh - th) // 2 + offset[1]
    cropped = img_resized.crop((left, top, left + tw, top + th))
    return cropped

def apply_gradient_overlay(base_img, direction="bottom", height_px=450, max_alpha=220, is_inverted=False):
    w, h = base_img.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    tint = (248, 250, 253) if is_inverted else (8, 9, 12)
    
    if direction == "bottom":
        start_y = h - height_px
        for y in range(start_y, h):
            alpha = int(max_alpha * ((y - start_y) / height_px) ** 1.3)
            d.line([(0, y), (w, y)], fill=(*tint, min(255, alpha)))
    elif direction == "top":
        for y in range(0, height_px):
            alpha = int(max_alpha * (1.0 - (y / height_px)) ** 1.3)
            d.line([(0, y), (w, y)], fill=(*tint, min(255, alpha)))
    elif direction == "full":
        for y in range(0, h):
            d.line([(0, y), (w, y)], fill=(*tint, min(255, max_alpha)))
    return Image.alpha_composite(base_img.convert("RGBA"), overlay)

def draw_translucent_panel(base_img, xy, fill_color=(10, 12, 16, 210), border_color=None):
    overlay = Image.new("RGBA", base_img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle(xy, fill=fill_color)
    if border_color:
        d.rectangle(xy, outline=border_color, width=1)
    return Image.alpha_composite(base_img.convert("RGBA"), overlay)

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

def draw_technical_frame(draw, accent_color=COLOR_PALE_CYAN, is_inverted=False):
    m = 48
    bl = 24
    line_col = accent_color
    hash_col = (180, 190, 205) if is_inverted else (55, 62, 75)
    
    draw.line([(m, m), (m + bl, m)], fill=line_col, width=1)
    draw.line([(m, m), (m, m + bl)], fill=line_col, width=1)
    draw.line([(1080 - m, m), (1080 - m - bl, m)], fill=line_col, width=1)
    draw.line([(1080 - m, m), (1080 - m, m + bl)], fill=line_col, width=1)
    draw.line([(m, 1350 - m), (m + bl, 1350 - m)], fill=line_col, width=1)
    draw.line([(m, 1350 - m), (m, 1350 - m - bl)], fill=line_col, width=1)
    draw.line([(1080 - m, 1350 - m), (1080 - m - bl, 1350 - m)], fill=line_col, width=1)
    draw.line([(1080 - m, 1350 - m), (1080 - m, 1350 - m - bl)], fill=line_col, width=1)
    draw.line([(m, 135), (m + 8, 135)], fill=hash_col, width=1)
    draw.line([(1080 - m - 8, 135), (1080 - m, 135)], fill=hash_col, width=1)
    draw.line([(m, 1215), (m + 8, 1215)], fill=hash_col, width=1)
    draw.line([(1080 - m - 8, 1215), (1080 - m, 1215)], fill=hash_col, width=1)

def draw_header_meta(draw, post_num, family_label, meta_right, accent_color=COLOR_PALE_CYAN, is_inverted=False):
    font_mono = get_font(15, "mono")
    h_text = COLOR_VOID if is_inverted else COLOR_WHITE
    bg_box = (235, 240, 248) if is_inverted else (18, 22, 28)
    bd_box = (190, 200, 215) if is_inverted else (50, 58, 70)
    meta_r = (80, 90, 105) if is_inverted else COLOR_SLATE
    
    draw_letterspaced(draw, (64, 68), f"RUPTURE // {post_num}", font_mono, h_text, spacing=2)
    draw.rectangle([(230, 68), (230 + len(family_label)*10 + 20, 88)], fill=bg_box, outline=bd_box)
    draw_letterspaced(draw, (240, 71), family_label, get_font(13, "mono"), accent_color, spacing=1)
    draw_letterspaced(draw, (1080 - 64, 68), meta_right, font_mono, meta_r, spacing=1, align="right")

def draw_footer_meta(draw, left_tag, right_tag, is_inverted=False):
    font_mono = get_font(14, "mono")
    col_l = (70, 80, 95) if is_inverted else (90, 100, 115)
    col_r = (60, 70, 85) if is_inverted else COLOR_SLATE
    draw_letterspaced(draw, (64, 1262), left_tag, font_mono, col_l, spacing=2)
    draw_letterspaced(draw, (1080 - 64, 1262), right_tag, font_mono, col_r, spacing=1, align="right")

def build_post_image(art_file, post_id, title, edition_title, family_name, family_role, color_mode="silver", accent_color=COLOR_PALE_CYAN, has_red=False):
    is_inv = (color_mode == "inverted_platinum")
    base = load_master_artwork(art_file, (1080, 1350), scale=1.06, offset=(0, -20), color_mode=color_mode, intensity=0.82)
    pid = int(post_id)
    
    panel_fill = (245, 248, 252, 230) if is_inv else (8, 10, 14, 215)
    panel_border = (195, 205, 220, 255) if is_inv else (45, 55, 70, 255)
    
    if pid in [1, 15]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=480, max_alpha=220, is_inverted=is_inv)
    elif pid in [2, 8]:
        base = apply_gradient_overlay(base, direction="top", height_px=750, max_alpha=245, is_inverted=is_inv)
    elif pid in [3]:
        base = draw_translucent_panel(base, (64, 460, 1016, 820), fill_color=panel_fill, border_color=panel_border)
    elif pid in [4, 11]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=560, max_alpha=230, is_inverted=is_inv)
    elif pid in [5]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=680, max_alpha=245, is_inverted=is_inv)
        base = apply_gradient_overlay(base, direction="top", height_px=360, max_alpha=200, is_inverted=is_inv)
    elif pid in [6, 14]:
        base = draw_translucent_panel(base, (64, 180, 1016, 1160), fill_color=panel_fill, border_color=panel_border)
    elif pid in [7, 9, 10]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=500, max_alpha=225, is_inverted=is_inv)
    elif pid in [12]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=600, max_alpha=230, is_inverted=is_inv)
    elif pid in [13]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=520, max_alpha=235, is_inverted=is_inv)

    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw, accent_color=accent_color, is_inverted=is_inv)
    draw_header_meta(draw, f"POST {post_id}", family_name.upper()[:16], f"{edition_title.upper()}", accent_color=accent_color, is_inverted=is_inv)
    draw_footer_meta(draw, f"RUPTURE // {edition_title.upper()}", f"CHAPTER SPECIFICATION", is_inverted=is_inv)

    c_white = COLOR_VOID if is_inv else COLOR_WHITE
    c_silver = (60, 70, 85) if is_inv else COLOR_SILVER
    c_pearl = (40, 50, 65) if is_inv else COLOR_PEARL
    c_slate = (85, 95, 115) if is_inv else COLOR_SLATE
    c_darkslate = (195, 205, 220) if is_inv else COLOR_DARK_SLATE

    font_mono = get_font(18, "mono")
    font_bold = get_font(68, "condensed_bold")
    font_sub = get_font(24, "regular")

    if pid == 1:
        cy = 820
        draw_letterspaced(draw, (540, cy), "NEW FREQUENCY DETECTED", font_mono, accent_color, spacing=4, align="center")
        draw.line([(420, cy + 34), (660, cy + 34)], fill=accent_color, width=1)
        draw_letterspaced(draw, (540, cy + 50), "SOMETHING IS SHIFTING.", font_bold, c_white, spacing=1, align="center")
        draw_letterspaced(draw, (540, cy + 135), "NOT EVERYTHING NEEDS TO FOLLOW THE PATTERN.", font_sub, c_silver, spacing=2, align="center")
        draw_letterspaced(draw, (540, cy + 195), f"CHAPTER: {edition_title.upper()} · STAND BY", font_mono, (85, 95, 110), spacing=2, align="center")

    elif pid == 2:
        y = 200
        draw_letterspaced(draw, (80, y), "OUR ETHOS // OUR PURPOSE", font_mono, accent_color, spacing=3)
        y += 40
        draw.text((80, y), "WE DO NOT REPEAT.", font=get_font(72, "condensed_bold"), fill=c_white)
        y += 76
        draw.text((80, y), "WE DO NOT CONFORM.", font=get_font(72, "condensed_bold"), fill=c_silver)
        y += 105
        draw.line([(80, y), (1000, y)], fill=c_darkslate, width=1)
        y += 35
        pts = [
            ("01", "BREAKING AWAY FROM CONVENTION", "Rejecting predictable nightlife templates and commercial electronic clichés."),
            ("02", "UNCOMPROMISING SONIC INTEGRITY", "Fast, hypnotic, dark and groove-laden rhythms curated with precision."),
            ("03", "A SACRED DANCEFLOOR SANCTUARY", "Safety, mutual respect, zero judgement, and complete bodily freedom."),
            ("04", "FREEDOM OF SOUND AND BODY", "Come for the music. Leave your ego at the door.")
        ]
        for num, headline, desc in pts:
            draw.text((80, y), f"[{num}]", font=font_mono, fill=accent_color)
            draw.text((140, y), headline, font=get_font(22, "bold"), fill=c_white)
            draw.text((140, y + 32), desc, font=get_font(24, "regular"), fill=c_silver)
            y += 92

    elif pid == 3:
        cy = 505
        font_logo = get_font(128, "condensed_black")
        draw_letterspaced(draw, (540, cy), "R U P T U R E", font_logo, c_white, spacing=14, align="center")
        draw.line([(240, cy + 145), (840, cy + 145)], fill=accent_color, width=1)
        draw_letterspaced(draw, (540, cy + 165), f"UNDERGROUND TECHNO COLLECTIVE", get_font(28, "condensed_bold"), accent_color, spacing=5, align="center")
        draw_letterspaced(draw, (540, cy + 225), f"MAURITIUS · {edition_title.upper()} · EST. 2026", font_mono, c_silver, spacing=2, align="center")

    elif pid == 4:
        y = 780
        draw_letterspaced(draw, (80, y), "COMMENCEMENT ANNOUNCEMENT //", font_mono, accent_color, spacing=3)
        y += 42
        draw.text((80, y), "SAVE THE DATE", font=get_font(96, "condensed_bold"), fill=c_white)
        y += 108
        draw.line([(80, y), (1000, y)], fill=c_darkslate, width=1)
        y += 36
        draw.text((80, y), "DATE:", font=font_mono, fill=c_slate)
        draw.text((220, y), "SATURDAY / 18 APRIL 2026", font=get_font(26, "bold"), fill=c_white)
        y += 46
        draw.text((80, y), "VENUE:", font=font_mono, fill=c_slate)
        draw.text((220, y), "SECRET INDUSTRIAL SILO · MAURITIUS", font=get_font(24, "regular"), fill=c_silver)
        y += 46
        draw.text((80, y), "HOURS:", font=font_mono, fill=c_slate)
        draw.text((220, y), "22:00 — 08:00 (EXTENDED SUNRISE SESSION)", font=font_mono, fill=accent_color)
        y += 50
        draw_letterspaced(draw, (80, y), "FULL LINEUP DROPS NEXT THURSDAY · CAPACITY STRICTLY CAPPED AT 400", font_mono, (90, 100, 115), spacing=1)

    elif pid == 5:
        y = 80
        draw_letterspaced(draw, (540, y), "RUPTURE // UNDERGROUND TECHNO COLLECTIVE", font_mono, COLOR_WHITE, spacing=3, align="center")
        y += 26
        draw_letterspaced(draw, (540, y), f"{edition_title.upper()} · SECRET INDUSTRIAL SILO", font_mono, COLOR_MOLTEN_RED, spacing=2, align="center")
        y += 40
        draw_letterspaced(draw, (540, y), "R U P T U R E", get_font(118, "condensed_black"), COLOR_WHITE, spacing=10, align="center")

        y = 750
        draw.line([(80, y), (1000, y)], fill=COLOR_MOLTEN_RED, width=2)
        y += 24
        draw_letterspaced(draw, (540, y), "INTERNATIONAL GUEST HEADLINER (BERLIN / DE)", font_mono, COLOR_MOLTEN_RED, spacing=3, align="center")
        y += 36
        draw_letterspaced(draw, (540, y), "CLAIR", get_font(74, "condensed_bold"), COLOR_WHITE, spacing=4, align="center")
        y += 74
        draw_letterspaced(draw, (540, y), "LIVE MODULAR SYNTHESIS // VINYL DIRECT CUT", font_mono, COLOR_SILVER, spacing=2, align="center")
        y += 40
        draw.line([(180, y), (900, y)], fill=COLOR_DARK_SLATE, width=1)
        y += 28
        draw_letterspaced(draw, (540, y), "SUPPORTING CURATION // COLD HYPNOTIC GROOVE", font_mono, COLOR_SLATE, spacing=2, align="center")
        y += 34
        lineup_str = "KALT  ·  ANIMA  ·  AXEL  ·  NVRMND"
        draw_letterspaced(draw, (540, y), lineup_str, get_font(32, "condensed_bold"), COLOR_WHITE, spacing=4, align="center")
        y += 56
        draw.line([(80, y), (1000, y)], fill=COLOR_DARK_SLATE, width=1)
        y += 22
        draw_letterspaced(draw, (80, y), "SAT 18 APR 2026 // 22:00 — 08:00", font_mono, COLOR_WHITE, spacing=2)
        draw_letterspaced(draw, (1000, y), "400 PASSES ONLY // 25 HZ SOUND RIG", font_mono, COLOR_MOLTEN_RED, spacing=2, align="right")

    elif pid == 6:
        y = 220
        draw_letterspaced(draw, (100, y), "PROGRAM ROSTER // 5 ARTISTS", font_mono, accent_color, spacing=3)
        y += 36
        draw.text((100, y), "THE LINEUP", font=get_font(72, "condensed_bold"), fill=c_white)
        y += 88
        draw.line([(100, y), (980, y)], fill=c_darkslate, width=1)
        y += 32
        acts = [
            ("01", "CLAIR [DE]", "HEADLINER // EXTENDED 3-HOUR CLOSING SET", "Fast, hypnotic, linear techno. Monolithic live textures.", "03:30 — 06:30", COLOR_MOLTEN_RED),
            ("02", "KALT", "LIVE MODULAR HARDWARE", "Raw analogue machine percussion and modular friction.", "02:00 — 03:30", accent_color),
            ("03", "ANIMA", "DARK HYPNOTIC GROOVE", "Deep rolling basslines, continuous psychoacoustic loops.", "00:30 — 02:00", c_white),
            ("04", "AXEL", "DIRECT VINYL SELECTION", "90s European Birmingham sound and relentless polyrhythms.", "23:00 — 00:30", c_silver),
            ("05", "NVRMND", "AMBIENT INTRO & FREQUENCY CALIBRATION", "Sub-bass pulse initialization, 25 Hz calibration.", "22:00 — 23:00", c_slate)
        ]
        for num, act, role, desc, slot, col in acts:
            draw.text((100, y), f"[{num}]", font=font_mono, fill=col)
            draw.text((160, y), act, font=get_font(32, "bold"), fill=c_white)
            draw_letterspaced(draw, (980, y + 4), slot, font_mono, col, spacing=1, align="right")
            draw.text((160, y + 36), role, font=get_font(18, "bold"), fill=col)
            draw.text((160, y + 60), desc, font=get_font(18, "regular"), fill=c_silver)
            y += 105
            draw.line([(100, y), (980, y)], fill=(32, 38, 48) if not is_inv else (210, 220, 230), width=1)
            y += 24

    elif pid == 7:
        y = 800
        draw_letterspaced(draw, (80, y), "CUSTOM ACOUSTIC RIG // 25 HZ FREQUENCY", font_mono, accent_color, spacing=3)
        y += 38
        draw.text((80, y), "SOUND IS A PHYSICAL FORCE.", font=get_font(64, "condensed_bold"), fill=c_white)
        y += 82
        draw.line([(80, y), (1000, y)], fill=c_darkslate, width=1)
        y += 32
        specs = [
            ("SUB LOW-END", "Custom 21\" subwoofers tuned flat to 25 Hz. Zero bass boom, pure physical displacement."),
            ("LINE ARRAYS", "Point-source precision horn-loaded arrays for clinical transient definition at 144 BPM."),
            ("LIMITERS", "Zero harsh top-end fatigue. Sound pressure maintained at 102 dBA continuous dancefloor envelope.")
        ]
        for title_s, desc_s in specs:
            draw.text((80, y), title_s, font=font_mono, fill=accent_color)
            draw.text((260, y), desc_s, font=get_font(21, "regular"), fill=c_silver)
            y += 46

    elif pid == 8:
        y = 200
        draw_letterspaced(draw, (80, y), "COMMUNITY CODE // DANCEFLOOR SANCTUARY", font_mono, accent_color, spacing=3)
        y += 40
        draw.text((80, y), "THE SANCTUARY RULES.", font=get_font(72, "condensed_bold"), fill=c_white)
        y += 86
        draw.line([(80, y), (1000, y)], fill=c_darkslate, width=1)
        y += 36
        rules = [
            ("01", "NO PHONES ON THE DANCEFLOOR", "Cameras taped at entry. Be present in the moment with the people around you."),
            ("02", "ZERO TOLERANCE FOR HARASSMENT", "Any non-consensual contact or harassment results in immediate, permanent expulsion."),
            ("03", "LOOK OUT FOR ONE ANOTHER", "Hydration stations and awareness team active throughout the entire night."),
            ("04", "FREEDOM OF EXPRESSION", "Dress as you choose, dance as you feel. No judgements, no expectations.")
        ]
        for num, title_r, desc_r in rules:
            draw.text((80, y), f"[{num}]", font=font_mono, fill=accent_color)
            draw.text((140, y), title_r, font=get_font(24, "bold"), fill=c_white)
            draw.text((140, y + 32), desc_r, font=get_font(24, "regular"), fill=c_silver)
            y += 94

    elif pid == 9:
        y = 800
        draw_letterspaced(draw, (80, y), "CURATION SPOTLIGHT // HEADLINER", font_mono, accent_color, spacing=3)
        y += 38
        draw.text((80, y), "CLAIR", font=get_font(96, "condensed_bold"), fill=c_white)
        draw.text((420, y + 48), "[BERLIN / DE]", font=font_mono, fill=accent_color)
        y += 114
        draw.line([(80, y), (1000, y)], fill=c_darkslate, width=1)
        y += 30
        draw.text((80, y), "STYLE:", font=font_mono, fill=c_slate)
        draw.text((220, y), "Fast, Hypnotic, Relentless Minimal Techno", font=get_font(24, "bold"), fill=c_white)
        y += 44
        draw.text((80, y), "SLOT:", font=font_mono, fill=c_slate)
        draw.text((220, y), "03:30 — 06:30 (Extended 3-Hour Closing Session)", font=font_mono, fill=accent_color)
        y += 44
        draw.text((80, y), "RELEASES:", font=font_mono, fill=c_slate)
        draw.text((220, y), "Drawn from underground tape labels and modular studio sessions.", font=get_font(22, "regular"), fill=c_silver)

    elif pid == 10:
        y = 800
        draw_letterspaced(draw, (80, y), "ARCHITECTURAL CONTEXT // THE SPACE", font_mono, accent_color, spacing=3)
        y += 38
        draw.text((80, y), "THE SILO.", font=get_font(92, "condensed_bold"), fill=c_white)
        y += 105
        draw.line([(80, y), (1000, y)], fill=c_darkslate, width=1)
        y += 32
        specs_v = [
            ("STRUCTURE", "Decommissioned cylindrical industrial grain silo, raw concrete walls, 18m vaulted ceiling."),
            ("ACOUSTICS", "Custom acoustic dampening baffles installed to control reverberation and focus the 25 Hz sub bass."),
            ("ATMOSPHERE", "Zero blinding strobe spam. Low-frequency monochromatic laser shafts and cold atmospheric haze.")
        ]
        for title_v, desc_v in specs_v:
            draw.text((80, y), title_v, font=font_mono, fill=accent_color)
            draw.text((260, y), desc_v, font=get_font(21, "regular"), fill=c_silver)
            y += 46

    elif pid == 11:
        y = 780
        draw_letterspaced(draw, (80, y), "COORDINATE DISPATCH // CONFIDENTIAL", font_mono, accent_color, spacing=3)
        y += 40
        draw.text((80, y), "THE LOCATION.", font=get_font(86, "condensed_bold"), fill=c_white)
        y += 98
        draw.line([(80, y), (1000, y)], fill=c_darkslate, width=1)
        y += 32
        draw.text((80, y), "ZONE:", font=font_mono, fill=c_slate)
        draw.text((240, y), "SECRET INDUSTRIAL SILO · MAURITIUS", font=get_font(26, "bold"), fill=c_white)
        y += 46
        draw.text((80, y), "DISPATCH:", font=font_mono, fill=c_slate)
        draw.text((240, y), "EXACT GPS COORDINATES SENT VIA SMS AT 18:00 DAY OF EVENT", font=font_mono, fill=accent_color)
        y += 46
        draw.text((80, y), "TRANSPORT:", font=font_mono, fill=c_slate)
        draw.text((240, y), "Organized shuttle departs from Grand Baie and Port Louis every 45 mins.", font=get_font(22, "regular"), fill=c_silver)
        y += 46
        draw.text((80, y), "PARKING:", font=font_mono, fill=c_slate)
        draw.text((240, y), "Strictly limited. Carpooling and official shuttles mandatory.", font=font_mono, fill=c_slate)

    elif pid == 12:
        y = 740
        draw_letterspaced(draw, (80, y), "TEMPORAL PROXIMITY //", font_mono, accent_color, spacing=3)
        y += 40
        draw.text((80, y), "7 DAYS OUT.", font=get_font(114, "condensed_bold"), fill=c_white)
        y += 125
        draw.line([(80, y), (1000, y)], fill=c_darkslate, width=1)
        y += 36
        draw.text((80, y), "STAGE:", font=font_mono, fill=c_slate)
        draw.text((220, y), "FINAL FREQUENCY CALIBRATION IN PROGRESS", font=get_font(24, "bold"), fill=c_white)
        y += 46
        draw.text((80, y), "CAPACITY:", font=font_mono, fill=c_slate)
        draw.text((220, y), "OVER 85% OF VENUE PASSES CLAIMED", font=font_mono, fill=accent_color)
        y += 46
        draw.text((80, y), "ADVISORY:", font=font_mono, fill=c_slate)
        draw.text((220, y), "No ticket sales at the door. Entry strictly by advance pass.", font=get_font(22, "regular"), fill=c_silver)

    elif pid == 13:
        y = 780
        draw_letterspaced(draw, (80, y), "ALLOCATION STATUS // URGENT DISPATCH", font_mono, COLOR_MOLTEN_RED, spacing=3)
        y += 40
        draw.text((80, y), "LAST TICKETS.", font=get_font(96, "condensed_bold"), fill=COLOR_WHITE)
        y += 105
        draw.line([(80, y), (1000, y)], fill=COLOR_MOLTEN_RED, width=2)
        y += 34
        tiers = [
            ("TIER 01 (EARLY ACCESS)", "SOLD OUT", COLOR_SLATE),
            ("TIER 02 (GENERAL ADMISSION)", "SOLD OUT", COLOR_SLATE),
            ("TIER 03 (FINAL RELEASE)", "LESS THAN 12% REMAINING", COLOR_MOLTEN_RED)
        ]
        for name, stat, col in tiers:
            draw.text((80, y), name, font=font_mono, fill=COLOR_SILVER)
            draw_letterspaced(draw, (1000, y), stat, font_mono, col, spacing=2, align="right")
            y += 42
        y += 14
        draw.line([(80, y), (1000, y)], fill=COLOR_DARK_SLATE, width=1)
        y += 24
        draw_letterspaced(draw, (80, y), "VENUE CAPACITY IS STRICTLY CAPPED AT 400 DANCERS. NO DOOR TICKETS.", font_mono, COLOR_MOLTEN_RED, spacing=1)

    elif pid == 14:
        y = 220
        draw_letterspaced(draw, (100, y), "ESSENTIAL DIRECTIVE // PREPARATION", font_mono, accent_color, spacing=3)
        y += 36
        draw.text((100, y), "PRACTICAL GUIDE.", font=get_font(72, "condensed_bold"), fill=c_white)
        y += 88
        draw.line([(100, y), (980, y)], fill=c_darkslate, width=1)
        y += 32
        guides = [
            ("01", "TIMING", "Doors unlock at 22:00 sharp. Initial sound immersion begins 22:30. Arrive early."),
            ("02", "BAR & AMENITIES", "Full bar, clean drinking water free all night, card & cash accepted."),
            ("03", "LOCKERS & CLOAKROOM", "Secure cloakroom on site. Keep essentials minimal for maximum dancefloor freedom."),
            ("04", "SECURITY & CARE", "Trained welfare and medical team present. Seek assistance at any moment without fear."),
            ("05", "ZERO WASTE POLICY", "Respect the industrial environment. Dispose of all items in designated recycling bins.")
        ]
        for num, title_g, desc_g in guides:
            draw.text((100, y), f"[{num}]", font=font_mono, fill=accent_color)
            draw.text((160, y), title_g, font=get_font(22, "bold"), fill=c_white)
            draw.text((160, y + 30), desc_g, font=get_font(20, "regular"), fill=c_silver)
            y += 94

    elif pid == 15:
        cy = 820
        draw_letterspaced(draw, (540, cy), "COMMENCEMENT PROTOCOL // INITIALIZED", font_mono, accent_color, spacing=4, align="center")
        draw.line([(380, cy + 34), (700, cy + 34)], fill=accent_color, width=1)
        draw_letterspaced(draw, (540, cy + 50), "TONIGHT.", get_font(120, "condensed_black"), c_white, spacing=6, align="center")
        draw_letterspaced(draw, (540, cy + 160), "DOORS UNLOCK 22:00 · THE VOID AWAITS", font_mono, c_silver, spacing=3, align="center")
        draw_letterspaced(draw, (540, cy + 205), "COME WITH OPEN MINDS · LEAVE WITH RESONANCE", font_sub, (90, 100, 115), spacing=2, align="center")

    return img

EDITIONS = [
    # --------------------------------------------------------------------------
    # EDITION 16: PRISMATIC CHROME (Translucent Glass Membrane + Sculptural Liquid Chrome)
    # --------------------------------------------------------------------------
    {
        "id": "edition_16_vitreous_chrome",
        "title": "EDITION 16: PRISMATIC CHROME",
        "short_title": "Prismatic Chrome",
        "posts": [
            ("01", "The First Signal", "RUPTURE_M06_v1.jpg", "Translucent Glass Membrane", "Primary Family", "cyan", COLOR_PALE_CYAN, False),
            ("02", "The Manifesto", "RUPTURE_M45_v1.jpg", "Sculptural Liquid Chrome", "Secondary Family", "silver", COLOR_SILVER, False),
            ("03", "The Identity", "RUPTURE_M12_v1.jpg", "Translucent Glass Membrane", "Primary Family", "cyan", COLOR_PALE_CYAN, False),
            ("04", "Save The Date", "RUPTURE_M52_v1.jpg", "Sculptural Liquid Chrome", "Secondary Family", "silver", COLOR_SILVER, False),
            ("05", "Main Event Poster", "RUPTURE_M72_v1.jpg", "Translucent Glass Membrane", "Primary Family", "red", COLOR_MOLTEN_RED, True),
            ("06", "The Lineup", "RUPTURE_M18_v1.jpg", "Translucent Glass Membrane", "Primary Family", "cyan", COLOR_PALE_CYAN, False),
            ("07", "Sound System Focus", "RUPTURE_M15_v1.jpg", "Sculptural Liquid Chrome", "Secondary Family", "silver", COLOR_SILVER, False),
            ("08", "The Sanctuary", "RUPTURE_M39_v1.jpg", "Translucent Glass Membrane", "Primary Family", "cyan", COLOR_PALE_CYAN, False),
            ("09", "Artist Spotlight", "RUPTURE_M28_v1.jpg", "Sculptural Liquid Chrome", "Secondary Family", "silver", COLOR_SILVER, False),
            ("10", "Spatial Geometry", "RUPTURE_M42_v1.jpg", "Translucent Glass Membrane", "Primary Family", "cyan", COLOR_PALE_CYAN, False),
            ("11", "Location Coordinates", "RUPTURE_M54_v1.jpg", "Sculptural Liquid Chrome", "Secondary Family", "silver", COLOR_SILVER, False),
            ("12", "The Countdown (7 Days)", "RUPTURE_M87_v1.jpg", "Translucent Glass Membrane", "Primary Family", "cyan", COLOR_PALE_CYAN, False),
            ("13", "Last Tickets", "RUPTURE_M64_v1.jpg", "Sculptural Liquid Chrome", "Secondary Family", "red", COLOR_MOLTEN_RED, True),
            ("14", "Practical Guide", "RUPTURE_M140_v1.jpg", "Translucent Glass Membrane", "Primary Family", "cyan", COLOR_PALE_CYAN, False),
            ("15", "Tonight", "RUPTURE_M137_v1.jpg", "Sculptural Liquid Chrome", "Secondary Family", "silver", COLOR_SILVER, False)
        ]
    },
    # --------------------------------------------------------------------------
    # EDITION 17: NACREOUS STRATA (Folded Liquid Surfaces + Pearlescent Silver Fluid)
    # --------------------------------------------------------------------------
    {
        "id": "edition_17_nacreous_strata",
        "title": "EDITION 17: NACREOUS STRATA",
        "short_title": "Nacreous Strata",
        "posts": [
            ("01", "The First Signal", "RUPTURE_M23_v1.jpg", "Folded Liquid Surfaces", "Primary Family", "silver", COLOR_PEARL, False),
            ("02", "The Manifesto", "RUPTURE_M35_v1.jpg", "Pearlescent Silver Fluid", "Secondary Family", "silver", COLOR_LAVENDER, False),
            ("03", "The Identity", "RUPTURE_M85_v1.jpg", "Folded Liquid Surfaces", "Primary Family", "silver", COLOR_PEARL, False),
            ("04", "Save The Date", "RUPTURE_M71_v1.jpg", "Pearlescent Silver Fluid", "Secondary Family", "silver", COLOR_LAVENDER, False),
            ("05", "Main Event Poster", "RUPTURE_M43_v1.jpg", "Folded Liquid Surfaces", "Primary Family", "red", COLOR_MOLTEN_RED, True),
            ("06", "The Lineup", "RUPTURE_M92_v1.jpg", "Pearlescent Silver Fluid", "Secondary Family", "silver", COLOR_PEARL, False),
            ("07", "Sound System Focus", "RUPTURE_M100_v1.jpg", "Folded Liquid Surfaces", "Primary Family", "silver", COLOR_PEARL, False),
            ("08", "The Sanctuary", "RUPTURE_M101_v1.jpg", "Pearlescent Silver Fluid", "Secondary Family", "silver", COLOR_LAVENDER, False),
            ("09", "Artist Spotlight", "RUPTURE_M80_v1.jpg", "Folded Liquid Surfaces", "Primary Family", "silver", COLOR_PEARL, False),
            ("10", "Spatial Geometry", "RUPTURE_M121_v1.jpg", "Pearlescent Silver Fluid", "Secondary Family", "silver", COLOR_LAVENDER, False),
            ("11", "Location Coordinates", "RUPTURE_M108_v1.jpg", "Folded Liquid Surfaces", "Primary Family", "silver", COLOR_PEARL, False),
            ("12", "The Countdown (7 Days)", "RUPTURE_M132_v1.jpg", "Pearlescent Silver Fluid", "Secondary Family", "silver", COLOR_LAVENDER, False),
            ("13", "Last Tickets", "RUPTURE_M138_v1.jpg", "Folded Liquid Surfaces", "Primary Family", "red", COLOR_MOLTEN_RED, True),
            ("14", "Practical Guide", "RUPTURE_M141_v1.jpg", "Folded Liquid Surfaces", "Primary Family", "silver", COLOR_PEARL, False),
            ("15", "Tonight", "RUPTURE_M135_v1.jpg", "Pearlescent Silver Fluid", "Secondary Family", "silver", COLOR_LAVENDER, False)
        ]
    },
    # --------------------------------------------------------------------------
    # EDITION 18: TOROIDAL FAULT (Reflective Globes & Rings + Folded Liquid Surfaces)
    # --------------------------------------------------------------------------
    {
        "id": "edition_18_toroidal_fault",
        "title": "EDITION 18: TOROIDAL FAULT",
        "short_title": "Toroidal Fault",
        "posts": [
            ("01", "The First Signal", "RUPTURE_M08_v1.jpg", "Reflective Globes & Rings", "Primary Family", "cyan", COLOR_ICY_BLUE, False),
            ("02", "The Manifesto", "RUPTURE_M34_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", "silver", COLOR_SILVER, False),
            ("03", "The Identity", "RUPTURE_M11_v1.jpg", "Reflective Globes & Rings", "Primary Family", "cyan", COLOR_ICY_BLUE, False),
            ("04", "Save The Date", "RUPTURE_M37_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", "silver", COLOR_SILVER, False),
            ("05", "Main Event Poster", "RUPTURE_M02_v1.jpg", "Reflective Globes & Rings", "Primary Family", "red", COLOR_MOLTEN_RED, True),
            ("06", "The Lineup", "RUPTURE_M60_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", "silver", COLOR_SILVER, False),
            ("07", "Sound System Focus", "RUPTURE_M61_v1.jpg", "Reflective Globes & Rings", "Primary Family", "cyan", COLOR_ICY_BLUE, False),
            ("08", "The Sanctuary", "RUPTURE_M99_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", "silver", COLOR_SILVER, False),
            ("09", "Artist Spotlight", "RUPTURE_M78_v1.jpg", "Reflective Globes & Rings", "Primary Family", "cyan", COLOR_ICY_BLUE, False),
            ("10", "Spatial Geometry", "RUPTURE_M103_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", "silver", COLOR_SILVER, False),
            ("11", "Location Coordinates", "RUPTURE_M81_v1.jpg", "Reflective Globes & Rings", "Primary Family", "cyan", COLOR_ICY_BLUE, False),
            ("12", "The Countdown (7 Days)", "RUPTURE_M117_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", "silver", COLOR_SILVER, False),
            ("13", "Last Tickets", "RUPTURE_M98_v1.jpg", "Reflective Globes & Rings", "Primary Family", "red", COLOR_MOLTEN_RED, True),
            ("14", "Practical Guide", "RUPTURE_M126_v1.jpg", "Reflective Globes & Rings", "Primary Family", "cyan", COLOR_ICY_BLUE, False),
            ("15", "Tonight", "RUPTURE_M134_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", "silver", COLOR_SILVER, False)
        ]
    },
    # --------------------------------------------------------------------------
    # EDITION 19: NACREOUS ANNULUS (Pearlescent Silver Fluid + Reflective Globes & Rings)
    # --------------------------------------------------------------------------
    {
        "id": "edition_19_nacreous_annulus",
        "title": "EDITION 19: NACREOUS ANNULUS",
        "short_title": "Nacreous Annulus",
        "posts": [
            ("01", "The First Signal", "RUPTURE_M71_v1.jpg", "Pearlescent Silver Fluid", "Primary Family", "purple", COLOR_ULTRAVIOLET, False),
            ("02", "The Manifesto", "RUPTURE_M16_v1.jpg", "Reflective Globes & Rings", "Secondary Family", "purple", COLOR_LAVENDER, False),
            ("03", "The Identity", "RUPTURE_M35_v1.jpg", "Pearlescent Silver Fluid", "Primary Family", "purple", COLOR_ULTRAVIOLET, False),
            ("04", "Save The Date", "RUPTURE_M59_v1.jpg", "Reflective Globes & Rings", "Secondary Family", "purple", COLOR_LAVENDER, False),
            ("05", "Main Event Poster", "RUPTURE_M128_v1.jpg", "Pearlescent Silver Fluid", "Primary Family", "red", COLOR_MOLTEN_RED, True),
            ("06", "The Lineup", "RUPTURE_M68_v1.jpg", "Reflective Globes & Rings", "Secondary Family", "purple", COLOR_LAVENDER, False),
            ("07", "Sound System Focus", "RUPTURE_M94_v1.jpg", "Pearlescent Silver Fluid", "Primary Family", "purple", COLOR_ULTRAVIOLET, False),
            ("08", "The Sanctuary", "RUPTURE_M106_v1.jpg", "Reflective Globes & Rings", "Secondary Family", "purple", COLOR_LAVENDER, False),
            ("09", "Artist Spotlight", "RUPTURE_M114_v1.jpg", "Pearlescent Silver Fluid", "Primary Family", "purple", COLOR_ULTRAVIOLET, False),
            ("10", "Spatial Geometry", "RUPTURE_M112_v1.jpg", "Reflective Globes & Rings", "Secondary Family", "purple", COLOR_LAVENDER, False),
            ("11", "Location Coordinates", "RUPTURE_M121_v1.jpg", "Pearlescent Silver Fluid", "Primary Family", "purple", COLOR_ULTRAVIOLET, False),
            ("12", "The Countdown (7 Days)", "RUPTURE_M120_v1.jpg", "Reflective Globes & Rings", "Secondary Family", "purple", COLOR_LAVENDER, False),
            ("13", "Last Tickets", "RUPTURE_M02_v1.jpg", "Reflective Globes & Rings", "Secondary Family", "red", COLOR_MOLTEN_RED, True),
            ("14", "Practical Guide", "RUPTURE_M139_v1.jpg", "Pearlescent Silver Fluid", "Primary Family", "purple", COLOR_ULTRAVIOLET, False),
            ("15", "Tonight", "RUPTURE_M135_v1.jpg", "Pearlescent Silver Fluid", "Primary Family", "purple", COLOR_LAVENDER, False)
        ]
    },
    # --------------------------------------------------------------------------
    # EDITION 20: TECTONIC MEMBRANE (Folded Liquid Surfaces + Translucent Glass Membrane)
    # --------------------------------------------------------------------------
    {
        "id": "edition_20_tectonic_membrane",
        "title": "EDITION 20: TECTONIC MEMBRANE",
        "short_title": "Tectonic Membrane",
        "posts": [
            ("01", "The First Signal", "RUPTURE_M21_v1.jpg", "Folded Liquid Surfaces", "Primary Family", "emerald", COLOR_EMERALD, False),
            ("02", "The Manifesto", "RUPTURE_M06_v1.jpg", "Translucent Glass Membrane", "Secondary Family", "emerald", COLOR_EMERALD, False),
            ("03", "The Identity", "RUPTURE_M80_v1.jpg", "Folded Liquid Surfaces", "Primary Family", "emerald", COLOR_EMERALD, False),
            ("04", "Save The Date", "RUPTURE_M24_v1.jpg", "Translucent Glass Membrane", "Secondary Family", "emerald", COLOR_EMERALD, False),
            ("05", "Main Event Poster", "RUPTURE_M119_v1.jpg", "Folded Liquid Surfaces", "Primary Family", "red", COLOR_MOLTEN_RED, True),
            ("06", "The Lineup", "RUPTURE_M40_v1.jpg", "Translucent Glass Membrane", "Secondary Family", "emerald", COLOR_EMERALD, False),
            ("07", "Sound System Focus", "RUPTURE_M85_v1.jpg", "Folded Liquid Surfaces", "Primary Family", "emerald", COLOR_EMERALD, False),
            ("08", "The Sanctuary", "RUPTURE_M41_v1.jpg", "Translucent Glass Membrane", "Secondary Family", "emerald", COLOR_EMERALD, False),
            ("09", "Artist Spotlight", "RUPTURE_M95_v1.jpg", "Folded Liquid Surfaces", "Primary Family", "emerald", COLOR_EMERALD, False),
            ("10", "Spatial Geometry", "RUPTURE_M77_v1.jpg", "Translucent Glass Membrane", "Secondary Family", "emerald", COLOR_EMERALD, False),
            ("11", "Location Coordinates", "RUPTURE_M127_v1.jpg", "Folded Liquid Surfaces", "Primary Family", "emerald", COLOR_EMERALD, False),
            ("12", "The Countdown (7 Days)", "RUPTURE_M84_v1.jpg", "Translucent Glass Membrane", "Secondary Family", "emerald", COLOR_EMERALD, False),
            ("13", "Last Tickets", "RUPTURE_M55_v1.jpg", "Folded Liquid Surfaces", "Primary Family", "red", COLOR_MOLTEN_RED, True),
            ("14", "Practical Guide", "RUPTURE_M140_v1.jpg", "Translucent Glass Membrane", "Secondary Family", "emerald", COLOR_EMERALD, False),
            ("15", "Tonight", "RUPTURE_M141_v1.jpg", "Folded Liquid Surfaces", "Primary Family", "emerald", COLOR_EMERALD, False)
        ]
    }
]

def main():
    print("🚀 Starting RUPTURE Editions 16 to 20 Generator...")
    total_posts = sum(len(ed["posts"]) for ed in EDITIONS)
    count = 0

    for ed in EDITIONS:
        ed_id = ed["id"]
        ed_title = ed["short_title"]
        print(f"\n⚡ Generating {ed['title']} ({len(ed['posts'])} posts)...")

        dir_camp = os.path.join(ROOT, "campaign", "editions", ed_id, "posts")
        dir_pub = os.path.join(ROOT, "public", "campaign", "editions", ed_id, "posts")
        os.makedirs(dir_camp, exist_ok=True)
        os.makedirs(dir_pub, exist_ok=True)

        for post_tuple in ed["posts"]:
            num, title, art_file, fam_name, fam_role, color_mode, accent_color, has_red = post_tuple
            stem = f"RUPTURE_IG_POST_{num}"

            img = build_post_image(
                art_file=art_file,
                post_id=num,
                title=title,
                edition_title=ed_title,
                family_name=fam_name,
                family_role=fam_role,
                color_mode=color_mode,
                accent_color=accent_color,
                has_red=has_red
            )

            # 1. 1080x1350 PNG
            p_png_camp = os.path.join(dir_camp, f"{stem}.png")
            p_png_pub = os.path.join(dir_pub, f"{stem}.png")
            img.save(p_png_camp, format="PNG", optimize=True)
            img.save(p_png_pub, format="PNG", optimize=True)

            # 2. 1080x1350 JPG
            p_jpg_camp = os.path.join(dir_camp, f"{stem}.jpg")
            p_jpg_pub = os.path.join(dir_pub, f"{stem}.jpg")
            p_jpg_brain = os.path.join(BRAIN_DIR, f"{ed_id}_{stem}.jpg")
            img.save(p_jpg_camp, format="JPEG", quality=94)
            img.save(p_jpg_pub, format="JPEG", quality=94)
            img.save(p_jpg_brain, format="JPEG", quality=94)

            # 3. 1080x1080 Square Crop (Central 135px to 1215px)
            sq_crop = img.crop((0, 135, 1080, 1215))
            p_sq_camp = os.path.join(dir_camp, f"{stem}_sq.jpg")
            p_sq_pub = os.path.join(dir_pub, f"{stem}_sq.jpg")
            p_sq_brain = os.path.join(BRAIN_DIR, f"{ed_id}_{stem}_sq.jpg")
            sq_crop.save(p_sq_camp, format="JPEG", quality=94)
            sq_crop.save(p_sq_pub, format="JPEG", quality=94)
            sq_crop.save(p_sq_brain, format="JPEG", quality=94)

            count += 1
            print(f"  [{count}/{total_posts}] {ed_id} :: Post {num} ({art_file} -> {color_mode}) OK")

    print(f"\n✨ Successfully generated all {total_posts} posts for Editions 16, 17, 18, 19, 20!")

if __name__ == "__main__":
    main()
