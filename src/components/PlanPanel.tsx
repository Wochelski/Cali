import { useRef, useState } from 'react'
import clsx from 'clsx'
import { SceneLayout } from './SceneLayout'
import { PhotoCard } from './PhotoCard'
import { useSceneTimeline } from '../hooks/useGSAPScroll'
import { ITINERARY } from '../data/trips'
import { remap01 } from '../utils/animation'

/**
 * The real plan, day by day — compact and readable, like a note
 * tucked into the back of the atlas. Scroll highlights each day;
 * on phones the detail line shows only for the active one.
 */
export function PlanPanel() {
  const ref = useRef<HTMLElement>(null)
  const lastRef = useRef(-1)
  const [active, setActive] = useState(-1)

  useSceneTimeline(
    ref,
    (tl) => {
      tl.fromTo('[data-plan-header]', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.01)
        .fromTo(
          '[data-plan-row]',
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.04, stagger: 0.005 },
          0.03,
        )
    },
    {
      onProgress: (p) => {
        const t = remap01(p, 0.08, 0.9)
        const idx = p < 0.05 ? -1 : Math.min(ITINERARY.length - 1, Math.floor(t * ITINERARY.length))
        if (idx !== lastRef.current) {
          lastRef.current = idx
          setActive(idx)
        }
      },
    },
  )

  return (
    <SceneLayout ref={ref} id="plan" heightVh={360}>
      <div className="mx-auto flex h-full max-w-3xl flex-col justify-center px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] md:px-8">
        <div data-plan-header className="invisible relative mb-4 md:mb-7">
          <p className="kicker">The plan</p>
          <p className="mt-2.5 max-w-[15rem] text-[17px] font-light text-ivory-50/85 md:max-w-none md:text-2xl">
            Thirteen days, one road, day by day.
          </p>
          {/* boarding-pass stubs holding the whole story */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md border border-ivory-50/15 px-2.5 py-1 text-[10px] font-medium tabular-nums tracking-[0.14em] text-sand-300">
              WAW → LAX · SEP 3
            </span>
            <span className="rounded-md border border-ivory-50/15 px-2.5 py-1 text-[10px] font-medium tabular-nums tracking-[0.14em] text-sand-300">
              LAS → WAW · SEP 15
            </span>
          </div>
          {/* a small photograph of us, pinned to the corner of the plan */}
          <div className="absolute -top-2 right-0 w-24 md:-top-4 md:w-32">
            <PhotoCard photoKey="couple/portraits" index={1} alt="The two of us in the dunes" rotate={3} />
          </div>
        </div>

        <ol className="border-t border-ivory-50/10">
          {ITINERARY.map((day, i) => {
            const isActive = i === active
            return (
              <li key={day.day} data-plan-row className="invisible border-b border-ivory-50/5 py-[0.3rem] md:py-1.5">
                <div className="flex items-baseline gap-3 md:gap-5">
                  <span
                    className={clsx(
                      'w-[4.6rem] shrink-0 text-[12px] font-medium tabular-nums transition-colors duration-300 md:w-24 md:text-sm',
                      isActive ? 'text-gold-300' : 'text-ivory-50/35',
                    )}
                  >
                    Day {day.day} · {day.date}
                  </span>
                  <span
                    className={clsx(
                      'min-w-0 flex-1 truncate text-[13.5px] font-medium transition-colors duration-300 md:w-64 md:flex-none md:text-base',
                      isActive ? 'text-ivory-50' : 'text-ivory-50/50',
                    )}
                  >
                    {day.place}
                  </span>
                  <span
                    className={clsx(
                      'hidden min-w-0 flex-1 truncate text-sm font-light transition-colors duration-300 md:block',
                      isActive ? 'text-sand-300' : 'text-ivory-50/25',
                    )}
                  >
                    {day.note}
                  </span>
                </div>
                <p
                  className={clsx(
                    'pl-[4.6rem] pr-2 text-[12px] font-light leading-snug text-sand-300 transition-all duration-300 md:hidden',
                    isActive ? 'mt-0.5 max-h-12 opacity-100' : 'max-h-0 overflow-hidden opacity-0',
                  )}
                >
                  {day.note}
                </p>
              </li>
            )
          })}
        </ol>
      </div>
    </SceneLayout>
  )
}
