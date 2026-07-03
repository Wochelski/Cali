/** A place we have already visited together. */
export interface PastTrip {
  id: string
  order: number
  title: string
  copy: string
  /** globe marker */
  lat: number
  lon: number
  /** key into the photo manifest, e.g. "past/spain" */
  photoKey: string
}

/** One chapter of the American West road trip. */
export interface RouteChapter {
  id: string
  title: string
  dateLabel: string
  headline: string
  lines: string[]
  /** position on the West map (viewBox 0 0 1000 800) */
  x: number
  y: number
  photoKey: string
  labelDx?: number
  labelDy?: number
  /** true when the route returns to an earlier marker (no new dot) */
  revisit?: boolean
}

/** One day of the real plan. */
export interface ItineraryDay {
  day: number
  date: string
  place: string
  note: string
}

export interface FlightInfo {
  date: string
  from: string
  to: string
}

/* ------------------------------------------------------------------ */
/* Our map of memories — mandatory historical order                    */
/* ------------------------------------------------------------------ */

export const PAST_TRIPS: PastTrip[] = [
  {
    id: 'spain',
    order: 1,
    title: 'Spain',
    copy: 'Sun on our skin, late streets, and the kind of days that quietly became ours.',
    lat: 41.3874,
    lon: 2.1686,
    photoKey: 'past/spain',
  },
  {
    id: 'germany',
    order: 2,
    title: 'Germany',
    copy: 'Cold air, city lights, and another small proof that anywhere feels warmer with you.',
    lat: 52.52,
    lon: 13.405,
    photoKey: 'past/germany',
  },
  {
    id: 'egypt',
    order: 3,
    title: 'Egypt',
    copy: 'Ancient stone, desert light, and that strange feeling of standing inside history together.',
    lat: 30.0444,
    lon: 31.2357,
    photoKey: 'past/egypt',
  },
  {
    id: 'thailand',
    order: 4,
    title: 'Thailand',
    copy: 'Heat, color, water, noise, and days that felt almost unreal.',
    lat: 13.7563,
    lon: 100.5018,
    photoKey: 'past/thailand',
  },
  {
    id: 'croatia',
    order: 5,
    title: 'Croatia',
    copy: 'Blue water, warm nights, and the feeling of having nowhere else to be.',
    lat: 43.5081,
    lon: 16.4402,
    photoKey: 'past/croatia',
  },
  {
    id: 'hong-kong',
    order: 6,
    title: 'Hong Kong',
    copy: 'A city of glass, lights, movement, and little moments above the world.',
    lat: 22.3193,
    lon: 114.1694,
    photoKey: 'past/hongkong',
  },
  {
    id: 'china',
    order: 7,
    title: 'China',
    copy: 'Far from home, surrounded by something new, still somehow exactly where we were meant to be.',
    lat: 39.9042,
    lon: 116.4074,
    photoKey: 'past/china',
  },
  {
    id: 'greece',
    order: 8,
    title: 'Greece',
    copy: 'White walls, blue evenings, slow walks, and light that made everything softer.',
    lat: 37.9838,
    lon: 23.7275,
    photoKey: 'past/greece',
  },
  {
    id: 'new-york',
    order: 9,
    title: 'New York',
    copy: 'Big streets, bright windows, fast days, and us inside the movie of it all.',
    lat: 40.7128,
    lon: -74.006,
    photoKey: 'past/new-york',
  },
  {
    id: 'boston',
    order: 10,
    title: 'Boston',
    copy: 'Quieter streets, old brick, soft mornings, and another mark on our map.',
    lat: 42.3601,
    lon: -71.0589,
    photoKey: 'past/boston',
  },
]

/** Home — where every line starts. */
export const HOME = { lat: 52.2297, lon: 21.0122 }

/** Where the globe pulls before the map takes over. */
export const WEST = { lat: 36.2, lon: -116.5 }

/* ------------------------------------------------------------------ */
/* Copy blocks (easy to edit in one place)                             */
/* ------------------------------------------------------------------ */

export const INTRO = {
  heading: 'Happy birthday, my love.',
  lines: ['Some gifts are wrapped.', 'This one begins on a road.'],
  note: 'I made you a little story — about where we have been, and where we are going next.',
  button: 'Begin the journey',
}

export const MEMORY_TITLE = 'Our map of memories'

export const MEMORY_OUTRO = [
  'Some places stay behind us.',
  'Some quietly come with us.',
  'And then the map quietly asked for another story.',
]

export const BUILDUP = [
  'And now, a new line appears on the map.',
  'Not just another trip.',
  'A road through ocean light, granite walls, desert silence, red canyons, and neon nights.',
  'California is only the beginning.',
]

