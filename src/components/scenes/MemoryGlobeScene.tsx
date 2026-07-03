import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { SceneLayout } from '../SceneLayout'
import { PhotoCard } from '../PhotoCard'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'
import { PAST_TRIPS } from '../../data/trips'
import { activeMemory, SLICE_LEAD, SLICE_TAIL } from '../../utils/animation'

const N = PAST_TRIPS.length

/** progress points where the journey rests at each remembered place */
const SNAP_POINTS = PAST_TRIPS.map((_, i) => SLICE_LEAD + (i / (N - 1)) * (SLICE_TAIL - SLICE_LEAD))
const snapToMemory = (value: number) => {
  if (value < 0.03 || value > 0.97) return value
  return SNAP_POINTS.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a))
}

/**
 * Ten places, in the order they actually happened. The globe travels
 * behind (it reads memoryProgress); here each memory is a photograph
 * pinned over the world and a short line beneath it.
 */
export function MemoryGlobeScene() {
  const ref = useRef<HTMLElement>(null)
  const active = useSceneStore((s) => activeMemory(s.memoryProgress))
  const memory = active >= 0 ? PAST_TRIPS[active] : null

  useSceneTimeline(ref, () => {}, {
    onProgress: (p) => useSceneStore.setState({ memoryProgress: p }),
    snapTo: snapToMemory,
  })

  // photo + caption entrance on every change
  useGSAP(
    () => {
      if (!memory) return
      gsap.fromTo(
        '[data-memory-photo]',
        { autoAlpha: 0, y: 22, rotate: active % 2 === 0 ? -4 : 4 },
        {
          autoAlpha: 1,
          y: 0,
          rotate: active % 2 === 0 ? -2 : 1.5,
          duration: 0.8,
          ease: 'power3.out',
        },
      )
      gsap.fromTo(
        '[data-memory-caption]',
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.7, delay: 0.08, ease: 'power3.out' },
      )
    },
    { scope: ref, dependencies: [active] },
  )

  return (
    <SceneLayout ref={ref} id="memories" heightVh={760}>
      <div className="relative h-full">
        {memory && (
          <div key={memory.id} className="absolute inset-0">
            {/* the photograph — a small print pinned over the world */}
            <div
              data-memory-photo
              className="invisible absolute left-1/2 top-[max(3rem,env(safe-area-inset-top))] w-40 -translate-x-1/2 md:left-auto md:right-[12%] md:top-1/2 md:w-60 md:-translate-y-1/2 md:translate-x-0"
            >
              <PhotoCard
                photoKey={memory.photoKey}
                alt={`Us in ${memory.title}`}
                stamp={String(memory.order).padStart(2, '0')}
                fallbackLabel={memory.title}
              />
            </div>

            {/* the caption — text-safe zone at the bottom */}
            <div
              data-memory-caption
              className="invisible absolute inset-x-7 bottom-[max(4rem,env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-auto md:left-16 md:top-1/2 md:max-w-sm md:-translate-y-1/2"
            >
              <p className="text-[11px] font-medium tabular-nums tracking-[0.2em] text-gold-300/80">
                {String(memory.order).padStart(2, '0')} / {N}
              </p>
              <h2 className="mt-2.5 text-4xl font-semibold tracking-tight md:text-6xl">
                {memory.title}
              </h2>
              <p className="mt-2.5 max-w-[21rem] text-[15px] font-light leading-relaxed text-mist-400 md:max-w-sm md:text-lg">
                {memory.copy}
              </p>
            </div>
          </div>
        )}
      </div>
    </SceneLayout>
  )
}
