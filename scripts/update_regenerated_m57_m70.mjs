import fs from "fs";

const suiteV2 = [
  {
    id: "RUPTURE_M57",
    inspiredBy: "RUPTURE_M21",
    accent: "pearl",
    secondary: "icy-blue",
    foundation: ["charcoal", "black"],
    treatment: "sculptural-chrome",
    brief: "Monumental undulating topographic fluid strata in nacreous pearlescent silver with icy-blue rim highlights and charcoal shadows (inspired by approved M21)",
    prompt: "Monumental undulating topographic fluid strata and continuous rolling folds of pearlescent silver and liquid mercury sweeping diagonally across pitch-black space, inspired by the approved master RUPTURE_M21. Silky nacreous fluid ridges catching cold icy-blue rim highlights, with deep charcoal shadow transitions cascading between the metallic waves into pitch-black void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon, no red. High resolution, 9:16 portrait composition.",
    isGenerated: true
  },
  {
    id: "RUPTURE_M58",
    inspiredBy: "RUPTURE_M24",
    accent: "lavender",
    secondary: "pale-cyan",
    foundation: ["white", "black"],
    treatment: "folded-surfaces",
    brief: "Ethereal translucent liquid glass membrane billowing weightless with lavender and pale-cyan iridescence and white specular glints (inspired by approved M24)",
    prompt: "An ethereal, monumental sheet of flowing translucent liquid glass and metallic silk billowing weightless through deep space, inspired by the approved master RUPTURE_M24. Delicate organic folds with restrained soft lavender iridescence and pale-cyan transparency shimmering across the vitreous film, catching sharp soft-white specular highlight glints along the fluid edges into pitch-black void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon, no red. High resolution, 9:16 portrait composition.",
    isGenerated: true
  },
  {
    id: "RUPTURE_M59",
    inspiredBy: "RUPTURE_M23",
    accent: "chrome",
    secondary: "ultraviolet",
    foundation: ["black"],
    treatment: "sculptural-chrome",
    brief: "Horizontal razor-sheared liquid chrome planes with deep ultraviolet refractions between sheared plates (inspired by approved M23)",
    prompt: "A stack of horizontal razor-sheared liquid chrome planes and laminar metallic fluid strata cutting across the composition in zero gravity, inspired by the approved master RUPTURE_M23. Razor-sharp horizontal ridges with mirror silver reflections and stepped fluid fractures, with deep ultraviolet light refracted through the thin horizontal shear boundaries into pitch-black negative space void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon, no red. High resolution, 9:16 portrait composition.",
    isGenerated: true
  },
  {
    id: "RUPTURE_M60",
    inspiredBy: "RUPTURE_M15",
    accent: "chrome-body",
    secondary: "icy-blue",
    foundation: ["black"],
    treatment: "sculptural-chrome",
    brief: "Weightless asymmetrical liquid mercury glyph with icy-blue rim highlights in slate liquid chrome body (inspired by approved M15)",
    prompt: "A weightless, asymmetrical sculptural liquid mercury glyph and dynamic fluid tension loop suspended in pure pitch-black void, inspired by the approved master RUPTURE_M15. Heavy slate metallic fluid body of liquid platinum chrome with cold directional rim lighting casting crisp icy-blue specular edge highlights, with razor-thin fluid pinch necks and delicate fluid meniscus beads. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon, no red. High resolution, 9:16 portrait composition.",
    isGenerated: true
  },
  {
    id: "RUPTURE_M61",
    inspiredBy: "RUPTURE_M16",
    accent: "ultraviolet",
    secondary: "lavender",
    foundation: ["black"],
    treatment: "folded-surfaces",
    brief: "Aerodynamic helical ribbon cage and toroidal spiral structure with lavender sheen and ultraviolet shadow caustics (inspired by approved M16)",
    prompt: "An interwoven aerodynamic helical ribbon cage and toroidal spiral structure of polished liquid platinum chrome hovering weightless in deep space, inspired by the approved master RUPTURE_M16. Deep cavernous interior negative space illuminated by mysterious ultraviolet shadow refraction, with soft pearlescent lavender iridescence shimmering across the outer twisting ribbon blades into pitch-black void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon, no red. High resolution, 9:16 portrait composition.",
    isGenerated: true
  },
  {
    id: "RUPTURE_M62",
    inspiredBy: "RUPTURE_M28",
    accent: "white",
    secondary: "pale-cyan",
    foundation: ["charcoal", "black"],
    treatment: "sculptural-chrome",
    brief: "Sharp organic cluster of conical magnetic liquid chrome spires with soft-white apex highlights and pale-cyan sheen (inspired by approved M28)",
    prompt: "A sharp organic cluster of conical magnetic liquid chrome spires and fluid ferrofluid needles erupting vertically in zero gravity, inspired by the approved master RUPTURE_M28. Razor-sharp tapering metallic fluid spikes with brilliant soft-white specular apex highlights, pale-cyan specular sheen along the needle flutes, and deep charcoal shadow transitions into pitch-black void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon, no red. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M63",
    inspiredBy: "RUPTURE_M18",
    accent: "icy-blue",
    secondary: "chrome",
    foundation: ["pearl", "black"],
    treatment: "sculptural-chrome",
    brief: "Complex volumetric sculptural wave of folded translucent liquid glass and pearlescent silver with icy-blue caustics (inspired by approved M18)",
    prompt: "A complex volumetric sculptural wave of folded translucent liquid glass membranes and pearlescent silver fluid surging across the vertical frame, inspired by the approved master RUPTURE_M18. Curved vitreous wave faces with cold icy-blue caustic refraction glowing internally, pure chrome edge reflections, and soft nacreous pearl transitions against pure pitch-black negative space void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon, no red. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M64",
    inspiredBy: "RUPTURE_M02",
    accent: "molten-red",
    secondary: "chrome",
    foundation: ["black"],
    treatment: "sculptural-chrome",
    brief: "Monumental distorted elliptical aperture ring of liquid chrome with a restrained molten crimson caustic core (inspired by approved M02)",
    prompt: "A monumental distorted elliptical aperture ring of heavy sculptural liquid chrome hovering weightless in deep space, inspired by the approved master RUPTURE_M02. Heavy viscous fluid borders with pure mirror silver specular reflections, and an interior concave fluid throat glowing with a restrained, hypnotic molten crimson caustic refraction into pitch-black void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M65",
    inspiredBy: "RUPTURE_M29",
    accent: "pale-cyan",
    secondary: "ultraviolet",
    foundation: ["black"],
    treatment: "sculptural-chrome",
    brief: "Macro lattice and Voronoi reticulum of interconnected liquid mercury cells with pale-cyan membranes and ultraviolet shadows (inspired by approved M29)",
    prompt: "A complex macro lattice and Voronoi reticulum of interconnected liquid mercury cells and razor-thin metallic fluid membranes, inspired by the approved master RUPTURE_M29. Micro-thin cell walls catching pale-cyan specular gleams, with deep ultraviolet caustic shadows nested inside the subterranean fluid cavities into pitch-black void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon, no red. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M66",
    inspiredBy: "RUPTURE_M34",
    accent: "black",
    secondary: "icy-blue",
    foundation: ["charcoal"],
    treatment: "sculptural-chrome",
    brief: "Stepped fluid obsidian and liquid chrome terraces in asymmetric diagonal fault with icy-blue rim highlights (inspired by approved M34)",
    prompt: "Stepped fluid obsidian terraces and chiseled dark chrome ledges arranged in an asymmetric diagonal fault in zero gravity, inspired by the approved master RUPTURE_M34. Pure obsidian black fluid surfaces with cold directional rim lighting casting crisp icy-blue highlights along the stepped fault edges, transitioning into deep charcoal shadows against pitch-black void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon, no red. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M67",
    inspiredBy: "RUPTURE_M17",
    accent: "lavender",
    secondary: "pearl",
    foundation: ["black"],
    treatment: "folded-surfaces",
    brief: "Dynamic sweeping liquid ribbons and razor-thin fluid tendrils in pearlescent silver with soft lavender sheen (inspired by approved M17)",
    prompt: "Dynamic sweeping ribbons and razor-thin fluid tendrils of nacreous pearlescent silver and liquid chrome cutting diagonally across the vertical composition, inspired by the approved master RUPTURE_M17. Ethereal lavender surface iridescence shimmering across the undulating fluid ribbons as they taper into microscopic fluid tendrils into pure pitch-black negative space void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon, no red. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M68",
    inspiredBy: "RUPTURE_M06",
    accent: "ultraviolet",
    secondary: "chrome-body",
    foundation: ["white", "black"],
    treatment: "sculptural-chrome",
    brief: "Hyperbolic liquid chrome caustic warp with heavy slate metallic body, ultraviolet caustics, and soft-white highlights (inspired by approved M06)",
    prompt: "A monumental warped hyperbolic manifold of heavy slate liquid chrome twisting in zero gravity, inspired by the approved master RUPTURE_M06. Deep concave fluid folds projecting intense ultraviolet caustic networks, contrasting against dense slate metallic body surfaces and stark soft-white specular highlight lines into pitch-black void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon, no red. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M69",
    inspiredBy: "RUPTURE_M37",
    accent: "molten-red",
    secondary: "icy-blue",
    foundation: ["black"],
    treatment: "sculptural-chrome",
    brief: "Hyper-thin planar fins of polished chrome with icy-blue edges and a restrained molten crimson interface slit (inspired by approved M37)",
    prompt: "Hyper-thin planar fins of polished liquid chrome sliced at conflicting shear angles in zero gravity, inspired by the approved master RUPTURE_M37. Knife-sharp planar bevels catching cold icy-blue specular reflections, with a restrained, paper-thin slit of molten crimson light refracted between the overlapping metallic fins into pitch-black void. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon. High resolution, 9:16 portrait composition.",
    isGenerated: false
  },
  {
    id: "RUPTURE_M70",
    inspiredBy: "RUPTURE_M41",
    accent: "pale-cyan",
    secondary: "lavender",
    foundation: ["chrome", "black"],
    treatment: "folded-surfaces",
    brief: "Twisted double-membrane of translucent vitreous film and mirror liquid silver with pale-cyan and lavender dispersion (inspired by approved M41)",
    prompt: "A twisted double-membrane of translucent vitreous film intertwining with a ribbon of mirror-polished liquid silver, inspired by the approved master RUPTURE_M41. Gossamer optic fluid membranes casting soft pale-cyan caustic refractions and delicate lavender dispersion into empty black space, with pure chrome specular highlights along the intertwining seams. Pure pitch-black negative space void. Exclude: No spheres, no orbs, no floating balls, no pedestal, no plinth, no floor, no text, no typography, no painted neon, no red. High resolution, 9:16 portrait composition.",
    isGenerated: false
  }
];

