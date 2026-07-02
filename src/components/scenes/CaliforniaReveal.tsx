import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'
import { FLIGHTS } from '../../data/trips'

const TITLE_WORDS = ['California', 'Road', 'Trip', '2026']

/**
 * Przejście do nowego rozdziału: krótki takt domykający podróże,
 * potem globus obraca się ku Ameryce, atmosfera ociepla się
 * i wjeżdża tytuł. Na końcu canvas z globusem zostaje wygaszony.
 */
export function CaliforniaReveal() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(
    ref,
    (tl) => {
      const globeRoot = document.getElementById('globe-root')

      tl
        // takt przejścia
        .fromTo(
          '[data-reveal-bridge]',
          { autoAlpha: 0, y: 24, filter: 'blur(8px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.1 },
          0.05,
        )
        .to('[data-reveal-bridge]', { autoAlpha: 0, y: -24, filter: 'blur(8px)', duration: 0.1 }, 0.24)
        // odsłonięcie
        .fromTo(
          '[data-reveal-kicker]',
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.06 },
          0.36,
        )
        .set('[data-reveal-title]', { autoAlpha: 1 }, 0.41)
        .fromTo(
          '[data-reveal-word]',
          { yPercent: 115 },
          { yPercent: 0, duration: 0.1, stagger: 0.02, ease: 'power2.out' },
          0.42,
        )
        .fromTo(
          '[data-reveal-tagline]',
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.08 },
          0.56,
        )
        .fromTo(
          '[data-reveal-flight]',
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.08, stagger: 0.05 },
          0.66,
        )
        .to('[data-reveal-content]', { autoAlpha: 0, y: -30, duration: 0.1 }, 0.89)

      if (globeRoot) tl.to(globeRoot, { autoAlpha: 0, duration: 0.11 }, 0.88)
    },
    {
      onProgress: (p) => useSceneStore.setState({ revealProgress: p }),
    },
  )

  return (
    <SceneLayout ref={ref} id="reveal" heightVh={250}>
      <div className="grid h-full place-items-center px-6">
        <p
          data-reveal-bridge
          className="invisible col-start-1 row-start-1 max-w-md text-center text-[22px] font-light leading-snug text-warm-50/90 md:max-w-xl md:text-3xl"
        >
          Zaczęło się od punktów na mapie. Teraz czas na trasę, której nie da się zamknąć
          w jednym mieście.
        </p>

        <div data-reveal-content className="col-start-1 row-start-1 w-full max-w-4xl text-center md:text-left">
          <p data-reveal-kicker className="kicker invisible">
            następny rozdział
          </p>

          <h2
            data-reveal-title
            className="invisible mt-5 flex flex-wrap justify-center gap-x-3 text-[44px] font-semibold leading-none tracking-tight md:justify-start md:gap-x-5 md:text-7xl"
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
            data-reveal-tagline
            className="invisible mt-6 text-[17px] font-light text-sand-200/90 md:text-xl"
          >
            Ocean, klify, sekwoje, pustynia i światła Vegas.
          </p>

          <div className="mt-10 space-y-4 border-t border-warm-50/10 pt-6 md:mt-12">
            {FLIGHTS.map((flight) => (
              <div
                data-reveal-flight
                key={flight.date}
                className="invisible flex flex-col items-center gap-1 md:flex-row md:items-baseline md:gap-6"
              >
                <span className="text-xs font-medium tabular-nums tracking-[0.18em] text-sand-300/70">
                  {flight.date}
                </span>
                <span className="text-[17px] font-light md:text-xl">
                  {flight.from} <span className="text-copper-300">→</span> {flight.to}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SceneLayout>
  )
}
