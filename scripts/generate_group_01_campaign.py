#!/usr/bin/env python3
"""
RUPTURE Studio — Dedicated Campaign Generator for Group 1 (Group Test 1)
Generates:
  - 15 authentic underground techno party announcement posters (1080x1350 4:5 and 1080x1080 1:1)
  - Outputs to:
    - campaign/editions/edition_grp_01_group_test_1/posts/
    - public/campaign/editions/edition_grp_01_group_test_1/posts/
    - Artifact directory for previewing
"""

import os
import sys
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MASTERS_DIR = os.path.join(ROOT, "artworks", "masters")
EDITION_ID = "edition_grp_01_group_test_1"
EDITION_DIR = os.path.join(ROOT, "campaign", "editions", EDITION_ID)
OUTPUT_POSTS = os.path.join(EDITION_DIR, "posts")
OUTPUT_TEMPLATES = os.path.join(EDITION_DIR, "templates")

PUBLIC_EDITION_DIR = os.path.join(ROOT, "public", "campaign", "editions", EDITION_ID)
PUBLIC_POSTS = os.path.join(PUBLIC_EDITION_DIR, "posts")
PUBLIC_TEMPLATES = os.path.join(PUBLIC_EDITION_DIR, "templates")
BRAIN_DIR = "/Users/alex/.gemini/antigravity/brain/caf6c4ea-9b06-4d9f-9428-74b197be24de"

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
COLOR_PEARL = (214, 218, 223)
COLOR_MOLTEN_RED = (255, 51, 68)

