import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Pause, Play } from 'lucide-react'

const AUDIO_SRC = `${import.meta.env.BASE_URL}audio/soundtrack.mp3`
const TARGET_VOLUME = 0.55

/**
 * Background music. Tries to autoplay on load; when the browser blocks
 * audible autoplay (mobile Safari), it starts on the first interaction
 * instead — touch, scroll, wheel or key. Always fades in gently.
 * The only control is a tiny pause/resume button. No sliders.
 * If the file is missing the control never appears (the availability
 * probe also rejects SPA-fallback HTML responses).
 */
export function MusicControl() {
  const [available, setAvailable] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startedRef = useRef(false)
  const pausedByUserRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    let removeInteractionListeners = () => {}

    fetch(AUDIO_SRC, { method: 'HEAD' })
      .then((res) => {
        const type = res.headers.get('content-type') ?? ''
        if (cancelled || !res.ok || type.includes('text/html')) return
        setAvailable(true)

        const audio = new Audio(AUDIO_SRC)
        audio.loop = true
        audio.volume = 0
        audio.addEventListener('error', () => {
          setAvailable(false)
          setPlaying(false)
        })
        audioRef.current = audio

        const start = () => {
          if (startedRef.current || pausedByUserRef.current) return
          audio
            .play()
            .then(() => {
              startedRef.current = true
              setPlaying(true)
              gsap.to(audio, { volume: TARGET_VOLUME, duration: 2.6, ease: 'power1.inOut' })
              removeInteractionListeners()
            })
            .catch(() => {
              /* still blocked — the next interaction will retry */
            })
        }

        const events: (keyof WindowEventMap)[] = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll']
        removeInteractionListeners = () =>
          events.forEach((e) => window.removeEventListener(e, start))
        events.forEach((e) => window.addEventListener(e, start, { passive: true }))

        start()
      })
      .catch(() => {})

    return () => {
      cancelled = true
      removeInteractionListeners()
      audioRef.current?.pause()
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      pausedByUserRef.current = true
      audio.pause()
      setPlaying(false)
    } else {
      pausedByUserRef.current = false
      audio
        .play()
        .then(() => {
          startedRef.current = true
          setPlaying(true)
          gsap.to(audio, { volume: TARGET_VOLUME, duration: 1, ease: 'power1.out' })
        })
        .catch(() => {})
    }
  }

  if (!available) return null

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? 'Pause music' : 'Play music'}
      className="fixed left-4 z-40 grid h-10 w-10 place-items-center rounded-full border border-ivory-50/10 bg-night-900/60 text-ivory-50/70 backdrop-blur-sm transition-colors duration-300 hover:text-ivory-50"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      {playing ? (
        <Pause size={14} strokeWidth={2} aria-hidden="true" />
      ) : (
        <Play size={14} strokeWidth={2} aria-hidden="true" className="translate-x-[1px]" />
      )}
    </button>
  )
}
