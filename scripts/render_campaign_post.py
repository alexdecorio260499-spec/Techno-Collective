#!/usr/bin/env python3
"""
RUPTURE Studio — Render Single Campaign Post Flyer
Re-renders an individual Instagram post flyer (4:5 portrait + 1:1 square crop)
when an artwork is swapped in a campaign edition.
"""

import os
import sys
import json
import argparse
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BRAIN_DIR = "/Users/alex/.gemini/antigravity/brain/caf6c4ea-9b06-4d9f-9428-74b197be24de"

# Add scripts directory to path
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from generate_group_01_campaign import build_post_image, COLOR_PALE_CYAN

def main():
    parser = argparse.ArgumentParser(description="Render a single campaign post flyer")
    parser.add_argument("--edition", required=True, help="Edition ID (e.g. edition_grp_01_group_test_1)")
    parser.add_argument("--post", required=True, help="Post ID (e.g. 01, 1, 05)")
    parser.add_argument("--artwork", required=True, help="Artwork filename (e.g. RUPTURE_M87_v1.jpg)")
    parser.add_argument("--title", default=None, help="Post title override")
    parser.add_argument("--family", default=None, help="Family name override")
    parser.add_argument("--role", default=None, help="Family role override")
    
    args = parser.parse_args()
    
    edition_id = args.edition
    pid_int = int(args.post)
    pid_str = f"{pid_int:02d}"
    art_file = args.artwork
    
    edition_dir = os.path.join(ROOT, "campaign", "editions", edition_id)
    posts_dir = os.path.join(edition_dir, "posts")
    public_posts_dir = os.path.join(ROOT, "public", "campaign", "editions", edition_id, "posts")
    
    os.makedirs(posts_dir, exist_ok=True)
    os.makedirs(public_posts_dir, exist_ok=True)
    
    # Load post data from edition_data.json if available
    edition_data_path = os.path.join(edition_dir, "edition_data.json")
    post_info = None
    if os.path.exists(edition_data_path):
        try:
            with open(edition_data_path, "r", encoding="utf-8") as f:
                posts_list = json.load(f)
                post_info = next((p for p in posts_list if str(p.get("id")) == str(pid_int) or str(p.get("id")) == pid_str), None)
        except Exception as e:
            print(f"Warning: could not read edition_data.json: {e}", file=sys.stderr)
            
    title = args.title or (post_info.get("title") if post_info else f"POST {pid_str}")
    family_name = args.family or (post_info.get("family") if post_info else "Core Artwork")
    family_role = args.role or (post_info.get("familyRole") if post_info else "Primary Family")
    has_red = (pid_int in [5, 13])
    
    edition_title = "TRANSMISSION 01"
    if "group" in edition_id:
        edition_title = "TRANSMISSION 01"
    
    print(f"🎨 Rendering Post {pid_str} for edition '{edition_id}': art='{art_file}', title='{title}'...")
    
    img_4x5 = build_post_image(
        art_file=art_file,
        post_id=pid_int,
        title=title,
        edition_title=edition_title,
        family_name=family_name,
        family_role=family_role,
        accent_color=COLOR_PALE_CYAN,
        has_red=has_red
    )
    
    stem = f"RUPTURE_IG_POST_{pid_str}"
    
    # Save 4:5
    path_png = os.path.join(posts_dir, f"{stem}.png")
    path_jpg = os.path.join(posts_dir, f"{stem}.jpg")
    img_4x5.save(path_png)
    img_4x5.save(path_jpg, quality=95)
    
    pub_png = os.path.join(public_posts_dir, f"{stem}.png")
    pub_jpg = os.path.join(public_posts_dir, f"{stem}.jpg")
    img_4x5.save(pub_png)
    img_4x5.save(pub_jpg, quality=95)
    
    # Save 1:1 square crop
    img_1x1 = img_4x5.crop((0, 135, 1080, 1215))
    path_sq = os.path.join(posts_dir, f"{stem}_sq.jpg")
    pub_sq = os.path.join(public_posts_dir, f"{stem}_sq.jpg")
    img_1x1.save(path_sq, quality=95)
    img_1x1.save(pub_sq, quality=95)
    
    # Save to brain directory if present
    if os.path.exists(BRAIN_DIR):
        img_4x5.save(os.path.join(BRAIN_DIR, f"{edition_id}_{stem}.jpg"), quality=95)
        img_1x1.save(os.path.join(BRAIN_DIR, f"{edition_id}_{stem}_sq.jpg"), quality=95)
        
    print(f"✨ Successfully rendered Post {pid_str} ({path_jpg})")

if __name__ == "__main__":
    main()
