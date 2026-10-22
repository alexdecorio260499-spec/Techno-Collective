# RUPTURE Studio

Local workspace for the RUPTURE visual identity: six pillars, one system.

```
npm start      # http://localhost:4747   (Node ≥ 18, no dependencies)
```

## Modes

| Mode | When | What "Generate" does |
|---|---|---|
| **Queue** (default) | no `GEMINI_API_KEY` | Builds the prompt, saves a job to `queue/jobs.json`. The agent fulfils it: *"process the RUPTURE queue"*. |
| **API** | `GEMINI_API_KEY` in `.env` | Calls the image API, saves a new version, passes approved masters as references. |

Nothing is simulated: a slot shows "Not generated" until a real image file exists.

## Folders
- `artworks/masters/` – M01–M06 reference masters (versioned)
- `artworks/raw/` – all other generated images, `RUPTURE_01_01_v1.jpg` …
- `exports/` – final 1080×1920 `RUPTURE_XX_YY.png|jpg`
- `data/identity.json` – pillars, colours, treatments, restrictions (source of truth)
- `data/collection.json` – the 51 briefs (6 masters + 45)
- `data/manifest.json` – versions, approved/unapproved state
- `queue/jobs.json` – pending generation jobs

## Agent CLI
```
node scripts/studio.mjs queue
node scripts/studio.mjs prompt RUPTURE_01_03
node scripts/studio.mjs ingest RUPTURE_01_03 /path/to/image.jpg --note "..."
```

## Export
Centre-crops to exact 9:16 (a few pixels at most) and resamples to 1080×1920 with macOS `sips`. Generator output is ~768×1376, so exports are **upscaled** — correct size, not extra detail. Use an API model with higher native resolution for sharper masters.

## Naming
`RUPTURE_01_xx` Acid Fracture · `02` Thermal Pressure · `03` Deep Signal · `04` Bio-Digital Contamination · `05` Liquid Geometry. Masters: `RUPTURE_M01–M06`.
