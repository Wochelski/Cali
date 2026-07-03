import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import clsx from 'clsx'
import { SceneLayout } from './SceneLayout'
import { PhotoCard } from './PhotoCard'
import { useSceneTimeline } from '../hooks/useGSAPScroll'
import { ROUTE_CHAPTERS, MAP_VIEWBOX } from '../data/trips'
import { clamp01, remap01 } from '../utils/animation'

/** portion of scene progress where the route unfolds */
const DRAW_START = 0.05
const DRAW_END = 0.88
const N = ROUTE_CHAPTERS.length

/** every chapter gets an EQUAL share of scroll — the line speeds up on
 *  long desert legs and lingers on short ones, so the story never
 *  rushes past a stop or jumps ahead */
const chapterPosition = (i: number) => DRAW_START + (i / (N - 1)) * (DRAW_END - DRAW_START)
const SNAP_POINTS = ROUTE_CHAPTERS.map((_, i) => chapterPosition(i))

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

/** state border hints: CA/NV diagonal, the Colorado, UT/AZ lines */
const BORDERS = [
  'M 278 67 L 278 267 L 578 533 C 573 548 583 560 575 574 C 562 588 556 602 548 618',
  'M 611 0 L 611 400',
  'M 611 400 L 1000 400',
  'M 0 67 L 611 67',
]

/** the Colorado carving toward the Grand Canyon */
const RIVER = 'M 748 412 C 730 428 716 438 702 456 C 686 472 664 468 648 480 C 636 488 624 486 614 492'

/** outbound road: LA → Malibu → Yosemite → Lone Pine → Death Valley →
 *  Vegas → Grand Canyon → Monument Valley → Page → Antelope */
const MAIN_PATH =
  'M 375 597 C 365 594 355 595 346 598 C 356 600 368 594 373 586 ' +
  'C 345 512 318 424 301 350 C 311 341 323 332 333 333 C 350 355 375 392 386 427 ' +
  'C 405 434 430 430 452 436 C 485 445 520 448 548 455 C 600 480 660 487 715 463 ' +
  'C 760 445 800 420 827 401 C 805 395 775 398 752 406 C 757 412 763 418 771 424'

/** the last road back to Vegas — drawn dashed, like a note on the atlas */
const RETURN_PATH = 'M 771 424 C 700 452 620 470 548 455'

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
/** two little palms by the coast highway */
const PALMS = [
  'M 352 634 q 3 -12 2 -22 M 354 611 q -8 -6 -14 -2 M 354 611 q -10 1 -15 7 M 354 611 q 8 -6 14 -2 M 354 611 q 10 1 15 7',
  'M 402 646 q 2 -9 1.5 -17 M 403 628 q -6 -5 -11 -2 M 403 628 q -8 1 -12 5 M 403 628 q 6 -5 11 -2 M 403 628 q 8 1 12 5',
]

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
 * The American West as a page of an old road atlas. Every chapter owns
 * an equal slice of scroll; the golden line draws leg by leg to arrive
 * exactly when its chapter does, the camera follows, and the last road
 * back to Vegas is a quiet dashed line.
 */
