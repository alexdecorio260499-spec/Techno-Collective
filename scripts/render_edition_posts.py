#!/usr/bin/env python3
"""
RUPTURE Studio — Universal Campaign Edition Post Renderer
Renders full authentic post content for any campaign edition:
  - 4:5 Instagram Feed Flyers (1080x1350)
  - 1:1 Square Safe-Crop Profile Images (1080x1080)
  - 9:16 Vertical Reel Concepts (1080x1920) for Video Posts (07, 08, 09, 15)
  - Updates edition_data.json with full rich metadata (archetypes, descriptions, videoData, safeArea)
  - Updates editions_manifest.json with basePath and active links
"""

import os
import sys
import json
import math
import random
import argparse
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MASTERS_DIR = os.path.join(ROOT, "artworks", "masters")
BRAIN_DIR = "/Users/alex/.gemini/antigravity/brain/caf6c4ea-9b06-4d9f-9428-74b197be24de"

FONT_HELVETICA_TTC = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_MONO_TTF = "/System/Library/Fonts/SFNSMono.ttf"

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

COLOR_WHITE = (255, 255, 255)
COLOR_OFFWHITE = (235, 238, 242)
COLOR_SILVER = (195, 202, 212)
COLOR_MUTED_SILVER = (150, 158, 172)
COLOR_SLATE = (110, 118, 132)
COLOR_DARK_SLATE = (45, 50, 60)
COLOR_CHARCOAL = (24, 26, 32)
COLOR_VOID = (8, 9, 12)

COLOR_PALE_CYAN = (122, 231, 255)
COLOR_ICY_BLUE = (94, 197, 255)
COLOR_PEARL = (214, 218, 223)
COLOR_MOLTEN_RED = (255, 51, 68)

def hex_to_rgb(hex_str, fallback=(122, 231, 255)):
    if not hex_str or not isinstance(hex_str, str):
        return fallback
    h = hex_str.strip().lstrip('#')
    if len(h) == 6:
        try:
            return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))
        except Exception:
            return fallback
    return fallback

def load_master_artwork(filename, target_size=(1080, 1350), scale=1.05, offset=(0, 0)):
    path = os.path.join(MASTERS_DIR, filename)
    if not os.path.exists(path):
        # Fallback to any existing master if specified one missing
        for f in os.listdir(MASTERS_DIR):
            if f.endswith(".jpg"):
                path = os.path.join(MASTERS_DIR, f)
                break
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
            alpha = int(max_alpha * ((y - start_y) / height_px) ** 1.3)
            d.line([(0, y), (w, y)], fill=(8, 9, 12, min(255, alpha)))
    elif direction == "top":
        for y in range(0, height_px):
            alpha = int(max_alpha * (1.0 - (y / height_px)) ** 1.3)
            d.line([(0, y), (w, y)], fill=(8, 9, 12, min(255, alpha)))
    return Image.alpha_composite(base_img.convert("RGBA"), overlay)

def draw_translucent_panel(base_img, xy, fill_color=(8, 10, 14, 210), border_color=(45, 55, 70, 255)):
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

def draw_technical_frame(draw, w=1080, h=1350, margin=48, accent_color=COLOR_PALE_CYAN, crop_ticks=True):
    m = margin
    bl = 24
    # Corner brackets
    draw.line([(m, m), (m + bl, m)], fill=accent_color, width=1)
    draw.line([(m, m), (m, m + bl)], fill=accent_color, width=1)
    draw.line([(w - m, m), (w - m - bl, m)], fill=accent_color, width=1)
    draw.line([(w - m, m), (w - m, m + bl)], fill=accent_color, width=1)
    draw.line([(m, h - m), (m + bl, h - m)], fill=accent_color, width=1)
    draw.line([(m, h - m), (m, h - m - bl)], fill=accent_color, width=1)
    draw.line([(w - m, h - m), (w - m - bl, h - m)], fill=accent_color, width=1)
    draw.line([(w - m, h - m), (w - m, h - m - bl)], fill=accent_color, width=1)
    
    if crop_ticks and h == 1350:
        # 1:1 safe crop tick marks at Y=135 and Y=1215
        draw.line([(m, 135), (m + 8, 135)], fill=(65, 75, 90), width=1)
        draw.line([(w - m - 8, 135), (w - m, 135)], fill=(65, 75, 90), width=1)
        draw.line([(m, 1215), (m + 8, 1215)], fill=(65, 75, 90), width=1)
        draw.line([(w - m - 8, 1215), (w - m, 1215)], fill=(65, 75, 90), width=1)

