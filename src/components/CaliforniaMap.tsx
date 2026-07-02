import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import clsx from 'clsx'
import { SceneLayout } from './SceneLayout'
import { useSceneTimeline } from '../hooks/useGSAPScroll'
import { ROUTE_STOPS, MAP_VIEWBOX } from '../data/trips'
import { remap01 } from '../utils/animation'

/** fragment postępu sceny, w którym rysuje się linia trasy */
const DRAW_START = 0.12
const DRAW_END = 0.94

/** stylizowana linia wybrzeża Pacyfiku (Kalifornia, z grubsza) */
const COASTLINE =
  'M 50 20 C 45 65 34 105 37 145 C 40 185 60 200 74 237 C 90 280 105 330 124 370 ' +
  'C 132 385 150 380 160 392 C 175 410 176 435 184 466 C 188 480 189 489 192 500 ' +
  'C 196 512 193 520 198 531 C 218 562 240 580 257 614 C 270 640 268 675 281 699 ' +
  'C 292 706 315 699 329 702 C 355 707 382 725 403 741 C 410 748 415 756 422 762 ' +
  'C 445 782 470 825 486 859 C 488 866 489 872 489 880'

/** granica Kalifornia / Nevada–Arizona */
const STATE_BORDER = 'M 310 8 L 310 278 L 646 650 C 640 665 652 682 646 702'

/** trasa przez 7 momentów — LA → wybrzeże → góry → pustynia → Las Vegas */
const ROUTE_PATH =
  'M 418 736 C 407 733 394 735 383 733 C 365 727 345 713 329 702 ' +
  'C 312 694 293 703 281 699 C 266 680 262 640 257 614 C 245 583 213 556 198 531 ' +
  'C 190 517 189 505 194 496 C 214 462 275 418 335 394 C 362 384 385 392 396 412 ' +
  'C 408 441 424 470 448 490 C 468 502 486 505 504 513 C 540 527 575 532 611 540'

/** kontury Sierra Nevada — tylko sugestia terenu */
const CONTOURS = [
  'M 298 302 C 328 342 350 382 364 432',
  'M 314 292 C 344 336 367 386 382 440',
  'M 330 284 C 360 330 384 388 399 446',
]

/**
 * Scena trasy: mapa rysuje się w rytmie scrolla, momenty zapalają się
 * jeden po drugim, a panel pokazuje zawsze tylko jedno miejsce.
 */
