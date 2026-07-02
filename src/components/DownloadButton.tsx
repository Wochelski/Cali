import { Download } from 'lucide-react'

const PDF_HREF = `${import.meta.env.BASE_URL}files/potwierdzenie-lotu.pdf`

/** The flight-confirmation CTA — it only appears at the end of the story. */
export function DownloadButton() {
  return (
    <div>
      <a
        href={PDF_HREF}
        download
        className="inline-flex items-center gap-2.5 rounded-full bg-gold-400 px-7 py-3.5 text-sm font-semibold text-night-900 shadow-[0_8px_32px_rgb(var(--gold-400)/0.3)] transition-colors duration-300 hover:bg-gold-300 active:scale-[0.98]"
      >
        <Download size={15} strokeWidth={2.25} aria-hidden="true" />
        Download the flight confirmation
      </a>
      <p className="mt-3 text-xs font-light text-ivory-50/50">Unlocked after the journey.</p>
    </div>
  )
}
