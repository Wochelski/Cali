import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'
import { MEMORY_TITLE } from '../../data/trips'

/**
 * The chapter title of the past — the globe surfaces from the dark
 * behind it while the words hold, then everything hands over to the
 * memories themselves.
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
        0.1,
      ).to('[data-memintro-title]', { autoAlpha: 0, y: -24, duration: 0.16 }, 0.72)
    },
    {
      onProgress: (p) => useSceneStore.setState({ memIntroProgress: p }),
    },
  )

  return (
    <SceneLayout ref={ref} id="memintro" heightVh={210}>
      <div className="relative flex h-full items-end px-7 pb-[20svh] md:items-center md:justify-center md:pb-0">
        <div data-memintro-title className="invisible md:text-center">
          <p className="kicker">Where it all started</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            {MEMORY_TITLE}
          </h2>
        </div>
      </div>
    </SceneLayout>
  )
}