export function CaliforniaMap() {
  const ref = useRef<HTMLElement>(null)
  const routeRef = useRef<SVGPathElement>(null)
  const thresholdsRef = useRef<number[]>([])
  const lastActiveRef = useRef(-1)
  const [active, setActive] = useState(-1)

  // pozycja każdego momentu na linii trasy (ułamek długości ścieżki);
  // szukanie sekwencyjne gwarantuje rosnące progi
  useLayoutEffect(() => {
    const path = routeRef.current
    if (!path) return
    const total = path.getTotalLength()
    const SAMPLES = 900
    const points: { x: number; y: number }[] = []
    for (let i = 0; i <= SAMPLES; i++) {
      const p = path.getPointAtLength((i / SAMPLES) * total)
      points.push({ x: p.x, y: p.y })
    }
    let searchFrom = 0
    thresholdsRef.current = ROUTE_STOPS.map((stop) => {
      let best = searchFrom
      let bestDist = Infinity
      for (let i = searchFrom; i <= SAMPLES; i++) {
        const d = (points[i].x - stop.x) ** 2 + (points[i].y - stop.y) ** 2
        if (d < bestDist) {
          bestDist = d
          best = i
        }
      }
      searchFrom = best
      return best / SAMPLES
    })
  }, [])

  // miękki snap do momentów trasy (progi znane po zmierzeniu ścieżki)
  const snapToStop = (value: number) => {
    const thresholds = thresholdsRef.current
    if (!thresholds.length || value < 0.09 || value > 0.96) return value
    const points = thresholds.map((t) => DRAW_START + t * (DRAW_END - DRAW_START))
    return points.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a))
  }

  useSceneTimeline(
    ref,
    (tl) => {
      tl.fromTo('[data-map-frame]', { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.01)
        .fromTo('[data-map-coast]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.14 }, 0.03)
        .fromTo('[data-map-decor]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, 0.1)
        .fromTo('[data-map-panel]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.05)
        .fromTo(
          '.route-draw',
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: DRAW_END - DRAW_START },
          DRAW_START,
        )
    },
    {
      snapTo: snapToStop,
      onProgress: (p) => {
        const thresholds = thresholdsRef.current
        let idx = -1
        if (p >= DRAW_START && thresholds.length) {
          const drawFrac = remap01(p, DRAW_START, DRAW_END)
          for (let i = 0; i < thresholds.length; i++) {
            if (drawFrac >= thresholds[i] - 0.004) idx = i
            else break
          }
        }
        if (idx !== lastActiveRef.current) {
          lastActiveRef.current = idx
          setActive(idx)
        }
      },
    },
  )

  // płynna podmiana podpisu w panelu
  useGSAP(
    () => {
      if (active < 0) return
      gsap.fromTo(
        '[data-stop-label]',
        { autoAlpha: 0, y: 14, filter: 'blur(5px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' },
      )
    },
    { scope: ref, dependencies: [active] },
  )

  const stop = active >= 0 ? ROUTE_STOPS[active] : null

  return (
    <SceneLayout ref={ref} id="route" heightVh={430}>
      <div className="flex h-full flex-col px-5 pb-8 pt-6 md:grid md:grid-cols-[1.15fr_1fr] md:items-center md:gap-10 md:px-14 md:py-10">
        {/* ------- mapa ------- */}
        <div data-map-frame className="invisible relative min-h-0 flex-1 md:h-[82svh]">
          <svg
            className="h-full w-full"
            viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Stylizowana mapa trasy: z Los Angeles wybrzeżem na północ, przez Yosemite i Dolinę Śmierci do Las Vegas"
          >
            <defs>
              <filter id="dot-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>

            {/* siatka geograficzna */}
            <g stroke="#f5f2ea" strokeOpacity="0.035" strokeWidth="1">
              {Array.from({ length: 6 }, (_, i) => (
                <line key={`v${i}`} x1={60 + i * 124} y1="0" x2={60 + i * 124} y2="940" />
              ))}
              {Array.from({ length: 5 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={92 + i * 185} x2="760" y2={92 + i * 185} />
              ))}
            </g>

            {/* wybrzeże */}
            <path
              data-map-coast
              d={COASTLINE}
              fill="none"
              stroke="#cdbd9c"
              strokeOpacity="0.4"
              strokeWidth="1.3"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
            />

            <g data-map-decor className="invisible">
              {/* granica stanu */}
              <path
                d={STATE_BORDER}
                fill="none"
                stroke="#f5f2ea"
                strokeOpacity="0.12"
                strokeWidth="1"
                strokeDasharray="4 8"
              />
              {/* kontury Sierra Nevada */}
              {CONTOURS.map((d) => (
                <path key={d} d={d} fill="none" stroke="#f5f2ea" strokeOpacity="0.06" strokeWidth="1" />
              ))}
              {/* podpisy przestrzeni */}
              <text
                x="112"
                y="565"
                transform="rotate(-52 112 565)"
                className="fill-sand-300/30 text-[13px] font-light"
                style={{ letterSpacing: '0.5em' }}
              >
                PACYFIK
              </text>
              <text
                x="508"
                y="408"
                transform="rotate(48 508 408)"
                className="fill-warm-50/15 text-[12px] font-light"
                style={{ letterSpacing: '0.45em' }}
              >
                NEVADA
              </text>
              <text
                x="196"
                y="200"
                className="fill-warm-50/15 text-[12px] font-light"
                style={{ letterSpacing: '0.45em' }}
              >
                KALIFORNIA
              </text>
              {/* róża północy */}
              <g transform="translate(700 60)" className="stroke-warm-50/25">
                <line x1="0" y1="14" x2="0" y2="-14" strokeWidth="1" />
                <path d="M -4 -6 L 0 -14 L 4 -6" fill="none" strokeWidth="1" />
                <text y="32" textAnchor="middle" className="fill-warm-50/25 text-[11px]">
                  N
                </text>
              </g>
            </g>

            {/* poświata pod trasą + linia trasy */}
            <path
              className="route-draw"
              d={ROUTE_PATH}
              fill="none"
              stroke="#e08a4e"
              strokeOpacity="0.14"
              strokeWidth="7"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
            />
            <path
              ref={routeRef}
              className="route-draw"
              d={ROUTE_PATH}
              fill="none"
              stroke="#e08a4e"
              strokeWidth="2"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
            />

            {/* momenty trasy */}
            {ROUTE_STOPS.map((s, i) => {
              const revealed = i <= active
              const isActive = i === active
              return (
                <g
                  key={s.id}
                  className={clsx(
                    'transition-opacity duration-700',
                    revealed ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r="9"
                    fill="#f0a869"
                    filter="url(#dot-glow)"
                    className={clsx(
                      'transition-opacity duration-500',
                      isActive ? 'opacity-70' : 'opacity-25',
                    )}
                  />
                  <circle cx={s.x} cy={s.y} r="4" fill="#04070d" stroke="#f0a869" strokeWidth="1.5" />
                  <circle cx={s.x} cy={s.y} r="1.6" fill="#f0a869" />
                  <text
                    x={s.x + (s.labelDx ?? 10)}
                    y={s.y + (s.labelDy ?? -8)}
                    className={clsx(
                      'text-[11px] font-medium tabular-nums transition-opacity duration-500',
                      isActive ? 'fill-warm-50/90' : 'fill-warm-50/35',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* ------- panel aktywnego momentu ------- */}
        <div data-map-panel className="invisible mt-4 md:mt-0">
          <p className="kicker">trasa · wrzesień 2026</p>

          <div className="mt-3 min-h-[7.5rem] md:mt-8 md:min-h-[13rem]">
            {stop && (
              <div key={stop.id} data-stop-label>
                <div className="flex items-baseline gap-4">
                  <p className="text-5xl font-semibold tabular-nums tracking-tight text-warm-50/15 md:text-8xl">
                    {String(active + 1).padStart(2, '0')}
                  </p>
                  <div>
                    <h3 className="text-3xl font-semibold tracking-tight md:text-5xl">
                      {stop.name}
                    </h3>
                    <p className="kicker mt-2.5">{stop.region}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* wskaźnik postępu trasy */}
          <div className="mt-4 flex items-center gap-4 md:mt-10">
            <div className="h-px flex-1 bg-warm-50/10">
              <div
                className="h-px origin-left bg-copper-400 transition-transform duration-500 ease-smooth"
                style={{ transform: `scaleX(${(active + 1) / ROUTE_STOPS.length})` }}
              />
            </div>
            <p className="text-xs font-medium tabular-nums text-warm-50/50">
              {String(Math.max(0, active + 1)).padStart(2, '0')} /{' '}
              {String(ROUTE_STOPS.length).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>
    </SceneLayout>
  )
}
