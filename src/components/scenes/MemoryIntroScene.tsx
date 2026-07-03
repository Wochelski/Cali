import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'
import { MEMORY_TITLE } from '../../data/trips'

/**
 * The chapter title of the past — the globe surfaces from the dark
 * behind it, and a small dashed flight line sketches itself under the
 * words, like a note in a travel journal.
 */
export function MemoryIntroScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(
    ref,
    (tl) => {
      tl.fromTo(
        '[data-memintro-title]',
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.16 },
        0.08,
      )
        .fromTo(
          '[data-memintro-arc]',
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.28 },
          0.18,
        )
        .to('[data-memintro-title]', { autoAlpha: 0, y: -24, duration: 0.16 }, 0.8)
    },
    {
      onProgress: (p) => useSceneStore.setState({ memIntroProgress: p }),
    },
  )

  return (
    <SceneLayout ref={ref} id="memintro" heightVh={180}>
      <div className="relative flex h-full items-end px-7 pb-[20svh] md:items-center md:justify-center md:pb-0">
        <div data-memintro-title className="invisible md:text-center">
          <p className="kicker">Where it all started</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            {MEMORY_TITLE}
          </h2>
          {/* a little dashed flight, journal-style */}
          <svg className="mt-5 h-7 w-28 md:mx-auto" viewBox="0 0 112 28" aria-hidden="true">
            <path
              data-memintro-arc
              d="M 4 24 Q 56 -8 100 14"
              fill="none"
              stroke="#EFC881"
              strokeOpacity="0.7"
              strokeWidth="1.3"
              pathLength={1}
              strokeDasharray="0.06 0.045"
              strokeDashoffset="1"
            />
            <path d="M 100 14 l -7 -1.5 M 100 14 l -5 5" stroke="#EFC881" strokeOpacity="0.7" strokeWidth="1.3" fill="none" />
          </svg>
        </div>
      </div>
    </SceneLayout>
  )
}