export const REVEAL = {
  eyebrow: 'The next chapter',
  title: 'California & The American West',
  titleYear: 'Road Trip 2026',
  dates: 'September 3 — September 15, 2026',
  subtitle: 'Ocean roads, desert light, canyon mornings, and one long story we will tell for years.',
}

export const FLIGHTS: FlightInfo[] = [
  { date: 'September 3, 2026', from: 'Warsaw', to: 'Los Angeles' },
  { date: 'September 15, 2026', from: 'Las Vegas', to: 'Warsaw' },
]

export const FINAL_LINES = [
  'Happy birthday, my love.',
  'In September, we will see the West together.',
  'But the best part is not California.',
  'Not the ocean, the canyons, the desert, or the road.',
  'It is getting to see it all with you.',
]

export const FINAL_WHISPER = 'And this is still only the beginning.'

/** caption under the closing constellation */
export const CONSTELLATION_NOTE =
  'The silver lights are where we have been. The gold ones are waiting for us.'

/* ------------------------------------------------------------------ */
/* The American West map (viewBox 0 0 1000 800)                        */
/* Stylized projection: lon −125…−107 → x 0…1000, lat 43…31 → y 0…800  */
/* ------------------------------------------------------------------ */

export const MAP_VIEWBOX = { width: 1000, height: 800 }

export const ROUTE_CHAPTERS: RouteChapter[] = [
  {
    id: 'los-angeles',
    title: 'Los Angeles',
    dateLabel: 'Sept 3 – 6',
    headline: 'The first golden hour.',
    lines: [
      'We land in the afternoon and let the city arrive slowly.',
      'Santa Monica air, Venice streets, Abbot Kinney lights.',
      'And the first feeling that this is real.',
    ],
    x: 375,
    y: 597,
    photoKey: 'california/los-angeles',
    labelDx: 12,
    labelDy: 22,
  },
  {
    id: 'malibu',
    title: 'Malibu',
    dateLabel: 'Sept 5',
    headline: 'Where the ocean starts to feel like a promise.',
    lines: ['Cliffs, salt air, El Matador light.', 'A slow day by the Pacific.'],
    x: 346,
    y: 598,
    photoKey: 'california/malibu',
    labelDx: -20,
    labelDy: -12,
  },
  {
    id: 'yosemite',
    title: 'Yosemite',
    dateLabel: 'Sept 7 – 8',
    headline: 'Where everything gets bigger.',
    lines: [
      'A long road out of LA, then granite, trees and waterfalls.',
      'The kind of silence that makes you look up more than you speak.',
    ],
    x: 301,
    y: 350,
    photoKey: 'california/yosemite',
    labelDx: -26,
    labelDy: -10,
  },
  {
    id: 'lone-pine',
    title: 'Tioga Road · Mono Lake · Lone Pine',
    dateLabel: 'Sept 9',
    headline: 'The road between worlds.',
    lines: [
      'Cold lakes, strange rocks, empty roads.',
      'The mountains slowly turning into desert.',
    ],
    x: 386,
    y: 427,
    photoKey: 'california/lone-pine-alabama-hills',
    labelDx: -14,
    labelDy: 22,
  },
  {
    id: 'death-valley',
    title: 'Death Valley',
    dateLabel: 'Sept 10',
    headline: 'Desert silence.',
    lines: [
      'Impossible heat, empty roads, salt flats, strange colors.',
      'Photos that look like another planet.',
    ],
    x: 452,
    y: 436,
    photoKey: 'california/death-valley',
    labelDx: -8,
    labelDy: -14,
  },
  {
    id: 'las-vegas',
    title: 'Las Vegas',
    dateLabel: 'Sept 10 – 11',
    headline: 'Neon in the desert.',
    lines: ['After the silence, the lights.', 'A city that feels half movie, half dream.'],
    x: 548,
    y: 455,
    photoKey: 'california/las-vegas',
    labelDx: -6,
    labelDy: 24,
  },
  {
    id: 'grand-canyon',
    title: 'Grand Canyon',
    dateLabel: 'Sept 11 – 12',
    headline: 'The sunset we came for.',
    lines: [
      'Hoover Dam, a stretch of Route 66, and then the rim.',
      'We watch the canyon change color until the day disappears inside it.',
    ],
    x: 715,
    y: 463,
    photoKey: 'california/grand-canyon',
    labelDx: 0,
    labelDy: 26,
  },
  {
    id: 'monument-valley',
    title: 'Monument Valley',
    dateLabel: 'Sept 12 – 13',
    headline: 'Morning on another planet.',
    lines: [
      'We wake up early for the kind of sunrise',
      'that makes the road feel like a movie.',
    ],
    x: 827,
    y: 401,
    photoKey: 'california/monument-valley',
    labelDx: 12,
    labelDy: -10,
  },
  {
    id: 'page',
    title: 'Page · Horseshoe Bend',
    dateLabel: 'Sept 13',
    headline: 'Where the river draws a perfect curve.',
    lines: [
      'Red rock, blue water, open sky.',
      'One of those views that does not feel real until you stand there.',
    ],
    x: 752,
    y: 406,
    photoKey: 'california/page-horseshoe-bend',
    labelDx: -22,
    labelDy: -14,
  },
  {
    id: 'antelope-canyon',
    title: 'Antelope Canyon',
    dateLabel: 'Sept 14',
    headline: 'Light you can walk through.',
    lines: [
      'A quiet morning under carved sandstone.',
      'Then one last desert road back to Vegas.',
    ],
    x: 771,
    y: 424,
    photoKey: 'california/antelope-canyon',
    labelDx: 16,
    labelDy: 14,
  },
  {
    id: 'vegas-morning',
    title: 'Final Vegas Morning',
    dateLabel: 'Sept 15',
    headline: 'One last neon morning.',
    lines: [
      'No rush. Brunch, maybe a pool, maybe outlets.',
      'And the strange feeling that we already have a new story.',
    ],
    x: 548,
    y: 455,
    photoKey: 'california/las-vegas',
    revisit: true,
  },
]

