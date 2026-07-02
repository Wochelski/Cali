import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import clsx from 'clsx'
import { SceneLayout } from './SceneLayout'
import { useSceneTimeline } from '../hooks/useGSAPScroll'
import { ROUTE_STOPS, MAP_STOPS, MAP_VIEWBOX } from '../data/trips'
import { remap01 } from '../utils/animation'

/** portion of scene progress where the route line draws (map stops) */
const DRAW_START = 0.08
const DRAW_END = 0.7
/** eastbound beats after the map route completes */
const NY_AT = 0.78
const BOSTON_AT = 0.88

/** camera anchor: where the focused point lands inside the viewBox —
 *  slightly above middle so the caption zone below stays clear */
const ANCHOR = { x: 380, y: 400 }
const CLOSE_UP = 1.85

/** stylized Pacific coastline (California, loosely) */
const COASTLINE =
  'M 50 20 C 45 65 34 105 37 145 C 40 185 60 200 74 237 C 90 280 105 330 124 370 ' +
  'C 132 385 150 380 160 392 C 175 410 176 435 184 466 C 188 480 189 489 192 500 ' +
  'C 196 512 193 520 198 531 C 218 562 240 580 257 614 C 270 640 268 675 281 699 ' +
  'C 292 706 315 699 329 702 C 355 707 382 725 403 741 C 410 748 415 756 422 762 ' +
  'C 445 782 470 825 486 859 C 488 866 489 872 489 880'

/** California / Nevada–Arizona border */
const STATE_BORDER = 'M 310 8 L 310 278 L 646 650 C 640 665 652 682 646 702'

/** the route: LA → Malibu → Big Sur → Redwoods → Yosemite → Death Valley → Vegas */
const ROUTE_PATH =
  'M 418 736 C 407 733 394 735 383 733 C 365 727 345 713 329 702 ' +
  'C 312 694 293 703 281 699 C 266 680 262 640 257 614 C 245 583 213 556 198 531 ' +
  'C 206 507 226 485 250 467 C 280 445 310 429 332 420 C 335 411 335 402 335 394 ' +
  'C 355 383 381 390 398 412 C 412 441 431 470 452 490 C 470 502 488 506 504 513 ' +
  'C 540 527 575 532 611 540'

/** the eastbound continuation — a quiet hint leaving the map */
const ONWARD_PATH = 'M 611 540 C 662 502 706 465 752 432'

/** Sierra Nevada contour hints */
const CONTOURS = [
  'M 298 302 C 328 342 350 382 364 432',
  'M 314 292 C 344 336 367 386 382 440',
  'M 330 284 C 360 330 384 388 399 446',
]

/** small atlas details: waves, pines, dunes */
const WAVES = ['M 96 618 q 7 -6 14 0 q 7 6 14 0', 'M 120 668 q 7 -6 14 0 q 7 6 14 0', 'M 76 560 q 7 -6 14 0 q 7 6 14 0']
const PINES = [
  { x: 366, y: 328 },
  { x: 380, y: 346 },
  { x: 358, y: 310 },
]
const DUNES = ['M 462 566 q 11 -9 22 0', 'M 484 580 q 11 -9 22 0', 'M 520 560 q 11 -9 22 0']

/**
 * The close-up West Coast scene: a hand-drawn map filling the frame,
 * a scroll-driven camera that pans stop to stop while the route draws,
 * then a gentle zoom-out as the journey turns east toward New York
 * and Boston. One caption at a time, always over a scrim, never
 * under a route dot.
 */
