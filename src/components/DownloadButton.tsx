import { Download, Lock } from 'lucide-react'
import { useSceneStore } from '../store'

const PDF_HREF = `${import.meta.env.BASE_URL}files/potwierdzenie-lotu.pdf`

/**
 * The flight-confirmation CTA. Locked until the final scene has been
 * reached; the lock is part of the story, not a technical gate.
 */
export function DownloadButton() {
  const unlocked = useSceneStore((s) => s.unlocked)

  if (!unlocked) {
    return (
      <div>
        <span className="inline-flex cursor-not-allowed items-center gap-2.5 rounded-full border border-ivory-50/15 px-7 py-3.5 text-sm font-medium text-ivory-50/45">
          <Lock size={14} strokeWidth={2} aria-hidden="true" />
          Download the flight confirmation
        </span>
        <p className="mt-3 text-xs font-light text-ivory-50/45">Unlocked after the journey.</p>
      </div>
    )
  }

  return (
    <a
      href={PDF_HREF}
      download
      className="inline-flex items-center gap-2.5 rounded-full bg-gold-400 px-7 py-3.5 text-sm font-semibold text-night-900 shadow-[0_8px_32px_rgb(var(--gold-400)/0.3)] transition-colors duration-300 hover:bg-gold-300 active:scale-[0.98]"
    >
      <Download size={15} strokeWidth={2.25} aria-hidden="true" />
      Download the flight confirmation
    </a>
  )
}
