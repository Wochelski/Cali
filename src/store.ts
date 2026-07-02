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

  introProgress: number
  revealProgress: number
  transitionProgress: number
  chapterProgress: number
  finalProgress: number

  /** the flight confirmation unlocks once the final scene is reached */
  unlocked: boolean
  setUnlocked: (unlocked: boolean) => void

  lenis: Lenis | null
}

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const isMobileViewport =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

export const useSceneStore = create<SceneState>((set) => ({
  isMobile: isMobileViewport,
  reducedMotion: prefersReducedMotion,

  introProgress: 0,
  revealProgress: 0,
  transitionProgress: 0,
  chapterProgress: 0,
  finalProgress: 0,

  unlocked: false,
  setUnlocked: (unlocked) => set({ unlocked }),

  lenis: null,
}))
