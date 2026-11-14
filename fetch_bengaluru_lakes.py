import urllib.request
import json

bbox = '12.80,77.45,13.15,77.78'
query = f"""[out:json][timeout:90];
(
  relation["natural"="water"]["name"~"Kere|Lake|Tank|Sagara",i]({bbox});
  way["natural"="water"]["name"~"Kere|Lake|Tank|Sagara",i]({bbox});
  relation["natural"="water"]["water"="lake"]({bbox});
  way["natural"="water"]["water"="lake"]({bbox});
);
out tags center geom;
"""

servers = [
    'https://overpass-api.de/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
]

for server in servers:
    print(f"Trying {server}...")
    try:
        req = urllib.request.Request(
            server,
            data=query.encode('utf-8'),
            headers={'User-Agent': 'JalashayaWaterTwin/1.0 (GIS educational platform; contact: jalashaya@example.com)'}
        )
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            elements = data.get('elements', [])
            print(f"Success! Elements found: {len(elements)}")
            with open("data/inventory/osm_raw_lakes.json", "w", encoding="utf-8") as f:
                json.dump(data, f)
            break
    except Exception as e:
        print(f"Error from {server}: {e}")