def load_master_artwork(filename, target_size=(1080, 1350), scale=1.05, offset=(0, 0)):
    path = os.path.join(MASTERS_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing master artwork: {path}")
    img = Image.open(path).convert("RGBA")
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

# ==============================================================================
# BUILDERS FOR POSTS
# ==============================================================================

def build_post_image(art_file, post_id, title, edition_title, family_name, family_role, accent_color=COLOR_PALE_CYAN, has_red=False):
    base = load_master_artwork(art_file, (1080, 1350), scale=1.06, offset=(0, -20))
    pid = int(post_id)
    
    # Layer gradient overlays according to post type
    if pid in [1, 15]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=500, max_alpha=230)
    elif pid in [2, 8]:
        base = apply_gradient_overlay(base, direction="top", height_px=750, max_alpha=245)
    elif pid in [3]:
        base = draw_translucent_panel(base, (64, 460, 1016, 820), fill_color=(8, 10, 14, 195), border_color=(45, 55, 70, 255))
    elif pid in [4, 11]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=560, max_alpha=235)
    elif pid in [5]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=700, max_alpha=248)
        base = apply_gradient_overlay(base, direction="top", height_px=380, max_alpha=210)
    elif pid in [6, 14]:
        base = draw_translucent_panel(base, (64, 180, 1016, 1160), fill_color=(8, 10, 14, 220), border_color=(45, 55, 70, 255))
    elif pid in [7, 9, 10]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=520, max_alpha=230)
    elif pid in [12]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=620, max_alpha=235)
    elif pid in [13]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=560, max_alpha=240)
        
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_technical_frame(draw, accent_color=accent_color)
    draw_header_meta(draw, f"POST {post_id}", "GROUP TEST 1", f"TRANSMISSION 01", accent_color=accent_color)
    draw_footer_meta(draw, "RUPTURE // TRANSMISSION 01", "CURATED STYLE GROUP ROLLOUT")

    font_mono = get_font(18, "mono")
    font_bold = get_font(68, "condensed_bold")
    font_sub = get_font(24, "regular")
    
    # Post 1: First Signal
    if pid == 1:
        cy = 820
        draw_letterspaced(draw, (540, cy), "INITIAL FREQUENCY DETECTED", font_mono, accent_color, spacing=4, align="center")
        draw.line([(420, cy + 34), (660, cy + 34)], fill=accent_color, width=1)
        draw_letterspaced(draw, (540, cy + 50), "SOMETHING IS SHIFTING.", font_bold, COLOR_WHITE, spacing=1, align="center")
        draw_letterspaced(draw, (540, cy + 135), "NOT EVERYTHING NEEDS TO FOLLOW THE PATTERN.", font_sub, COLOR_SILVER, spacing=2, align="center")
        draw_letterspaced(draw, (540, cy + 195), "TRANSMISSION 01 · STAND BY FOR SIGNAL", font_mono, (85, 95, 110), spacing=2, align="center")

    # Post 2: Manifesto
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
            ("01", "BREAKING AWAY FROM CONVENTION", "Rejecting commercial club formulas, VIP divisions, and predictable playlists."),
            ("02", "ACOUSTIC INTEGRITY & INTENSITY", "Fast, hypnotic, dark and groove-laden rhythms curated with zero compromise."),
            ("03", "A SACRED DANCEFLOOR COMMUNITY", "A space built on safety, mutual respect, zero judgement, and complete bodily freedom."),
            ("04", "FREEDOM OF SOUND AND BODY", "Come for the music. Leave your ego outside.")
        ]
        for num, headline, desc in pts:
            draw.text((80, y), f"[{num}]", font=font_mono, fill=accent_color)
            draw.text((140, y), headline, font=get_font(22, "bold"), fill=COLOR_WHITE)
            draw.text((140, y + 32), desc, font=get_font(24, "regular"), fill=COLOR_SILVER)
            y += 92

    # Post 3: Identity / Logotype
    elif pid == 3:
        cy = 505
        font_logo = get_font(128, "condensed_black")
        draw_letterspaced(draw, (540, cy), "R U P T U R E", font_logo, COLOR_WHITE, spacing=14, align="center")
        draw.line([(240, cy + 145), (840, cy + 145)], fill=accent_color, width=1)
        draw_letterspaced(draw, (540, cy + 165), "UNDERGROUND TECHNO COLLECTIVE", get_font(28, "condensed_bold"), accent_color, spacing=5, align="center")
        draw_letterspaced(draw, (540, cy + 225), "MAURITIUS · TRANSMISSION 01 · EST. 2026", font_mono, COLOR_SILVER, spacing=2, align="center")

    # Post 4: Save The Date
    elif pid == 4:
        y = 770
        draw.rectangle([(80, y), (360, y + 42)], fill=COLOR_WHITE)
        draw_letterspaced(draw, (98, y + 10), "SAVE THE DATE", get_font(20, "bold"), COLOR_VOID, spacing=2)
        y += 65
        draw.text((80, y), "TRANSMISSION 01", font=get_font(84, "condensed_black"), fill=COLOR_WHITE)
        y += 95
        draw.text((80, y), "FRIDAY · 24 APRIL · 22:00 — 06:00", font=get_font(32, "bold"), fill=accent_color)
        y += 50
        draw.text((80, y), "SECRET INDUSTRIAL SILO // NORTH COAST, MAURITIUS", font=get_font(24, "regular"), fill=COLOR_SILVER)

    # Post 5: Main Event Poster (Centerpiece Hero Poster!)
    elif pid == 5:
        y = 200
        draw_letterspaced(draw, (540, y), "RUPTURE COLLECTIVE PRESENTS", font_mono, accent_color, spacing=4, align="center")
        y += 45
        draw_letterspaced(draw, (540, y), "TRANSMISSION 01", get_font(102, "condensed_black"), COLOR_WHITE, spacing=2, align="center")
        y += 115
        if has_red:
            draw.line([(200, y), (880, y)], fill=COLOR_MOLTEN_RED, width=3)
        else:
            draw.line([(200, y), (880, y)], fill=accent_color, width=2)
        y += 35
        draw_letterspaced(draw, (540, y), "FOUR ARTISTS // EIGHT HOURS OF SOUND", font_mono, COLOR_SILVER, spacing=2, align="center")
        y += 50
        lineup = [
            "[MODULAR LIVE] — BERLIN (HARDWARE SET)",
            "[RESIDENT 01] — FAST HYPNOTIC TECHNO",
            "[RESIDENT 02] — DARK GROOVY DRIVE",
            "[SPECIAL GUEST] — SUB-BASS OPENING"
        ]
        for act in lineup:
            draw_letterspaced(draw, (540, y), act, get_font(33, "condensed_bold"), COLOR_WHITE, spacing=1, align="center")
            y += 48
        y += 20
        draw.rectangle([(220, y), (860, y + 70)], fill=(12, 14, 18, 220), outline=COLOR_DARK_SLATE)
        draw_letterspaced(draw, (540, y + 14), "SECRET INDUSTRIAL SILO · MAURITIUS", font_mono, accent_color, spacing=2, align="center")
        draw_letterspaced(draw, (540, y + 40), "ADVANCE PRESALE ONLY · CAPACITY 400 STRICT", font_mono, COLOR_SILVER, spacing=1, align="center")

    # Post 6: Lineup Architecture
    elif pid == 6:
        y = 220
        draw_letterspaced(draw, (540, y), "THE LINEUP ARCHITECTURE", font_mono, accent_color, spacing=4, align="center")
        y += 45
        draw_letterspaced(draw, (540, y), "FOUR SONIC CHAPTERS", get_font(60, "condensed_bold"), COLOR_WHITE, spacing=1, align="center")
        y += 75
        acts = [
            ("22:00 — 00:30", "[SPECIAL GUEST]", "DEEP AMBIENT & SUB-BASS DRIVES", "Modular analog synthesis constructing the initial hypnotic drift."),
            ("00:30 — 02:30", "[RESIDENT 02]", "HYPNOTIC & DRIVING TECHNO", "Precision groove, layered tension, and continuous momentum."),
            ("02:30 — 04:30", "[HEADLINER LIVE]", "RAW INDUSTRIAL MODULAR PEAK", "Fast percussive drive, mechanical sub-bass, and physical catharsis."),
            ("04:30 — 06:00", "[RESIDENT 01]", "CLOSING CEREMONY // SUB-BASS RITUAL", "Dark euphoric groove into the early morning light.")
        ]
        for time_slot, act_name, title_line, desc in acts:
            draw.text((100, y), time_slot, font=font_mono, fill=accent_color)
            draw.text((360, y), act_name, font=get_font(26, "bold"), fill=COLOR_WHITE)
            draw.text((100, y + 28), title_line, font=get_font(22, "condensed_bold"), fill=COLOR_PEARL)
            draw.text((100, y + 56), desc, font=get_font(18, "regular"), fill=COLOR_SLATE)
            draw.line([(100, y + 90), (980, y + 90)], fill=(40, 48, 60), width=1)
            y += 115

    # Post 7: Sound System 25 Hz
    elif pid == 7:
        y = 780
        draw_letterspaced(draw, (80, y), "ACOUSTIC REINFORCEMENT", font_mono, accent_color, spacing=3)
        y += 35
        draw.text((80, y), "CUSTOM 25 HZ SUB ARRAY.", font=get_font(64, "condensed_bold"), fill=COLOR_WHITE)
        y += 75
        draw.text((80, y), "ENGINEERED DOWN TO 25 HZ FOR VISCERAL PHYSICAL PRESSURE", font=get_font(23, "bold"), fill=COLOR_PEARL)
        y += 40
        draw.text((80, y), "Calibrated specifically to eliminate reflective flutter in industrial concrete space.", font=get_font(22, "regular"), fill=COLOR_SLATE)

    # Post 8: Sanctuary / Code of Conduct
    elif pid == 8:
        y = 220
        draw_letterspaced(draw, (80, y), "COMMUNITY CODE // THE SANCTUARY", font_mono, accent_color, spacing=3)
        y += 40
        draw.text((80, y), "SACRED DANCEFLOOR.", font=get_font(72, "condensed_bold"), fill=COLOR_WHITE)
        y += 85
        rules = [
            ("NO PHOTOS. NO FLASH.", "Experience the music with your senses, not your screen. Phone cameras taped at door."),
            ("ZERO HARASSMENT TOLERANCE.", "Complete safety for all identities, bodies, and forms of expression."),
            ("RESPECT THE SPACE.", "Leave no trace. Preserve the integrity of our underground sanctuary."),
            ("COMMUNAL DISSOLUTION.", "Leave ego behind. Become one with the low frequencies.")
        ]
        for rh, rd in rules:
            draw.text((80, y), f"// {rh}", font=get_font(24, "bold"), fill=COLOR_WHITE)
            draw.text((80, y + 32), rd, font=get_font(20, "regular"), fill=COLOR_SILVER)
            y += 85

    # Post 9: Artist Spotlight
    elif pid == 9:
        y = 780
        draw_letterspaced(draw, (80, y), "ARTIST SPOTLIGHT // HEADLINER", font_mono, accent_color, spacing=3)
        y += 35
        draw.text((80, y), "[LIVE HARDWARE ACT]", font=get_font(72, "condensed_bold"), fill=COLOR_WHITE)
        y += 75
        draw.text((80, y), "ANALOG MODULAR SYNTHESIS & 140 BPM LIVE HYPNOSIS", font=get_font(24, "bold"), fill=COLOR_PEARL)
        y += 40
        draw.text((80, y), "No pre-recorded USBs. Pure spontaneous real-time creation on the dancefloor.", font=get_font(22, "regular"), fill=COLOR_SLATE)

    # Post 10: Venue Architecture
    elif pid == 10:
        y = 780
        draw_letterspaced(draw, (80, y), "VENUE ARCHITECTURE", font_mono, accent_color, spacing=3)
        y += 35
        draw.text((80, y), "THE INDUSTRIAL SILO.", font=get_font(68, "condensed_bold"), fill=COLOR_WHITE)
        y += 75
        draw.text((80, y), "RAW BRUTALIST CONCRETE, SOARING REFLECTIONS, MONOLITHIC MASS", font=get_font(22, "bold"), fill=COLOR_PEARL)
        y += 40
        draw.text((80, y), "A decommissioned coastal industrial shell transformed by monochromatic amber washes.", font=get_font(22, "regular"), fill=COLOR_SLATE)

    # Post 11: GPS Coordinates
    elif pid == 11:
        y = 780
        draw.rectangle([(80, y), (440, y + 42)], fill=COLOR_WHITE)
        draw_letterspaced(draw, (98, y + 10), "GPS COORDINATES // VENUE", get_font(20, "bold"), COLOR_VOID, spacing=2)
        y += 65
        draw.text((80, y), "-20.3541°, 57.3682°", font=get_font(64, "condensed_bold"), fill=COLOR_WHITE)
        y += 75
        draw.text((80, y), "SECRET SITE UNLOCKED 12H PRIOR TO TICKET HOLDERS", font=get_font(24, "bold"), fill=accent_color)
        y += 40
        draw.text((80, y), "Private shuttle access and detailed parking instructions transmitted via SMS.", font=get_font(22, "regular"), fill=COLOR_SLATE)

    # Post 12: 7 Days Countdown
    elif pid == 12:
        y = 680
        draw_letterspaced(draw, (80, y), "T-MINUS 7 DAYS // COUNTDOWN", font_mono, accent_color, spacing=3)
        y += 30
        draw.text((80, y), "7 DAYS.", font=get_font(128, "condensed_black"), fill=COLOR_WHITE)
        y += 140
        draw.text((80, y), "FINAL REHEARSALS & SYSTEM RIGGING IN PROGRESS", font=get_font(24, "bold"), fill=COLOR_PEARL)
        y += 40
        draw.text((80, y), "The frequency arrives next Friday. Secure your place in the void.", font=get_font(22, "regular"), fill=COLOR_SLATE)

    # Post 13: Last Tickets Alert (Crimson Alert!)
    elif pid == 13:
        y = 760
        if has_red:
            draw.rectangle([(80, y), (440, y + 42)], fill=COLOR_MOLTEN_RED)
            draw_letterspaced(draw, (98, y + 10), "CRITICAL CAPACITY: 90%", get_font(20, "bold"), COLOR_WHITE, spacing=2)
        else:
            draw.rectangle([(80, y), (440, y + 42)], fill=accent_color)
            draw_letterspaced(draw, (98, y + 10), "FINAL ADMISSION TIER", get_font(20, "bold"), COLOR_VOID, spacing=2)
        y += 65
        draw.text((80, y), "LAST 50 TICKETS.", font=get_font(72, "condensed_bold"), fill=COLOR_WHITE)
        y += 80
        draw.text((80, y), "NO TICKETS AT THE DOOR. ADVANCE ONLY.", font=get_font(26, "bold"), fill=COLOR_MOLTEN_RED if has_red else accent_color)
        y += 40
        draw.text((80, y), "Strict 400 capacity locked to preserve space and acoustic integrity.", font=get_font(22, "regular"), fill=COLOR_SLATE)

    # Post 14: Practical Information / Logistics
    elif pid == 14:
        y = 220
        draw_letterspaced(draw, (540, y), "PRACTICAL INFORMATION // ESSENTIAL GUIDE", font_mono, accent_color, spacing=3, align="center")
        y += 40
        draw_letterspaced(draw, (540, y), "LOGISTICS & PROTOCOLS", get_font(52, "condensed_bold"), COLOR_WHITE, spacing=2, align="center")
        y += 75
        info_blocks = [
            ("[TIMETABLE]", "Doors open at 22:00 sharp. Strict door closure at 02:00. No re-entry."),
            ("[ENTRY REQUIREMENTS]", "Valid government ID required. Advance QR code must be presented. 21+ only."),
            ("[LOCATION & TRANSIT]", "Secure parking on-site. Shuttle runs every 30m from northern hub."),
            ("[AMENITIES & CARE]", "Dedicated free hydration station, quiet recovery zone, trained awareness crew.")
        ]
        for header, body in info_blocks:
            draw.text((100, y), header, font=font_mono, fill=accent_color)
            draw.text((100, y + 26), body, font=get_font(22, "regular"), fill=COLOR_WHITE)
            draw.line([(100, y + 65), (980, y + 65)], fill=(45, 55, 70), width=1)
            y += 90

    # Post 15: Tonight Summons
    elif pid == 15:
        cy = 820
        draw_letterspaced(draw, (540, cy), "THE RITUAL COMMENCES TONIGHT", font_mono, accent_color, spacing=4, align="center")
        draw.line([(380, cy + 34), (700, cy + 34)], fill=accent_color, width=1)
        draw_letterspaced(draw, (540, cy + 50), "WE ENTER THE VOID.", font_bold, COLOR_WHITE, spacing=1, align="center")
        draw_letterspaced(draw, (540, cy + 135), "DOORS 22:00 · SOUND DOWN TO 25 HZ · ZERO CLICHES", font_sub, COLOR_SILVER, spacing=2, align="center")
        draw_letterspaced(draw, (540, cy + 195), "SEE YOU IN THE DARK.", font_mono, accent_color, spacing=3, align="center")

    return img

