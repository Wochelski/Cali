import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { FLIGHTS } from '../../data/trips'

const TITLE_WORDS = ['California', 'Road', 'Trip', '2026']

/**
 * The earned reveal — it only arrives after the memories and the route.
 * Title rises through word masks; the flight details appear here for
 * the first time anywhere on the page.
 */
export function RevealScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(ref, (tl) => {
    tl.fromTo(
      '[data-reveal-kicker]',
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.08 },
      0.12,
    )
      .set('[data-reveal-title]', { autoAlpha: 1 }, 0.19)
      .fromTo(
        '[data-reveal-word]',
        { yPercent: 115 },
        { yPercent: 0, duration: 0.11, stagger: 0.022, ease: 'power2.out' },
        0.2,
      )
      .fromTo('[data-reveal-sub]', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.4)
      .fromTo(
        '[data-reveal-flight]',
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.1, stagger: 0.06 },
        0.54,
      )
      .to('[data-reveal-content]', { autoAlpha: 0, y: -26, duration: 0.13 }, 0.86)
  })

  return (
    <SceneLayout ref={ref} id="reveal" heightVh={300}>
      <div className="flex h-full items-center px-7 md:px-0">
        <div data-reveal-content className="mx-auto w-full max-w-[22rem] md:max-w-3xl">
          <p data-reveal-kicker className="kicker invisible">
            The next chapter
          </p>

          <h2
            data-reveal-title
            className="invisible mt-4 flex flex-wrap gap-x-3 text-[42px] font-semibold leading-[1.02] tracking-tight md:gap-x-4 md:text-7xl"
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
            Ocean roads, Big Sur cliffs, redwood shadows, desert light, and Vegas after dark.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 border-t border-ivory-50/10 pt-7 sm:grid-cols-2">
            {FLIGHTS.map((flight) => (
              <div data-reveal-flight key={flight.date} className="invisible">
                <p className="text-[13px] font-medium tabular-nums tracking-[0.14em] text-gold-300/85">
                  {flight.date}
                </p>
                <p className="mt-1.5 text-[17px] font-light md:text-xl">
                  {flight.from} <span className="text-gold-300">→</span> {flight.to}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SceneLayout>
  )
}
