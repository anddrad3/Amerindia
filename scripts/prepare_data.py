"""Reproducible conversion of the explicitly downloaded FUNAI public polygons.

Run after downloading tmp/funai-territories.json. Does not infer historical limits.
"""
import json
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1]
SOURCE = "https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas/geoserver-funai"
IDS = {"Yanomami": "yanomami", "Parque do Xingu": "xingu", "Barra Velha": "barra-velha", "Barra Velha do Monte Pascoal": "monte-pascoal"}
raw = json.loads((ROOT / 'tmp/funai-territories.json').read_text(encoding='utf-8-sig'))
features = []
for feature in raw['features']:
    props = feature['properties']
    name = props['terrai_nome']
    features.append({"type": "Feature", "geometry": feature['geometry'], "properties": {
        "id": IDS[name], "name": name, "people": props['etnia_nome'], "region": props['uf_sigla'],
        "description": "Limite disponibilizado pela Funai. Uma terra pode abrigar vários povos; ela não representa a totalidade dos territórios de um povo.",
        "source_url": SOURCE, "official_status": props['fase_ti'],
        "source_date": props['data_atualizacao'], "retrieved_at": "2026-10-18"
    }})
out = ROOT / 'database/seed/territories.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({"type":"FeatureCollection","features":features},ensure_ascii=False,separators=(',',':')),encoding='utf-8')
# Decorative preview of a real shape, not an alternative scientific boundary dataset.
geometry = next(f['geometry'] for f in features if f['properties']['id']=='yanomami')
polygons = geometry['coordinates'] if geometry['type']=='MultiPolygon' else [geometry['coordinates']]
points = [p for polygon in polygons for ring in polygon for p in ring]
xs, ys = [p[0] for p in points], [p[1] for p in points]
minx,maxx,miny,maxy = min(xs),max(xs),min(ys),max(ys)
scale = min(360/(maxx-minx),340/(maxy-miny))
paths=[]
for polygon in polygons:
    for ring in polygon:
        small = ring[::max(1,len(ring)//350)]
        paths.append('M'+' L'.join(f'{90+(x-minx)*scale:.1f},{450-(y-miny)*scale:.1f}' for x,y,*_ in small)+' Z')
svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 560"><defs><radialGradient id="g"><stop stop-color="#dce4d7"/><stop offset="1" stop-color="#edf0e8"/></radialGradient></defs><rect width="560" height="560" rx="280" fill="url(#g)"/>'
for radius in range(50,440,24):
    svg += f'<ellipse cx="320" cy="230" rx="{radius}" ry="{radius*.73}" fill="none" stroke="#bac8b6" stroke-opacity=".4" transform="rotate(-28 320 230)"/>'
svg += '<path d="'+escape(' '.join(paths))+'" fill="#597561" fill-opacity=".18" stroke="#4c6b57" stroke-width="1.6"/><circle cx="285" cy="280" r="7" fill="#cc633e"/><circle cx="285" cy="280" r="19" fill="none" stroke="#cc633e" stroke-opacity=".4"/></svg>'
(ROOT/'public/assets').mkdir(parents=True,exist_ok=True)
(ROOT/'public/assets/territory-preview.svg').write_text(svg,encoding='utf-8')
print(f'Prepared {len(features)} official polygons; historical dates are not inferred.')
