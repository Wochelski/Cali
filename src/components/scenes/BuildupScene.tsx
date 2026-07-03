import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'
import { BUILDUP } from '../../data/trips'

/**
 * The build-up: a new line draws itself from home across the Atlantic
 * (on the globe behind, reading pullProgress) while four short beats
 * carry the anticipation. The globe dissolves at the end — the West
 * takes over from here.
 */
export function BuildupScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(
    ref,
    (tl) => {
      const globeRoot = document.getElementById('globe-root')
      const slots = [
        { in: 0.05, out: 0.24 },
        { in: 0.3, out: 0.47 },
        { in: 0.53, out: 0.72 },
        { in: 0.78, out: 0.95 },
      ]
      slots.forEach((slot, i) => {
        tl.fromTo(
          `[data-build-line="${i}"]`,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.12 },
          slot.in,
        ).to(
          `[data-build-line="${i}"]`,
          { autoAlpha: 0, y: -22, duration: 0.12 },
          slot.out,
        )
      })
      if (globeRoot) tl.to(globeRoot, { autoAlpha: 0, duration: 0.16 }, 0.84)
    },
    {
      onProgress: (p) => useSceneStore.setState({ pullProgress: p }),
    },
  )

  return (
    <SceneLayout ref={ref} id="buildup" heightVh={300}>
      <div className="relative flex h-full items-end px-7 pb-[18svh] md:items-center md:justify-center md:pb-0">
        {BUILDUP.map((line, i) => (
          <p
            key={line}
            data-build-line={i}
            className={
              i === 3
                ? 'invisible absolute inset-x-7 bottom-[18svh] text-3xl font-semibold tracking-tight md:static md:max-w-xl md:text-center md:text-5xl'
                : 'invisible absolute inset-x-7 bottom-[18svh] text-[22px] font-light leading-snug text-ivory-50/95 md:static md:max-w-xl md:text-center md:text-3xl'
            }
          >
            {line}
          </p>
        ))}
      </div>
    </SceneLayout>
  )
}
