import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'
import { HOME } from '../../data/trips'

/**
 * Otwarcie w dwóch taktach: współrzędne startu, potem jedno krótkie
 * zdanie zapowiedzi. Wejście robi animacja CSS na wrapperze (jednorazowa),
 * scroll steruje wyłącznie elementami wewnętrznymi.
 */
export function IntroScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(
    ref,
    (tl) => {
      tl.to('[data-intro-hint]', { autoAlpha: 0, duration: 0.06 }, 0.03)
        // takt 1 → odpływa
        .to(
          '[data-intro-core]',
          { autoAlpha: 0, scale: 1.08, y: -24, filter: 'blur(10px)', duration: 0.16 },
          0.16,
        )
        // takt 2: zapowiedź
        .fromTo(
          '[data-intro-story]',
          { autoAlpha: 0, y: 26, filter: 'blur(8px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.14 },
          0.4,
        )
        .to(
          '[data-intro-story]',
          { autoAlpha: 0, y: -26, filter: 'blur(8px)', duration: 0.14 },
          0.8,
        )
    },
    {
      onProgress: (p) => useSceneStore.setState({ introProgress: p }),
    },
  )

  return (
    <SceneLayout ref={ref} id="intro" heightVh={200}>
      <div className="intro-enter relative grid h-full place-items-center px-6">
        <div data-intro-core className="col-start-1 row-start-1 text-center">
          <p className="text-xl font-light tracking-[0.14em] text-warm-50/90 md:text-3xl">
            {HOME.coords}
          </p>
          <span className="mx-auto mt-6 block h-px w-10 bg-copper-400/60" />
          <p className="kicker mt-6">{HOME.city}</p>
        </div>

        <div data-intro-story className="invisible col-start-1 row-start-1 max-w-md text-center">
          <p className="text-[26px] font-light leading-snug text-warm-50/95 md:text-4xl">
            Kilka miejsc za nami.
          </p>
          <p className="mt-3 text-[26px] font-light leading-snug text-warm-50/95 md:text-4xl">
            Jedna większa droga przed nami.
          </p>
        </div>

        <div
          data-intro-hint
          className="absolute bottom-[max(2.5rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          <span className="kicker">przewiń</span>
          <span className="block h-10 w-px animate-pulse bg-warm-50/40" />
        </div>
      </div>
    </SceneLayout>
  )
}