const smoothstep = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function WestMap() {
  const ref = useRef<HTMLElement>(null)
  const routeRef = useRef<SVGPathElement>(null)
  const glowRef = useRef<SVGPathElement>(null)
  const returnRef = useRef<SVGPathElement>(null)
  const cameraRef = useRef<SVGGElement>(null)
  /** single source of truth for the scrubbed journey: t=0 at LA, t=1
   *  when the dashed road home completes; over=1 at the final pull-back */
  const driveState = useRef({ t: 0, over: 0 })
  const appliedRef = useRef({ fx: 0, fy: 0, s: 0, main: -1, ret: -1 })
  const thresholdsRef = useRef<number[]>([])
  const lastActiveRef = useRef(-1)
  const [active, setActive] = useState(-1)

  // fraction of the outbound road at every stop (sequential search —
  // the road passes near several points twice)
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
    // the last chapter lives on the dashed return road, not this path
    thresholdsRef.current = ROUTE_CHAPTERS.slice(0, -1).map((stop) => {
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

  const snapToStop = (value: number) => {
    if (value < 0.04 || value > 0.91) return value
    return SNAP_POINTS.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a))
  }

  useSceneTimeline(
    ref,
    (tl) => {
      const drive = driveState.current
      drive.t = 0
      drive.over = 0

      /**
       * Everything on the map derives deterministically from drive.t —
       * ONE scrubbed tween, no chained same-property tweens whose lazy
       * start-value capture corrupts under snap jumps (that was the bug:
       * the dash went straight from hidden to fully drawn).
       */
      const applyJourney = () => {
        const applied = appliedRef.current
        const slice = drive.t * (N - 1)
        const i = Math.min(N - 2, Math.floor(slice))
        const f = clamp01(slice - i)
        const thresholds = thresholdsRef.current

        // route fraction: chapter i sits at thresholds[i] of the outbound
        // road; the last segment (i = N-2) is the dashed road home
        const th = (k: number) => thresholds[k] ?? k / (N - 2)
        let mainFrac: number
        let returnFrac: number
        if (i < N - 2) {
          mainFrac = lerp(th(i), th(i + 1), f)
          returnFrac = 0
        } else {
          mainFrac = 1
          returnFrac = f
        }

        // camera rests briefly at every stop, travels between them
        const travel = smoothstep(clamp01((f - 0.18) / 0.64))
        const a = ROUTE_CHAPTERS[i]
        const b = ROUTE_CHAPTERS[Math.min(N - 1, i + 1)]
        let fx = lerp(a.x, b.x, travel)
        let fy = lerp(a.y, b.y, travel)
        let s = CLOSE_UP
        // the closing frame: pull back over the whole loop
        fx = lerp(fx, 560, drive.over)
        fy = lerp(fy, 480, drive.over)
        s = lerp(s, 1.05, drive.over)

        if (
          Math.abs(applied.fx - fx) > 0.05 ||
          Math.abs(applied.fy - fy) > 0.05 ||
          Math.abs(applied.s - s) > 0.0005
        ) {
          applied.fx = fx
          applied.fy = fy
          applied.s = s
          cameraRef.current?.setAttribute(
            'transform',
            `translate(${ANCHOR.x} ${ANCHOR.y}) scale(${s}) translate(${-fx} ${-fy})`,
          )
        }
        if (Math.abs(applied.main - mainFrac) > 0.0005) {
          applied.main = mainFrac
          const offset = String(1 - mainFrac)
          routeRef.current?.setAttribute('stroke-dashoffset', offset)
          glowRef.current?.setAttribute('stroke-dashoffset', offset)
        }
        if (Math.abs(applied.ret - returnFrac) > 0.0005) {
          applied.ret = returnFrac
          returnRef.current?.setAttribute('stroke-dashoffset', String(1 - returnFrac))
        }
      }
      applyJourney()
      tl.eventCallback('onUpdate', applyJourney)

      tl.fromTo('[data-map-stage]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.004)
        .fromTo('[data-map-coast]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.07 }, 0.012)
        .fromTo('[data-map-decor]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.045)
        // the whole journey: LA → ... → Antelope → the road home
        .fromTo(drive, { t: 0 }, { t: 1, duration: DRAW_END - DRAW_START }, DRAW_START)
        .fromTo(drive, { over: 0 }, { over: 1, duration: 0.07, ease: 'power1.inOut' }, 0.92)
    },
    {
      snapTo: snapToStop,
      onProgress: (p) => {
        // even mapping: chapter i owns [pos(i), pos(i+1))
        const slice = remap01(p, DRAW_START, DRAW_END) * (N - 1)
        const idx = p < DRAW_START ? -1 : Math.min(N - 1, Math.floor(slice + 0.02))
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
    <SceneLayout ref={ref} id="westmap" heightVh={880}>
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
            <radialGradient id="neon-halo" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#FFB86B" stopOpacity="0.6" />
              <stop offset="0.6" stopColor="#FFB86B" stopOpacity="0.22" />
              <stop offset="1" stopColor="#FFB86B" stopOpacity="0" />
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
              strokeWidth="1.1"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
            />

            <g data-map-decor className="invisible">
              {BORDERS.map((d) => (
                <path key={d} d={d} fill="none" stroke="#F7F0E6" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="4 8" />
              ))}
              <path d={RIVER} fill="none" stroke="#C96F4A" strokeOpacity="0.35" strokeWidth="1.2" />
              {CONTOURS.map((d) => (
                <path key={d} d={d} fill="none" stroke="#F7F0E6" strokeOpacity="0.06" strokeWidth="1" />
              ))}
              {WAVES.map((d) => (
                <path key={d} d={d} fill="none" stroke="#BDAF9F" strokeOpacity="0.18" strokeWidth="1" />
              ))}
              {PINES.map(({ x, y }) => (
                <path key={`${x}${y}`} d={`M ${x} ${y} l 4.5 9 h -9 z`} fill="none" stroke="#BDAF9F" strokeOpacity="0.2" strokeWidth="1" />
              ))}
              {DUNES.map((d) => (
                <path key={d} d={d} fill="none" stroke="#BDAF9F" strokeOpacity="0.16" strokeWidth="1" />
              ))}
              {MESAS.map((d) => (
                <path key={d} d={d} fill="none" stroke="#C96F4A" strokeOpacity="0.35" strokeWidth="1" />
              ))}
              {PALMS.map((d) => (
                <path key={d} d={d} fill="none" stroke="#BDAF9F" strokeOpacity="0.28" strokeWidth="1" strokeLinecap="round" />
              ))}
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
              <g transform="translate(935 78)" stroke="#F7F0E6" strokeOpacity="0.25">
                <line x1="0" y1="14" x2="0" y2="-14" strokeWidth="1" />
                <path d="M -4 -6 L 0 -14 L 4 -6" fill="none" strokeWidth="1" />
                <text y="32" textAnchor="middle" fill="#F7F0E6" fillOpacity="0.25" fontSize="11" stroke="none">
                  N
                </text>
              </g>
            </g>

            {/* outbound road: glow + line (dash written directly from drive.t) */}
            <path
              ref={glowRef}
              d={MAIN_PATH}
              fill="none"
              stroke="#E6B66A"
              strokeOpacity="0.13"
              strokeWidth="6"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
            />
            <path
              ref={routeRef}
              d={MAIN_PATH}
              fill="none"
              stroke="#E6B66A"
              strokeWidth="1.8"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
            />
            {/* the dashed road home */}
            <path
              ref={returnRef}
              d={RETURN_PATH}
              fill="none"
              stroke="#EFC881"
              strokeOpacity="0.55"
              strokeWidth="1.3"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray="0.028 0.018"
              strokeDashoffset="1"
            />

            {/* chapter markers (the return to Vegas reuses its dot) */}
            {ROUTE_CHAPTERS.map((s, i) => {
              if (s.revisit) return null
              const vegasReturn = active === N - 1 && s.id === 'las-vegas'
              const revealed = i <= active || vegasReturn
              const isActive = i === active || vegasReturn
              const neon = s.id === 'las-vegas' && isActive
              return (
                <g key={s.id} className={clsx('transition-opacity duration-700', revealed ? 'opacity-100' : 'opacity-0')}>
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r="10"
                    fill={neon ? 'url(#neon-halo)' : 'url(#dot-halo)'}
                    className={clsx(
                      'transition-opacity duration-500',
                      isActive ? 'opacity-100' : 'opacity-40',
                      neon && 'neon-flicker',
                    )}
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
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-night-950/95 via-night-950/70 to-transparent" />

        {chapter && (
          <div key={chapter.id} className="absolute inset-0">
            <div
              data-chapter-photo
              className="invisible absolute left-1/2 top-[max(2.75rem,env(safe-area-inset-top))] w-44 -translate-x-1/2 md:left-auto md:right-[10%] md:top-[16%] md:w-72 md:translate-x-0"
            >
              <PhotoCard
                photoKey={chapter.photoKey}
                index={active % 3}
                alt={chapter.title}
                stamp={String(active + 1).padStart(2, '0')}
                fallbackLabel={chapter.title}
                fallbackGradient={FALLBACKS[chapter.id]}
              />
            </div>

            <div
              data-chapter-caption
              className="invisible absolute inset-x-7 bottom-[max(3.25rem,env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-[14%] md:left-16 md:max-w-md"
            >
              <p className="text-[11px] font-medium tabular-nums tracking-[0.18em] text-gold-300/80">
                {chapter.dateLabel} · {String(active + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
              </p>
              <h2 className="mt-2 text-[27px] font-semibold leading-tight tracking-tight md:text-4xl">
                {chapter.title}
              </h2>
              <p className="mt-1.5 text-[17px] font-medium text-gold-300/90 md:text-xl">{chapter.headline}</p>
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