// Update manifest.json
const manifestPath = "data/manifest.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

for (const item of suiteV2) {
  const art = manifest.artworks[item.id];
  if (!art) continue;

  if (item.isGenerated) {
    // Add v2 to versions if not already added
    const existingV2 = art.versions.find(v => v.v === 2);
    const v2Entry = {
      v: 2,
      file: `artworks/masters/${item.id}_v2.jpg`,
      prompt: item.prompt,
      spec: {
        pillars: [{ id: "liquid-geometry", weight: 1 }],
        accent: item.accent,
        secondary: item.secondary,
        foundation: item.foundation,
        treatment: item.treatment,
        inspiredBy: item.inspiredBy
      },
      source: "gemini-3.1-flash-image",
      note: item.brief,
      createdAt: new Date().toISOString()
    };
    if (existingV2) {
      Object.assign(existingV2, v2Entry);
    } else {
      art.versions.push(v2Entry);
    }
    art.activeVersion = 2;
    delete art.plannedSpec;
  } else {
    art.plannedSpec = {
      inspiredBy: item.inspiredBy,
      prompt: item.prompt,
      accent: item.accent,
      secondary: item.secondary,
      foundation: item.foundation,
      treatment: item.treatment,
      note: item.brief,
      createdAt: new Date().toISOString()
    };
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
console.log("Updated manifest.json with v2 specifications!");

// Update collection.json
const collPath = "data/collection.json";
const coll = JSON.parse(fs.readFileSync(collPath, "utf-8"));

for (const item of suiteV2) {
  const c = coll.artworks.find(a => a.id === item.id);
  if (c) {
    c.accent = item.accent;
    c.secondary = item.secondary;
    c.treatment = item.treatment;
    c.brief = item.brief;
  }
}

fs.writeFileSync(collPath, JSON.stringify(coll, null, 2), "utf-8");
console.log("Updated collection.json with v2 specifications!");
