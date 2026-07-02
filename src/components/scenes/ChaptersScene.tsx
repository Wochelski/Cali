import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'
import { CHAPTERS } from '../../data/trips'
import { activeChapter, SLICE_LEAD, SLICE_TAIL } from '../../utils/animation'

const N = CHAPTERS.length

/** progress points where the journey rests at each chapter */
const SNAP_POINTS = CHAPTERS.map((_, i) => SLICE_LEAD + (i / (N - 1)) * (SLICE_TAIL - SLICE_LEAD))
const snapToChapter = (value: number) => {
  if (value < 0.04 || value > 0.965) return value
  return SNAP_POINTS.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a))
}

/** abstract mood per chapter — gradients only, no image assets */
const MOODS: Record<string, string> = {
  'los-angeles': 'radial-gradient(90% 42% at 50% 104%, rgb(var(--gold-400) / 0.11), transparent 62%)',
  malibu: 'radial-gradient(95% 46% at 32% 104%, rgb(var(--pacific-400) / 0.13), transparent 62%)',
  'big-sur': 'radial-gradient(105% 50% at 55% 106%, rgb(var(--pacific-500) / 0.16), transparent 64%)',
  redwoods: 'radial-gradient(105% 58% at 50% 108%, rgb(var(--redwood-900) / 0.85), transparent 66%)',
  yosemite: 'radial-gradient(85% 38% at 50% -6%, rgb(var(--ivory-100) / 0.07), transparent 60%)',
  'death-valley': 'radial-gradient(95% 46% at 50% 104%, rgb(var(--blush-300) / 0.13), transparent 62%)',
  'las-vegas':
    'radial-gradient(70% 36% at 50% 104%, rgb(var(--neon-400) / 0.13), transparent 58%), radial-gradient(45% 22% at 65% 108%, rgb(var(--blush-400) / 0.1), transparent 55%)',
  'new-york': 'radial-gradient(85% 42% at 50% 106%, rgb(var(--mist-400) / 0.11), transparent 62%)',
  boston: 'radial-gradient(90% 42% at 50% 104%, rgb(var(--gold-400) / 0.09), transparent 64%)',
}

/**
 * Nine chapters on the globe. The canvas behind reads chapterProgress
 * and travels the route; here live the mood layers, the soft snap and
 * one chapter caption at a time — always in the text-safe bottom zone.
 */
export function ChaptersScene() {
  const ref = useRef<HTMLElement>(null)
  const active = useSceneStore((s) => activeChapter(s.chapterProgress))
  const chapter = active >= 0 ? CHAPTERS[active] : null

  useSceneTimeline(ref, () => {}, {
    onProgress: (p) => useSceneStore.setState({ chapterProgress: p }),
    snapTo: snapToChapter,
  })

  // caption entrance on every chapter change
  useGSAP(
    () => {
      if (!chapter) return
      gsap.fromTo(
        '[data-chapter-caption]',
        { autoAlpha: 0, y: 16, filter: 'blur(6px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' },
      )
    },
    { scope: ref, dependencies: [active] },
  )

  return (
    <SceneLayout ref={ref} id="chapters" heightVh={720}>
      <div className="relative h-full">
        {/* abstract chapter moods — only opacity animates */}
        {CHAPTERS.map((c, i) => (
          <div
            key={c.id}
            aria-hidden="true"
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === active ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ background: MOODS[c.id] }}
          />
        ))}

        {chapter && (
          <div
            key={chapter.id}
            data-chapter-caption
            className="invisible absolute inset-x-7 bottom-[max(4.5rem,env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-auto md:left-16 md:top-1/2 md:max-w-md md:-translate-y-1/2"
          >
            <p className="text-[11px] font-medium tabular-nums tracking-[0.2em] text-gold-300/80">
              {String(active + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
            </p>
            <h2 className="mt-3 font-display text-[38px] font-medium leading-tight tracking-tight md:text-6xl">
              {chapter.name}
            </h2>
            <p className="mt-3 max-w-[20rem] text-[16px] font-light leading-relaxed text-mist-400 md:max-w-md md:text-lg">
              {chapter.line}
            </p>
          </div>
        )}
      </div>
    </SceneLayout>
  )
}
