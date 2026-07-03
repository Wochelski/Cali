import { create } from 'zustand'
import type Lenis from 'lenis'

/**
 * Shared scene state. The *Progress values are written by ScrollTriggers
 * (DOM) and read inside useFrame (R3F) via getState() — no re-renders.
 */
interface SceneState {
  isMobile: boolean
  /** honored silently — there is intentionally no motion-settings UI */
  reducedMotion: boolean

  /** globe emerges under the "map of memories" title */
  memIntroProgress: number
  /** the journey through the ten remembered places */
  memoryProgress: number
  /** the build-up: globe swings west, the Warsaw → LA line draws */
  pullProgress: number

  lenis: Lenis | null
}

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const isMobileViewport =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

export const useSceneStore = create<SceneState>(() => ({
  isMobile: isMobileViewport,
  reducedMotion: prefersReducedMotion,

  memIntroProgress: 0,
  memoryProgress: 0,
  pullProgress: 0,

  lenis: null,
}))
