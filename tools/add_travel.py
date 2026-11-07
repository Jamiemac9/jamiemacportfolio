#!/usr/bin/env python3
"""Add travel photos to the "My life in motion" globe.

1. In Photos on your Mac, select photos > File > Export > Export Unmodified Original,
   and save them into the travel-inbox/ folder of this repo. (Unmodified originals keep
   the GPS location; "Export 1 Photo" can strip it.)
2. Run:  python3 tools/add_travel.py
3. Check data/places.json (fix any place name or add a caption), then commit and push.
   Cloudflare Pages redeploys the site automatically.

What it does for each photo:
- reads where and when it was taken from the photo's EXIF data
- looks up the town and country (OpenStreetMap Nominatim; skip with --no-geocode)
- saves a web-sized copy and a thumbnail with ALL metadata removed, so the published
  images carry no GPS or camera data
- rounds the location to about 1 km before publishing it
- adds an entry to data/places.json and moves the original to travel-inbox/done/

Photos without a location are skipped, unless you give one:
  python3 tools/add_travel.py --place "Zanzibar, Tanzania" --lat -5.99 --lon 39.38 photo.jpg

Needs: pip3 install pillow   (and pillow-heif for .HEIC files)
"""
import argparse, datetime, hashlib, json, re, shutil, sys, time, urllib.parse, urllib.request
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit('Pillow is missing. Run: pip3 install pillow')
try:
    import pillow_heif  # optional, for .HEIC
    pillow_heif.register_heif_opener()
except ImportError:
    pass

ROOT = Path(__file__).resolve().parent.parent
INBOX = ROOT / 'travel-inbox'
OUT = ROOT / 'img' / 'travel'
DATA = ROOT / 'data' / 'places.json'
EXTS = {'.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp'}


def dms(v, ref):
    d, m, s = [float(x) for x in v]
    x = d + m / 60 + s / 3600
    return -x if ref in ('S', 'W') else x


def read_meta(im):
    ex = im.getexif()
    gps = ex.get_ifd(0x8825) if ex else {}
    lat = lon = None
    if gps and 2 in gps and 4 in gps:
        lat, lon = dms(gps[2], gps.get(1, 'N')), dms(gps[4], gps.get(3, 'E'))
    when = None
    sub = ex.get_ifd(0x8769) if ex else {}
    raw = (sub or {}).get(36867) or ex.get(306) if ex else None
    if raw:
        try:
            when = datetime.datetime.strptime(str(raw).strip()[:19], '%Y:%m:%d %H:%M:%S').date().isoformat()
        except ValueError:
            pass
    return lat, lon, when


def geocode(lat, lon):
    q = urllib.parse.urlencode({'lat': lat, 'lon': lon, 'format': 'jsonv2', 'zoom': 10, 'accept-language': 'en'})
    req = urllib.request.Request('https://nominatim.openstreetmap.org/reverse?' + q, headers={'User-Agent': 'jamiemac-portfolio-travel/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            a = json.load(r).get('address', {})
        time.sleep(1.1)  # Nominatim allows 1 request a second
        town = a.get('city') or a.get('town') or a.get('village') or a.get('island') or a.get('county') or a.get('state')
        return town or '', a.get('country', '')
    except Exception as e:
        print('  ! could not look up place name:', e)
        return '', ''


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-') or 'place'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('files', nargs='*', help='photos to add (default: everything in travel-inbox/)')
    ap.add_argument('--place', help='place name to use, e.g. "Zanzibar, Tanzania"')
    ap.add_argument('--lat', type=float); ap.add_argument('--lon', type=float)
    ap.add_argument('--date', help='YYYY-MM-DD if the photo has none')
    ap.add_argument('--caption', default='')
    ap.add_argument('--no-geocode', action='store_true')
    a = ap.parse_args()

    files = [Path(f) for f in a.files] if a.files else sorted(p for p in INBOX.glob('*') if p.suffix.lower() in EXTS)
    if not files:
        print('Nothing to add. Put photos in', INBOX); return
    OUT.mkdir(parents=True, exist_ok=True); (OUT / 'thumb').mkdir(exist_ok=True)
    data = json.loads(DATA.read_text()) if DATA.exists() else {'home': {'name': 'Solihull', 'lat': 52.41, 'lon': -1.78}, 'photos': []}
    seen = {p.get('id') for p in data['photos']}
    added = 0
    for f in files:
        print('·', f.name)
        im = Image.open(f)
        lat, lon, when = read_meta(im)
        if a.lat is not None and a.lon is not None:
            lat, lon = a.lat, a.lon
        if lat is None:
            print('  - skipped: no location in this photo (use --place/--lat/--lon)'); continue
        when = a.date or when or ''
        pid = hashlib.sha1(f.read_bytes()).hexdigest()[:10]
        if pid in seen:
            print('  - already added'); continue
        if a.place:
            parts = [x.strip() for x in a.place.split(',')]
            place, country = parts[0], (parts[1] if len(parts) > 1 else '')
        elif a.no_geocode:
            place, country = '', ''
        else:
            place, country = geocode(lat, lon)
        name = f"{slug(place or 'place')}-{when or pid}-{pid[:4]}"
        im = ImageOps.exif_transpose(im).convert('RGB')
        big = im.copy(); big.thumbnail((1600, 1600), Image.LANCZOS)
        big.save(OUT / f'{name}.jpg', 'JPEG', quality=80, optimize=True, progressive=True)  # no exif passed: metadata stripped
        th = ImageOps.fit(im, (480, 360), Image.LANCZOS, centering=(0.5, 0.45))
        th.save(OUT / 'thumb' / f'{name}.jpg', 'JPEG', quality=76, optimize=True, progressive=True)
        data['photos'].append({'id': pid, 'src': f'img/travel/{name}.jpg', 'thumb': f'img/travel/thumb/{name}.jpg',
                               'lat': round(lat, 2), 'lon': round(lon, 2), 'place': place, 'country': country,
                               'date': when, 'caption': a.caption})
        seen.add(pid); added += 1
        if f.parent == INBOX:
            (INBOX / 'done').mkdir(exist_ok=True); shutil.move(str(f), INBOX / 'done' / f.name)
        print(f'  + {place or "?"}, {country or "?"} ({when or "no date"})')
    data['photos'].sort(key=lambda p: p.get('date') or '')
    DATA.parent.mkdir(exist_ok=True)
    DATA.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
    print(f'\nAdded {added}. Check data/places.json, then: git add -A && git commit -m "Add travel photos" && git push')


if __name__ == '__main__':
    main()
