import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'
import { FLIGHTS } from '../../data/trips'
import { DownloadButton } from '../DownloadButton'

/**
 * The opening letter. A one-shot CSS animation brings the frame in;
 * the scrubbed timeline reveals it line by line and never shares
 * targets with the entrance.
 */
export function IntroScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(
    ref,
    (tl) => {
      tl.to('[data-intro-hint]', { autoAlpha: 0, duration: 0.07 }, 0.05)
        .fromTo(
          '[data-intro-heading]',
          { autoAlpha: 0, y: 26, filter: 'blur(8px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.12 },
          0.08,
        )
        .fromTo(
          '[data-intro-sub="0"]',
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.1 },
          0.26,
        )
        .fromTo(
          '[data-intro-sub="1"]',
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.1 },
          0.38,
        )
        .fromTo(
          '[data-intro-flights]',
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.1 },
          0.52,
        )
        .fromTo(
          '[data-intro-cta]',
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.1 },
          0.64,
        )
        .to('[data-intro-content]', { autoAlpha: 0, y: -30, filter: 'blur(6px)', duration: 0.14 }, 0.86)
    },
    {
      onProgress: (p) => useSceneStore.setState({ introProgress: p }),
    },
  )

  return (
    <SceneLayout ref={ref} id="intro" heightVh={240}>
      <div className="intro-enter relative flex h-full items-center px-7 md:px-0">
        <div
          data-intro-content
          className="mx-auto w-full max-w-[22rem] pb-[6svh] md:max-w-xl"
        >
          <p className="kicker">For you, Klusia.</p>

          <h1
            data-intro-heading
            className="invisible mt-5 font-display text-[40px] font-medium leading-[1.12] tracking-tight md:text-6xl"
          >
            Happy birthday, my&nbsp;love.
          </h1>

          <p
            data-intro-sub="0"
            className="invisible mt-7 text-[17px] font-light leading-relaxed text-ivory-50/85 md:text-xl"
          >
            In September, we are not just flying to California.
          </p>
          <p
            data-intro-sub="1"
            className="invisible mt-2 text-[17px] font-light leading-relaxed text-ivory-50/85 md:text-xl"
          >
            We are driving into our next story.
          </p>

          <div data-intro-flights className="invisible mt-8 space-y-1.5">
            {FLIGHTS.map((flight) => (
              <p key={flight.from} className="text-[13px] font-light text-sand-300 md:text-sm">
                {flight.from} <span className="text-gold-300">→</span> {flight.to}
              </p>
            ))}
          </div>

          <div data-intro-cta className="invisible mt-9">
            <DownloadButton />
          </div>
        </div>

        <div
          data-intro-hint
          className="absolute bottom-[max(2.25rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          <span className="kicker">Scroll</span>
          <span className="block h-10 w-px animate-pulse bg-ivory-50/40" />
        </div>
      </div>
    </SceneLayout>
  )
}
