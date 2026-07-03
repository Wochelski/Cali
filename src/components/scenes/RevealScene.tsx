import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { REVEAL, FLIGHTS } from '../../data/trips'

/**
 * The reveal — earned after the memories and the new line on the globe.
 * A travel-film title card: the name of the trip, the dates, and the
 * two flights that hold the whole story.
 */
export function RevealScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(ref, (tl) => {
    tl.fromTo('[data-reveal-kicker]', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.1)
      .set('[data-reveal-title]', { autoAlpha: 1 }, 0.17)
      .fromTo(
        '[data-reveal-word]',
        { yPercent: 115 },
        { yPercent: 0, duration: 0.11, stagger: 0.016, ease: 'power2.out' },
        0.18,
      )
      .fromTo('[data-reveal-dates]', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.09 }, 0.36)
      .fromTo('[data-reveal-sub]', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.46)
      .fromTo(
        '[data-reveal-flight]',
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.1, stagger: 0.06 },
        0.58,
      )
      .to('[data-reveal-content]', { autoAlpha: 0, y: -26, duration: 0.13 }, 0.86)
  })

  return (
    <SceneLayout ref={ref} id="reveal" heightVh={300}>
      {/* warm dawn behind the title card */}
      <div className="absolute inset-0 bg-gradient-to-b from-night-950 via-night-800/70 to-[#2a1a12]" />
      <div className="light-leak" aria-hidden="true" />

      <div className="relative flex h-full items-center px-7 md:px-0">
        <div data-reveal-content className="mx-auto w-full max-w-[22rem] md:max-w-3xl">
          <p data-reveal-kicker className="kicker invisible">
            {REVEAL.eyebrow}
          </p>

          <h2 data-reveal-title className="invisible mt-4">
            <span className="flex flex-wrap gap-x-2.5 text-[34px] font-semibold leading-[1.06] tracking-tight md:gap-x-4 md:text-6xl">
              {REVEAL.title.split(' ').map((word, i) => (
                <span key={`${word}${i}`} className="-mb-2 inline-block overflow-hidden pb-2">
                  <span data-reveal-word className="inline-block">
                    {word}
                  </span>
                </span>
              ))}
            </span>
            <span className="mt-1 flex flex-wrap gap-x-2.5 text-[34px] font-semibold leading-[1.06] tracking-tight text-gold-300 md:gap-x-4 md:text-6xl">
              {REVEAL.titleYear.split(' ').map((word, i) => (
                <span key={`${word}${i}`} className="-mb-2 inline-block overflow-hidden pb-2">
                  <span data-reveal-word className="inline-block">
                    {word}
                  </span>
                </span>
              ))}
            </span>
          </h2>

          <p data-reveal-dates className="kicker invisible mt-6">
            {REVEAL.dates}
          </p>

          <p
            data-reveal-sub
            className="invisible mt-5 max-w-md text-[16px] font-light leading-relaxed text-mist-400 md:max-w-xl md:text-lg"
          >
            {REVEAL.subtitle}
          </p>

          <div className="mt-9 grid grid-cols-1 gap-5 border-t border-ivory-50/10 pt-6 sm:grid-cols-2">
            {FLIGHTS.map((flight) => (
              <div data-reveal-flight key={flight.date} className="invisible">
                <p className="text-[12px] font-medium tabular-nums tracking-[0.14em] text-gold-300/85">
                  {flight.date}
                </p>
                <p className="mt-1 text-[17px] font-light md:text-xl">
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
