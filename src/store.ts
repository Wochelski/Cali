import { create } from 'zustand'
import type Lenis from 'lenis'

/**
 * Wspólny stan sceny. Wartości *Progress są zapisywane przez ScrollTriggery
 * (DOM) i odczytywane w useFrame (R3F) przez getState() — bez re-renderów.
 */
interface SceneState {
  /** "Tryb spokojny" — mniej cząsteczek, bez bloom, łagodniejszy scroll. */
  calm: boolean
  setCalm: (calm: boolean) => void

  isMobile: boolean

  introProgress: number
  memoryProgress: number
  revealProgress: number

  /** indeks aktywnej sceny (pasek postępu) */
  activeScene: number

  lenis: Lenis | null
}

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const isMobileViewport =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

export const useSceneStore = create<SceneState>((set) => ({
  calm: prefersReducedMotion,
  setCalm: (calm) => set({ calm }),

  isMobile: isMobileViewport,

  introProgress: 0,
  memoryProgress: 0,
  revealProgress: 0,

  activeScene: 0,

  lenis: null,
}))
