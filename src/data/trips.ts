/** A place we have already visited together — a point on the memory globe. */
export interface Memory {
  id: string
  /** internal city reference (drives the exact globe coordinates) */
  city: string
  /** the only visible label */
  label: string
  lat: number
  lon: number
}

/** A stop of the West Coast route — always a point on the sketch map. */
export interface RouteStop {
  id: string
  name: string
  line: string
  x: number
  y: number
  labelDx?: number
  labelDy?: number
}

export interface FlightInfo {
  date: string
  from: string
  to: string
}

/* ------------------------------------------------------------------ */
/* Memory globe — the original visited-places sequence, original order */
/* ------------------------------------------------------------------ */

export const MEMORIES: Memory[] = [
  { id: 'barcelona', city: 'Barcelona', label: 'Spain', lat: 41.3874, lon: 2.1686 },
  { id: 'berlin', city: 'Berlin', label: 'Germany', lat: 52.52, lon: 13.405 },
  { id: 'madrid', city: 'Madrid', label: 'Spain', lat: 40.4168, lon: -3.7038 },
  { id: 'thailand', city: 'Bangkok', label: 'Thailand', lat: 13.7563, lon: 100.5018 },
  { id: 'croatia', city: 'Split', label: 'Croatia', lat: 43.5081, lon: 16.4402 },
  { id: 'china', city: 'Beijing', label: 'China', lat: 39.9042, lon: 116.4074 },
  { id: 'greece', city: 'Athens', label: 'Greece', lat: 37.9838, lon: 23.7275 },
  { id: 'new-york', city: 'New York', label: 'New York', lat: 40.7128, lon: -74.006 },
  { id: 'boston', city: 'Boston', label: 'Boston', lat: 42.3601, lon: -71.0589 },
]

/** Where the globe pulls inward before the map takes over. */
export const WEST_COAST = { lat: 36.6, lon: -119.4 }

/* ------------------------------------------------------------------ */
/* West Coast route (map viewBox: 0 0 760 940; stylized projection:    */
/* lon −125…−114 → x 60…742, lat 42…32 → y 0…926)                      */
/* ------------------------------------------------------------------ */

export const MAP_VIEWBOX = { width: 760, height: 940 }

export const ROUTE_STOPS: RouteStop[] = [
  { id: 'los-angeles', name: 'Los Angeles', line: 'The first light of the West.', x: 418, y: 736, labelDx: 10, labelDy: 20 },
  { id: 'malibu', name: 'Malibu', line: 'Where the ocean starts to feel like a promise.', x: 383, y: 733, labelDx: -16, labelDy: 22 },
  { id: 'big-sur', name: 'Big Sur', line: 'A road above the cliffs, made for remembering.', x: 198, y: 531, labelDx: -26, labelDy: 4 },
  { id: 'redwoods', name: 'Redwoods', line: 'Quiet giants. A forest older than words.', x: 332, y: 420, labelDx: -30, labelDy: 16 },
  { id: 'yosemite', name: 'Yosemite', line: 'Granite, waterfalls, and a sky too big to describe.', x: 335, y: 394, labelDx: -30, labelDy: -8 },
  { id: 'death-valley', name: 'Death Valley', line: 'Desert silence at the edge of nowhere.', x: 504, y: 513, labelDx: 0, labelDy: -14 },
  { id: 'las-vegas', name: 'Las Vegas', line: 'Neon in the desert. Half movie, half dream.', x: 611, y: 540, labelDx: 12, labelDy: 6 },
]

/* ------------------------------------------------------------------ */
/* Flights — shown only after the reveal                               */
/* ------------------------------------------------------------------ */

export const FLIGHTS: FlightInfo[] = [
  { date: 'September 3, 2026', from: 'Warsaw', to: 'Los Angeles' },
  { date: 'September 15, 2026', from: 'Las Vegas', to: 'Warsaw' },
]

/** Scene order — used by the progress rail. */
export const SCENES = [
  { id: 'opening', label: 'For you' },
  { id: 'memintro', label: 'Marks on the map' },
  { id: 'memories', label: 'Where we have been' },
  { id: 'pull', label: 'Where we are going' },
  { id: 'westcoast', label: 'The route' },
  { id: 'reveal', label: 'The next chapter' },
  { id: 'final', label: 'The beginning' },
] as const
