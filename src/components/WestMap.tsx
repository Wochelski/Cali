import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import clsx from 'clsx'
import { SceneLayout } from './SceneLayout'
import { PhotoCard } from './PhotoCard'
import { useSceneTimeline } from '../hooks/useGSAPScroll'
import { ROUTE_CHAPTERS, MAP_VIEWBOX } from '../data/trips'
import { remap01 } from '../utils/animation'

/** portion of scene progress where the route line draws */
const DRAW_START = 0.05
const DRAW_END = 0.86
/** camera anchor: where the focused point lands inside the viewBox */
const ANCHOR = { x: 500, y: 320 }
const CLOSE_UP = 2.0

/** stylized Pacific coastline (California, loosely) */
const COASTLINE =
  'M 0 90 C -8 130 -22 145 -18 172 C -15 200 3 210 13 237 C 25 268 43 304 57 333 ' +
  'C 63 344 82 340 90 349 C 101 362 105 380 111 402 C 114 412 115 419 118 427 ' +
  'C 121 436 119 441 124 449 C 139 471 165 484 177 509 C 186 528 188 553 198 570 ' +
  'C 206 575 231 570 241 572 C 260 576 292 588 307 600 C 312 605 319 611 324 615 ' +
  'C 341 629 371 660 382 685 C 383 690 384 695 384 700'

/** state border hints: CA/NV diagonal, the Colorado river, UT/AZ lines */
const BORDERS = [
  'M 278 67 L 278 267 L 578 533 C 573 548 583 560 575 574 C 562 588 556 602 548 618',
  'M 611 0 L 611 400',
  'M 611 400 L 1000 400',
  'M 0 67 L 611 67',
]

/** the Colorado carving toward the Grand Canyon */
const RIVER = 'M 748 412 C 730 428 716 438 702 456 C 686 472 664 468 648 480 C 636 488 624 486 614 492'

/** the route: LA → Malibu → Yosemite → Lone Pine → Death Valley → Vegas →
 *  Grand Canyon → Monument Valley → Page → Antelope → back to Vegas */
const ROUTE_PATH =
  'M 375 597 C 365 594 355 595 346 598 C 356 600 368 594 373 586 ' +
  'C 345 512 318 424 301 350 C 311 341 323 332 333 333 C 350 355 375 392 386 427 ' +
  'C 405 434 430 430 452 436 C 485 445 520 448 548 455 C 600 480 660 487 715 463 ' +
  'C 760 445 800 420 827 401 C 805 395 775 398 752 406 C 757 412 763 418 771 424 ' +
  'C 700 452 620 470 548 455'

/** Sierra Nevada contour hints */
const CONTOURS = [
  'M 262 280 C 288 320 308 360 322 400',
  'M 276 270 C 302 314 324 364 338 408',
  'M 290 262 C 316 308 340 366 354 414',
]

/** small atlas details */
const WAVES = ['M 60 480 q 7 -6 14 0 q 7 6 14 0', 'M 90 540 q 7 -6 14 0 q 7 6 14 0', 'M 40 420 q 7 -6 14 0 q 7 6 14 0']
const PINES = [
  { x: 268, y: 318 },
  { x: 282, y: 338 },
  { x: 258, y: 300 },
]
const DUNES = ['M 420 470 q 11 -9 22 0', 'M 444 484 q 11 -9 22 0', 'M 470 465 q 11 -9 22 0']
const MESAS = ['M 838 372 h 13 l 4 9 h -21 z', 'M 858 384 h 10 l 3 7 h -16 z', 'M 820 362 h 11 l 3 8 h -17 z']

/** procedural postcard moods when a chapter photo is missing */
const FALLBACKS: Record<string, string> = {
  'los-angeles': 'linear-gradient(165deg, #10243A, #E6B66A66)',
  malibu: 'linear-gradient(165deg, #0D1B2A, #7FB7C966)',
  yosemite: 'linear-gradient(165deg, #17241F, #9CC9D655)',
  'lone-pine': 'linear-gradient(165deg, #1d1a24, #C96F4A66)',
  'death-valley': 'linear-gradient(165deg, #2A1F1A, #D8A85C77)',
  'las-vegas': 'linear-gradient(165deg, #0a0d18, #FFB86B55)',
  'grand-canyon': 'linear-gradient(165deg, #241318, #C96F4A88)',
  'monument-valley': 'linear-gradient(165deg, #1d1210, #C96F4A99)',
  page: 'linear-gradient(165deg, #142433, #C96F4A77)',
  'antelope-canyon': 'linear-gradient(165deg, #2a1410, #D9855977)',
  'vegas-morning': 'linear-gradient(165deg, #10131f, #EFC88155)',
}

/**
 * The American West, drawn like a page of an old road atlas.
 * A scroll-driven camera follows the route from Los Angeles all the
 * way around the canyon loop and back to Vegas; every chapter brings
 * a photograph and a few lines, always clear of the map's markers.
 */
