import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'

const STANZAS: [string, string][] = [
  ['It started as dots on a map.', 'Now it becomes a road we will remember for years.'],
  ['The most beautiful part will not be the places.', 'It will be seeing them together.'],
]

/**
 * A short breath between the title and the chapters — the globe keeps
 * drawing closer behind the words, so the scroll never feels empty.
 */
export function TransitionScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(
    ref,
    (tl) => {
      const slots = [
        { in: 0.06, out: 0.42 },
        { in: 0.52, out: 0.9 },
      ]
      slots.forEach((slot, i) => {
        tl.fromTo(
          `[data-transition-stanza="${i}"]`,
          { autoAlpha: 0, y: 24, filter: 'blur(8px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.13 },
          slot.in,
        ).to(
          `[data-transition-stanza="${i}"]`,
          { autoAlpha: 0, y: -22, filter: 'blur(8px)', duration: 0.13 },
          slot.out,
        )
      })
    },
    {
      onProgress: (p) => useSceneStore.setState({ transitionProgress: p }),
    },
  )

  return (
    <SceneLayout ref={ref} id="transition" heightVh={200}>
      <div className="relative flex h-full items-end px-7 pb-[18svh] md:items-center md:justify-center md:px-6 md:pb-0">
        {STANZAS.map((stanza, i) => (
          <div
            key={stanza[0]}
            data-transition-stanza={i}
            className="invisible absolute inset-x-7 bottom-[18svh] md:static md:max-w-xl md:text-center"
          >
            <p className="text-[21px] font-light leading-snug text-ivory-50/95 md:text-3xl">
              {stanza[0]}
            </p>
            <p className="mt-2.5 text-[21px] font-light leading-snug text-ivory-50/95 md:text-3xl">
              {stanza[1]}
            </p>
          </div>
        ))}
      </div>
    </SceneLayout>
  )
}
