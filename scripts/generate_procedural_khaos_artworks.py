#!/usr/bin/env python3
"""
Procedural KHAOS Artwork Synthesizer
Generates photorealistic liquid chrome and sculptural metallic artworks
using mathematical 3D heightfields, normal-map surface dynamics, multi-point HDR specular lighting,
and Fresnel reflections in pure obsidian negative space.
Outputs:
  - artworks/khaos_new/khaos_artwork_11.jpg (The Code: Brutalist Tectonic Chrome Monolith)
  - artworks/khaos_new/khaos_artwork_14.jpg (Final Info: Structural Chrome Framework & Joints)
  - artworks/khaos_new/khaos_artwork_15.jpg (Tonight Teaser: Explosive Liquid Chrome Bloom & Mercury Droplets)
"""

import os
import cv2
import numpy as np
from PIL import Image, ImageFilter

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "artworks", "khaos_new")
os.makedirs(OUT_DIR, exist_ok=True)

H, W = 1920, 1080

def create_chrome_material(nx, ny, nz, mask, seed=42, icy_blue=True):
    """
    Renders realistic liquid chrome reflection and lighting given surface normals (nx, ny, nz)
    and an object alpha mask.
    """
    # Key light 1: Strong top-left overhead key light
    l1 = np.array([-0.55, -0.75, 0.65], dtype=np.float32)
    l1 /= np.linalg.norm(l1)
    
    # Key light 2: Sharp right-side rim light
    l2 = np.array([0.85, -0.2, 0.45], dtype=np.float32)
    l2 /= np.linalg.norm(l2)
    
    # Key light 3: Bottom subtle fill light
    l3 = np.array([0.1, 0.9, 0.35], dtype=np.float32)
    l3 /= np.linalg.norm(l3)
    
    # Diffuse components
    diff1 = np.maximum(0, nx * l1[0] + ny * l1[1] + nz * l1[2])
    diff2 = np.maximum(0, nx * l2[0] + ny * l2[1] + nz * l2[2])
    diff3 = np.maximum(0, nx * l3[0] + ny * l3[1] + nz * l3[2])
    
    # View vector (0, 0, 1) -> Specular reflection vectors
    # r = 2 * (n . l) * n - l
    r1z = 2 * diff1 * nz - l1[2]
    r2z = 2 * diff2 * nz - l2[2]
    r3z = 2 * diff3 * nz - l3[2]
    
    spec1 = np.maximum(0, r1z) ** 28
    spec2 = np.maximum(0, r2z) ** 48
    spec3 = np.maximum(0, r3z) ** 16
    
    # Environment reflection map simulation
    # Ray reflection direction
    rx = 2 * nz * nx
    ry = 2 * nz * ny
    env_horizon = np.exp(-((ry - 0.1) * 3.5) ** 2)
    env_ground = np.maximum(0, ry) * 0.25
    env_sky = np.maximum(0, -ry) * 0.4
    
    # Fresnel term (Schlick's approximation for metals: R0 ~ 0.92)
    fresnel = 0.88 + 0.12 * ((1.0 - np.maximum(0, nz)) ** 5)
    
    # Base chrome luminance
    lum = (diff1 * 0.12 + diff2 * 0.08 + diff3 * 0.05 +
           spec1 * 0.70 + spec2 * 0.55 + spec3 * 0.20 +
           env_horizon * 0.45 + env_sky * 0.35) * fresnel
    
    # Color grading
    r = lum * 240
    g = lum * 245
    b = lum * 255
    
    if icy_blue:
        # Subtle cold icy-blue caustics in specular rim and mid-tones
        caustic = (spec2 * 0.4 + np.maximum(0, nx) * 0.2) * (1.0 - nz * 0.5)
        r -= caustic * 30
        g += caustic * 15
        b += caustic * 60
        
    rgb = np.stack([r, g, b], axis=-1)
    rgb = np.clip(rgb, 0, 255)
    
    # Pitch black void #050505
    void = np.full((H, W, 3), 5.0, dtype=np.float32)
    mask_3d = np.repeat(mask[:, :, np.newaxis], 3, axis=-1)
    
    final_img = rgb * mask_3d + void * (1.0 - mask_3d)
    return np.clip(final_img, 0, 255).astype(np.uint8)

