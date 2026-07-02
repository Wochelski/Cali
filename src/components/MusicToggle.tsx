import { useEffect, useRef, useState } from 'react'
import { Music2 } from 'lucide-react'
import clsx from 'clsx'

const AUDIO_SRC = `${import.meta.env.BASE_URL}audio/soundtrack.mp3`

/**
 * Muzyka w tle — start wyłącznie po dotknięciu (mobile Safari blokuje
 * autoplay). Gdy pliku nie ma, przycisk w ogóle się nie pokazuje:
 * HEAD musi zwrócić OK i nie-HTML (SPA-fallbacki hostingów zwracają
 * index.html z kodem 200 dla brakujących ścieżek).
 */
export function MusicToggle() {
  const [available, setAvailable] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(AUDIO_SRC, { method: 'HEAD' })
      .then((res) => {
        const type = res.headers.get('content-type') ?? ''
        if (!cancelled && res.ok && !type.includes('text/html')) setAvailable(true)
      })
      .catch(() => {})
    return () => {
      cancelled = true
      audioRef.current?.pause()
    }
  }, [])

  const toggle = () => {
    if (!audioRef.current) {
      const audio = new Audio(AUDIO_SRC)
      audio.loop = true
      audio.volume = 0.65
      audio.addEventListener('error', () => {
        setAvailable(false)
        setPlaying(false)
      })
      audioRef.current = audio
    }
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => setAvailable(false))
    }
  }

  if (!available) return null

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? 'Zatrzymaj muzykę' : 'Włącz muzykę'}
      className={clsx(
        'fixed left-4 z-40 flex items-center gap-2 rounded-full border px-3 py-2 backdrop-blur-sm transition-colors duration-300',
        playing
          ? 'border-copper-400/40 bg-night-900/70 text-copper-300'
          : 'border-warm-50/10 bg-night-900/60 text-warm-50/60 hover:text-warm-50/90',
      )}
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <Music2 size={13} strokeWidth={2} aria-hidden="true" />
      <span className="text-[11px] font-medium">Muzyka</span>
      <span
        aria-hidden="true"
        className={clsx(
          'h-1.5 w-1.5 rounded-full transition-colors duration-300',
          playing ? 'animate-pulse bg-copper-300' : 'bg-warm-50/25',
        )}
      />
    </button>
  )
}
