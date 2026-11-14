import httpx
import json

def fetch_overpass_lakes():
    headers = {
        "User-Agent": "JalashayaGeospatial/1.0 (https://github.com/jalashaya; jalashaya@bengaluru.org)"
    }
    # Query for water bodies in Bengaluru bounding box: (12.85, 77.45, 13.15, 77.75)
    ql = """
    [out:json][timeout:25];
    (
      relation["natural"="water"]["name"~"Bellandur|Varthur|Jakkur|Ulsoor|Sankey|Hebbal|Agara|Madiwala|Nagavara",i](12.85,77.50,13.15,77.78);
      way["natural"="water"]["name"~"Bellandur|Varthur|Jakkur|Ulsoor|Sankey|Hebbal|Agara|Madiwala|Nagavara",i](12.85,77.50,13.15,77.78);
    );
    out geom;
    """
    for endpoint in [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi2.net/api/interpreter",
        "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
    ]:
        try:
            print(f"Trying {endpoint}...")
            r = httpx.post(endpoint, data={"data": ql}, headers=headers, timeout=25.0)
            if r.status_code == 200:
                data = r.json()
                print(f"Success from {endpoint}! Found {len(data.get('elements', []))} elements.")
                return data
            else:
                print(f"Status: {r.status_code}")
        except Exception as e:
            print(f"Error {endpoint}: {e}")
    return None

if __name__ == "__main__":
    res = fetch_overpass_lakes()
    if res:
        with open("data/inventory/osm_raw_lakes.json", "w") as f:
            json.dump(res, f, indent=2)
        print("Saved raw OSM lakes to data/inventory/osm_raw_lakes.json")
