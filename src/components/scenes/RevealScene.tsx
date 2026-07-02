import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'

const TITLE_WORDS = ['California', 'Road', 'Trip', '2026']

/**
 * The reveal: the globe emerges from darkness behind this scene
 * (GlobeScene reads revealProgress) and the title rises like a
 * travel-film opening. Text sits low in the frame, clear of the globe.
 */
export function RevealScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(
    ref,
    (tl) => {
      tl.fromTo(
        '[data-reveal-kicker]',
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.08 },
        0.2,
      )
        .set('[data-reveal-title]', { autoAlpha: 1 }, 0.27)
        .fromTo(
          '[data-reveal-word]',
          { yPercent: 115 },
          { yPercent: 0, duration: 0.11, stagger: 0.022, ease: 'power2.out' },
          0.28,
        )
        .fromTo(
          '[data-reveal-sub]',
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.1 },
          0.48,
        )
        .to('[data-reveal-content]', { autoAlpha: 0, y: -26, duration: 0.13 }, 0.84)
    },
    {
      onProgress: (p) => useSceneStore.setState({ revealProgress: p }),
    },
  )

  return (
    <SceneLayout ref={ref} id="reveal" heightVh={230}>
      <div className="flex h-full items-end px-7 pb-[16svh] md:items-center md:px-0 md:pb-0">
        <div data-reveal-content className="mx-auto w-full max-w-[22rem] md:max-w-3xl">
          <p data-reveal-kicker className="kicker invisible">
            The next chapter
          </p>

          <h2
            data-reveal-title
            className="invisible mt-4 flex flex-wrap gap-x-3 font-display text-[42px] font-medium leading-none tracking-tight md:gap-x-5 md:text-7xl"
          >
            {TITLE_WORDS.map((word) => (
              <span key={word} className="-mb-2 inline-block overflow-hidden pb-2">
                <span data-reveal-word className="inline-block">
                  {word}
                </span>
              </span>
            ))}
          </h2>

          <p
            data-reveal-sub
            className="invisible mt-6 max-w-md text-[16px] font-light leading-relaxed text-mist-400 md:max-w-xl md:text-lg"
          >
            Pacific coastlines, Big Sur cliffs, redwoods, desert light, and Vegas after dark.
          </p>
        </div>
      </div>
    </SceneLayout>
  )
}
