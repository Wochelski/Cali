import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'
import { DownloadButton } from '../DownloadButton'

/**
 * The closing frame: the globe pulls slowly away with the whole route
 * glowing, a horizon line settles, and the confirmation unlocks.
 */
export function FinalScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(
    ref,
    (tl) => {
      tl.fromTo('[data-final-horizon]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 0.08)
        .fromTo(
          '[data-final-road]',
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.35 },
          0.06,
        )
        .fromTo(
          '[data-final-line="0"]',
          { autoAlpha: 0, y: 24, filter: 'blur(8px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.11 },
          0.18,
        )
        .fromTo(
          '[data-final-line="1"]',
          { autoAlpha: 0, y: 24, filter: 'blur(8px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.11 },
          0.28,
        )
        .fromTo(
          '[data-final-dedication]',
          { autoAlpha: 0, y: 20, filter: 'blur(6px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.11 },
          0.46,
        )
        .fromTo(
          '[data-final-whisper]',
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.1 },
          0.58,
        )
        .fromTo(
          '[data-final-cta]',
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.1 },
          0.7,
        )
    },
    {
      onProgress: (p) => {
        useSceneStore.setState({ finalProgress: p })
        // reaching the ending unlocks the confirmation — and it stays unlocked
        if (p > 0.05 && !useSceneStore.getState().unlocked) {
          useSceneStore.getState().setUnlocked(true)
        }
      },
    },
  )

  return (
    <SceneLayout ref={ref} id="final" heightVh={240}>
      {/* warm horizon under the pulling-away globe */}
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
            className="invisible font-display text-[30px] font-medium leading-snug tracking-tight md:text-5xl"
          >
            A few places behind us.
          </p>
          <p
            data-final-line="1"
            className="invisible mt-1.5 font-display text-[30px] font-medium leading-snug tracking-tight md:text-5xl"
          >
            One greater road ahead.
          </p>

          <p
            data-final-dedication
            className="invisible mt-9 font-display text-2xl font-medium text-gold-300 md:text-3xl"
          >
            For you, Klusia.
          </p>

          <p
            data-final-whisper
            className="invisible mt-3 text-[13px] font-light text-ivory-50/55 md:text-sm"
          >
            And for every next journey we have not imagined yet.
          </p>

          <div data-final-cta className="invisible mt-10">
            <DownloadButton />
          </div>
        </div>
      </div>
    </SceneLayout>
  )
}
