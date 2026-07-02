import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'
import { MEMORIES } from '../../data/trips'
import { activeMemory, SLICE_LEAD, SLICE_TAIL } from '../../utils/animation'

const N = MEMORIES.length

/** progress points where the journey rests at each remembered place */
const SNAP_POINTS = MEMORIES.map((_, i) => SLICE_LEAD + (i / (N - 1)) * (SLICE_TAIL - SLICE_LEAD))
const snapToMemory = (value: number) => {
  if (value < 0.04 || value > 0.965) return value
  return SNAP_POINTS.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a))
}

/**
 * The shared past on the globe — the original visited order, one place
 * at a time. The canvas behind reads memoryProgress and travels;
 * here live the soft snap and a single caption in the text-safe zone.
 */
export function MemoryGlobeScene() {
  const ref = useRef<HTMLElement>(null)
  const active = useSceneStore((s) => activeMemory(s.memoryProgress))
  const memory = active >= 0 ? MEMORIES[active] : null

  useSceneTimeline(ref, () => {}, {
    onProgress: (p) => useSceneStore.setState({ memoryProgress: p }),
    snapTo: snapToMemory,
  })

  // caption entrance on every change
  useGSAP(
    () => {
      if (!memory) return
      gsap.fromTo(
        '[data-memory-caption]',
        { autoAlpha: 0, y: 16, filter: 'blur(6px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' },
      )
    },
    { scope: ref, dependencies: [active] },
  )

  return (
    <SceneLayout ref={ref} id="memories" heightVh={520}>
      <div className="relative h-full">
        {memory && (
          <div
            key={memory.id}
            data-memory-caption
            className="invisible absolute inset-x-7 bottom-[max(4.5rem,env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-auto md:left-16 md:top-1/2 md:-translate-y-1/2"
          >
            <p className="text-[11px] font-medium tabular-nums tracking-[0.2em] text-gold-300/80">
              {String(active + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
              {memory.label}
            </h2>
          </div>
        )}
      </div>
    </SceneLayout>
  )
}
