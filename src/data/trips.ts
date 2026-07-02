/** One chapter of the journey — a point on the globe with its own mood. */
export interface Chapter {
  id: string
  name: string
  /** one short emotional line under the name */
  line: string
  lat: number
  lon: number
}

export interface FlightInfo {
  from: string
  to: string
}

/* ------------------------------------------------------------------ */
/* The nine chapters of the route                                      */
/* ------------------------------------------------------------------ */

export const CHAPTERS: Chapter[] = [
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    line: 'The first breath of California. Palms, lights, and the beginning of everything.',
    lat: 34.05,
    lon: -118.25,
  },
  {
    id: 'malibu',
    name: 'Malibu',
    line: 'Where the ocean feels like a promise.',
    lat: 34.03,
    lon: -118.78,
  },
  {
    id: 'big-sur',
    name: 'Big Sur',
    line: 'A road above the cliffs, made for remembering.',
    lat: 36.27,
    lon: -121.81,
  },
  {
    id: 'redwoods',
    name: 'Redwoods',
    line: 'Trees taller than time. A silence worth keeping.',
    lat: 37.5,
    lon: -119.6,
  },
  {
    id: 'yosemite',
    name: 'Yosemite',
    line: 'Granite walls, waterfalls, and the kind of view that leaves us quiet.',
    lat: 37.75,
    lon: -119.59,
  },
  {
    id: 'death-valley',
    name: 'Death Valley',
    line: 'Desert light, endless space, and the beautiful edge of nowhere.',
    lat: 36.46,
    lon: -116.87,
  },
  {
    id: 'las-vegas',
    name: 'Las Vegas',
    line: 'Neon in the desert. Half movie, half dream.',
    lat: 36.17,
    lon: -115.14,
  },
  {
    id: 'new-york',
    name: 'New York',
    line: 'One more chapter before we turn toward home.',
    lat: 40.7128,
    lon: -74.006,
  },
  {
    id: 'boston',
    name: 'Boston',
    line: 'The final stop. A memory that will stay much longer than the trip.',
    lat: 42.3601,
    lon: -71.0589,
  },
]

/** Where the reveal points the globe before the chapters begin. */
export const CALIFORNIA = { lat: 36.6, lon: -119.4 }

/* ------------------------------------------------------------------ */
/* Flights                                                             */
/* ------------------------------------------------------------------ */

export const FLIGHTS: FlightInfo[] = [
  { from: 'Warsaw', to: 'Los Angeles' },
  { from: 'Las Vegas', to: 'Warsaw' },
]

/** Scene order — used by the progress rail. */
export const SCENES = [
  { id: 'intro', label: 'For you' },
  { id: 'reveal', label: 'The next chapter' },
  { id: 'transition', label: 'Dots on a map' },
  { id: 'chapters', label: 'The road' },
  { id: 'final', label: 'One greater road' },
] as const
