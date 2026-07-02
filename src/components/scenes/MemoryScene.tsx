import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'
import { DESTINATIONS } from '../../data/trips'
import { activeDestinationIndex, SLICE_LEAD, SLICE_TAIL } from '../../utils/animation'

const N = DESTINATIONS.length

/** punkty postępu, w których globus "staje" przy kolejnych miejscach */
const SNAP_POINTS = DESTINATIONS.map((_, i) => SLICE_LEAD + (i / (N - 1)) * (SLICE_TAIL - SLICE_LEAD))
const snapToDestination = (value: number) => {
  if (value < 0.05 || value > 0.96) return value
  return SNAP_POINTS.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a))
}

/**
 * Scena globusa: obraz żyje na stałym canvasie (GlobeScene czyta
 * memoryProgress ze store'u) — tutaj tylko dystans scrolla, miękki snap
 * i jedna widoczna etykieta: nazwa kraju.
 */
export function MemoryScene() {
  const ref = useRef<HTMLElement>(null)
  const active = useSceneStore((s) => activeDestinationIndex(s.memoryProgress, N))
  const destination = active >= 0 ? DESTINATIONS[active] : null

  useSceneTimeline(ref, () => {}, {
    onProgress: (p) => useSceneStore.setState({ memoryProgress: p }),
    snapTo: snapToDestination,
  })

  // wejście etykiety przy każdej zmianie aktywnego miejsca
  useGSAP(
    () => {
      if (!destination) return
      gsap.fromTo(
        '[data-memory-label]',
        { autoAlpha: 0, y: 16, filter: 'blur(6px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' },
      )
    },
    { scope: ref, dependencies: [active] },
  )

  return (
    <SceneLayout ref={ref} id="memory" heightVh={400}>
      <div className="relative h-full">
        {destination && (
          <div
            key={destination.id}
            data-memory-label
            className="invisible absolute inset-x-6 bottom-[max(4.5rem,env(safe-area-inset-bottom))] text-center md:inset-x-auto md:bottom-auto md:left-16 md:top-1/2 md:-translate-y-1/2 md:text-left"
          >
            <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
              {destination.label}
            </h2>
            <p className="mt-2.5 text-[11px] font-medium tabular-nums tracking-[0.18em] text-warm-50/35">
              {active + 1} / {N}
            </p>
          </div>
        )}
      </div>
    </SceneLayout>
  )
}
