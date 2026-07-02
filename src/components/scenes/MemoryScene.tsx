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
 * Scena globusa: sam obraz żyje na stałym canvasie (GlobeScene czyta
 * memoryProgress ze store'u) — tutaj jest tylko dystans scrolla,
 * miękki snap do kolejnych miejsc i minimalny podpis: numer, nazwa, metka.
 */
export function MemoryScene() {
  const ref = useRef<HTMLElement>(null)
  const active = useSceneStore((s) => activeDestinationIndex(s.memoryProgress, N))
  const destination = active >= 0 ? DESTINATIONS[active] : null

  useSceneTimeline(
    ref,
    (tl) => {
      tl.fromTo(
        '[data-memory-kicker]',
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.05 },
        0.02,
      ).to('[data-memory-kicker]', { autoAlpha: 0, y: -10, duration: 0.05 }, 0.93)
    },
    {
      onProgress: (p) => useSceneStore.setState({ memoryProgress: p }),
      snapTo: snapToDestination,
    },
  )

  // wejście podpisu przy każdej zmianie aktywnego miejsca
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
    <SceneLayout ref={ref} id="memory" heightVh={430}>
      <div className="relative h-full">
        <p
          data-memory-kicker
          className="kicker invisible absolute left-1/2 top-14 -translate-x-1/2 md:top-16"
        >
          dziewięć miejsc
        </p>

        {destination && (
          <div
            key={destination.id}
            data-memory-label
            className="invisible absolute inset-x-6 bottom-16 pb-[env(safe-area-inset-bottom)] text-center md:inset-x-auto md:bottom-auto md:left-16 md:top-1/2 md:-translate-y-1/2 md:pb-0 md:text-left"
          >
            <p className="text-xs font-medium tabular-nums tracking-[0.25em] text-sand-300/70">
              {String(active + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
              {destination.name}
            </h2>
            <p className="kicker mt-3">{destination.meta}</p>
          </div>
        )}
      </div>
    </SceneLayout>
  )
}