def generate_artwork_11():
    """POST 11: Brutalist Tectonic Chrome Monolith with Shear Crevasses"""
    print("Generating Artwork 11 (The Code)...")
    y, x = np.mgrid[-1:1:complex(0, H), -1:1:complex(0, W)].astype(np.float32)
    
    # Monolithic rectangular slab
    slab_w = 0.48
    slab_h = 0.78
    d_box = np.maximum(np.abs(x) - slab_w, np.abs(y) - slab_h)
    
    # Base height
    z = np.maximum(0, 1.0 - np.maximum(0, d_box * 8.0))
    # Beveled edges
    edge_bevel = np.clip(1.0 - np.abs(d_box) * 12.0, 0, 1)
    z = z * 0.8 + edge_bevel * 0.2
    
    # Tectonic diagonal fissures
    fissure1 = np.exp(-((y - 0.7 * x + 0.15) * 45.0) ** 2) * 0.45
    fissure2 = np.exp(-((y + 0.6 * x - 0.25) * 55.0) ** 2) * 0.35
    fissure3 = np.exp(-((y - 0.8 * x - 0.35) * 65.0) ** 2) * 0.30
    
    # Fluid mercury veins weeping from fissures
    mercury_vein = np.sin((x + y) * 35.0) * fissure1 * 0.6
    
    z = np.maximum(0, z - fissure1 - fissure2 - fissure3 + mercury_vein)
    
    # Micro-tectonic roughness
    noise = np.sin(x * 120.0) * np.cos(y * 120.0) * 0.015
    z += noise * (z > 0.05)
    
    # Surface normals
    gx = cv2.Sobel(z, cv2.CV_32F, 1, 0, ksize=5)
    gy = cv2.Sobel(z, cv2.CV_32F, 0, 1, ksize=5)
    gz = np.ones_like(gx) * 0.35
    norm = np.sqrt(gx*gx + gy*gy + gz*gz)
    nx, ny, nz = gx/norm, gy/norm, gz/norm
    
    mask = (d_box < 0.02).astype(np.float32)
    mask = cv2.GaussianBlur(mask, (15, 15), 4)
    
    img = create_chrome_material(nx, ny, nz, mask, icy_blue=True)
    out_path = os.path.join(OUT_DIR, "khaos_artwork_11.jpg")
    cv2.imwrite(out_path, cv2.cvtColor(img, cv2.COLOR_RGB2BGR), [int(cv2.IMWRITE_JPEG_QUALITY), 96])
    print(f"Saved: {out_path}")

def generate_artwork_14():
    """POST 14: Precision Structural Chrome Beams & Knurled Joints"""
    print("Generating Artwork 14 (Final Information)...")
    y, x = np.mgrid[-1:1:complex(0, H), -1:1:complex(0, W)].astype(np.float32)
    
    z = np.zeros_like(x)
    # Horizontal precision divider beams
    for beam_y in [-0.62, -0.22, 0.22, 0.62]:
        dist_y = np.abs(y - beam_y)
        beam = np.maximum(0, 1.0 - (dist_y / 0.08) ** 2) * (np.abs(x) < 0.85)
        # 45 degree chamfer caps at beam ends
        beam *= np.clip((0.85 - np.abs(x)) * 12.0, 0, 1)
        z = np.maximum(z, beam)
        
    # Vertical interlocking struts
    for strut_x in [-0.55, 0.0, 0.55]:
        dist_x = np.abs(x - strut_x)
        strut = np.maximum(0, 1.0 - (dist_x / 0.06) ** 2) * (np.abs(y) < 0.75)
        z = np.maximum(z, strut)
        
    # Cylindrical fluid pivot nodes at intersections
    for bx in [-0.55, 0.0, 0.55]:
        for by in [-0.62, -0.22, 0.22, 0.62]:
            dr = np.sqrt((x - bx)**2 + (y - by)**2)
            node = np.maximum(0, 1.0 - (dr / 0.11) ** 2) ** 2 * 1.3
            # Inner recessed core ring
            inner_ring = np.exp(-((dr - 0.055) * 50.0) ** 2) * 0.5
            z = np.maximum(z, node + inner_ring)
            
    # Surface normals
    gx = cv2.Sobel(z, cv2.CV_32F, 1, 0, ksize=5)
    gy = cv2.Sobel(z, cv2.CV_32F, 0, 1, ksize=5)
    gz = np.ones_like(gx) * 0.32
    norm = np.sqrt(gx*gx + gy*gy + gz*gz)
    nx, ny, nz = gx/norm, gy/norm, gz/norm
    
    mask = (z > 0.02).astype(np.float32)
    mask = cv2.GaussianBlur(mask, (11, 11), 3)
    
    img = create_chrome_material(nx, ny, nz, mask, icy_blue=True)
    out_path = os.path.join(OUT_DIR, "khaos_artwork_14.jpg")
    cv2.imwrite(out_path, cv2.cvtColor(img, cv2.COLOR_RGB2BGR), [int(cv2.IMWRITE_JPEG_QUALITY), 96])
    print(f"Saved: {out_path}")

