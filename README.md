# jamiemac.co.uk

Personal site for Jamie Mac. Plain static files: no build step.

## Deploy (Cloudflare Pages)
Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → `jamiemacportfolio`.
- Framework preset: None
- Build command: *(leave empty)*
- Build output directory: `/`

Every push to `main` then redeploys. Custom domain: the Pages project → Custom domains → `jamiemac.co.uk` (and `www.jamiemac.co.uk`).

## Add travel photos to "My life in motion"
1. In Photos on the Mac, select photos → File → Export → **Export Unmodified Original**, into `travel-inbox/`.
   (Unmodified originals keep the GPS location the globe uses.)
2. `pip3 install pillow` (once), then `python3 tools/add_travel.py`
3. Check `data/places.json` (fix a place name, add a caption), then
   `git add -A && git commit -m "Add travel photos" && git push`

The script publishes resized copies with all metadata removed, rounds locations to about 1 km,
and never commits the originals (`travel-inbox/` is ignored).
Photos without GPS: `python3 tools/add_travel.py --place "Town, Country" --lat 0.0 --lon 0.0 photo.jpg`

## Files
- `index.html` – page, styles and scroll motion
- `yard.js` – the 3D island (three.js)
- `life.js` – the travel globe; reads `data/places.json` and `data/land.json`
- `vendor/` – three.js r147 and OrbitControls
- `img/` – compressed images; `img/travel/` is written by the script
