import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'

const LINES = [
  'Some places become more than places.',
  'They turn into little marks on the map that only we understand.',
]

/**
 * A short breath before the memories — the globe slowly surfaces
 * from the dark behind these two lines.
 */
export function MemoryIntroScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(
    ref,
    (tl) => {
      const slots = [
        { in: 0.06, out: 0.4 },
        { in: 0.5, out: 0.88 },
      ]
      slots.forEach((slot, i) => {
        tl.fromTo(
          `[data-memintro-line="${i}"]`,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.14 },
          slot.in,
        ).to(
          `[data-memintro-line="${i}"]`,
          { autoAlpha: 0, y: -22, duration: 0.14 },
          slot.out,
        )
      })
    },
    {
      onProgress: (p) => useSceneStore.setState({ memIntroProgress: p }),
    },
  )

  return (
    <SceneLayout ref={ref} id="memintro" heightVh={220}>
      <div className="relative flex h-full items-end px-7 pb-[18svh] md:items-center md:justify-center md:px-6 md:pb-0">
        {LINES.map((line, i) => (
          <p
            key={line}
            data-memintro-line={i}
            className="invisible absolute inset-x-7 bottom-[18svh] text-[21px] font-light leading-snug text-ivory-50/95 md:static md:max-w-xl md:text-center md:text-3xl"
          >
            {line}
          </p>
        ))}
      </div>
    </SceneLayout>
  )
}