def draw_cinematic_dj_stage(draw, base_img, box, artist_title, time_slot, bpm_text, seed=101):
    bx1, by1, bx2, by2 = box
    bw = bx2 - bx1
    bh = by2 - by1
    
    stage = Image.new("RGBA", (bw, bh), (10, 12, 16, 255))
    sdraw = ImageDraw.Draw(stage)
    
    # Ambient overhead cone spotlight
    spot_cx = int(bw * 0.52)
    for r in range(int(bh * 0.7), 0, -8):
        alpha = int(28 * (1.0 - r / (bh * 0.7)))
        sdraw.ellipse([(spot_cx - r, -r // 2), (spot_cx + r, int(r * 1.2))], fill=(130, 145, 170, alpha))
        
    # Volumetric haze rays
    for angle in [-24, -12, 6, 18, 30]:
        rad = math.radians(angle)
        x_end = spot_cx + int(math.tan(rad) * bh)
        sdraw.line([(spot_cx, 0), (x_end, bh)], fill=(160, 175, 200, 14), width=32)
        
    dj_cx = int(bw * 0.5)
    tbl_y = int(bh * 0.76)
    
    # Performance table
    sdraw.rectangle([(int(bw * 0.12), tbl_y), (int(bw * 0.88), tbl_y + 90)], fill=(18, 20, 26, 240))
    sdraw.line([(int(bw * 0.12), tbl_y), (int(bw * 0.88), tbl_y)], fill=(70, 78, 92), width=2)
    
    # Eurorack knobs and LEDs
    rnd = random.Random(seed)
    for k in range(24):
        kx = int(bw * 0.16) + k * 20
        ky = tbl_y + 16 + (k % 3) * 18
        sdraw.ellipse([(kx, ky), (kx + 6, ky + 6)], fill=(120, 130, 145))
        if k % 4 == 0:
            sdraw.ellipse([(kx + 1, ky + 1), (kx + 4, ky + 4)], fill=COLOR_ICY_BLUE)
            
    # Performer silhouette
    sdraw.ellipse([(dj_cx - 46, tbl_y - 170), (dj_cx + 46, tbl_y - 80)], fill=(16, 18, 22))  # Head
    sdraw.arc([(dj_cx - 50, tbl_y - 160), (dj_cx + 50, tbl_y - 105)], start=160, end=380, fill=(180, 190, 205), width=4)
    shoulder_poly = [
        (dj_cx - 120, tbl_y),
        (dj_cx - 85, tbl_y - 95),
        (dj_cx - 35, tbl_y - 75),
        (dj_cx + 35, tbl_y - 75),
        (dj_cx + 85, tbl_y - 95),
        (dj_cx + 120, tbl_y),
    ]
    sdraw.polygon(shoulder_poly, fill=(14, 16, 20))
    sdraw.line([(dj_cx - 75, tbl_y - 65), (dj_cx - 35, tbl_y + 10)], fill=(22, 25, 32), width=20)
    sdraw.line([(dj_cx + 75, tbl_y - 65), (dj_cx + 45, tbl_y + 10)], fill=(22, 25, 32), width=20)
    
    # HUD Bar & audio waveform
    sdraw.line([(20, 36), (bw - 20, 36)], fill=(50, 58, 70), width=1)
    sdraw.ellipse([(24, 18), (34, 28)], fill=COLOR_WHITE)
    sdraw.text((42, 16), "● LIVE HARDWARE // PCM 24-BIT 96KHZ", font=get_font(13, "mono"), fill=COLOR_WHITE)
    sdraw.text((bw - 180, 16), f"{bpm_text} // {time_slot}", font=get_font(13, "mono"), fill=COLOR_ICY_BLUE)
    
    # Real-time waveform display in HUD
    for wx in range(bw - 240, bw - 20, 4):
        wh = int(abs(math.sin(wx * 0.12 + seed)) * 14) + 2
        sdraw.line([(wx, 26 - wh // 2), (wx, 26 + wh // 2)], fill=COLOR_ICY_BLUE, width=2)
        
    base_img.paste(stage, (bx1, by1), stage)

ARCHETYPE_MAP = {
    1: ("Full Artwork Composition", "Complete abstract artwork composition featuring a monumental suspended liquid form with minimal technical typography in the safe zone.", "Full-bleed hero composition with deep obsidian bottom fade (480px) and precision technical frame."),
    2: ("Typography-Led Composition", "Swiss editorial typography on deep obsidian void. Artwork is restrained to razor-thin accent margins.", "Razor-thin metallic sheared accent rules at top and bottom margins."),
    3: ("Artwork Fragments & Framing", "Asymmetrical composition with cantilevered liquid chrome aerodynamic dagger cutting in from top-right.", "Asymmetrical fragment entering from top-right corner, balanced against monumental RUPTURE logotype."),
    4: ("Full Artwork Composition", "High-contrast announcement flyer with prominent date block and safe-area typography.", "Suspended fluid sculpture occupying upper 60% of frame with dark gradient lower section."),
    5: ("Full Artwork Composition", "Monumental centerpiece hero event poster with full artist billing, acoustic reinforcement specs, and ticket protocol.", "Centerpiece high-contrast liquid metal form anchoring the primary party announcement."),
    6: ("Typography-Led Composition", "Clean 4-chapter musical timetable and timetable architecture with subtle background fluid strata.", "Translucent obsidian protective glass panel over liquid metal background texture."),
    7: ("Cinematic DJ Video", "Cinematic live hardware performance preview stage with modular synthesizer controls and real-time audio waveform.", "Integrated video stage with interactive 142 BPM waveform HUD and hardware playback."),
    8: ("Cinematic DJ Video", "Community code and sanctuary policy presented over cinematic dark performance stage.", "Cinematic performance frame with illuminated rules [01] to [04] for dancefloor safety."),
    9: ("Cinematic DJ Video", "Dedicated international headliner artist spotlight with analog live modular breakdown.", "Live performance staging with modular Eurorack patch cables and waveform visualizer."),
    10: ("Cropped Macro Artwork", "Macro architectural crop of raw concrete industrial textures and liquid metal refractions.", "Macro close-up composition emphasizing physical material weight and brutalist industrial setting."),
    11: ("Mixed-Media Composition", "GPS coordinate release mechanism and navigational logistics.", "Technical coordinates container with brutalist typography and coordinate release protocol."),
    12: ("Full Artwork Composition", "Colossal kinetic countdown number 7 anchored by aerodynamic fluid spires.", "Monumental typography cutting into high-tension liquid chrome mass."),
    13: ("Typography-Led Composition", "Urgent final admission warning with bold typography and capacity restrictions.", "High-contrast alert typography with strict 400 capacity ceiling."),
    14: ("Mixed-Media Composition", "Mobile-readable practical guide with timetable, transit, entry rules, and harm reduction info.", "Modular information grid on protective obsidian panel with clean divider rules."),
    15: ("Cinematic DJ Video", "Final summons on event day: monumental white TONIGHT on sweeping fluid chrome.", "Peak anticipation cinematic visual with colossal TONIGHT summons.")
}

def build_post_image(art_file, post_id, title, edition_title, group_name, accent_color=COLOR_PALE_CYAN, has_red=False):
    pid = int(post_id)
    base = load_master_artwork(art_file, (1080, 1350), scale=1.06, offset=(0, -20))
    
    # Gradients & overlays
    if pid in [1, 15]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=520, max_alpha=230)
    elif pid in [2, 8]:
        base = apply_gradient_overlay(base, direction="top", height_px=750, max_alpha=245)
    elif pid == 3:
        base = draw_translucent_panel(base, (64, 460, 1016, 820), fill_color=(8, 10, 14, 195), border_color=(45, 55, 70, 255))
    elif pid in [4, 11]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=560, max_alpha=235)
    elif pid == 5:
        base = apply_gradient_overlay(base, direction="bottom", height_px=700, max_alpha=248)
        base = apply_gradient_overlay(base, direction="top", height_px=380, max_alpha=210)
    elif pid in [6, 14]:
        base = draw_translucent_panel(base, (64, 180, 1016, 1160), fill_color=(8, 10, 14, 220), border_color=(45, 55, 70, 255))
    elif pid in [7, 9]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=520, max_alpha=230)
    elif pid == 10:
        base = apply_gradient_overlay(base, direction="bottom", height_px=520, max_alpha=230)
    elif pid in [12, 13]:
        base = apply_gradient_overlay(base, direction="bottom", height_px=620, max_alpha=240)
        
    img = base.convert("RGB")
    draw = ImageDraw.Draw(img)
    
    # Technical frame & headers
    draw_technical_frame(draw, 1080, 1350, margin=48, accent_color=accent_color)
    
    font_mono = get_font(15, "mono")
    draw_letterspaced(draw, (64, 68), f"RUPTURE // {pid:02d}", font_mono, COLOR_WHITE, spacing=2)
    grp_badge = group_name.upper()[:22]
    draw.rectangle([(230, 68), (230 + len(grp_badge)*9 + 18, 88)], fill=(18, 22, 28), outline=(50, 58, 70))
    draw_letterspaced(draw, (238, 71), grp_badge, get_font(13, "mono"), accent_color, spacing=1)
    draw_letterspaced(draw, (1016, 68), edition_title.upper()[:30], font_mono, COLOR_SLATE, spacing=1, align="right")
    
    draw_letterspaced(draw, (64, 1262), f"RUPTURE // {edition_title.upper()[:24]}", font_mono, (90, 100, 115), spacing=2)
    draw_letterspaced(draw, (1016, 1262), "25 HZ SUB RIG // INDUSTRIAL ARCHITECTURE", font_mono, COLOR_SLATE, spacing=1, align="right")
    
    font_bold = get_font(68, "condensed_bold")
    font_sub = get_font(24, "regular")
    
    # Post specific layouts
    if pid == 1:
        cy = 820
        draw_letterspaced(draw, (540, cy), "INITIAL FREQUENCY DETECTED", font_mono, accent_color, spacing=4, align="center")
        draw.line([(420, cy + 34), (660, cy + 34)], fill=accent_color, width=1)
        draw_letterspaced(draw, (540, cy + 50), "SOMETHING IS SHIFTING.", font_bold, COLOR_WHITE, spacing=1, align="center")
        draw_letterspaced(draw, (540, cy + 135), "NOT EVERYTHING NEEDS TO FOLLOW THE PATTERN.", font_sub, COLOR_SILVER, spacing=2, align="center")
        draw_letterspaced(draw, (540, cy + 195), f"{edition_title.upper()} · STAND BY FOR SIGNAL", font_mono, (85, 95, 110), spacing=2, align="center")
        
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
            
    elif pid == 3:
        cy = 505
        draw_letterspaced(draw, (540, cy), "R U P T U R E", get_font(128, "condensed_black"), COLOR_WHITE, spacing=14, align="center")
        draw.line([(240, cy + 145), (840, cy + 145)], fill=accent_color, width=1)
        draw_letterspaced(draw, (540, cy + 165), "UNDERGROUND TECHNO COLLECTIVE", get_font(28, "condensed_bold"), accent_color, spacing=5, align="center")
        draw_letterspaced(draw, (540, cy + 225), f"MAURITIUS · {group_name.upper()} · EST. 2026", font_mono, COLOR_SILVER, spacing=2, align="center")
        
    elif pid == 4:
        y = 770
        draw.rectangle([(80, y), (360, y + 42)], fill=COLOR_WHITE)
        draw_letterspaced(draw, (98, y + 10), "SAVE THE DATE", get_font(20, "bold"), COLOR_VOID, spacing=2)
        y += 65
        draw.text((80, y), edition_title.upper()[:22], font=get_font(84, "condensed_black"), fill=COLOR_WHITE)
        y += 95
        draw.text((80, y), "FRIDAY · 28 NOVEMBER · 22:00 — 06:00", font=get_font(32, "bold"), fill=accent_color)
        y += 50
        draw.text((80, y), "SECRET INDUSTRIAL SILO // NORTH COAST, MAURITIUS", font=get_font(24, "regular"), fill=COLOR_SILVER)
        
    elif pid == 5:
        y = 200
        draw_letterspaced(draw, (540, y), "RUPTURE COLLECTIVE PRESENTS", font_mono, accent_color, spacing=4, align="center")
        y += 45
        draw_letterspaced(draw, (540, y), edition_title.upper()[:22], get_font(98, "condensed_black"), COLOR_WHITE, spacing=2, align="center")
        y += 115
        draw.line([(200, y), (880, y)], fill=COLOR_MOLTEN_RED if has_red else accent_color, width=3 if has_red else 2)
        y += 35
        draw_letterspaced(draw, (540, y), "FOUR ARTISTS // EIGHT HOURS OF CONTINUOUS SOUND", font_mono, COLOR_SILVER, spacing=2, align="center")
        y += 50
        lineup = [
            "[MODULAR LIVE] — BERLIN (ANALOG HARDWARE)",
            "[RESIDENT 01] — FAST HYPNOTIC TECHNO",
            "[RESIDENT 02] — DARK DRIVING GROOVE",
            "[SPECIAL GUEST] — VISCERAL 25 HZ SUB-BASS"
        ]
        for act in lineup:
            draw_letterspaced(draw, (540, y), act, get_font(33, "condensed_bold"), COLOR_WHITE, spacing=1, align="center")
            y += 48
        y += 20
        draw.rectangle([(220, y), (860, y + 70)], fill=(12, 14, 18, 220), outline=COLOR_DARK_SLATE)
        draw_letterspaced(draw, (540, y + 14), "SECRET INDUSTRIAL SILO · MAURITIUS", font_mono, accent_color, spacing=2, align="center")
        draw_letterspaced(draw, (540, y + 40), "ADVANCE PRESALE ONLY · CAPACITY 400 STRICT", font_mono, COLOR_SILVER, spacing=1, align="center")
        
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
            
    elif pid == 7:
        # Video Stage embedded in flyer
        vbox = (64, 220, 1016, 760)
        draw_cinematic_dj_stage(draw, img, vbox, "[HEADLINER LIVE]", "02:30 — 04:30", "142 BPM LIVE", seed=707)
        draw = ImageDraw.Draw(img)
        y = 800
        draw_letterspaced(draw, (80, y), "ACOUSTIC REINFORCEMENT // 25 HZ SPECIFICATION", font_mono, accent_color, spacing=3)
        y += 35
        draw.text((80, y), "CUSTOM 25 HZ SUB ARRAY.", font=get_font(64, "condensed_bold"), fill=COLOR_WHITE)
        y += 75
        draw.text((80, y), "ENGINEERED DOWN TO 25 HZ FOR VISCERAL PHYSICAL PRESSURE", font=get_font(23, "bold"), fill=COLOR_PEARL)
        y += 40
        draw.text((80, y), "Calibrated specifically to eliminate reflective flutter in industrial concrete space.", font=get_font(22, "regular"), fill=COLOR_SLATE)
        
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
            
    elif pid == 9:
        vbox = (64, 220, 1016, 760)
        draw_cinematic_dj_stage(draw, img, vbox, "[ARTIST SPOTLIGHT]", "01:00 — 02:30", "140 BPM MODULAR", seed=909)
        draw = ImageDraw.Draw(img)
        y = 800
        draw_letterspaced(draw, (80, y), "ARTIST SPOTLIGHT // HEADLINER PROFILE", font_mono, accent_color, spacing=3)
        y += 35
        draw.text((80, y), "[LIVE HARDWARE ACT]", font=get_font(72, "condensed_bold"), fill=COLOR_WHITE)
        y += 75
        draw.text((80, y), "ANALOG MODULAR SYNTHESIS & 140 BPM LIVE HYPNOSIS", font=get_font(24, "bold"), fill=COLOR_PEARL)
        y += 40
        draw.text((80, y), "No pre-recorded USBs. Pure spontaneous real-time creation on the dancefloor.", font=get_font(22, "regular"), fill=COLOR_SLATE)
        
    elif pid == 10:
        y = 780
        draw_letterspaced(draw, (80, y), "VENUE ARCHITECTURE", font_mono, accent_color, spacing=3)
        y += 35
        draw.text((80, y), "THE INDUSTRIAL SILO.", font=get_font(68, "condensed_bold"), fill=COLOR_WHITE)
        y += 75
        draw.text((80, y), "RAW BRUTALIST CONCRETE, SOARING CEILINGS, MONOLITHIC MASS", font=get_font(22, "bold"), fill=COLOR_PEARL)
        y += 40
        draw.text((80, y), "A decommissioned coastal industrial shell transformed by monochromatic amber washes.", font=get_font(22, "regular"), fill=COLOR_SLATE)
        
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
        
    elif pid == 12:
        y = 680
        draw_letterspaced(draw, (80, y), "T-MINUS 7 DAYS // COUNTDOWN", font_mono, accent_color, spacing=3)
        y += 30
        draw.text((80, y), "7 DAYS.", font=get_font(128, "condensed_black"), fill=COLOR_WHITE)
        y += 140
        draw.text((80, y), "FINAL REHEARSALS & SYSTEM RIGGING IN PROGRESS", font=get_font(24, "bold"), fill=COLOR_PEARL)
        y += 40
        draw.text((80, y), "The frequency arrives next Friday. Secure your place in the void.", font=get_font(22, "regular"), fill=COLOR_SLATE)
        
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
            
    elif pid == 15:
        cy = 820
        draw_letterspaced(draw, (540, cy), "THE RITUAL COMMENCES TONIGHT", font_mono, accent_color, spacing=4, align="center")
        draw.line([(380, cy + 34), (700, cy + 34)], fill=accent_color, width=1)
        draw_letterspaced(draw, (540, cy + 50), "WE ENTER THE VOID.", font_bold, COLOR_WHITE, spacing=1, align="center")
        draw_letterspaced(draw, (540, cy + 135), "DOORS 22:00 · SOUND DOWN TO 25 HZ · ZERO CLICHES", font_sub, COLOR_SILVER, spacing=2, align="center")
        draw_letterspaced(draw, (540, cy + 195), "SEE YOU IN THE DARK.", font_mono, accent_color, spacing=3, align="center")
        
    return img

def build_reel_image(art_file, post_id, title, edition_title, group_name, accent_color=COLOR_PALE_CYAN):
    pid = int(post_id)
    reel = Image.new("RGB", (1080, 1920), COLOR_VOID)
    rdraw = ImageDraw.Draw(reel)
    draw_technical_frame(rdraw, 1080, 1920, margin=54, accent_color=accent_color, crop_ticks=False)
    
    font_mono = get_font(18, "mono")
    font_bold = get_font(52, "condensed_bold")
    
    draw_letterspaced(rdraw, (64, 80), f"RUPTURE // POST {pid:02d}", font_mono, COLOR_WHITE, spacing=2)
    draw_letterspaced(rdraw, (1016, 80), "9:16 VERTICAL REEL / STORY", font_mono, COLOR_SLATE, spacing=1, align="right")
    
    # Video Stage in center
    r_stage_box = (64, 380, 1016, 1460)
    draw_cinematic_dj_stage(rdraw, reel, r_stage_box, f"[{title}]", "01:00 — 02:30", "142 BPM LIVE", seed=pid * 111)
    
    # Corner artwork thumbnail/texture overlay
    thumb = load_master_artwork(art_file, (320, 240), scale=1.0)
    reel.paste(thumb.convert("RGB"), (64, 180))
    rdraw = ImageDraw.Draw(reel)
    rdraw.rectangle([(64, 180), (384, 420)], outline=accent_color, width=1)
    
    # Bottom meta
    y = 1520
    rdraw.text((64, y), f"[{title}]", font=font_bold, fill=COLOR_WHITE)
    y += 65
    rdraw.text((64, y), f"STYLE DIRECTION // {group_name.upper()} // {edition_title.upper()}", font=font_mono, fill=accent_color)
    y += 40
    rdraw.text((64, y), "ADVANCE TICKETS & GPS TRANSMISSION VIA LINK IN BIO", font=font_mono, fill=COLOR_SILVER)
    
    draw_letterspaced(rdraw, (64, 1840), "SWIPE UP FOR TICKETS & SOUND ARCHIVE", font_mono, COLOR_SLATE, spacing=2)
    draw_letterspaced(rdraw, (1016, 1840), "25 HZ ACOUSTIC RIG", font_mono, accent_color, spacing=1, align="right")
    
    return reel

def render_edition(edition_id):
    print(f"🎬 Processing Edition '{edition_id}'...")
    ed_dir1 = os.path.join(ROOT, "campaign", "editions", edition_id)
    ed_dir2 = os.path.join(ROOT, "public", "campaign", "editions", edition_id)
    posts_dir1 = os.path.join(ed_dir1, "posts")
    posts_dir2 = os.path.join(ed_dir2, "posts")
    
    os.makedirs(posts_dir1, exist_ok=True)
    os.makedirs(posts_dir2, exist_ok=True)
    
    data_path = os.path.join(ed_dir1, "edition_data.json")
    if not os.path.exists(data_path):
        print(f"❌ Error: {data_path} does not exist", file=sys.stderr)
        return False
        
    with open(data_path, "r", encoding="utf-8") as f:
        posts = json.load(f)
        
    # Read manifest for edition info
    man_path = os.path.join(ROOT, "campaign", "editions_manifest.json")
    edition_meta = {}
    if os.path.exists(man_path):
        with open(man_path, "r", encoding="utf-8") as f:
            man = json.load(f)
            edition_meta = next((e for e in man.get("editions", []) if e.get("id") == edition_id), {})
            
    edition_title = edition_meta.get("title", edition_id).split("//")[0].replace("EDITION", "").replace("GROUP:", "").strip()
    group_name = edition_meta.get("groupName") or edition_meta.get("primaryFamily", {}).get("name", "Sculptural Liquid Chrome")
    accent_hex = edition_meta.get("groupColor", "#7AE7FF")
    accent_rgb = hex_to_rgb(accent_hex)
    
    enriched_posts = []
    
    for idx, post in enumerate(posts):
        pid_int = int(post.get("id", idx + 1))
        pid_str = f"{pid_int:02d}"
        stem = f"RUPTURE_IG_POST_{pid_str}"
        title = post.get("title", f"POST {pid_str}")
        art_file = post.get("artwork", f"RUPTURE_M{pid_str}_v1.jpg")
        fam_name = post.get("family", group_name)
        has_red = (pid_int in [5, 13])
        
        print(f"  → Rendering Post {pid_str}: {title} (Art: {art_file})")
        
        # Build 4:5 image
        img_4x5 = build_post_image(
            art_file=art_file,
            post_id=pid_int,
            title=title,
            edition_title=edition_title,
            group_name=fam_name,
            accent_color=accent_rgb,
            has_red=has_red
        )
        
        # Save 4:5 JPG and PNG
        p_jpg1 = os.path.join(posts_dir1, f"{stem}.jpg")
        p_png1 = os.path.join(posts_dir1, f"{stem}.png")
        p_jpg2 = os.path.join(posts_dir2, f"{stem}.jpg")
        p_png2 = os.path.join(posts_dir2, f"{stem}.png")
        
        img_4x5.save(p_jpg1, quality=95)
        img_4x5.save(p_png1)
        img_4x5.save(p_jpg2, quality=95)
        img_4x5.save(p_png2)
        
        # Save 1:1 Square Crop
        img_1x1 = img_4x5.crop((0, 135, 1080, 1215))
        p_sq1 = os.path.join(posts_dir1, f"{stem}_sq.jpg")
        p_sq2 = os.path.join(posts_dir2, f"{stem}_sq.jpg")
        img_1x1.save(p_sq1, quality=95)
        img_1x1.save(p_sq2, quality=95)
        
        # Copy to brain dir if available
        if os.path.exists(BRAIN_DIR):
            img_4x5.save(os.path.join(BRAIN_DIR, f"{edition_id}_{stem}.jpg"), quality=95)
            img_1x1.save(os.path.join(BRAIN_DIR, f"{edition_id}_{stem}_sq.jpg"), quality=95)
            
        # Check if Reel post (07, 08, 09, 15)
        is_reel = pid_int in [7, 8, 9, 15]
        if is_reel:
            reel_img = build_reel_image(
                art_file=art_file,
                post_id=pid_int,
                title=title,
                edition_title=edition_title,
                group_name=fam_name,
                accent_color=accent_rgb
            )
            r_jpg1 = os.path.join(posts_dir1, f"{stem}_reel.jpg")
            r_png1 = os.path.join(posts_dir1, f"{stem}_reel.png")
            r_jpg2 = os.path.join(posts_dir2, f"{stem}_reel.jpg")
            r_png2 = os.path.join(posts_dir2, f"{stem}_reel.png")
            
            reel_img.save(r_jpg1, quality=95)
            reel_img.save(r_png1)
            reel_img.save(r_jpg2, quality=95)
            reel_img.save(r_png2)
            
            if os.path.exists(BRAIN_DIR):
                reel_img.save(os.path.join(BRAIN_DIR, f"{edition_id}_{stem}_reel.jpg"), quality=95)
                
        # Archetype & rich info
        arch_info = ARCHETYPE_MAP.get(pid_int, ("Full Artwork Composition", "Art-directed layout.", "Full artwork integration."))
        
        # Build enriched post object
        enriched = dict(post)
        enriched["id"] = pid_str
        enriched["fileStem"] = stem
        enriched["archetype"] = arch_info[0]
        enriched["archetypeDescription"] = arch_info[1]
        enriched["artworkUsage"] = arch_info[2]
        enriched["reelAvailable"] = is_reel
        if is_reel:
            enriched["videoData"] = {
                "bpm": 140 if pid_int == 9 else 142,
                "key": "F Minor",
                "format": "4K 60FPS Live Hardware Feed",
                "audio": "PCM 24-Bit / 96 kHz Direct Rehearsal Recording"
            }
        enriched["typography"] = "Helvetica Neue Condensed Bold + SFNSMono"
        enriched["safeArea"] = "Key typography positioned securely inside central 1080x1080 safe area; crop ticks at Y=135 and Y=1215."
        enriched_posts.append(enriched)
        
    # Write enriched edition_data.json
    out_json = json.dumps(enriched_posts, indent=2)
    with open(data_path, "w", encoding="utf-8") as f:
        f.write(out_json)
    with open(os.path.join(ed_dir2, "edition_data.json"), "w", encoding="utf-8") as f:
        f.write(out_json)
        
    # Update manifest with basePath
    base_path_val = f"/campaign/editions/{edition_id}"
    for mpath in [os.path.join(ROOT, "campaign", "editions_manifest.json"), os.path.join(ROOT, "public", "campaign", "editions_manifest.json")]:
        if os.path.exists(mpath):
            with open(mpath, "r", encoding="utf-8") as f:
                man_data = json.load(f)
            updated = False
            for ed in man_data.get("editions", []):
                if ed.get("id") == edition_id:
                    ed["basePath"] = base_path_val
                    ed["postCount"] = 15
                    updated = True
                    break
            if updated:
                with open(mpath, "w", encoding="utf-8") as f:
                    json.dump(man_data, f, indent=2)
                    
    print(f"✨ Successfully rendered full post content for '{edition_id}' (15 posts in 4:5, 1:1, and 9:16 reels)")
    return True

def main():
    parser = argparse.ArgumentParser(description="Render full campaign edition posts")
    parser.add_argument("--edition", default=None, help="Target edition ID")
    parser.add_argument("--all-groups", action="store_true", help="Render all group editions (G1, G2, G3)")
    args = parser.parse_args()
    
    if args.all_groups:
        man_path = os.path.join(ROOT, "campaign", "editions_manifest.json")
        if os.path.exists(man_path):
            with open(man_path, "r", encoding="utf-8") as f:
                man = json.load(f)
            grp_editions = [e["id"] for e in man.get("editions", []) if str(e.get("editionNumber", "")).startswith("G")]
            for gid in grp_editions:
                render_edition(gid)
        return
        
    if args.edition:
        render_edition(args.edition)
    else:
        print("Please specify --edition <id> or --all-groups")

if __name__ == "__main__":
    main()
