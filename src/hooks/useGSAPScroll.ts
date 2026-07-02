import type { RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useSceneStore } from '../store'

gsap.registerPlugin(ScrollTrigger, useGSAP)

type SnapTarget = number[] | ((value: number) => number)

interface SceneTimelineOptions {
  /** scrub przekazywany do ScrollTriggera (domyślnie łagodne 0.6 s) */
  scrub?: boolean | number
  /** postęp sekcji 0–1 przy każdym scrollu (do zapisu w store) */
  onProgress?: (progress: number) => void
  /** miękki snap do punktów postępu (pomijany w trybie spokojnym) */
  snapTo?: SnapTarget
  dependencies?: unknown[]
}

/**
 * Timeline przypięty do całej wysokości sekcji-sceny:
 * start gdy sekcja dotyka góry okna, koniec gdy jej dół dociera do dołu okna.
 * Sticky wnętrze sekcji robi "pin" bez pin-spacerów ScrollTriggera,
 * więc Lenis i przeliczanie layoutu zostają trywialne.
 *
 * Czas timeline'a jest dopełniany do 1, dzięki czemu parametry pozycji
 * tweenów są dokładnie ułamkami postępu scrolla sekcji.
 */
export function useSceneTimeline(
  sectionRef: RefObject<HTMLElement | null>,
  build: (tl: gsap.core.Timeline) => void,
  { scrub = 0.6, onProgress, snapTo, dependencies = [] }: SceneTimelineOptions = {},
) {
  const calm = useSceneStore((s) => s.calm)

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub,
          invalidateOnRefresh: true,
          onUpdate: onProgress ? (self) => onProgress(self.progress) : undefined,
          snap:
            snapTo && !calm
              ? {
                  snapTo,
                  duration: { min: 0.25, max: 0.7 },
                  delay: 0.12,
                  ease: 'power2.out',
                }
              : undefined,
        },
      })
      build(tl)
      // dopełnienie: pozycje tweenów == postęp scrolla
      if (tl.duration() < 1) tl.set({}, {}, 1)
    },
    { scope: sectionRef, dependencies: [...dependencies, calm], revertOnUpdate: true },
  )
}
