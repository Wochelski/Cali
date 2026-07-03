import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'
import { INTRO } from '../../data/trips'
import { getPhoto, photoUrl } from '../../utils/photos'
import { startMusic } from '../../utils/audio'

const HERO = getPhoto('couple/hero', 0)

/**
 * The opening frame: golden-hour photo of us, a birthday line, and a
 * single warm button that starts the music and the story. No spoilers —
 * only "where we have been, and where we are going next".
 */
export function IntroScene() {
  const ref = useRef<HTMLElement>(null)
  const lenis = useSceneStore((s) => s.lenis)

  useSceneTimeline(ref, (tl) => {
    // slow push into the photo while the frame holds
    tl.fromTo('[data-intro-photo]', { scale: 1.04, y: 0 }, { scale: 1.12, y: '-2%', duration: 1 }, 0)
      .to('[data-intro-hint]', { autoAlpha: 0, duration: 0.08 }, 0.06)
      .to('[data-intro-content]', { autoAlpha: 0, y: -26, duration: 0.18 }, 0.78)
  })

  const begin = () => {
    startMusic()
    if (lenis) lenis.scrollTo('#memintro', { duration: 2.6, easing: (t) => 1 - Math.pow(1 - t, 3) })
    else document.getElementById('memintro')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <SceneLayout ref={ref} id="intro" heightVh={150}>
      <div className="intro-enter relative h-full">
        {/* the photo — or a warm dawn if it is ever missing */}
        <div className="absolute inset-0 overflow-hidden">
          {HERO ? (
            <img
              data-intro-photo
              src={photoUrl(HERO)}
              alt="The two of us above the city at golden hour"
              className="h-full w-full object-cover"
              style={{ objectPosition: '50% 30%' }}
            />
          ) : (
            <div
              data-intro-photo
              className="h-full w-full"
              style={{ background: 'linear-gradient(175deg, #10243A 20%, #C96F4A66 90%)' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-night-950/60 via-night-950/20 to-night-950/95" />
        </div>
        <div className="light-leak" aria-hidden="true" />

        <div className="relative flex h-full items-end px-7 md:px-0">
          <div data-intro-content className="mx-auto w-full max-w-[22rem] pb-[16svh] md:max-w-xl">
            <h1 className="text-[40px] font-semibold leading-[1.1] tracking-tight md:text-6xl">
              {INTRO.heading}
            </h1>

            <p className="mt-5 text-[17px] font-light leading-relaxed text-ivory-50/90 md:text-xl">
              {INTRO.lines[0]} {INTRO.lines[1]}
            </p>
            <p className="mt-2 max-w-[19rem] text-[14px] font-light leading-relaxed text-sand-300 md:max-w-md md:text-base">
              {INTRO.note}
            </p>

            <button
              type="button"
              onClick={begin}
              className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-gold-400 px-7 py-3.5 text-sm font-semibold text-night-900 shadow-[0_8px_32px_rgb(var(--gold-400)/0.35)] transition-colors duration-300 hover:bg-gold-300 active:scale-[0.98]"
            >
              {INTRO.button}
            </button>
          </div>
        </div>

        <div
          data-intro-hint
          className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2.5"
        >
          <span className="kicker">Scroll</span>
          <span className="block h-8 w-px animate-pulse bg-ivory-50/40" />
        </div>
      </div>
    </SceneLayout>
  )
}
