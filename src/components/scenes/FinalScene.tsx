import { useMemo, useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { FINAL_LINES, FINAL_WHISPER, PAST_TRIPS, ROUTE_CHAPTERS } from '../../data/trips'
import { getPhoto, photoUrl } from '../../utils/photos'

const FINAL_PHOTO = getPhoto('couple/hero', 1)

/**
 * The closing frame: everywhere we have been and everywhere we are
 * going becomes one soft constellation over a photo of us, and the
 * last lines arrive one by one — and stay.
 */
export function FinalScene() {
  const ref = useRef<HTMLElement>(null)

  // one star per place — past in moonlight, the West in gold
  const stars = useMemo(() => {
    const count = PAST_TRIPS.length + ROUTE_CHAPTERS.length
    return Array.from({ length: count }, (_, i) => {
      // deterministic scatter, no runtime randomness
      const t = i / count
      const x = 40 + ((i * 137.5) % 320)
      const y = 24 + ((i * 89.3 + t * 47) % 150)
      return { x, y, past: i < PAST_TRIPS.length, delay: (i % 7) * 0.6 }
    })
  }, [])

  useSceneTimeline(ref, (tl) => {
    tl.fromTo('[data-final-photo]', { autoAlpha: 0, scale: 1.06 }, { autoAlpha: 1, scale: 1, duration: 0.22 }, 0.03)
      .fromTo('[data-final-stars]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 0.12)
    FINAL_LINES.forEach((_, i) => {
      tl.fromTo(
        `[data-final-line="${i}"]`,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.09 },
        0.22 + i * 0.11,
      )
    })
    tl.fromTo('[data-final-whisper]', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.82)
  })

  return (
    <SceneLayout ref={ref} id="final" heightVh={330}>
      {/* us, warm and close, behind everything */}
      <div data-final-photo className="invisible absolute inset-0 overflow-hidden">
        {FINAL_PHOTO ? (
          <img
            src={photoUrl(FINAL_PHOTO)}
            alt="The two of us, holding on"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover opacity-45"
            style={{ objectPosition: '50% 32%' }}
          />
        ) : (
          <div className="h-full w-full" style={{ background: 'linear-gradient(170deg, #10243A, #C96F4A55)' }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-night-950/85 via-night-950/55 to-night-950/95" />
      </div>

      {/* warm horizon */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#241610] to-transparent" />
      <div className="light-leak" aria-hidden="true" />

      {/* the constellation of every place — past and next */}
      <svg
        data-final-stars
        className="invisible absolute inset-x-0 top-[max(3rem,env(safe-area-inset-top))] mx-auto h-40 w-full max-w-md"
        viewBox="0 0 400 180"
        aria-hidden="true"
      >
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.past ? 1.4 : 1.9}
            fill={s.past ? '#AEB8C4' : '#EFC881'}
            className="constellation-star"
            style={{ animationDelay: `${s.delay}s`, opacity: s.past ? 0.55 : 0.9 }}
          />
        ))}
      </svg>

      <div className="relative flex h-full items-end justify-center px-7 pb-[max(9svh,env(safe-area-inset-bottom))] md:items-center md:pb-0">
        <div className="w-full max-w-md text-center">
          {FINAL_LINES.map((line, i) => (
            <p
              key={line}
              data-final-line={i}
              className={
                i === 0
                  ? 'invisible text-[32px] font-semibold leading-snug tracking-tight md:text-5xl'
                  : i === FINAL_LINES.length - 1
                    ? 'invisible mt-4 text-[20px] font-medium leading-relaxed text-gold-300 md:text-2xl'
                    : 'invisible mt-3 text-[17px] font-light leading-relaxed text-ivory-50/90 md:text-xl'
              }
            >
              {line}
            </p>
          ))}

          <p
            data-final-whisper
            className="invisible mt-8 text-[13px] font-light tracking-[0.04em] text-ivory-50/60 md:text-sm"
          >
            {FINAL_WHISPER}
          </p>
        </div>
      </div>
    </SceneLayout>
  )
}
