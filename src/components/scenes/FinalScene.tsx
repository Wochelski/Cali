import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { DownloadButton } from '../DownloadButton'

/**
 * The closing movie frame: completed-route glow on the horizon,
 * warm Pacific gradient, and the confirmation download.
 */
export function FinalScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(ref, (tl) => {
    tl.fromTo('[data-final-horizon]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 0.06)
      .fromTo(
        '[data-final-road]',
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.35 },
        0.05,
      )
      .fromTo(
        '[data-final-line="0"]',
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.12 },
        0.16,
      )
      .fromTo(
        '[data-final-line="1"]',
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.11 },
        0.3,
      )
      .fromTo(
        '[data-final-dedication]',
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.12 },
        0.46,
      )
      .fromTo(
        '[data-final-whisper]',
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.1 },
        0.58,
      )
      .fromTo('[data-final-cta]', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.7)
  })

  return (
    <SceneLayout ref={ref} id="final" heightVh={280}>
      {/* warm Pacific sunset under the closing frame */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#1d1410] via-[#0d1220]/60 to-transparent" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="final-road-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#E6B66A" stopOpacity="0.6" />
            <stop offset="1" stopColor="#E6B66A" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="final-horizon-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#D78C7A" stopOpacity="0" />
            <stop offset="0.5" stopColor="#EFC881" stopOpacity="0.45" />
            <stop offset="1" stopColor="#D78C7A" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="final-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#E6B66A" stopOpacity="0.22" />
            <stop offset="1" stopColor="#E6B66A" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g data-final-horizon className="invisible">
          <ellipse cx="500" cy="452" rx="280" ry="60" fill="url(#final-glow)" />
          <line x1="130" y1="452" x2="870" y2="452" stroke="url(#final-horizon-grad)" strokeWidth="1" />
        </g>

        <path
          data-final-road
          d="M 500 600 C 499 550 501 500 500 454"
          fill="none"
          stroke="url(#final-road-grad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
        />
      </svg>

      <div className="relative flex h-full items-end justify-center px-7 pb-[max(9svh,env(safe-area-inset-bottom))] md:items-center md:pb-0">
        <div className="w-full max-w-md text-center">
          <p
            data-final-line="0"
            className="invisible text-[32px] font-semibold leading-snug tracking-tight md:text-5xl"
          >
            Happy birthday, my love.
          </p>
          <p
            data-final-line="1"
            className="invisible mt-4 text-[18px] font-light leading-relaxed text-ivory-50/90 md:text-2xl"
          >
            In September, we will see California together.
          </p>

          <p data-final-dedication className="invisible mt-8 text-xl font-medium text-gold-300 md:text-2xl">
            For you, Klusia.
          </p>

          <p
            data-final-whisper
            className="invisible mt-2.5 text-[13px] font-light text-ivory-50/55 md:text-sm"
          >
            And this is only the beginning.
          </p>

          <div data-final-cta className="invisible mt-10">
            <DownloadButton />
          </div>
        </div>
      </div>
    </SceneLayout>
  )
}
