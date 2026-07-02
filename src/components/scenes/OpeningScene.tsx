import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'

/**
 * The quiet opening. No destination, no dates, no trip name —
 * only a birthday and a hint that a story is about to unfold.
 * A one-shot CSS animation brings the frame in; the scrubbed timeline
 * never shares targets with it.
 */
export function OpeningScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(
    ref,
    (tl) => {
      tl.to('[data-open-hint]', { autoAlpha: 0, duration: 0.07 }, 0.05)
        .fromTo(
          '[data-open-sub="0"]',
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.11 },
          0.18,
        )
        .fromTo(
          '[data-open-sub="1"]',
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.11 },
          0.38,
        )
        .to('[data-open-content]', { autoAlpha: 0, y: -28, duration: 0.16 }, 0.8)
    },
    {
      onProgress: (p) => useSceneStore.setState({ openingProgress: p }),
    },
  )

  return (
    <SceneLayout ref={ref} id="opening" heightVh={260}>
      <div className="intro-enter relative flex h-full items-center px-7 md:px-0">
        <div data-open-content className="mx-auto w-full max-w-[22rem] pb-[5svh] md:max-w-xl">
          <p className="kicker">For you, Klusia.</p>

          <h1 className="mt-5 text-[38px] font-semibold leading-[1.14] tracking-tight md:text-6xl">
            Happy birthday, my&nbsp;love.
          </h1>

          <p
            data-open-sub="0"
            className="invisible mt-7 text-[17px] font-light leading-relaxed text-ivory-50/85 md:text-xl"
          >
            I made you something small.
          </p>
          <p
            data-open-sub="1"
            className="invisible mt-2 text-[17px] font-light leading-relaxed text-ivory-50/85 md:text-xl"
          >
            A little story about where we have been… and where we are going next.
          </p>
        </div>

        <div
          data-open-hint
          className="absolute bottom-[max(2.25rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          <span className="kicker">Scroll</span>
          <span className="block h-10 w-px animate-pulse bg-ivory-50/40" />
        </div>
      </div>
    </SceneLayout>
  )
}