export function WestMap() {
  const ref = useRef<HTMLElement>(null)
  const routeRef = useRef<SVGPathElement>(null)
  const cameraRef = useRef<SVGGElement>(null)
  const camState = useRef({ fx: ROUTE_CHAPTERS[0].x, fy: ROUTE_CHAPTERS[0].y, s: CLOSE_UP })
  const appliedRef = useRef({ fx: 0, fy: 0, s: 0 })
  const thresholdsRef = useRef<number[]>([])
  const lastActiveRef = useRef(-1)
  const [active, setActive] = useState(-1)

  // fraction of the route length at every chapter (sequential search —
  // the road passes near several points twice on the canyon loop)
  useLayoutEffect(() => {
    const path = routeRef.current
    if (!path) return
    const total = path.getTotalLength()
    const SAMPLES = 1100
    const points: { x: number; y: number }[] = []
    for (let i = 0; i <= SAMPLES; i++) {
      const p = path.getPointAtLength((i / SAMPLES) * total)
      points.push({ x: p.x, y: p.y })
    }
    let searchFrom = 0
    thresholdsRef.current = ROUTE_CHAPTERS.map((stop) => {
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
    const t = thresholdsRef.current[i] ?? i / (ROUTE_CHAPTERS.length - 1)
    return DRAW_START + t * (DRAW_END - DRAW_START)
  }

  const snapToStop = (value: number) => {
    if (value < 0.04 || value > 0.9) return value
    const points = ROUTE_CHAPTERS.map((_, i) => stopPosition(i))
    return points.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a))
  }

  useSceneTimeline(
    ref,
    (tl) => {
      const cam = camState.current
      Object.assign(cam, { fx: ROUTE_CHAPTERS[0].x, fy: ROUTE_CHAPTERS[0].y, s: CLOSE_UP })
      const applyCamera = () => {
        const applied = appliedRef.current
        if (
          Math.abs(applied.fx - cam.fx) < 0.05 &&
          Math.abs(applied.fy - cam.fy) < 0.05 &&
          Math.abs(applied.s - cam.s) < 0.0005
        ) {
          return
        }
        Object.assign(applied, cam)
        cameraRef.current?.setAttribute(
          'transform',
          `translate(${ANCHOR.x} ${ANCHOR.y}) scale(${cam.s}) translate(${-cam.fx} ${-cam.fy})`,
        )
      }
      applyCamera()
      tl.eventCallback('onUpdate', applyCamera)

      tl.fromTo('[data-map-stage]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.004)
        .fromTo('[data-map-coast]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.08 }, 0.015)
        .fromTo('[data-map-decor]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.05)
        .fromTo(
          '.route-draw',
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: DRAW_END - DRAW_START },
          DRAW_START,
        )

      // camera pans chapter to chapter, synchronized with the drawing
      for (let i = 1; i < ROUTE_CHAPTERS.length; i++) {
        const from = stopPosition(i - 1)
        const to = stopPosition(i)
        tl.to(
          cam,
          { fx: ROUTE_CHAPTERS[i].x, fy: ROUTE_CHAPTERS[i].y, duration: Math.max(0.01, to - from) },
          from,
        )
      }

      // the closing frame: pull back over the whole loop
      tl.to(cam, { fx: 560, fy: 480, s: 1.05, duration: 0.09, ease: 'power1.inOut' }, 0.9)
    },
    {
      snapTo: snapToStop,
      onProgress: (p) => {
        let idx = -1
        if (p >= DRAW_START && thresholdsRef.current.length) {
          const drawFrac = remap01(p, DRAW_START, DRAW_END)
          for (let i = 0; i < thresholdsRef.current.length; i++) {
            if (drawFrac >= thresholdsRef.current[i] - 0.003) idx = i
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

  // photo + caption entrance on every chapter change
  useGSAP(
    () => {
      if (active < 0) return
      gsap.fromTo(
        '[data-chapter-photo]',
        { autoAlpha: 0, y: 20, rotate: active % 2 === 0 ? 3.5 : -3.5 },
        { autoAlpha: 1, y: 0, rotate: active % 2 === 0 ? 1.5 : -1.5, duration: 0.75, ease: 'power3.out' },
      )
      gsap.fromTo(
        '[data-chapter-caption]',
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.06, ease: 'power3.out' },
      )
    },
    { scope: ref, dependencies: [active] },
  )

  const chapter = active >= 0 ? ROUTE_CHAPTERS[active] : null

  return (
    <SceneLayout ref={ref} id="westmap" heightVh={900}>
      <div data-map-stage className="invisible relative h-full">
        <svg
          className="h-full w-full"
          viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="A hand-drawn map of the American West: the road runs from Los Angeles through Yosemite, Death Valley and Las Vegas, around the Grand Canyon, Monument Valley and Page, and back to Las Vegas"
        >
          <defs>
            <radialGradient id="dot-halo" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#EFC881" stopOpacity="0.5" />
              <stop offset="0.6" stopColor="#EFC881" stopOpacity="0.18" />
              <stop offset="1" stopColor="#EFC881" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g ref={cameraRef}>
            {/* survey grid */}
            <g stroke="#F7F0E6" strokeOpacity="0.03" strokeWidth="1">
              {Array.from({ length: 8 }, (_, i) => (
                <line key={`v${i}`} x1={125 * (i + 1)} y1="0" x2={125 * (i + 1)} y2="800" />
              ))}
              {Array.from({ length: 5 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={133 * (i + 1)} x2="1000" y2={133 * (i + 1)} />
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
              {BORDERS.map((d) => (
                <path
                  key={d}
                  d={d}
                  fill="none"
                  stroke="#F7F0E6"
                  strokeOpacity="0.1"
                  strokeWidth="1"
                  strokeDasharray="4 8"
                />
              ))}
              {/* the Colorado near the canyon */}
              <path d={RIVER} fill="none" stroke="#C96F4A" strokeOpacity="0.35" strokeWidth="1.2" />
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
              {MESAS.map((d) => (
                <path key={d} d={d} fill="none" stroke="#C96F4A" strokeOpacity="0.35" strokeWidth="1" />
              ))}
              {/* space labels */}
              <text x="48" y="430" transform="rotate(-58 48 430)" fill="#BDAF9F" fillOpacity="0.3" fontSize="13" fontWeight="300" style={{ letterSpacing: '0.5em' }}>
                PACIFIC
              </text>
              <text x="150" y="280" transform="rotate(50 150 280)" fill="#F7F0E6" fillOpacity="0.14" fontSize="12" fontWeight="300" style={{ letterSpacing: '0.45em' }}>
                CALIFORNIA
              </text>
              <text x="400" y="230" fill="#F7F0E6" fillOpacity="0.14" fontSize="12" fontWeight="300" style={{ letterSpacing: '0.45em' }}>
                NEVADA
              </text>
              <text x="700" y="580" fill="#F7F0E6" fillOpacity="0.14" fontSize="12" fontWeight="300" style={{ letterSpacing: '0.45em' }}>
                ARIZONA
              </text>
              <text x="760" y="330" fill="#F7F0E6" fillOpacity="0.14" fontSize="12" fontWeight="300" style={{ letterSpacing: '0.45em' }}>
                UTAH
              </text>
              {/* compass */}
              <g transform="translate(935 78)" stroke="#F7F0E6" strokeOpacity="0.25">
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
              strokeWidth="6.5"
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
              strokeWidth="1.9"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
            />

            {/* chapter markers (the return to Vegas reuses its dot) */}
            {ROUTE_CHAPTERS.map((s, i) => {
              if (s.revisit) return null
              const revealed = i <= active || (active === ROUTE_CHAPTERS.length - 1 && s.id === 'las-vegas')
              const isActive =
                i === active || (active === ROUTE_CHAPTERS.length - 1 && s.id === 'las-vegas')
              return (
                <g
                  key={s.id}
                  className={clsx('transition-opacity duration-700', revealed ? 'opacity-100' : 'opacity-0')}
                >
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r="10"
                    fill="url(#dot-halo)"
                    className={clsx('transition-opacity duration-500', isActive ? 'opacity-100' : 'opacity-40')}
                  />
                  <circle cx={s.x} cy={s.y} r="3.4" fill="#050812" stroke="#EFC881" strokeWidth="1.3" />
                  <circle cx={s.x} cy={s.y} r="1.3" fill="#EFC881" />
                  <text
                    x={s.x + (s.labelDx ?? 10)}
                    y={s.y + (s.labelDy ?? -8)}
                    fontSize="10.5"
                    fontWeight="500"
                    className="tabular-nums transition-opacity duration-500"
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

        {/* text-safe zone */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-night-950/95 via-night-950/50 to-transparent" />

        {chapter && (
          <div key={chapter.id} className="absolute inset-0">
            {/* the chapter photograph */}
            <div
              data-chapter-photo
              className="invisible absolute left-1/2 top-[max(2.75rem,env(safe-area-inset-top))] w-44 -translate-x-1/2 md:left-auto md:right-[10%] md:top-[16%] md:w-72 md:translate-x-0"
            >
              <PhotoCard
                photoKey={chapter.photoKey}
                index={active % 3}
                alt={chapter.title}
                fallbackLabel={chapter.title}
                fallbackGradient={FALLBACKS[chapter.id]}
              />
            </div>

            {/* the chapter caption */}
            <div
              data-chapter-caption
              className="invisible absolute inset-x-7 bottom-[max(3.25rem,env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-[14%] md:left-16 md:max-w-md"
            >
              <p className="text-[11px] font-medium tabular-nums tracking-[0.18em] text-gold-300/80">
                {chapter.dateLabel} · {String(active + 1).padStart(2, '0')} /{' '}
                {String(ROUTE_CHAPTERS.length).padStart(2, '0')}
              </p>
              <h2 className="mt-2 text-[27px] font-semibold leading-tight tracking-tight md:text-4xl">
                {chapter.title}
              </h2>
              <p className="mt-1.5 text-[17px] font-medium text-gold-300/90 md:text-xl">
                {chapter.headline}
              </p>
              <div className="mt-2 space-y-0.5">
                {chapter.lines.map((line) => (
                  <p key={line} className="text-[13.5px] font-light leading-snug text-mist-400 md:text-base">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </SceneLayout>
  )
}
