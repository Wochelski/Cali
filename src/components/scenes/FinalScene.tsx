import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'

const CLOSING_WORD = 'Klusia'

/**
 * Finał: droga znika za horyzontem i zostaje jedno słowo.
 * Jedyne miejsce na stronie z inną typografią (Instrument Serif italic).
 */
export function FinalScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(ref, (tl) => {
    tl.fromTo(
      '[data-final-road]',
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.4 },
      0.05,
    )
      .fromTo('[data-final-horizon]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.08)
      .fromTo(
        '[data-final-rule]',
        { autoAlpha: 0, scaleX: 0 },
        { autoAlpha: 1, scaleX: 1, duration: 0.1 },
        0.42,
      )
      .fromTo(
        '[data-final-char]',
        { autoAlpha: 0, y: 26, filter: 'blur(8px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.16, stagger: 0.03, ease: 'power2.out' },
        0.5,
      )
  })

  return (
    <SceneLayout ref={ref} id="final" heightVh={180}>
      {/* delikatny gradient zachodu przy horyzoncie */}
      <div className="absolute inset-0 bg-gradient-to-b from-night-950 via-night-900 to-[#221410]" />

      {/* droga zbiegająca do horyzontu */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="final-road-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#e08a4e" stopOpacity="0.75" />
            <stop offset="1" stopColor="#e08a4e" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="final-horizon-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#e08a4e" stopOpacity="0" />
            <stop offset="0.5" stopColor="#f0a869" stopOpacity="0.55" />
            <stop offset="1" stopColor="#e08a4e" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="final-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#e08a4e" stopOpacity="0.28" />
            <stop offset="1" stopColor="#e08a4e" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g data-final-horizon className="invisible">
          <ellipse cx="500" cy="432" rx="260" ry="60" fill="url(#final-glow)" />
          <line x1="140" y1="432" x2="860" y2="432" stroke="url(#final-horizon-grad)" strokeWidth="1" />
        </g>

        <path
          data-final-road
          d="M 500 600 C 499 545 501 490 500 434"
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
        <div className="text-center">
          <span data-final-rule className="invisible mx-auto block h-px w-12 bg-copper-400/60" />
          <p
            className="mt-10 font-display text-6xl italic tracking-wide text-warm-50 md:text-8xl"
            aria-label={CLOSING_WORD}
          >
            {CLOSING_WORD.split('').map((char, i) => (
              <span
                key={i}
                data-final-char
                aria-hidden="true"
                className="invisible inline-block [text-shadow:0_0_36px_rgba(224,138,78,0.35)]"
              >
                {char}
              </span>
            ))}
          </p>
        </div>
      </div>
    </SceneLayout>
  )
}