export function WestCoastMap() {
  const ref = useRef<HTMLElement>(null)
  const routeRef = useRef<SVGPathElement>(null)
  const cameraRef = useRef<SVGGElement>(null)
  const camState = useRef({ fx: MAP_STOPS[0].x, fy: MAP_STOPS[0].y, s: CLOSE_UP })
  const thresholdsRef = useRef<number[]>([])
  const lastActiveRef = useRef(-1)
  const [active, setActive] = useState(-1)

  // fraction of the route length at every map stop (sequential search —
  // the path passes the Redwoods/Yosemite area twice)
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
    thresholdsRef.current = MAP_STOPS.map((stop) => {
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

  const stopPosition = (i: number) => {
    const t = thresholdsRef.current[i] ?? i / (MAP_STOPS.length - 1)
    return DRAW_START + t * (DRAW_END - DRAW_START)
  }

  // soft snap: each map stop plus the two eastbound beats
  const snapToStop = (value: number) => {
    if (value < 0.06 || value > 0.93) return value
    const points = [...MAP_STOPS.map((_, i) => stopPosition(i)), NY_AT, BOSTON_AT]
    return points.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a))
  }

  useSceneTimeline(
    ref,
    (tl) => {
      const cam = camState.current
      Object.assign(cam, { fx: MAP_STOPS[0].x, fy: MAP_STOPS[0].y, s: CLOSE_UP })
      const applyCamera = () => {
        cameraRef.current?.setAttribute(
          'transform',
          `translate(${ANCHOR.x} ${ANCHOR.y}) scale(${cam.s}) translate(${-cam.fx} ${-cam.fy})`,
        )
      }
      applyCamera()
      tl.eventCallback('onUpdate', applyCamera)

      tl.fromTo('[data-map-stage]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.005)
        .fromTo('[data-map-coast]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.1 }, 0.02)
        .fromTo('[data-map-decor]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.06)
        .fromTo(
          '.route-draw',
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: DRAW_END - DRAW_START },
          DRAW_START,
        )

      // camera pans stop to stop, synchronized with the route drawing
      for (let i = 1; i < MAP_STOPS.length; i++) {
        const from = stopPosition(i - 1)
        const to = stopPosition(i)
        tl.to(cam, { fx: MAP_STOPS[i].x, fy: MAP_STOPS[i].y, duration: Math.max(0.01, to - from) }, from)
      }

      // the journey turns east: pull back to the whole map
      tl.to(cam, { fx: 420, fy: 490, s: 1.04, duration: 0.09 }, 0.72)
        .fromTo('[data-map-onward]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, NY_AT - 0.02)
    },
    {
      snapTo: snapToStop,
      onProgress: (p) => {
        let idx = -1
        if (p >= BOSTON_AT - 0.01) idx = 8
        else if (p >= NY_AT - 0.01) idx = 7
        else if (p >= DRAW_START && thresholdsRef.current.length) {
          const drawFrac = remap01(p, DRAW_START, DRAW_END)
          for (let i = 0; i < thresholdsRef.current.length; i++) {
            if (drawFrac >= thresholdsRef.current[i] - 0.004) idx = i
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

  // caption entrance on every stop change
  useGSAP(
    () => {
      if (active < 0) return
      gsap.fromTo(
        '[data-stop-caption]',
        { autoAlpha: 0, y: 14, filter: 'blur(5px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' },
      )
    },
    { scope: ref, dependencies: [active] },
  )

  const stop = active >= 0 ? ROUTE_STOPS[active] : null

  return (
    <SceneLayout ref={ref} id="westcoast" heightVh={620}>
      <div data-map-stage className="invisible relative h-full">
        {/* the map fills the whole frame — a close-up, not a distant view */}
        <svg
          className="h-full w-full"
          viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="A hand-drawn map of the American West Coast: the route runs from Los Angeles up the Pacific coast, through Yosemite and Death Valley to Las Vegas, then east"
        >
          <defs>
            <filter id="dot-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          <g ref={cameraRef}>
            {/* graticule */}
            <g stroke="#F7F0E6" strokeOpacity="0.035" strokeWidth="1">
              {Array.from({ length: 6 }, (_, i) => (
                <line key={`v${i}`} x1={60 + i * 124} y1="0" x2={60 + i * 124} y2="940" />
              ))}
              {Array.from({ length: 5 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={92 + i * 185} x2="760" y2={92 + i * 185} />
              ))}
            </g>

            {/* coastline */}
            <path
              data-map-coast
              d={COASTLINE}
              fill="none"
              stroke="#BDAF9F"
              strokeOpacity="0.42"
              strokeWidth="1.3"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
            />

            <g data-map-decor className="invisible">
              <path
                d={STATE_BORDER}
                fill="none"
                stroke="#F7F0E6"
                strokeOpacity="0.12"
                strokeWidth="1"
                strokeDasharray="4 8"
              />
              {CONTOURS.map((d) => (
                <path key={d} d={d} fill="none" stroke="#F7F0E6" strokeOpacity="0.06" strokeWidth="1" />
              ))}
              {WAVES.map((d) => (
                <path key={d} d={d} fill="none" stroke="#BDAF9F" strokeOpacity="0.18" strokeWidth="1" />
              ))}
              {PINES.map(({ x, y }) => (
                <path
                  key={`${x}${y}`}
                  d={`M ${x} ${y} l 4.5 9 h -9 z`}
                  fill="none"
                  stroke="#BDAF9F"
                  strokeOpacity="0.2"
                  strokeWidth="1"
                />
              ))}
              {DUNES.map((d) => (
                <path key={d} d={d} fill="none" stroke="#BDAF9F" strokeOpacity="0.16" strokeWidth="1" />
              ))}
              <text
                x="112"
                y="565"
                transform="rotate(-52 112 565)"
                fill="#BDAF9F"
                fillOpacity="0.3"
                fontSize="13"
                fontWeight="300"
                style={{ letterSpacing: '0.5em' }}
              >
                PACIFIC
              </text>
              <text
                x="508"
                y="408"
                transform="rotate(48 508 408)"
                fill="#F7F0E6"
                fillOpacity="0.15"
                fontSize="12"
                fontWeight="300"
                style={{ letterSpacing: '0.45em' }}
              >
                NEVADA
              </text>
              <text
                x="196"
                y="200"
                fill="#F7F0E6"
                fillOpacity="0.15"
                fontSize="12"
                fontWeight="300"
                style={{ letterSpacing: '0.45em' }}
              >
                CALIFORNIA
              </text>
              {/* compass */}
              <g transform="translate(700 60)" stroke="#F7F0E6" strokeOpacity="0.25">
                <line x1="0" y1="14" x2="0" y2="-14" strokeWidth="1" />
                <path d="M -4 -6 L 0 -14 L 4 -6" fill="none" strokeWidth="1" />
                <text y="32" textAnchor="middle" fill="#F7F0E6" fillOpacity="0.25" fontSize="11" stroke="none">
                  N
                </text>
              </g>
            </g>

            {/* route glow + route line */}
            <path
              className="route-draw"
              d={ROUTE_PATH}
              fill="none"
              stroke="#E6B66A"
              strokeOpacity="0.13"
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
              stroke="#E6B66A"
              strokeWidth="2"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
            />

            {/* eastbound hint after Vegas */}
            <path
              data-map-onward
              className="invisible"
              d={ONWARD_PATH}
              fill="none"
              stroke="#E6B66A"
              strokeOpacity="0.4"
              strokeWidth="1.4"
              strokeDasharray="3 7"
              strokeLinecap="round"
            />

            {/* stops */}
            {MAP_STOPS.map((s, i) => {
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
                    r="8"
                    fill="#EFC881"
                    filter="url(#dot-glow)"
                    className={clsx(
                      'transition-opacity duration-500',
                      isActive ? 'opacity-65' : 'opacity-25',
                    )}
                  />
                  <circle cx={s.x} cy={s.y} r="3.6" fill="#050812" stroke="#EFC881" strokeWidth="1.4" />
                  <circle cx={s.x} cy={s.y} r="1.4" fill="#EFC881" />
                  <text
                    x={s.x + (s.labelDx ?? 10)}
                    y={s.y + (s.labelDy ?? -8)}
                    fontSize="11"
                    fontWeight="500"
                    className={clsx('tabular-nums transition-opacity duration-500')}
                    fill="#F7F0E6"
                    fillOpacity={isActive ? 0.9 : 0.35}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>

        {/* text-safe zone: scrim + one caption at a time */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-night-950/90 via-night-950/45 to-transparent" />
        {stop && (
          <div
            key={stop.id}
            data-stop-caption
            className="invisible absolute inset-x-7 bottom-[max(3.5rem,env(safe-area-inset-bottom))] md:inset-x-auto md:left-16 md:max-w-md"
          >
            <p className="text-[11px] font-medium tabular-nums tracking-[0.2em] text-gold-300/80">
              {String(active + 1).padStart(2, '0')} / {String(ROUTE_STOPS.length).padStart(2, '0')}
            </p>
            <h2 className="mt-2.5 text-[34px] font-semibold leading-tight tracking-tight md:text-5xl">
              {stop.name}
            </h2>
            <p className="mt-2 max-w-[20rem] text-[16px] font-light leading-relaxed text-mist-400 md:max-w-md md:text-lg">
              {stop.line}
            </p>
          </div>
        )}
      </div>
    </SceneLayout>
  )
}
