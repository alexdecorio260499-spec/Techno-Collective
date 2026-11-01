#!/usr/bin/env python3
"""
RUPTURE Studio — Generator for Editions 07, 08, 09, and 10
Explores chromatic variety across the collective's underground identity:
- Edition 07: Chromatic Strata (Horizontal Color Rows in 3-col profile grid: Silver, Red, Cyan, Purple, Amber)
- Edition 08: Ultraviolet Rift (Deep Acid Violet, Dark Orchid, Electric Lavender, Void Obsidian)
- Edition 09: Cryogenic Void (Sub-zero Cyan, Oceanic Cobalt, Polar Ice Glass, Mirror Chrome)
- Edition 10: Spectrum Mutation (Full Randomized Multi-Chromatic Exploration & Duotones across all 15 posts)
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
        
    elif mode == "magenta":
        tint = ImageOps.colorize(gray, black=(16, 0, 10), mid=(250, 25, 165), white=(255, 235, 252))
        return Image.blend(rgb, tint, intensity)
        
    elif mode == "cobalt":
        tint = ImageOps.colorize(gray, black=(0, 4, 16), mid=(35, 95, 250), white=(215, 238, 255))
        return Image.blend(rgb, tint, intensity)
        
    elif mode == "duotone_purple_cyan":
        tint = ImageOps.colorize(gray, black=(24, 2, 42), mid=(152, 42, 225), white=(85, 242, 255))
        return Image.blend(rgb, tint, intensity)
        
    elif mode == "duotone_red_amber":
        tint = ImageOps.colorize(gray, black=(24, 2, 4), mid=(225, 28, 32), white=(255, 218, 85))
        return Image.blend(rgb, tint, intensity)
        
    return rgb

def load_master_artwork(filename, target_size=(1080, 1350), scale=1.0, offset=(0, 0), color_mode="silver", intensity=0.82):
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

def apply_gradient_overlay(base_img, direction="bottom", height_px=450, max_alpha=220):
    w, h = base_img.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    if direction == "bottom":
        start_y = h - height_px
        for y in range(start_y, h):
            alpha = int(max_alpha * ((y - start_y) / height_px) ** 1.3)
            d.line([(0, y), (w, y)], fill=(8, 9, 12, min(255, alpha)))
    elif direction == "top":
        for y in range(0, height_px):
            alpha = int(max_alpha * (1.0 - (y / height_px)) ** 1.3)
            d.line([(0, y), (w, y)], fill=(8, 9, 12, min(255, alpha)))
    elif direction == "full":
        for y in range(0, h):
            d.line([(0, y), (w, y)], fill=(8, 9, 12, min(255, max_alpha)))
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

def draw_technical_frame(draw, accent_color=COLOR_PALE_CYAN):
    m = 48
    bl = 24
    draw.line([(m, m), (m + bl, m)], fill=accent_color, width=1)
    draw.line([(m, m), (m, m + bl)], fill=accent_color, width=1)
    draw.line([(1080 - m, m), (1080 - m - bl, m)], fill=accent_color, width=1)
    draw.line([(1080 - m, m), (1080 - m, m + bl)], fill=accent_color, width=1)
    draw.line([(m, 1350 - m), (m + bl, 1350 - m)], fill=accent_color, width=1)
    draw.line([(m, 1350 - m), (m, 1350 - m - bl)], fill=accent_color, width=1)
    draw.line([(1080 - m, 1350 - m), (1080 - m - bl, 1350 - m)], fill=accent_color, width=1)
    draw.line([(1080 - m, 1350 - m), (1080 - m, 1350 - m - bl)], fill=accent_color, width=1)
    draw.line([(m, 135), (m + 8, 135)], fill=(55, 62, 75), width=1)
    draw.line([(1080 - m - 8, 135), (1080 - m, 135)], fill=(55, 62, 75), width=1)
    draw.line([(m, 1215), (m + 8, 1215)], fill=(55, 62, 75), width=1)
    draw.line([(1080 - m - 8, 1215), (1080 - m, 1215)], fill=(55, 62, 75), width=1)

def draw_header_meta(draw, post_num, family_label, meta_right, accent_color=COLOR_PALE_CYAN):
    font_mono = get_font(15, "mono")
    draw_letterspaced(draw, (64, 68), f"RUPTURE // {post_num}", font_mono, COLOR_WHITE, spacing=2)
    draw.rectangle([(230, 68), (230 + len(family_label)*10 + 20, 88)], fill=(18, 22, 28), outline=(50, 58, 70))
    draw_letterspaced(draw, (240, 71), family_label, get_font(13, "mono"), accent_color, spacing=1)
    draw_letterspaced(draw, (1080 - 64, 68), meta_right, font_mono, COLOR_SLATE, spacing=1, align="right")

def draw_footer_meta(draw, left_tag, right_tag):
    font_mono = get_font(14, "mono")
    draw_letterspaced(draw, (64, 1262), left_tag, font_mono, (90, 100, 115), spacing=2)
    draw_letterspaced(draw, (1080 - 64, 1262), right_tag, font_mono, COLOR_SLATE, spacing=1, align="right")

def build_post_image(art_file, post_id, title, edition_title, family_name, family_role, color_mode="silver", accent_color=COLOR_PALE_CYAN, has_red=False):
    base = load_master_artwork(art_file, (1080, 1350), scale=1.06, offset=(0, -20), color_mode=color_mode, intensity=0.82)
    pid = int(post_id)
    
    if pid in [1, 15]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=480, max_alpha=220)
    elif pid in [2, 8]:
        base = apply_gradient_overlay(base, direction="top", height_px=750, max_alpha=245)
    elif pid in [3]:
        base = draw_translucent_panel(base, (64, 460, 1016, 820), fill_color=(8, 10, 14, 195), border_color=(45, 55, 70, 255))
    elif pid in [4, 11]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=560, max_alpha=230)
    elif pid in [5]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=680, max_alpha=245)
        base = apply_gradient_overlay(base, direction="top", height_px=360, max_alpha=200)
    elif pid in [6, 14]:
        base = draw_translucent_panel(base, (64, 180, 1016, 1160), fill_color=(8, 10, 14, 215), border_color=(45, 55, 70, 255))
    elif pid in [7, 9, 10]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=500, max_alpha=225)
    elif pid in [12]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=600, max_alpha=230)
    elif pid in [13]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=520, max_alpha=235)

    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw, accent_color=accent_color)
    draw_header_meta(draw, f"POST {post_id}", family_name.upper()[:16], f"{edition_title.upper()}", accent_color=accent_color)
    draw_footer_meta(draw, f"RUPTURE // {edition_title.upper()}", f"CHAPTER SPECIFICATION")

    font_mono = get_font(18, "mono")
    font_bold = get_font(68, "condensed_bold")
    font_sub = get_font(24, "regular")

    if pid == 1:
        cy = 820
        draw_letterspaced(draw, (540, cy), "NEW FREQUENCY DETECTED", font_mono, accent_color, spacing=4, align="center")
        draw.line([(420, cy + 34), (660, cy + 34)], fill=accent_color, width=1)
        draw_letterspaced(draw, (540, cy + 50), "SOMETHING IS SHIFTING.", font_bold, COLOR_WHITE, spacing=1, align="center")
        draw_letterspaced(draw, (540, cy + 135), "NOT EVERYTHING NEEDS TO FOLLOW THE PATTERN.", font_sub, COLOR_SILVER, spacing=2, align="center")
        draw_letterspaced(draw, (540, cy + 195), f"CHAPTER: {edition_title.upper()} · STAND BY", font_mono, (85, 95, 110), spacing=2, align="center")

    elif pid == 2:
        y = 200
        draw_letterspaced(draw, (80, y), "OUR ETHOS // OUR PURPOSE", font_mono, accent_color, spacing=3)
        y += 40
        draw.text((80, y), "WE DO NOT REPEAT.", font=get_font(72, "condensed_bold"), fill=COLOR_WHITE)
        y += 76
        draw.text((80, y), "WE DO NOT CONFORM.", font=get_font(72, "condensed_bold"), fill=COLOR_SILVER)
        y += 105
        draw.line([(80, y), (1000, y)], fill=(60, 68, 82), width=1)
        y += 35
        pts = [
            ("01", "BREAKING AWAY FROM CONVENTION", "Rejecting predictable nightlife templates and commercial electronic clichés."),
            ("02", "UNCOMPROMISING SONIC INTEGRITY", "Fast, hypnotic, dark and groove-laden rhythms curated with precision."),
            ("03", "A SACRED DANCEFLOOR SANCTUARY", "Safety, mutual respect, zero judgement, and complete bodily freedom."),
            ("04", "FREEDOM OF SOUND AND BODY", "Come for the music. Leave your ego at the door.")
        ]
        for num, headline, desc in pts:
            draw.text((80, y), f"[{num}]", font=font_mono, fill=accent_color)
            draw.text((140, y), headline, font=get_font(22, "bold"), fill=COLOR_WHITE)
            draw.text((140, y + 32), desc, font=get_font(24, "regular"), fill=COLOR_SILVER)
            y += 92

    elif pid == 3:
        cy = 505
        font_logo = get_font(128, "condensed_black")
        draw_letterspaced(draw, (540, cy), "R U P T U R E", font_logo, COLOR_WHITE, spacing=14, align="center")
        draw.line([(240, cy + 145), (840, cy + 145)], fill=accent_color, width=1)
        draw_letterspaced(draw, (540, cy + 165), f"UNDERGROUND TECHNO COLLECTIVE", get_font(28, "condensed_bold"), accent_color, spacing=5, align="center")
        draw_letterspaced(draw, (540, cy + 225), f"MAURITIUS · {edition_title.upper()} · EST. 2026", font_mono, COLOR_SILVER, spacing=2, align="center")

    elif pid == 4:
        y = 780
        draw.rectangle([(80, y), (360, y + 42)], fill=COLOR_WHITE)
        draw_letterspaced(draw, (98, y + 10), "SAVE THE DATE", get_font(20, "bold"), COLOR_VOID, spacing=2)
        y += 65
        draw.text((80, y), edition_title.upper(), font=get_font(88, "condensed_black"), fill=COLOR_WHITE)
        y += 95
        draw.text((80, y), "FRIDAY · [DATE TBD] · 22:00 — 06:00", font=get_font(32, "bold"), fill=accent_color)
        y += 50
        draw.text((80, y), "SECRET INDUSTRIAL LOCATION // NORTH COAST, MAURITIUS", font=get_font(24, "regular"), fill=COLOR_SILVER)

    elif pid == 5:
        y = 200
        draw_letterspaced(draw, (540, y), "RUPTURE COLLECTIVE PRESENTS", font_mono, accent_color, spacing=4, align="center")
        y += 45
        draw_letterspaced(draw, (540, y), edition_title.upper(), get_font(104, "condensed_black"), COLOR_WHITE, spacing=2, align="center")
        y += 115
        if has_red:
            draw.line([(200, y), (880, y)], fill=COLOR_MOLTEN_RED, width=3)
        else:
            draw.line([(200, y), (880, y)], fill=accent_color, width=2)
        y += 35
        draw_letterspaced(draw, (540, y), "FOUR ARTISTS // EIGHT HOURS OF SOUND", font_mono, COLOR_SILVER, spacing=2, align="center")
        y += 50
        lineup = ["[ARTIST 01] — MODULAR LIVE", "[ARTIST 02] — HYPNOTIC VINYL", "[ARTIST 03] — INDUSTRIAL GROOVE", "[ARTIST 04] — CLOSING RITUAL"]
        for act in lineup:
            draw_letterspaced(draw, (540, y), act, get_font(34, "condensed_bold"), COLOR_WHITE, spacing=1, align="center")
            y += 48
        y += 20
        draw.rectangle([(220, y), (860, y + 70)], fill=(12, 14, 18, 220), outline=COLOR_DARK_SLATE)
        draw_letterspaced(draw, (540, y + 14), "SECRET INDUSTRIAL LOCATION · MAURITIUS", font_mono, accent_color, spacing=2, align="center")
        draw_letterspaced(draw, (540, y + 40), "ADVANCE PRESALE ONLY · CAPACITY 400", font_mono, COLOR_SILVER, spacing=1, align="center")

    elif pid == 6:
        y = 220
        draw_letterspaced(draw, (540, y), "THE LINEUP ARCHITECTURE", font_mono, accent_color, spacing=4, align="center")
        y += 45
        draw_letterspaced(draw, (540, y), "FOUR SONIC CHAPTERS", get_font(60, "condensed_bold"), COLOR_WHITE, spacing=1, align="center")
        y += 75
        acts = [
            ("22:00 — 00:30", "[ACT 01]", "DEEP AMBIENT & TEXTURAL FREQUENCIES", "Modular analog synthesis constructing the initial hypnotic drift."),
            ("00:30 — 02:30", "[ACT 02]", "HYPNOTIC & DRIVING TECHNO", "Precision groove, layered tension, and continuous momentum."),
            ("02:30 — 04:30", "[ACT 03]", "RAW INDUSTRIAL PEAK HOUR", "Fast percussive drive, mechanical sub-bass, and physical catharsis."),
            ("04:30 — 06:00", "[ACT 04]", "CLOSING CEREMONY // SUB-BASS RITUAL", "Dark euphoric groove into the early morning light.")
        ]
        for time_slot, act_name, title_line, desc in acts:
            draw.text((100, y), time_slot, font=font_mono, fill=accent_color)
            draw.text((360, y), act_name, font=get_font(26, "bold"), fill=COLOR_WHITE)
            draw.text((100, y + 28), title_line, font=get_font(22, "condensed_bold"), fill=COLOR_PEARL)
            draw.text((100, y + 56), desc, font=get_font(18, "regular"), fill=COLOR_SLATE)
            draw.line([(100, y + 90), (980, y + 90)], fill=(40, 48, 60), width=1)
            y += 115

    elif pid == 7:
        y = 780
        draw_letterspaced(draw, (80, y), "ACOUSTIC REINFORCEMENT", font_mono, accent_color, spacing=3)
        y += 35
        draw.text((80, y), "CUSTOM MULTI-POINT RIG.", font=get_font(64, "condensed_bold"), fill=COLOR_WHITE)
        y += 75
        draw.text((80, y), "ENGINEERED DOWN TO 25 HZ FOR PHYSICAL IMPACT", font=get_font(24, "bold"), fill=COLOR_PEARL)
        y += 40
        draw.text((80, y), "Calibrated specifically to eliminate reflective acoustic flutter in industrial space.", font=get_font(22, "regular"), fill=COLOR_SLATE)

    elif pid == 8:
        y = 220
        draw_letterspaced(draw, (80, y), "COMMUNITY CODE // THE SANCTUARY", font_mono, accent_color, spacing=3)
        y += 40
        draw.text((80, y), "SACRED DANCEFLOOR.", font=get_font(72, "condensed_bold"), fill=COLOR_WHITE)
        y += 85
        rules = [
            ("NO PHOTOS. NO FLASH.", "Experience the music with your senses, not your screen."),
            ("ZERO HARASSMENT TOLERANCE.", "Complete safety for all identities, bodies, and forms of expression."),
            ("RESPECT THE SPACE.", "Leave no waste. Preserve the integrity of our underground sanctuary."),
            ("COMMUNAL DISSOLUTION.", "Leave the outside world behind. Become one with the low frequencies.")
        ]
        for rh, rd in rules:
            draw.text((80, y), f"// {rh}", font=get_font(24, "bold"), fill=COLOR_WHITE)
            draw.text((80, y + 32), rd, font=get_font(20, "regular"), fill=COLOR_SILVER)
            y += 85

    elif pid == 9:
        y = 780
        draw_letterspaced(draw, (80, y), "ARTIST SPOTLIGHT // 01", font_mono, accent_color, spacing=3)
        y += 35
        draw.text((80, y), "[ARTIST 01]", font=get_font(72, "condensed_bold"), fill=COLOR_WHITE)
        y += 75
        draw.text((80, y), "LIVE HARDWARE SYNTHESIS & ACOUSTIC TENSION", font=get_font(24, "bold"), fill=COLOR_PEARL)
        y += 40
        draw.text((80, y), "Opening the ritual with continuous atmospheric soundscapes.", font=get_font(22, "regular"), fill=COLOR_SLATE)

    elif pid == 10:
        y = 780
        draw_letterspaced(draw, (80, y), "VENUE ARCHITECTURE", font_mono, accent_color, spacing=3)
        y += 35
        draw.text((80, y), "THE SPACE REVEALED.", font=get_font(68, "condensed_bold"), fill=COLOR_WHITE)
        y += 75
        draw.text((80, y), "RAW INDUSTRIAL MASS TRANSFORMED BY LIGHT & HAZE", font=get_font(22, "bold"), fill=COLOR_PEARL)
        y += 40
        draw.text((80, y), "Engineered specifically for acoustic enclosure and dancefloor immersion.", font=get_font(22, "regular"), fill=COLOR_SLATE)

    elif pid == 11:
        y = 780
        draw.rectangle([(80, y), (440, y + 42)], fill=COLOR_WHITE)
        draw_letterspaced(draw, (98, y + 10), "GPS COORDINATES // VENUE", get_font(20, "bold"), COLOR_VOID, spacing=2)
        y += 65
        draw.text((80, y), "-20.3541°, 57.3682°", font=get_font(64, "condensed_bold"), fill=COLOR_WHITE)
        y += 75
        draw.text((80, y), "SECRET SITE UNLOCKED 24H PRIOR TO TICKET HOLDERS", font=get_font(24, "bold"), fill=accent_color)
        y += 40
        draw.text((80, y), "Private shuttle access and detailed parking instructions transmitted via SMS.", font=get_font(22, "regular"), fill=COLOR_SLATE)

    elif pid == 12:
        y = 680
        draw_letterspaced(draw, (80, y), "T-MINUS 7 DAYS // COUNTDOWN", font_mono, accent_color, spacing=3)
        y += 30
        draw.text((80, y), "7 DAYS.", font=get_font(128, "condensed_black"), fill=COLOR_WHITE)
        y += 140
        draw.text((80, y), "FINAL REHEARSALS & SYSTEM RIGGING IN PROGRESS", font=get_font(24, "bold"), fill=COLOR_PEARL)
        y += 40
        draw.text((80, y), "Secure your place in the frequency.", font=get_font(22, "regular"), fill=COLOR_SLATE)

    elif pid == 13:
        y = 760
        if has_red:
            draw.rectangle([(80, y), (420, y + 42)], fill=COLOR_MOLTEN_RED)
            draw_letterspaced(draw, (98, y + 10), "CRITICAL CAPACITY: 92%", get_font(20, "bold"), COLOR_WHITE, spacing=2)
        else:
            draw.rectangle([(80, y), (420, y + 42)], fill=accent_color)
            draw_letterspaced(draw, (98, y + 10), "FINAL ADMISSION TIER", get_font(20, "bold"), COLOR_VOID, spacing=2)
        y += 65
        draw.text((80, y), "LAST TICKETS.", font=get_font(72, "condensed_bold"), fill=COLOR_WHITE)
        y += 80
        draw.text((80, y), "NO TICKETS AT THE DOOR. ADVANCE ONLY.", font=get_font(26, "bold"), fill=accent_color)
        y += 40
        draw.text((80, y), "Link in bio to secure final release.", font=get_font(22, "regular"), fill=COLOR_SLATE)

    elif pid == 14:
        y = 220
        draw_letterspaced(draw, (540, y), "PRACTICAL INFORMATION // ESSENTIAL GUIDE", font_mono, accent_color, spacing=3, align="center")
        y += 40
        draw_letterspaced(draw, (540, y), "LOGISTICS & PROTOCOLS", get_font(52, "condensed_bold"), COLOR_WHITE, spacing=2, align="center")
        y += 75
        info_blocks = [
            ("[TIMETABLE]", "Doors open at 22:00 sharp. Continuous audio journey until 06:00."),
            ("[ENTRY REQUIREMENTS]", "Valid government ID required. Advance QR code must be presented. 21+ only."),
            ("[LOCATION & TRANSIT]", "Secure parking on-site. Shuttle runs every 30m from northern hub."),
            ("[AMENITIES & CARE]", "Dedicated free hydration station, quiet recovery zone, trained awareness crew.")
        ]
        for header, body in info_blocks:
            draw.text((100, y), header, font=font_mono, fill=accent_color)
            draw.text((100, y + 26), body, font=get_font(22, "regular"), fill=COLOR_WHITE)
            draw.line([(100, y + 65), (980, y + 65)], fill=(45, 55, 70), width=1)
            y += 90

    elif pid == 15:
        cy = 820
        draw_letterspaced(draw, (540, cy), "THE RITUAL COMMENCES TONIGHT", font_mono, accent_color, spacing=4, align="center")
        draw.line([(380, cy + 34), (700, cy + 34)], fill=accent_color, width=1)
        draw_letterspaced(draw, (540, cy + 50), "WE ENTER THE VOID.", font_bold, COLOR_WHITE, spacing=1, align="center")
        draw_letterspaced(draw, (540, cy + 135), "DOORS 22:00 · SOUND DOWN TO 25 HZ · ZERO CLICHES", font_sub, COLOR_SILVER, spacing=2, align="center")
        draw_letterspaced(draw, (540, cy + 195), "SEE YOU ON THE DANCEFLOOR.", font_mono, COLOR_WHITE, spacing=3, align="center")

    return img

# ==============================================================================
# EDITIONS SPECIFICATIONS FOR 07, 08, 09, 10
# ==============================================================================

EDITIONS = [
    {
        "id": "edition_07_chromatic_strata",
        "title": "EDITION 07: CHROMATIC STRATA",
        "short_title": "Chromatic Strata",
        "posts": [
            # Row 1 (Silver / Mercury)
            ("01", "The First Signal", "RUPTURE_M15_v1.jpg", "Sculptural Liquid Chrome", "Primary Family", "silver", COLOR_SILVER, False),
            ("02", "The Manifesto", "RUPTURE_M23_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", "silver", COLOR_WHITE, False),
            ("03", "The Identity", "RUPTURE_M54_v1.jpg", "Sculptural Liquid Chrome", "Primary Family", "silver", COLOR_SILVER, False),
            # Row 2 (Molten Crimson Red)
            ("04", "Save The Date", "RUPTURE_M38_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", "red", COLOR_MOLTEN_RED, False),
            ("05", "Main Event Poster", "RUPTURE_M43_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", "red", COLOR_MOLTEN_RED, True),
            ("06", "The Lineup", "RUPTURE_M74_v1.jpg", "Sculptural Liquid Chrome", "Primary Family", "red", COLOR_MOLTEN_RED, False),
            # Row 3 (Cryogenic Cyan)
            ("07", "Sound System Focus", "RUPTURE_M80_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", "cyan", COLOR_ICY_BLUE, False),
            ("08", "The Sanctuary", "RUPTURE_M40_v1.jpg", "Translucent Glass Membrane", "Secondary Family", "cyan", COLOR_PALE_CYAN, False),
            ("09", "Artist Spotlight", "RUPTURE_M61_v1.jpg", "Reflective Globes & Rings", "Secondary Family", "cyan", COLOR_PALE_CYAN, False),
            # Row 4 (Ultraviolet / Purple)
            ("10", "Spatial Geometry", "RUPTURE_M85_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", "purple", COLOR_ULTRAVIOLET, False),
            ("11", "Location Coordinates", "RUPTURE_M52_v1.jpg", "Sculptural Liquid Chrome", "Primary Family", "purple", COLOR_LAVENDER, False),
            ("12", "The Countdown (7 Days)", "RUPTURE_M39_v1.jpg", "Translucent Glass Membrane", "Secondary Family", "purple", COLOR_ULTRAVIOLET, False),
            # Row 5 (Amber / Gold)
            ("13", "Last Tickets", "RUPTURE_M138_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", "amber", COLOR_AMBER, True),
            ("14", "Practical Guide", "RUPTURE_M45_v1.jpg", "Sculptural Liquid Chrome", "Primary Family", "amber", COLOR_AMBER, False),
            ("15", "Tonight", "RUPTURE_M130_v1.jpg", "Sculptural Liquid Chrome", "Primary Family", "amber", COLOR_AMBER, False)
        ]
    },
    {
        "id": "edition_08_ultraviolet_rift",
        "title": "EDITION 08: ULTRAVIOLET RIFT",
        "short_title": "Ultraviolet Rift",
        "posts": [
            ("01", "The First Signal", "RUPTURE_M35_v1.jpg", "Pearlescent Silver Fluid", "Primary Family", "purple", COLOR_ULTRAVIOLET, False),
            ("02", "The Manifesto", "RUPTURE_M41_v1.jpg", "Translucent Glass Membrane", "Secondary Family", "purple", COLOR_LAVENDER, False),
            ("03", "The Identity", "RUPTURE_M92_v1.jpg", "Pearlescent Silver Fluid", "Primary Family", "silver", COLOR_LAVENDER, False),
            ("04", "Save The Date", "RUPTURE_M18_v1.jpg", "Translucent Glass Membrane", "Secondary Family", "purple", COLOR_ULTRAVIOLET, False),
            ("05", "Main Event Poster", "RUPTURE_M101_v1.jpg", "Pearlescent Silver Fluid", "Primary Family", "magenta", COLOR_MAGENTA, True),
            ("06", "The Lineup", "RUPTURE_M24_v1.jpg", "Translucent Glass Membrane", "Secondary Family", "duotone_purple_cyan", COLOR_LAVENDER, False),
            ("07", "Sound System Focus", "RUPTURE_M71_v1.jpg", "Pearlescent Silver Fluid", "Primary Family", "purple", COLOR_ULTRAVIOLET, False),
            ("08", "The Sanctuary", "RUPTURE_M39_v1.jpg", "Translucent Glass Membrane", "Secondary Family", "silver", COLOR_LAVENDER, False),
            ("09", "Artist Spotlight", "RUPTURE_M114_v1.jpg", "Pearlescent Silver Fluid", "Primary Family", "purple", COLOR_ULTRAVIOLET, False),
            ("10", "Spatial Geometry", "RUPTURE_M42_v1.jpg", "Translucent Glass Membrane", "Secondary Family", "purple", COLOR_LAVENDER, False),
            ("11", "Location Coordinates", "RUPTURE_M121_v1.jpg", "Pearlescent Silver Fluid", "Primary Family", "purple", COLOR_ULTRAVIOLET, False),
            ("12", "The Countdown (7 Days)", "RUPTURE_M87_v1.jpg", "Translucent Glass Membrane", "Secondary Family", "purple", COLOR_ULTRAVIOLET, False),
            ("13", "Last Tickets", "RUPTURE_M128_v1.jpg", "Pearlescent Silver Fluid", "Primary Family", "magenta", COLOR_MAGENTA, True),
            ("14", "Practical Guide", "RUPTURE_M140_v1.jpg", "Translucent Glass Membrane", "Secondary Family", "purple", COLOR_LAVENDER, False),
            ("15", "Tonight", "RUPTURE_M135_v1.jpg", "Pearlescent Silver Fluid", "Primary Family", "purple", COLOR_ULTRAVIOLET, False)
        ]
    },
    {
        "id": "edition_09_cryogenic_void",
        "title": "EDITION 09: CRYOGENIC VOID",
        "short_title": "Cryogenic Void",
        "posts": [
            ("01", "The First Signal", "RUPTURE_M08_v1.jpg", "Reflective Globes & Rings", "Primary Family", "cyan", COLOR_PALE_CYAN, False),
            ("02", "The Manifesto", "RUPTURE_M15_v1.jpg", "Sculptural Liquid Chrome", "Secondary Family", "silver", COLOR_ICY_BLUE, False),
            ("03", "The Identity", "RUPTURE_M16_v1.jpg", "Reflective Globes & Rings", "Primary Family", "cyan", COLOR_PALE_CYAN, False),
            ("04", "Save The Date", "RUPTURE_M53_v1.jpg", "Sculptural Liquid Chrome", "Secondary Family", "cyan", COLOR_ICY_BLUE, False),
            ("05", "Main Event Poster", "RUPTURE_M02_v1.jpg", "Reflective Globes & Rings", "Primary Family", "cobalt", COLOR_PALE_CYAN, False),
            ("06", "The Lineup", "RUPTURE_M28_v1.jpg", "Sculptural Liquid Chrome", "Secondary Family", "cyan", COLOR_ICY_BLUE, False),
            ("07", "Sound System Focus", "RUPTURE_M61_v1.jpg", "Reflective Globes & Rings", "Primary Family", "cyan", COLOR_PALE_CYAN, False),
            ("08", "The Sanctuary", "RUPTURE_M88_v1.jpg", "Sculptural Liquid Chrome", "Secondary Family", "silver", COLOR_PALE_CYAN, False),
            ("09", "Artist Spotlight", "RUPTURE_M78_v1.jpg", "Reflective Globes & Rings", "Primary Family", "cyan", COLOR_ICY_BLUE, False),
            ("10", "Spatial Geometry", "RUPTURE_M52_v1.jpg", "Sculptural Liquid Chrome", "Secondary Family", "cobalt", COLOR_PALE_CYAN, False),
            ("11", "Location Coordinates", "RUPTURE_M81_v1.jpg", "Reflective Globes & Rings", "Primary Family", "cyan", COLOR_ICY_BLUE, False),
            ("12", "The Countdown (7 Days)", "RUPTURE_M137_v1.jpg", "Sculptural Liquid Chrome", "Secondary Family", "cyan", COLOR_PALE_CYAN, False),
            ("13", "Last Tickets", "RUPTURE_M98_v1.jpg", "Reflective Globes & Rings", "Primary Family", "red", COLOR_MOLTEN_RED, True),
            ("14", "Practical Guide", "RUPTURE_M97_v1.jpg", "Sculptural Liquid Chrome", "Secondary Family", "cyan", COLOR_ICY_BLUE, False),
            ("15", "Tonight", "RUPTURE_M126_v1.jpg", "Reflective Globes & Rings", "Primary Family", "cyan", COLOR_PALE_CYAN, False)
        ]
    },
    {
        "id": "edition_10_spectrum_mutation",
        "title": "EDITION 10: SPECTRUM MUTATION",
        "short_title": "Spectrum Mutation",
        "posts": [
            ("01", "The First Signal", "RUPTURE_M68_v1.jpg", "Reflective Globes & Rings", "Multi-Family", "emerald", COLOR_EMERALD, False),
            ("02", "The Manifesto", "RUPTURE_M119_v1.jpg", "Folded Liquid Surfaces", "Multi-Family", "red", COLOR_MOLTEN_RED, False),
            ("03", "The Identity", "RUPTURE_M11_v1.jpg", "Translucent Glass Membrane", "Multi-Family", "silver", COLOR_WHITE, False),
            ("04", "Save The Date", "RUPTURE_M132_v1.jpg", "Folded Liquid Surfaces", "Multi-Family", "duotone_purple_cyan", COLOR_PALE_CYAN, False),
            ("05", "Main Event Poster", "RUPTURE_M72_v1.jpg", "Translucent Glass Membrane", "Multi-Family", "red", COLOR_MOLTEN_RED, True),
            ("06", "The Lineup", "RUPTURE_M96_v1.jpg", "Reflective Globes & Rings", "Multi-Family", "purple", COLOR_ULTRAVIOLET, False),
            ("07", "Sound System Focus", "RUPTURE_M139_v1.jpg", "Pearlescent Silver Fluid", "Multi-Family", "cyan", COLOR_PALE_CYAN, False),
            ("08", "The Sanctuary", "RUPTURE_M108_v1.jpg", "Folded Liquid Surfaces", "Multi-Family", "amber", COLOR_AMBER, False),
            ("09", "Artist Spotlight", "RUPTURE_M12_v1.jpg", "Sculptural Liquid Chrome", "Multi-Family", "duotone_purple_cyan", COLOR_LAVENDER, False),
            ("10", "Spatial Geometry", "RUPTURE_M84_v1.jpg", "Folded Liquid Surfaces", "Multi-Family", "cobalt", COLOR_ICY_BLUE, False),
            ("11", "Location Coordinates", "RUPTURE_M106_v1.jpg", "Reflective Globes & Rings", "Multi-Family", "magenta", COLOR_MAGENTA, False),
            ("12", "The Countdown (7 Days)", "RUPTURE_M134_v1.jpg", "Folded Liquid Surfaces", "Multi-Family", "emerald", COLOR_EMERALD, False),
            ("13", "Last Tickets", "RUPTURE_M55_v1.jpg", "Folded Liquid Surfaces", "Multi-Family", "duotone_red_amber", COLOR_MOLTEN_RED, True),
            ("14", "Practical Guide", "RUPTURE_M113_v1.jpg", "Sculptural Liquid Chrome", "Multi-Family", "silver", COLOR_SILVER, False),
            ("15", "Tonight", "RUPTURE_M141_v1.jpg", "Folded Liquid Surfaces", "Multi-Family", "amber", COLOR_AMBER, False)
        ]
    }
]

def main():
    print("🚀 Starting RUPTURE Editions 07, 08, 09, 10 Generator...")
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

    print(f"\n✨ Successfully generated all {total_posts} posts for Editions 07, 08, 09, 10!")

if __name__ == "__main__":
    main()
