#!/usr/bin/env python3
"""
KHAOS Typographic Engine — System Fracture & Glitch Architecture
Provides a reference-led, custom geometric display alphabet (A-Z, 0-9, punctuation)
with:
  - 45-degree chamfers and custom geometric anatomy
  - Structural fractures (horizontal slices, unexpected gaps, displaced sections)
  - Glitch architecture (horizontal scanline displacement, raster offsets)
  - Metallic specular shading and cold icy-blue edge refractions
"""

import math
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

COLOR_WHITE = (255, 255, 255)
COLOR_SILVER = (210, 216, 225)
COLOR_CHROME = (160, 168, 180)
COLOR_SLATE = (110, 118, 132)
COLOR_ICY_BLUE = (122, 231, 255)

def draw_glyph_polygons(draw, char, x0, y0, w, h, stroke, cham):
    """
    Draws custom geometric polygonal letterforms for char in box (x0, y0, x0+w, y0+h).
    Returns list of drawn polygons.
    """
    x1 = x0 + w
    y1 = y0 + h
    cy = y0 + h * 0.5
    st = stroke
    ch = cham
    c = char.upper()
    
    if c == 'A':
        # Open inverted chevron with chamfered apex and no crossbar
        apex = (x0 + x1) / 2.0
        draw.polygon([
            (apex - ch, y0), (apex + ch, y0),
            (x1, y1), (x1 - st * 1.15, y1),
            (apex, y0 + st * 1.6),
            (x0 + st * 1.15, y1), (x0, y1)
        ], fill=COLOR_WHITE)
        
    elif c == 'B':
        # Dual faceted loops
        draw.polygon([(x0, y0), (x0 + st, y0), (x0 + st, y1), (x0, y1)], fill=COLOR_WHITE)
        # Top loop
        draw.polygon([(x0 + st, y0), (x1 - ch, y0), (x1, y0 + ch), (x1, cy - ch), (x1 - ch, cy), (x0 + st, cy),
                      (x0 + st, cy - st * 0.7), (x1 - st - ch * 0.5, cy - st * 0.7), (x1 - st, cy - ch),
                      (x1 - st, y0 + ch), (x1 - st - ch * 0.5, y0 + st * 0.7), (x0 + st, y0 + st * 0.7)], fill=COLOR_WHITE)
        # Bottom loop
        draw.polygon([(x0 + st, cy), (x1 - ch, cy), (x1, cy + ch), (x1, y1 - ch), (x1 - ch, y1), (x0 + st, y1),
                      (x0 + st, y1 - st * 0.7), (x1 - st - ch * 0.5, y1 - st * 0.7), (x1 - st, y1 - ch),
                      (x1 - st, cy + ch), (x1 - st - ch * 0.5, cy + st * 0.7), (x0 + st, cy + st * 0.7)], fill=COLOR_WHITE)

    elif c == 'C':
        # Faceted octagonal C with open right side
        draw.polygon([
            (x0 + ch, y0), (x1, y0), (x1, y0 + st),
            (x0 + st, y0 + st), (x0 + st, y1 - st),
            (x1, y1 - st), (x1, y1), (x0 + ch, y1),
            (x0, y1 - ch), (x0, y0 + ch)
        ], fill=COLOR_WHITE)

    elif c == 'D':
        # Vertical stem + faceted loop
        draw.polygon([(x0, y0), (x0 + st, y0), (x0 + st, y1), (x0, y1)], fill=COLOR_WHITE)
        draw.polygon([
            (x0 + st, y0), (x1 - ch, y0), (x1, y0 + ch), (x1, y1 - ch), (x1 - ch, y1), (x0 + st, y1),
            (x0 + st, y1 - st), (x1 - st - ch * 0.5, y1 - st), (x1 - st, y1 - ch),
            (x1 - st, y0 + ch), (x1 - st - ch * 0.5, y0 + st), (x0 + st, y0 + st)
        ], fill=COLOR_WHITE)

    elif c == 'E':
        # Stem + 3 horizontal bars, middle bar slightly shorter/severed
        draw.polygon([(x0, y0), (x0 + st, y0), (x0 + st, y1), (x0, y1)], fill=COLOR_WHITE)
        draw.polygon([(x0 + st, y0), (x1, y0), (x1, y0 + st), (x0 + st, y0 + st)], fill=COLOR_WHITE)
        draw.polygon([(x0 + st, cy - st * 0.4), (x1 - st * 0.6, cy - st * 0.4), (x1 - st * 0.6, cy + st * 0.4), (x0 + st, cy + st * 0.4)], fill=COLOR_WHITE)
        draw.polygon([(x0 + st, y1 - st), (x1, y1 - st), (x1, y1), (x0 + st, y1)], fill=COLOR_WHITE)

    elif c == 'F':
        draw.polygon([(x0, y0), (x0 + st, y0), (x0 + st, y1), (x0, y1)], fill=COLOR_WHITE)
        draw.polygon([(x0 + st, y0), (x1, y0), (x1, y0 + st), (x0 + st, y0 + st)], fill=COLOR_WHITE)
        draw.polygon([(x0 + st, cy - st * 0.4), (x1 - st * 0.8, cy - st * 0.4), (x1 - st * 0.8, cy + st * 0.4), (x0 + st, cy + st * 0.4)], fill=COLOR_WHITE)

    elif c == 'G':
        # C shape + inward tooth
        draw.polygon([
            (x0 + ch, y0), (x1, y0), (x1, y0 + st),
            (x0 + st, y0 + st), (x0 + st, y1 - st),
            (x1 - st, y1 - st), (x1 - st, cy),
            (x1, cy), (x1, y1 - ch), (x1 - ch, y1), (x0 + ch, y1),
            (x0, y1 - ch), (x0, y0 + ch)
        ], fill=COLOR_WHITE)

    elif c == 'H':
        # Two vertical stems + crossbar
        draw.polygon([(x0, y0), (x0 + st, y0), (x0 + st, y1), (x0, y1)], fill=COLOR_WHITE)
        draw.polygon([(x1 - st, y0), (x1, y0), (x1, y1), (x1 - st, y1)], fill=COLOR_WHITE)
        draw.polygon([(x0 + st, cy - st * 0.45), (x1 - st, cy - st * 0.45), (x1 - st, cy + st * 0.45), (x0 + st, cy + st * 0.45)], fill=COLOR_WHITE)

    elif c == 'I':
        draw.polygon([(x0 + w * 0.5 - st * 0.5, y0), (x0 + w * 0.5 + st * 0.5, y0),
                      (x0 + w * 0.5 + st * 0.5, y1), (x0 + w * 0.5 - st * 0.5, y1)], fill=COLOR_WHITE)

    elif c == 'J':
        draw.polygon([
            (x1 - st, y0), (x1, y0), (x1, y1 - ch), (x1 - ch, y1),
            (x0 + ch, y1), (x0, y1 - ch), (x0, y1 - st * 1.8),
            (x0 + st, y1 - st * 1.8), (x0 + st, y1 - st),
            (x1 - st, y1 - st)
        ], fill=COLOR_WHITE)

    elif c == 'K':
        # Vertical stem + angled chevron arms with chamfer
        draw.polygon([(x0, y0), (x0 + st, y0), (x0 + st, y1), (x0, y1)], fill=COLOR_WHITE)
        draw.polygon([
            (x0 + st * 0.8, cy + st * 0.1),
            (x1 - ch, y0), (x1, y0), (x1, y0 + ch * 1.5),
            (x0 + st * 1.2, cy + st * 0.5)
        ], fill=COLOR_WHITE)
        draw.polygon([
            (x0 + st * 1.0, cy - st * 0.4),
            (x0 + st * 1.4, cy - st * 0.4),
            (x1, y1 - ch * 1.5), (x1, y1), (x1 - ch, y1),
            (x0 + st * 0.8, cy + st * 0.2)
        ], fill=COLOR_WHITE)

    elif c == 'L':
        draw.polygon([(x0, y0), (x0 + st, y0), (x0 + st, y1 - st), (x1, y1 - st), (x1, y1), (x0, y1)], fill=COLOR_WHITE)

    elif c == 'M':
        # Outer vertical stems + sharp central V
        draw.polygon([(x0, y0), (x0 + st, y0), (x0 + st, y1), (x0, y1)], fill=COLOR_WHITE)
        draw.polygon([(x1 - st, y0), (x1, y0), (x1, y1), (x1 - st, y1)], fill=COLOR_WHITE)
        cx = (x0 + x1) / 2.0
        draw.polygon([(x0 + st, y0), (cx, y1 - st * 0.8), (cx + st * 0.4, y1 - st * 0.8), (x0 + st * 1.8, y0)], fill=COLOR_WHITE)
        draw.polygon([(x1 - st * 1.8, y0), (cx - st * 0.4, y1 - st * 0.8), (cx, y1 - st * 0.8), (x1 - st, y0)], fill=COLOR_WHITE)

    elif c == 'N':
        draw.polygon([(x0, y0), (x0 + st, y0), (x0 + st, y1), (x0, y1)], fill=COLOR_WHITE)
        draw.polygon([(x1 - st, y0), (x1, y0), (x1, y1), (x1 - st, y1)], fill=COLOR_WHITE)
        draw.polygon([(x0 + st, y0), (x1, y1 - st * 0.5), (x1 - st, y1), (x0, y0 + st * 0.5)], fill=COLOR_WHITE)

    elif c == 'O':
        # Faceted octagonal ring
        draw.polygon([
            (x0 + ch, y0), (x1 - ch, y0), (x1, y0 + ch), (x1, y1 - ch),
            (x1 - ch, y1), (x0 + ch, y1), (x0, y1 - ch), (x0, y0 + ch)
        ], fill=COLOR_WHITE)
        in_ch = max(ch - st * 0.4, 2)
        draw.polygon([
            (x0 + st + in_ch, y0 + st), (x1 - st - in_ch, y0 + st),
            (x1 - st, y0 + st + in_ch), (x1 - st, y1 - st - in_ch),
            (x1 - st - in_ch, y1 - st), (x0 + st + in_ch, y1 - st),
            (x0 + st, y1 - st - in_ch), (x0 + st, y0 + st + in_ch)
        ], fill=(0, 0, 0, 0))

    elif c == 'P':
        draw.polygon([(x0, y0), (x0 + st, y0), (x0 + st, y1), (x0, y1)], fill=COLOR_WHITE)
        draw.polygon([
            (x0 + st, y0), (x1 - ch, y0), (x1, y0 + ch), (x1, cy - ch), (x1 - ch, cy), (x0 + st, cy),
            (x0 + st, cy - st * 0.7), (x1 - st - ch * 0.5, cy - st * 0.7), (x1 - st, cy - ch),
            (x1 - st, y0 + ch), (x1 - st - ch * 0.5, y0 + st * 0.7), (x0 + st, y0 + st * 0.7)
        ], fill=COLOR_WHITE)

    elif c == 'Q':
        # O shape + diagonal tail
        draw.polygon([
            (x0 + ch, y0), (x1 - ch, y0), (x1, y0 + ch), (x1, y1 - ch),
            (x1 - ch, y1), (x0 + ch, y1), (x0, y1 - ch), (x0, y0 + ch)
        ], fill=COLOR_WHITE)
        in_ch = max(ch - st * 0.4, 2)
        draw.polygon([
            (x0 + st + in_ch, y0 + st), (x1 - st - in_ch, y0 + st),
            (x1 - st, y0 + st + in_ch), (x1 - st, y1 - st - in_ch),
            (x1 - st - in_ch, y1 - st), (x0 + st + in_ch, y1 - st),
            (x0 + st, y1 - st - in_ch), (x0 + st, y0 + st + in_ch)
        ], fill=(0, 0, 0, 0))
        # Tail
        draw.polygon([(x1 - st * 1.5, cy + st * 0.5), (x1 + st * 0.2, y1), (x1 - st * 0.4, y1), (x1 - st * 1.8, cy + st * 1.2)], fill=COLOR_WHITE)

    elif c == 'R':
        # P shape + diagonal fractured leg
        draw.polygon([(x0, y0), (x0 + st, y0), (x0 + st, y1), (x0, y1)], fill=COLOR_WHITE)
        draw.polygon([
            (x0 + st, y0), (x1 - ch, y0), (x1, y0 + ch), (x1, cy - ch), (x1 - ch, cy), (x0 + st, cy),
            (x0 + st, cy - st * 0.7), (x1 - st - ch * 0.5, cy - st * 0.7), (x1 - st, cy - ch),
            (x1 - st, y0 + ch), (x1 - st - ch * 0.5, y0 + st * 0.7), (x0 + st, y0 + st * 0.7)
        ], fill=COLOR_WHITE)
        draw.polygon([
            (x0 + st * 1.1, cy - st * 0.2), (x1 - st * 0.4, cy - st * 0.2),
            (x1, y1), (x1 - st * 1.1, y1), (x0 + st * 0.8, cy + st * 0.6)
        ], fill=COLOR_WHITE)

    elif c == 'S':
        # Angular chamfered S
        draw.polygon([
            (x0 + ch, y0), (x1, y0), (x1, y0 + st),
            (x0 + st, y0 + st), (x0 + st, cy - st * 0.4),
            (x1 - ch, cy - st * 0.4), (x1, cy),
            (x1, y1 - ch), (x1 - ch, y1),
            (x0, y1), (x0, y1 - st),
            (x1 - st, y1 - st), (x1 - st, cy + st * 0.4),
            (x0 + ch, cy + st * 0.4), (x0, cy),
            (x0, y0 + ch)
        ], fill=COLOR_WHITE)

    elif c == 'T':
        # Horizontal top bar + vertical center stem
        draw.polygon([(x0, y0), (x1, y0), (x1, y0 + st), (x0, y0 + st)], fill=COLOR_WHITE)
        cx = (x0 + x1) / 2.0
        draw.polygon([(cx - st * 0.5, y0 + st), (cx + st * 0.5, y0 + st), (cx + st * 0.5, y1), (cx - st * 0.5, y1)], fill=COLOR_WHITE)

    elif c == 'U':
        draw.polygon([
            (x0, y0), (x0 + st, y0), (x0 + st, y1 - ch), (x0 + st + ch, y1 - st),
            (x1 - st - ch, y1 - st), (x1 - st, y1 - ch), (x1 - st, y0), (x1, y0),
            (x1, y1 - ch), (x1 - ch, y1), (x0 + ch, y1), (x0, y1 - ch)
        ], fill=COLOR_WHITE)

    elif c == 'V':
        # Inverted chevron downwards
        apex = (x0 + x1) / 2.0
        draw.polygon([
            (x0, y0), (x0 + st * 1.15, y0), (apex, y1 - st * 1.6),
            (x1 - st * 1.15, y0), (x1, y0), (apex + ch, y1), (apex - ch, y1)
        ], fill=COLOR_WHITE)

    elif c == 'W':
        draw.polygon([(x0, y0), (x0 + st, y0), (x0 + st, y1), (x0, y1)], fill=COLOR_WHITE)
        draw.polygon([(x1 - st, y0), (x1, y0), (x1, y1), (x1 - st, y1)], fill=COLOR_WHITE)
        cx = (x0 + x1) / 2.0
        draw.polygon([(x0 + st, y1), (cx, y0 + st * 0.8), (cx + st * 0.4, y0 + st * 0.8), (x0 + st * 1.8, y1)], fill=COLOR_WHITE)
        draw.polygon([(x1 - st * 1.8, y1), (cx - st * 0.4, y0 + st * 0.8), (cx, y0 + st * 0.8), (x1 - st, y1)], fill=COLOR_WHITE)

    elif c == 'X':
        draw.polygon([(x0, y0), (x0 + st * 1.1, y0), (x1, y1), (x1 - st * 1.1, y1)], fill=COLOR_WHITE)
        draw.polygon([(x1 - st * 1.1, y0), (x1, y0), (x0, y1), (x0 + st * 1.1, y1)], fill=COLOR_WHITE)

    elif c == 'Y':
        cx = (x0 + x1) / 2.0
        draw.polygon([(x0, y0), (x0 + st, y0), (cx + st * 0.4, cy), (cx - st * 0.4, cy)], fill=COLOR_WHITE)
        draw.polygon([(x1 - st, y0), (x1, y0), (cx + st * 0.4, cy), (cx - st * 0.4, cy)], fill=COLOR_WHITE)
        draw.polygon([(cx - st * 0.5, cy), (cx + st * 0.5, cy), (cx + st * 0.5, y1), (cx - st * 0.5, y1)], fill=COLOR_WHITE)

    elif c == 'Z':
        draw.polygon([(x0, y0), (x1, y0), (x1, y0 + st), (x0, y0 + st)], fill=COLOR_WHITE)
        draw.polygon([(x1, y0 + st), (x1, y0 + st * 1.5), (x0 + st, y1 - st), (x0, y1 - st)], fill=COLOR_WHITE)
        draw.polygon([(x0, y1 - st), (x1, y1 - st), (x1, y1), (x0, y1)], fill=COLOR_WHITE)

    # Numerals
    elif c == '0':
        draw.polygon([
            (x0 + ch, y0), (x1 - ch, y0), (x1, y0 + ch), (x1, y1 - ch),
            (x1 - ch, y1), (x0 + ch, y1), (x0, y1 - ch), (x0, y0 + ch)
        ], fill=COLOR_WHITE)
        in_ch = max(ch - st * 0.4, 2)
        draw.polygon([
            (x0 + st + in_ch, y0 + st), (x1 - st - in_ch, y0 + st),
            (x1 - st, y0 + st + in_ch), (x1 - st, y1 - st - in_ch),
            (x1 - st - in_ch, y1 - st), (x0 + st + in_ch, y1 - st),
            (x0 + st, y1 - st - in_ch), (x0 + st, y0 + st + in_ch)
        ], fill=(0, 0, 0, 0))
        # Inner diagonal slash
        draw.polygon([(x0 + st * 1.5, y1 - st * 1.5), (x1 - st * 1.5, y0 + st * 1.5),
                      (x1 - st * 2.0, y0 + st * 1.5), (x0 + st * 1.0, y1 - st * 1.5)], fill=COLOR_WHITE)

    elif c == '1':
        cx = (x0 + x1) / 2.0
        draw.polygon([(cx - st * 0.5, y0), (cx + st * 0.5, y0), (cx + st * 0.5, y1), (cx - st * 0.5, y1)], fill=COLOR_WHITE)
        draw.polygon([(cx - st * 1.5, y0 + st * 1.2), (cx - st * 0.5, y0), (cx - st * 0.5, y0 + st * 0.8)], fill=COLOR_WHITE)
        draw.polygon([(cx - st * 1.2, y1 - st * 0.6), (cx + st * 1.2, y1 - st * 0.6), (cx + st * 1.2, y1), (cx - st * 1.2, y1)], fill=COLOR_WHITE)

    elif c == '2':
        draw.polygon([
            (x0 + ch, y0), (x1 - ch, y0), (x1, y0 + ch), (x1, cy), (x0 + st, y1 - st),
            (x1, y1 - st), (x1, y1), (x0, y1), (x0, y1 - st * 1.4),
            (x1 - st * 1.2, cy), (x1 - st, y0 + ch), (x1 - ch - st, y0 + st), (x0 + ch, y0 + st)
        ], fill=COLOR_WHITE)

    elif c == '3':
        draw.polygon([
            (x0, y0), (x1 - ch, y0), (x1, y0 + ch), (x1, cy - ch * 0.5), (x1 - ch, cy),
            (x1, cy + ch * 0.5), (x1, y1 - ch), (x1 - ch, y1), (x0, y1), (x0, y1 - st),
            (x1 - st - ch, y1 - st), (x1 - st, y1 - ch), (x1 - st, cy + ch * 0.5),
            (x0 + st, cy + ch * 0.5), (x0 + st, cy - ch * 0.5), (x1 - st, cy - ch * 0.5),
            (x1 - st, y0 + ch), (x1 - st - ch, y0 + st), (x0, y0 + st)
        ], fill=COLOR_WHITE)

    elif c == '4':
        draw.polygon([(x1 - st * 1.2, y0), (x1 - st * 0.2, y0), (x1 - st * 0.2, y1), (x1 - st * 1.2, y1)], fill=COLOR_WHITE)
        draw.polygon([(x0, y0), (x0 + st, y0), (x0, cy + st * 0.5), (x1, cy + st * 0.5), (x1, cy - st * 0.5), (x0 + st, cy - st * 0.5), (x0 + st, y0 + st * 0.8)], fill=COLOR_WHITE)

    elif c == '5':
        draw.polygon([
            (x0, y0), (x1, y0), (x1, y0 + st), (x0 + st, y0 + st), (x0 + st, cy - st * 0.3),
            (x1 - ch, cy - st * 0.3), (x1, cy), (x1, y1 - ch), (x1 - ch, y1),
            (x0, y1), (x0, y1 - st), (x1 - st - ch, y1 - st), (x1 - st, y1 - ch),
            (x1 - st, cy + ch * 0.4), (x0, cy + ch * 0.4)
        ], fill=COLOR_WHITE)

    elif c == '6':
        draw.polygon([
            (x0 + ch, y0), (x1, y0), (x1, y0 + st), (x0 + st, y0 + st),
            (x0 + st, cy), (x1 - ch, cy), (x1, cy + ch), (x1, y1 - ch), (x1 - ch, y1), (x0 + ch, y1),
            (x0, y1 - ch), (x0, y0 + ch)
        ], fill=COLOR_WHITE)
        in_ch = max(ch - st * 0.4, 2)
        draw.polygon([
            (x0 + st + in_ch, cy + st * 0.8), (x1 - st - in_ch, cy + st * 0.8),
            (x1 - st, cy + st * 0.8 + in_ch), (x1 - st, y1 - st - in_ch),
            (x1 - st - in_ch, y1 - st), (x0 + st + in_ch, y1 - st),
            (x0 + st, y1 - st - in_ch), (x0 + st, cy + st * 0.8 + in_ch)
        ], fill=(0, 0, 0, 0))

    elif c == '7':
        # Sharp horizontal top bar + diagonal fractured descending stem
        draw.polygon([(x0, y0), (x1, y0), (x1, y0 + st), (x0, y0 + st)], fill=COLOR_WHITE)
        draw.polygon([
            (x1 - st * 1.1, y0 + st), (x1, y0 + st),
            (x0 + w * 0.45 + st * 0.6, y1), (x0 + w * 0.45 - st * 0.5, y1)
        ], fill=COLOR_WHITE)

    elif c == '8':
        # Dual octagonal loops
        draw.polygon([
            (x0 + ch, y0), (x1 - ch, y0), (x1, y0 + ch), (x1, y1 - ch),
            (x1 - ch, y1), (x0 + ch, y1), (x0, y1 - ch), (x0, y0 + ch)
        ], fill=COLOR_WHITE)
        # Inner top hole
        draw.polygon([(x0 + st, y0 + st), (x1 - st, y0 + st), (x1 - st, cy - st * 0.3), (x0 + st, cy - st * 0.3)], fill=(0, 0, 0, 0))
        # Inner bottom hole
        draw.polygon([(x0 + st, cy + st * 0.3), (x1 - st, cy + st * 0.3), (x1 - st, y1 - st), (x0 + st, y1 - st)], fill=(0, 0, 0, 0))

    elif c == '9':
        draw.polygon([
            (x0 + ch, y0), (x1 - ch, y0), (x1, y0 + ch), (x1, y1 - ch),
            (x0, y1), (x0, y1 - st), (x1 - st, y1 - st), (x1 - st, cy),
            (x0, cy), (x0, y0 + ch)
        ], fill=COLOR_WHITE)
        in_ch = max(ch - st * 0.4, 2)
        draw.polygon([
            (x0 + st + in_ch, y0 + st), (x1 - st - in_ch, y0 + st),
            (x1 - st, y0 + st + in_ch), (x1 - st, cy - in_ch),
            (x1 - st - in_ch, cy), (x0 + st + in_ch, cy),
            (x0 + st, cy - in_ch), (x0 + st, y0 + st + in_ch)
        ], fill=(0, 0, 0, 0))

    elif c == '.':
        draw.rectangle([(x0 + w * 0.3, y1 - st), (x0 + w * 0.7, y1)], fill=COLOR_WHITE)

    elif c == ':':
        draw.rectangle([(x0 + w * 0.3, y0 + h * 0.25), (x0 + w * 0.7, y0 + h * 0.25 + st * 0.8)], fill=COLOR_WHITE)
        draw.rectangle([(x0 + w * 0.3, y1 - h * 0.25 - st * 0.8), (x0 + w * 0.7, y1 - h * 0.25)], fill=COLOR_WHITE)

    elif c == '/':
        draw.polygon([(x1 - st * 0.8, y0), (x1, y0), (x0 + st * 0.8, y1), (x0, y1)], fill=COLOR_WHITE)

    elif c == '-':
        draw.rectangle([(x0, cy - st * 0.4), (x1, cy + st * 0.4)], fill=COLOR_WHITE)

    elif c == '[':
        draw.polygon([(x0, y0), (x1, y0), (x1, y0 + st * 0.7), (x0 + st, y0 + st * 0.7), (x0 + st, y1 - st * 0.7), (x1, y1 - st * 0.7), (x1, y1), (x0, y1)], fill=COLOR_WHITE)

    elif c == ']':
        draw.polygon([(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y1 - st * 0.7), (x1 - st, y1 - st * 0.7), (x1 - st, y0 + st * 0.7), (x0, y0 + st * 0.7)], fill=COLOR_WHITE)