def generate_artwork_15():
    """POST 15: Explosive Liquid Chrome Bloom & Suspended Mercury Corona"""
    print("Generating Artwork 15 (Tonight Teaser Hero)...")
    y, x = np.mgrid[-1:1:complex(0, H), -1:1:complex(0, W)].astype(np.float32)
    r = np.sqrt(x*x*1.4 + y*y)
    theta = np.arctan2(y, x)
    
    # Sinuous radiating liquid chrome flares and corona ribbons
    bloom = np.sin(r * 14.0 - theta * 6.0) * np.exp(-r * 2.2)
    bloom += 0.55 * np.cos(r * 28.0 + theta * 9.0) * np.exp(-r * 3.1)
    bloom += 0.40 * np.sin(theta * 12.0) * np.exp(-r * 1.8)
    bloom += 0.25 * np.cos(theta * 20.0 + r * 10.0) * np.exp(-r * 2.5)
    
    # Central liquid core crater
    core = np.exp(-(r * 3.8) ** 2) * 1.4
    bloom = np.maximum(0, bloom * 1.2 + core)
    
    # 35+ suspended liquid mercury droplets of varying scale orbiting the bloom
    np.random.seed(1337)
    droplets = np.zeros_like(x)
    for _ in range(38):
        ang = np.random.uniform(0, 2 * np.pi)
        dist = np.random.uniform(0.35, 0.88)
        dx = np.cos(ang) * dist / np.sqrt(1.4)
        dy = np.sin(ang) * dist
        rad = np.random.uniform(0.025, 0.08)
        dr = np.sqrt((x - dx)**2 + (y - dy)**2)
        drop = np.maximum(0, 1.0 - (dr / rad)**2)**2 * np.random.uniform(0.8, 1.4)
        droplets = np.maximum(droplets, drop)
        
    z = np.maximum(bloom, droplets).astype(np.float32)
    
    # Surface normals
    gx = cv2.Sobel(z, cv2.CV_32F, 1, 0, ksize=5)
    gy = cv2.Sobel(z, cv2.CV_32F, 0, 1, ksize=5)
    gz = np.ones_like(gx) * 0.32
    norm = np.sqrt(gx*gx + gy*gy + gz*gz)
    nx, ny, nz = gx/norm, gy/norm, gz/norm
    
    mask = (z > 0.02).astype(np.float32)
    mask = cv2.GaussianBlur(mask, (15, 15), 4)
    
    img = create_chrome_material(nx, ny, nz, mask, icy_blue=True)
    out_path = os.path.join(OUT_DIR, "khaos_artwork_15.jpg")
    cv2.imwrite(out_path, cv2.cvtColor(img, cv2.COLOR_RGB2BGR), [int(cv2.IMWRITE_JPEG_QUALITY), 96])
    print(f"Saved: {out_path}")

if __name__ == "__main__":
    generate_artwork_11()
    generate_artwork_14()
    generate_artwork_15()
    print("All procedural KHAOS artworks synthesized successfully!")
