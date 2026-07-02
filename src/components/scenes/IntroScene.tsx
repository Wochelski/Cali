import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'
import { HOME } from '../../data/trips'

/**
 * Otwarcie: prawie żadnego tekstu — współrzędne punktu startu.
 * Wejście robi animacja CSS na wrapperze (jednorazowa), scroll steruje
 * wyłącznie elementami wewnętrznymi — te dwa systemy nie dzielą celów.
 */
export function IntroScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(
    ref,
    (tl) => {
      tl.to('[data-intro-hint]', { autoAlpha: 0, duration: 0.06 }, 0.03)
        .to(
          '[data-intro-core]',
          { autoAlpha: 0, scale: 1.08, y: -24, filter: 'blur(10px)', duration: 0.22 },
          0.2,
        )
    },
    {
      onProgress: (p) => useSceneStore.setState({ introProgress: p }),
    },
  )

  return (
    <SceneLayout ref={ref} id="intro" heightVh={170}>
      <div className="intro-enter relative grid h-full place-items-center px-6">
        <div data-intro-core className="text-center">
          <p className="text-xl font-light tracking-[0.18em] text-warm-50/90 md:text-3xl">
            {HOME.coords}
          </p>
          <span className="mx-auto mt-6 block h-px w-10 bg-copper-400/60" />
          <p className="kicker mt-6">{HOME.city}</p>
        </div>

        <div
          data-intro-hint
          className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 pb-[env(safe-area-inset-bottom)]"
        >
          <span className="kicker">przewiń</span>
          <span className="block h-10 w-px animate-pulse bg-warm-50/40" />
        </div>
      </div>
    </SceneLayout>
  )
}