/* ------------------------------------------------------------------ */
/* The real plan, day by day                                           */
/* ------------------------------------------------------------------ */

export const ITINERARY: ItineraryDay[] = [
  { day: 1, date: 'Sept 3', place: 'Los Angeles', note: 'Arrival at 2:45 PM, pick up the car, slow first evening in Santa Monica, Venice, and Abbot Kinney.' },
  { day: 2, date: 'Sept 4', place: 'Los Angeles', note: 'Griffith Observatory, Hollywood Sign viewpoint, Beverly Hills, The Grove, West Hollywood.' },
  { day: 3, date: 'Sept 5', place: 'Malibu / Los Angeles', note: 'Malibu, El Matador Beach, Getty Villa or Getty Center, Venice, Melrose / Fairfax.' },
  { day: 4, date: 'Sept 6', place: 'Los Angeles', note: 'Shopping, restaurants, Silver Lake / Los Feliz, Fairfax, Century City or Manhattan Beach.' },
  { day: 5, date: 'Sept 7', place: 'Yosemite / Mariposa / El Portal', note: 'Long drive from LA to Yosemite. A road day that changes the whole mood of the trip.' },
  { day: 6, date: 'Sept 8', place: 'Yosemite', note: 'Granite walls, waterfalls, valley views, slow walks, photos, and that huge impossible sky.' },
  { day: 7, date: 'Sept 9', place: 'Lone Pine', note: 'Yosemite to Tioga Road, Tenaya Lake, Mono Lake, Alabama Hills, Lone Pine.' },
  { day: 8, date: 'Sept 10', place: 'Las Vegas', note: 'Lone Pine through Death Valley to Vegas. Desert silence by day, neon by night.' },
  { day: 9, date: 'Sept 11', place: 'Grand Canyon / Tusayan / Williams', note: 'Vegas to Hoover Dam and Route 66, then Grand Canyon sunset.' },
  { day: 10, date: 'Sept 12', place: 'Monument Valley / Kayenta', note: 'Grand Canyon sunrise, Desert View Drive, then Monument Valley.' },
  { day: 11, date: 'Sept 13', place: 'Page', note: 'Monument Valley sunrise, Page, Horseshoe Bend, Lake Powell.' },
  { day: 12, date: 'Sept 14', place: 'Las Vegas', note: 'Antelope Canyon in the morning, then the road back to Vegas.' },
  { day: 13, date: 'Sept 15', place: 'Las Vegas → flight home', note: 'Slow morning, brunch, pool or outlets, then flight at 5:15 PM.' },
]

/** Scene order — used by the progress rail. */
export const SCENES = [
  { id: 'intro', label: 'Happy birthday' },
  { id: 'memintro', label: 'Our map of memories' },
  { id: 'memories', label: 'Where we have been' },
  { id: 'outro', label: 'What stays with us' },
  { id: 'buildup', label: 'A new line' },
  { id: 'reveal', label: 'The next chapter' },
  { id: 'westmap', label: 'The road' },
  { id: 'plan', label: 'Day by day' },
  { id: 'final', label: 'Only the beginning' },
] as const
