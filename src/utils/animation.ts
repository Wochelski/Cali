import { MEMORIES } from '../data/trips'

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** Remap [inMin, inMax] → [0, 1], clamped. */
export const remap01 = (v: number, inMin: number, inMax: number) =>
  clamp01((v - inMin) / (inMax - inMin))

/** Portion of the memory scene before the first / after the last place. */
export const SLICE_LEAD = 0.05
export const SLICE_TAIL = 0.95

const N = MEMORIES.length

/**
 * Scene progress → fractional memory index in [−1, N−1].
 * Negative values are the approach phase before the first place.
 */
export function memorySlice(progress: number, lead = SLICE_LEAD, tail = SLICE_TAIL): number {
  if (progress < lead) return progress / lead - 1
  return remap01(progress, lead, tail) * (N - 1)
}

/** Index of the active memory (−1 before the first one). */
export function activeMemory(progress: number): number {
  const slice = memorySlice(progress)
  if (slice < -0.5) return -1
  return Math.min(N - 1, Math.max(0, Math.round(slice)))
}
