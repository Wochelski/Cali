import manifest from '../data/photo-manifest.json'

export interface Photo {
  src: string
  w?: number
  h?: number
}

const MANIFEST = manifest as Record<string, Photo[]>

/** All photos for a manifest key like "past/spain" (empty when none). */
export function getPhotos(key: string): Photo[] {
  return MANIFEST[key] ?? []
}

/** One photo by index (falling back to the first), or null when the
 *  folder is empty — callers must handle absence gracefully. */
export function getPhoto(key: string, index = 0): Photo | null {
  const photos = getPhotos(key)
  return photos[index] ?? photos[0] ?? null
}

/** Public URL for a manifest photo (paths are pre-encoded, no leading slash). */
export function photoUrl(photo: Photo): string {
  return `${import.meta.env.BASE_URL}${photo.src}`
}
