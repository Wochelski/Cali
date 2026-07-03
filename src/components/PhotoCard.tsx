import { useState } from 'react'
import clsx from 'clsx'
import { getPhoto, photoUrl } from '../utils/photos'

interface PhotoCardProps {
  photoKey: string
  index?: number
  alt: string
  className?: string
  /** small tilt in degrees for a hand-placed feel */
  rotate?: number
  /** object-position for careful cropping (e.g. "50% 30%") */
  focus?: string
  /** tiny postmark in the corner (e.g. the chapter number) */
  stamp?: string
  /** shown inside a procedural postcard when no photo exists */
  fallbackLabel?: string
  fallbackGradient?: string
}

/** a faded circular postmark, like on the back of a postcard */
function Postmark({ text }: { text: string }) {
  return (
    <span
      aria-hidden="true"
      className="absolute -bottom-1.5 -right-1.5 grid h-9 w-9 rotate-[8deg] place-items-center rounded-full border border-canyon-400/50 text-[10px] font-semibold tabular-nums text-canyon-400/80"
      style={{ borderStyle: 'dashed' }}
    >
      {text}
    </span>
  )
}

/**
 * A photo as a memory: warm paper frame, soft shadow, slight tilt.
 * Never renders a broken image — a missing or failed photo becomes a
 * quiet procedural postcard (or nothing, if no fallback is given).
 */
export function PhotoCard({
  photoKey,
  index = 0,
  alt,
  className,
  rotate = 0,
  focus,
  stamp,
  fallbackLabel,
  fallbackGradient,
}: PhotoCardProps) {
  const [failed, setFailed] = useState(false)
  const photo = getPhoto(photoKey, index)

  const frame = clsx(
    'relative rounded-[5px] bg-ivory-100 p-1.5 pb-5 shadow-[0_16px_40px_rgba(0,0,0,0.45)]',
    className,
  )
  const style = rotate ? { transform: `rotate(${rotate}deg)` } : undefined

  if (!photo || failed) {
    if (!fallbackLabel) return null
    return (
      <figure className={frame} style={style} aria-hidden="true">
        <div
          className="flex aspect-[4/3] w-full items-end rounded-[3px] p-3"
          style={{ background: fallbackGradient ?? 'linear-gradient(160deg, #10243A, #C96F4A55)' }}
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ivory-50/70">
            {fallbackLabel}
          </span>
        </div>
        {stamp && <Postmark text={stamp} />}
      </figure>
    )
  }

  return (
    <figure className={frame} style={style}>
      <img
        src={photoUrl(photo)}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="w-full rounded-[3px] object-cover"
        style={{
          aspectRatio: photo.w && photo.h ? `${photo.w} / ${photo.h}` : undefined,
          objectPosition: focus,
        }}
      />
      {stamp && <Postmark text={stamp} />}
    </figure>
  )
}
