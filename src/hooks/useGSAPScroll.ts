import type { RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useSceneStore } from '../store'

gsap.registerPlugin(ScrollTrigger, useGSAP)

type SnapTarget = number[] | ((value: number) => number)

interface SceneTimelineOptions {
  /** scrub smoothing in seconds (slow, cinematic default) */
  scrub?: boolean | number
  /** section progress 0–1 on every scroll (written to the store) */
  onProgress?: (progress: number) => void
  /** soft snap to progress points (skipped for prefers-reduced-motion) */
  snapTo?: SnapTarget
  dependencies?: unknown[]
}

/**
 * A timeline pinned to a full scene section: starts when the section
 * touches the top of the viewport, ends when its bottom reaches the
 * bottom. CSS sticky does the pinning — no pin spacers, no layout jumps.
 *
 * The timeline is padded to a duration of exactly 1 so tween position
 * parameters are literal scroll-progress fractions.
 */
export function useSceneTimeline(
  sectionRef: RefObject<HTMLElement | null>,
  build: (tl: gsap.core.Timeline) => void,
  { scrub = 1.15, onProgress, snapTo, dependencies = [] }: SceneTimelineOptions = {},
) {
  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return
      const { reducedMotion } = useSceneStore.getState()

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
            snapTo && !reducedMotion
              ? {
                  snapTo,
                  duration: { min: 0.35, max: 0.9 },
                  delay: 0.15,
                  ease: 'power2.out',
                }
              : undefined,
        },
      })
      build(tl)
      if (tl.duration() < 1) tl.set({}, {}, 1)
    },
    { scope: sectionRef, dependencies, revertOnUpdate: true },
  )
}