POST_DEFINITIONS = [
    ("01", "THE FIRST SIGNAL", "RUPTURE_M74_v1.jpg", "Sculptural Liquid Chrome", "Primary Family", False),
    ("02", "THE MANIFESTO", "RUPTURE_M23_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", False),
    ("03", "THE NAME / IDENTITY", "RUPTURE_M21_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", False),
    ("04", "SAVE THE DATE", "RUPTURE_M34_v1.jpg", "Tectonic Faults", "Secondary Family", False),
    ("05", "THE MAIN EVENT POSTER", "RUPTURE_M43_v1.jpg", "Tectonic Faults", "Primary Family", True),
    ("06", "THE LINEUP", "RUPTURE_M86_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", False),
    ("07", "SOUND SYSTEM (25 HZ)", "RUPTURE_M78_v1.jpg", "Kinetic Annuli", "Secondary Family", False),
    ("08", "THE SANCTUARY / CODE OF CONDUCT", "RUPTURE_M38_v1.jpg", "Tectonic Faults", "Secondary Family", False),
    ("09", "ARTIST SPOTLIGHT", "RUPTURE_M114_v1.jpg", "Sculptural Liquid Chrome", "Primary Family", False),
    ("10", "VENUE / SPACE REVEAL", "RUPTURE_M99_v1.jpg", "Tectonic Faults", "Secondary Family", False),
    ("11", "LOCATION COORDINATES", "RUPTURE_M126_v1.jpg", "Folded Liquid Surfaces", "Secondary Family", False),
    ("12", "7 DAYS COUNTDOWN", "RUPTURE_M100_v1.jpg", "Tectonic Faults", "Secondary Family", False),
    ("13", "LAST TICKETS", "RUPTURE_M119_v1.jpg", "Tectonic Faults", "Primary Family", True),
    ("14", "PRACTICAL LOGISTICS", "RUPTURE_M108_v1.jpg", "Tectonic Faults", "Secondary Family", False),
    ("15", "DAY OF EVENT SUMMONS", "RUPTURE_M80_v1.jpg", "Tectonic Faults", "Secondary Family", False),
]

