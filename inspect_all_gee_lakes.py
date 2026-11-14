import json

with open('data/inventory/bengaluru_gee_all_lakes.json') as f:
    lakes = json.load(f)

print('Total extracted lakes:', len(lakes))
lakes.sort(key=lambda x: -x['area_ha'])
for idx, l in enumerate(lakes[:20]):
    print(f"#{idx+1}: Area: {l['area_ha']:6.2f} ha | Centroid: {l['centroid']} | Bounds: {l['bounds']}")
