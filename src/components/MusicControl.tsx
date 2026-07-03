import { useEffect } from 'react'
import { Music2, Volume2, VolumeX } from 'lucide-react'
import { probeAudio, startMusic, toggleMute, useAudioStore } from '../utils/audio'

/**
 * The floating music control. The soundtrack starts from the
 * "Begin the journey" button (or a tap here) — never by itself.
 * After that, this is a tiny mute/unmute; no sliders, no panel.
 * Hidden entirely when the soundtrack file is missing.
 */
export function MusicControl() {
  const available = useAudioStore((s) => s.available)
  const started = useAudioStore((s) => s.started)
  const muted = useAudioStore((s) => s.muted)

  useEffect(() => {
    probeAudio()
  }, [])

  if (!available) return null

  const label = !started ? 'Play the story soundtrack' : muted ? 'Unmute music' : 'Mute music'

  return (
    <button
      type="button"
      onClick={() => (started ? toggleMute() : startMusic())}
      aria-pressed={started && !muted}
      aria-label={label}
      className="fixed left-4 z-40 grid h-10 w-10 place-items-center rounded-full border border-ivory-50/10 bg-night-900/60 text-ivory-50/70 backdrop-blur-sm transition-colors duration-300 hover:text-ivory-50"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      {!started ? (
        <Music2 size={14} strokeWidth={2} aria-hidden="true" />
      ) : muted ? (
        <VolumeX size={14} strokeWidth={2} aria-hidden="true" />
      ) : (
        <Volume2 size={14} strokeWidth={2} aria-hidden="true" />
      )}
    </button>
  )
}
