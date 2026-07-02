export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** Przeskalowanie zakresu [inMin, inMax] → [0, 1] z przycięciem. */
export const remap01 = (v: number, inMin: number, inMax: number) =>
  clamp01((v - inMin) / (inMax - inMin))

/** Fragment postępu sceny globusa przed pierwszym / po ostatnim miejscu. */
export const SLICE_LEAD = 0.08
export const SLICE_TAIL = 0.94

/**
 * Postęp sceny wspomnień → "ułamkowy indeks" celu podróży.
 * Zwraca wartość z zakresu [−1, count]: −1 oznacza "jeszcze przed pierwszym
 * miejscem", wartości 0…count−1 to kolejne miejsca (część ułamkowa = droga
 * do następnego), końcówka to wyciszenie sceny.
 */
export function destinationSlice(progress: number, count: number, lead = SLICE_LEAD, tail = SLICE_TAIL): number {
  if (progress < lead) return progress / lead - 1 // −1 → 0: zbliżanie
  const t = remap01(progress, lead, tail)
  return t * (count - 1)
}

/** Indeks aktywnego miejsca (−1 gdy jeszcze żadne). */
export function activeDestinationIndex(progress: number, count: number): number {
  const slice = destinationSlice(progress, count)
  if (slice < -0.5) return -1
  return Math.min(count - 1, Math.max(0, Math.round(slice)))
}
