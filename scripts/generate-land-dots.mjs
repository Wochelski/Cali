/**
 * Jednorazowy generator "kontynentów z kropek" dla globusa.
 * Wejście: Natural Earth land-110m (TopoJSON, public domain).
 * Wyjście: src/data/land-dots.json — lista [lat, lon] punktów lądu.
 *
 * Użycie:  node scripts/generate-land-dots.mjs [ścieżka-do-land-110m.json]
 * (bez argumentu pobiera plik z unpkg)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { feature } from 'topojson-client'

const source = process.argv[2]
const topo = source
  ? JSON.parse(readFileSync(source, 'utf8'))
  : await (await fetch('https://unpkg.com/world-atlas@2.0.2/land-110m.json')).json()

const land = feature(topo, topo.objects.land)
const geoms = land.type === 'FeatureCollection' ? land.features.map((f) => f.geometry) : [land.geometry]
const polygons = []
for (const g of geoms) {
  if (g.type === 'Polygon') polygons.push(g.coordinates)
  else if (g.type === 'MultiPolygon') polygons.push(...g.coordinates)
}

function inRing([x, y], ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
const inPolygon = (pt, poly) =>
  inRing(pt, poly[0]) && !poly.slice(1).some((hole) => inRing(pt, hole))

// siatka o wyrównanej gęstości (krok długości rośnie z szerokością);
// bez Antarktydy — na kropkowym globusie tylko szumi
const STEP = 1.8
const dots = []
for (let lat = -56; lat <= 78; lat += STEP) {
  const lonStep = STEP / Math.max(0.35, Math.cos((lat * Math.PI) / 180))
  for (let lon = -180; lon < 180; lon += lonStep) {
    if (polygons.some((p) => inPolygon([lon, lat], p))) {
      dots.push([+lat.toFixed(1), +lon.toFixed(1)])
    }
  }
}

writeFileSync('src/data/land-dots.json', JSON.stringify(dots))
console.log(`land-dots: ${dots.length} punktów → src/data/land-dots.json`)
