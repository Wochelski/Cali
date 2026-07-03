import gsap from 'gsap'
import { create } from 'zustand'

const AUDIO_SRC = `${import.meta.env.BASE_URL}audio/soundtrack.mp3`
const TARGET_VOLUME = 0.55

interface AudioState {
  available: boolean
  started: boolean
  muted: boolean
}

export const useAudioStore = create<AudioState>(() => ({
  available: false,
  started: false,
  muted: false,
}))

let audio: HTMLAudioElement | null = null
let probed = false

/**
 * Checks the soundtrack exists before showing any music UI. The probe
 * rejects SPA-fallback HTML responses (hosts return index.html + 200
 * for missing paths).
 */
export function probeAudio() {
  if (probed) return
  probed = true
  fetch(AUDIO_SRC, { method: 'HEAD' })
    .then((res) => {
      const type = res.headers.get('content-type') ?? ''
      if (res.ok && !type.includes('text/html')) useAudioStore.setState({ available: true })
    })
    .catch(() => {})
}

/** Starts the soundtrack from a user gesture, fading in gently. */
export function startMusic() {
  if (useAudioStore.getState().started) return
  if (!audio) {
    audio = new Audio(AUDIO_SRC)
    audio.loop = true
    audio.volume = 0
    audio.addEventListener('error', () => {
      useAudioStore.setState({ available: false, started: false })
      audio = null
    })
  }
  audio
    .play()
    .then(() => {
      useAudioStore.setState({ started: true, muted: false })
      gsap.to(audio, { volume: TARGET_VOLUME, duration: 2.8, ease: 'power1.inOut' })
    })
    .catch(() => {
      /* blocked — the floating control still offers a manual start */
    })
}

/** Mute fades out then pauses; unmute resumes and fades back in. */
export function toggleMute() {
  const { started, muted } = useAudioStore.getState()
  if (!audio || !started) {
    startMusic()
    return
  }
  if (muted) {
    useAudioStore.setState({ muted: false })
    audio.play().catch(() => {})
    gsap.to(audio, { volume: TARGET_VOLUME, duration: 1, ease: 'power1.out' })
  } else {
    useAudioStore.setState({ muted: true })
    gsap.to(audio, {
      volume: 0,
      duration: 0.7,
      ease: 'power1.out',
      onComplete: () => audio?.pause(),
    })
  }
}
