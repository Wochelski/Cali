import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'
import { FLIGHTS } from '../../data/trips'

const TITLE_WORDS = ['California', 'Road', 'Trip', '2026']

/**
 * Globus (na stałym canvasie) obraca się w stronę Ameryki Północnej,
 * atmosfera ociepla się, a nad nim wjeżdża tytuł nowego rozdziału.
 * Na końcu sceny canvas z globusem zostaje wygaszony — dalej mapa.
 */
export function CaliforniaReveal() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(
    ref,
    (tl) => {
      const globeRoot = document.getElementById('globe-root')

      tl.fromTo(
        '[data-reveal-kicker]',
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.06 },
        0.3,
      )
        .set('[data-reveal-title]', { autoAlpha: 1 }, 0.36)
        .fromTo(
          '[data-reveal-word]',
          { yPercent: 115 },
          { yPercent: 0, duration: 0.12, stagger: 0.025, ease: 'power2.out' },
          0.37,
        )
        .fromTo(
          '[data-reveal-flight]',
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.1, stagger: 0.06 },
          0.58,
        )
        .to('[data-reveal-content]', { autoAlpha: 0, y: -30, duration: 0.1 }, 0.89)

      if (globeRoot) tl.to(globeRoot, { autoAlpha: 0, duration: 0.11 }, 0.88)
    },
    {
      onProgress: (p) => useSceneStore.setState({ revealProgress: p }),
    },
  )

  return (
    <SceneLayout ref={ref} id="reveal" heightVh={240}>
      <div className="grid h-full place-items-center px-6">
        <div data-reveal-content className="w-full max-w-4xl text-center md:text-left">
          <p data-reveal-kicker className="kicker invisible">
            następny rozdział
          </p>

          <h2
            data-reveal-title
            className="invisible mt-5 flex flex-wrap justify-center gap-x-3 text-5xl font-semibold tracking-tight md:justify-start md:gap-x-6 md:text-7xl lg:text-8xl"
          >
            {TITLE_WORDS.map((word) => (
              <span key={word} className="-mb-2 inline-block overflow-hidden pb-2">
                <span data-reveal-word className="inline-block">
                  {word}
                </span>
              </span>
            ))}
          </h2>

          <div className="mt-12 space-y-4 border-t border-warm-50/10 pt-7 md:mt-14">
            {FLIGHTS.map((flight) => (
              <div
                data-reveal-flight
                key={flight.date}
                className="invisible flex flex-col items-center gap-1 md:flex-row md:items-baseline md:gap-6"
              >
                <span className="text-xs font-medium tabular-nums tracking-[0.25em] text-sand-300/70">
                  {flight.date}
                </span>
                <span className="text-lg font-light md:text-xl">
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
