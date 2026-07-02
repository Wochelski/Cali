/** Miejsce, w którym już byliśmy — punkt na globusie. */
export interface Destination {
  id: string
  name: string
  /** drobna, czysto geograficzna metka (miasto / kraj) — bez opisów */
  meta: string
  lat: number
  lon: number
}

/** Moment na trasie Kalifornia 2026 — współrzędne w układzie SVG mapy. */
export interface RouteStop {
  id: string
  name: string
  /** region / droga — etykieta krajobrazowa, nie opis */
  region: string
  x: number
  y: number
  /** przesunięcie numeru przystanku względem punktu */
  labelDx?: number
  labelDy?: number
}

export interface FlightInfo {
  date: string
  from: string
  to: string
}

/* ------------------------------------------------------------------ */
/* Scena 2 — globus podróży                                            */
/* ------------------------------------------------------------------ */

export const DESTINATIONS: Destination[] = [
  { id: 'barcelona', name: 'Barcelona', meta: 'Hiszpania', lat: 41.3874, lon: 2.1686 },
  { id: 'berlin', name: 'Berlin', meta: 'Niemcy', lat: 52.52, lon: 13.405 },
  { id: 'madryt', name: 'Madryt', meta: 'Hiszpania', lat: 40.4168, lon: -3.7038 },
  { id: 'tajlandia', name: 'Tajlandia', meta: 'Bangkok', lat: 13.7563, lon: 100.5018 },
  { id: 'chorwacja', name: 'Chorwacja', meta: 'Split', lat: 43.5081, lon: 16.4402 },
  { id: 'chiny', name: 'Chiny', meta: 'Pekin', lat: 39.9042, lon: 116.4074 },
  { id: 'grecja', name: 'Grecja', meta: 'Ateny', lat: 37.9838, lon: 23.7275 },
  { id: 'nowy-jork', name: 'Nowy Jork', meta: 'USA', lat: 40.7128, lon: -74.006 },
  { id: 'boston', name: 'Boston', meta: 'USA', lat: 42.3601, lon: -71.0589 },
]

/** Cel następnego rozdziału — środek Kalifornii. */
export const CALIFORNIA = { lat: 36.6, lon: -119.4 }

/** Punkt startu — otwarcie strony. */
export const HOME = { city: 'Warszawa', coords: '52°14′ N — 21°01′ E' }

/* ------------------------------------------------------------------ */
/* Scena 3 — loty                                                      */
/* ------------------------------------------------------------------ */

export const FLIGHTS: FlightInfo[] = [
  { date: '03.09.2026', from: 'Warszawa', to: 'Los Angeles' },
  { date: '15.09.2026', from: 'Las Vegas', to: 'Warszawa' },
]

/* ------------------------------------------------------------------ */
/* Scena 4 — trasa po Kalifornii (viewBox mapy: 0 0 760 940)           */
/* Współrzędne to stylizowane odwzorowanie: lon −125…−114 → x 60…742,  */
/* lat 42…32 → y 0…926.                                                */
/* ------------------------------------------------------------------ */

export const MAP_VIEWBOX = { width: 760, height: 940 }

export const ROUTE_STOPS: RouteStop[] = [
  { id: 'la', name: 'Los Angeles', region: 'Westside', x: 418, y: 736, labelDx: 10, labelDy: 20 },
  { id: 'malibu', name: 'Malibu', region: 'Pacific Coast Highway', x: 383, y: 733, labelDx: -16, labelDy: 22 },
  { id: 'santa-barbara', name: 'Santa Barbara', region: 'Central Coast', x: 329, y: 702, labelDx: 2, labelDy: 24 },
  { id: 'big-sur', name: 'Big Sur', region: 'Highway 1', x: 198, y: 531, labelDx: -26, labelDy: 4 },
  { id: 'yosemite', name: 'Yosemite', region: 'Sierra Nevada', x: 335, y: 394, labelDx: -28, labelDy: -8 },
  { id: 'death-valley', name: 'Death Valley', region: 'Mojave', x: 504, y: 513, labelDx: -2, labelDy: -14 },
  { id: 'las-vegas', name: 'Las Vegas', region: 'Nevada', x: 611, y: 540, labelDx: 12, labelDy: 6 },
]

/** Kolejność scen — używana przez pasek postępu. */
export const SCENES = [
  { id: 'intro', label: 'Otwarcie' },
  { id: 'memory', label: 'Podróże' },
  { id: 'reveal', label: 'Kalifornia' },
  { id: 'route', label: 'Trasa' },
  { id: 'final', label: 'Finał' },
] as const
