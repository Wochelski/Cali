import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { PhotoCard } from '../PhotoCard'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { MEMORY_OUTRO } from '../../data/trips'

/**
 * The quiet turn of the story: what the memories leave behind.
 * The second line carries a small photograph of us — the one thing
 * that comes along on every trip.
 */
export function OutroScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(ref, (tl) => {
    const slots = [
      { in: 0.05, out: 0.3 },
      { in: 0.37, out: 0.62 },
      { in: 0.69, out: 0.94 },
    ]
    slots.forEach((slot, i) => {
      tl.fromTo(
        `[data-outro-line="${i}"]`,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.13 },
        slot.in,
      ).to(
        `[data-outro-line="${i}"]`,
        { autoAlpha: 0, y: -22, duration: 0.13 },
        slot.out,
      )
    })
    // the photograph rides with the second line
    tl.fromTo(
      '[data-outro-photo]',
      { autoAlpha: 0, y: 20, rotate: 4 },
      { autoAlpha: 1, y: 0, rotate: 2, duration: 0.13 },
      0.37,
    ).to('[data-outro-photo]', { autoAlpha: 0, y: -18, duration: 0.13 }, 0.62)
  })

  return (
    <SceneLayout ref={ref} id="outro" heightVh={260}>
      <div className="relative h-full">
        <div
          data-outro-photo
          className="invisible absolute left-1/2 top-[max(4rem,env(safe-area-inset-top))] w-36 -translate-x-1/2 md:top-[16%] md:w-48"
        >
          <PhotoCard photoKey="couple/portraits" index={0} alt="The two of us out on the water" />
        </div>

        <div className="relative flex h-full items-end px-7 pb-[20svh] md:items-center md:justify-center md:pb-0">
          {MEMORY_OUTRO.map((line, i) => (
            <p
              key={line}
              data-outro-line={i}
              className="invisible absolute inset-x-7 bottom-[18svh] text-[22px] font-light leading-snug text-ivory-50/95 md:static md:max-w-xl md:text-center md:text-3xl"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </SceneLayout>
  )
}