def get_text_width(text, height=60, tracking=4):
    scale = 3
    th = height * scale
    char_widths = []
    for ch in text.upper():
        if ch == ' ':
            char_widths.append(th * 0.38)
        elif ch in ['I', '1', '.', ':', '/']:
            char_widths.append(th * 0.28)
        elif ch in ['M', 'W']:
            char_widths.append(th * 0.95)
        elif ch in ['[', ']']:
            char_widths.append(th * 0.32)
        else:
            char_widths.append(th * 0.72)
    gap = tracking * scale
    total_w = sum(char_widths) + gap * (len(text) - 1)
    return int(total_w / scale)

def render_fractured_text(text, height=60, style="fracture", tracking=4, tint=None, seed=42):
    """
    Renders text using the custom System Fracture & Glitch Architecture geometry.
    tint: optional (r, g, b) tuple to tint or replace base specular shading.
    Returns RGBA PIL Image.
    """
    scale = 3
    th = height * scale
    
    # Calculate widths for each character
    char_widths = []
    for ch in text.upper():
        if ch == ' ':
            char_widths.append(th * 0.38)
        elif ch in ['I', '1', '.', ':', '/']:
            char_widths.append(th * 0.28)
        elif ch in ['M', 'W']:
            char_widths.append(th * 0.95)
        elif ch in ['[', ']']:
            char_widths.append(th * 0.32)
        else:
            char_widths.append(th * 0.72)
            
    gap = tracking * scale
    total_w = int(sum(char_widths) + gap * (len(text) - 1))
    if total_w <= 0:
        return Image.new("RGBA", (1, 1), (0, 0, 0, 0))
        
    canvas = Image.new("RGBA", (total_w, int(th)), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    
    x_curr = 0
    stroke = th * 0.22
    cham = stroke * 0.75
    
    for i, ch in enumerate(text.upper()):
        w_ch = char_widths[i]
        if ch != ' ':
            draw_glyph_polygons(draw, ch, x_curr, 0, w_ch, th, stroke, cham)
        x_curr += w_ch + gap
        
    # Downsample
    final_w = int(total_w / scale)
    final_h = int(height)
    res = canvas.resize((final_w, final_h), Image.Resampling.LANCZOS)
    arr = np.array(res)
    
    # Metallic specular reflectance gradient
    grad = np.zeros((final_h, final_w, 4), dtype=np.float32)
    for y in range(final_h):
        t = y / float(final_h)
        if tint is not None:
            # Modulate tint with vertical lighting gradient
            brightness = 1.0 - 0.35 * (t ** 0.8)
            r = int(min(255, tint[0] * brightness))
            g = int(min(255, tint[1] * brightness))
            b = int(min(255, tint[2] * brightness))
        else:
            if t < 0.25:
                r = 255
                g = 255 - int(20 * (t / 0.25))
                b = 255 - int(5 * (t / 0.25))
            elif t < 0.55:
                t2 = (t - 0.25) / 0.30
                r = int(255 - 55 * t2)
                g = int(240 - 45 * t2)
                b = int(248 - 30 * t2)
            elif t < 0.80:
                t3 = (t - 0.55) / 0.25
                r = int(200 - 65 * t3)
                g = int(195 - 55 * t3)
                b = int(218 - 45 * t3)
            else:
                t4 = (t - 0.80) / 0.20
                r = int(135 + 65 * t4)
                g = int(140 + 65 * t4)
                b = int(173 + 65 * t4)
        grad[y, :, 0] = r
        grad[y, :, 1] = g
        grad[y, :, 2] = b
        grad[y, :, 3] = 255
        
    alpha_mask = arr[:, :, 3] / 255.0
    shaded = np.zeros_like(arr)
    for c in range(3):
        shaded[:, :, c] = np.clip(grad[:, :, c] * alpha_mask, 0, 255).astype(np.uint8)
    shaded[:, :, 3] = arr[:, :, 3]
    
    if style == "fracture":
        split_y = int(final_h * 0.48)
        upper = shaded[:split_y].copy()
        cut_h = max(1, int(final_h * 0.025))
        lower = shaded[split_y + cut_h:].copy()
        
        # Displace lower half slightly right
        shift = max(2, int(final_h * 0.04))
        shifted_lower = np.zeros_like(lower)
        shifted_lower[:, shift:] = lower[:, :-shift]
        
        fractured = np.zeros_like(shaded)
        fractured[:split_y] = upper
        fractured[split_y + cut_h:] = shifted_lower
        return Image.fromarray(fractured, "RGBA")
        
    elif style == "glitch":
        glitched = shaded.copy()
        rnd = random.Random(seed)
        num_glitches = max(4, int(final_h * 0.15))
        for _ in range(num_glitches):
            sy = rnd.randint(2, max(3, final_h - 10))
            sh_h = rnd.randint(2, max(3, int(final_h * 0.12)))
            shift = rnd.randint(-int(final_h * 0.15), int(final_h * 0.15))
            if shift != 0 and sy + sh_h < final_h:
                sl = glitched[sy:sy+sh_h].copy()
                if shift > 0:
                    glitched[sy:sy+sh_h, shift:] = sl[:, :-shift]
                else:
                    glitched[sy:sy+sh_h, :shift] = sl[:, -shift:]
        return Image.fromarray(glitched, "RGBA")
        
    return Image.fromarray(shaded, "RGBA")