def main():
    print(f"🚀 Generating 15 Posters for Group 1 ({EDITION_ID})...")
    for pid, title, art_file, family_name, family_role, has_red in POST_DEFINITIONS:
        print(f"  → Post {pid}: {title} [{family_name}] ({art_file}) [Red Accent: {has_red}]")
        img_4x5 = build_post_image(
            art_file=art_file,
            post_id=pid,
            title=title,
            edition_title="TRANSMISSION 01",
            family_name=family_name,
            family_role=family_role,
            accent_color=COLOR_PALE_CYAN,
            has_red=has_red
        )
        
        stem = f"RUPTURE_IG_POST_{pid}"
        
        # Save 4:5
        img_4x5.save(os.path.join(OUTPUT_POSTS, f"{stem}.png"))
        img_4x5.save(os.path.join(OUTPUT_POSTS, f"{stem}.jpg"), quality=95)
        img_4x5.save(os.path.join(PUBLIC_POSTS, f"{stem}.png"))
        img_4x5.save(os.path.join(PUBLIC_POSTS, f"{stem}.jpg"), quality=95)
        
        # Save 1:1 square crop
        img_1x1 = img_4x5.crop((0, 135, 1080, 1215))
        img_1x1.save(os.path.join(OUTPUT_POSTS, f"{stem}_sq.jpg"), quality=95)
        img_1x1.save(os.path.join(PUBLIC_POSTS, f"{stem}_sq.jpg"), quality=95)
        
        # Save brain artifact copies
        if os.path.exists(BRAIN_DIR):
            img_4x5.save(os.path.join(BRAIN_DIR, f"{EDITION_ID}_{stem}.jpg"), quality=95)
            img_1x1.save(os.path.join(BRAIN_DIR, f"{EDITION_ID}_{stem}_sq.jpg"), quality=95)

    print("✨ Successfully generated all 15 campaign posters for Group 1!")

if __name__ == "__main__":
    main()
