import { useRef } from 'react'
import { Download } from 'lucide-react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { FLIGHTS } from '../../data/trips'

const PDF_HREF = `${import.meta.env.BASE_URL}files/potwierdzenie-lotu.pdf`

/** Finał: droga znika za horyzontem, życzenia i bilet do pobrania. */
export function FinalScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(ref, (tl) => {
    tl.fromTo(
      '[data-final-road]',
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.35 },
      0.04,
    )
      .fromTo('[data-final-horizon]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 0.07)
      .fromTo(
        '[data-final-rule]',
        { autoAlpha: 0, scaleX: 0 },
        { autoAlpha: 1, scaleX: 1, duration: 0.08 },
        0.28,
      )
      .fromTo(
        '[data-final-wishes]',
        { autoAlpha: 0, y: 24, filter: 'blur(8px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.12 },
        0.34,
      )
      .fromTo(
        '[data-final-sub]',
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.1 },
        0.44,
      )
      .fromTo(
        '[data-final-flights]',
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.1 },
        0.54,
      )
      .fromTo(
        '[data-final-signature]',
        { autoAlpha: 0, y: 18, filter: 'blur(6px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.1 },
        0.64,
      )
      .fromTo(
        '[data-final-cta]',
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.1 },
        0.74,
      )
  })

  return (
    <SceneLayout ref={ref} id="final" heightVh={210}>
      {/* delikatny gradient zachodu przy horyzoncie */}
      <div className="absolute inset-0 bg-gradient-to-b from-night-950 via-night-900 to-[#2a1a12]" />

      {/* droga zbiegająca do horyzontu */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="final-road-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#e08a4e" stopOpacity="0.7" />
            <stop offset="1" stopColor="#e08a4e" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="final-horizon-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#e08a4e" stopOpacity="0" />
            <stop offset="0.5" stopColor="#f0a869" stopOpacity="0.5" />
            <stop offset="1" stopColor="#e08a4e" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="final-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#e08a4e" stopOpacity="0.26" />
            <stop offset="1" stopColor="#e08a4e" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g data-final-horizon className="invisible">
          <ellipse cx="500" cy="430" rx="270" ry="62" fill="url(#final-glow)" />
          <line x1="130" y1="430" x2="870" y2="430" stroke="url(#final-horizon-grad)" strokeWidth="1" />
        </g>

        <path
          data-final-road
          d="M 500 600 C 499 545 501 490 500 432"
          fill="none"
          stroke="url(#final-road-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
        />
      </svg>

      <div className="relative grid h-full place-items-center px-6">
        <div className="w-full max-w-md pb-[env(safe-area-inset-bottom)] text-center">
          <span data-final-rule className="invisible mx-auto block h-px w-12 bg-copper-400/60" />

          <div data-final-wishes className="invisible mt-9">
            <p className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Sto lat, kochanie.
            </p>
          </div>

          <p
            data-final-sub
            className="invisible mt-5 text-[19px] font-light leading-snug text-warm-50/90 md:text-2xl"
          >
            We wrześniu widzimy się w Kalifornii.
          </p>

          <div
            data-final-flights
            className="invisible mt-8 space-y-1.5 text-[13px] font-light tabular-nums text-warm-50/60"
          >
            {FLIGHTS.map((flight) => (
              <p key={flight.date}>
                {flight.from} <span className="text-copper-300/80">→</span> {flight.to}
              </p>
            ))}
          </div>

          <p
            data-final-signature
            className="invisible mt-9 text-xl font-light tracking-[0.02em] text-sand-200 md:text-2xl"
          >
            Dla Ciebie, Klusia.
          </p>

          <div data-final-cta className="invisible mt-10">
            <a
              href={PDF_HREF}
              download
              className="inline-flex items-center gap-2.5 rounded-full bg-copper-400 px-7 py-3.5 text-sm font-semibold text-night-950 shadow-[0_8px_32px_rgba(224,138,78,0.28)] transition-colors duration-300 hover:bg-copper-300 active:scale-[0.98]"
            >
              <Download size={15} strokeWidth={2.25} aria-hidden="true" />
              Pobierz potwierdzenie lotu
            </a>
            <p className="mt-3.5 text-xs font-light text-warm-50/50">
              Otwórz po obejrzeniu do końca.
            </p>
          </div>
        </div>
      </div>
    </SceneLayout>
  )
}
