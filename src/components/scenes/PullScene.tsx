import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'

/**
 * The hinge of the story: the globe swings west and the camera dives
 * inward (the canvas reads pullProgress) while a short bridge of text
 * introduces the next journey — past memories above, the road ahead
 * below. A faint horizon line draws in between them, then everything
 * dissolves into the close-up map.
 */
export function PullScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(
    ref,
    (tl) => {
      const globeRoot = document.getElementById('globe-root')

      tl.fromTo('[data-pull-horizon]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 }, 0.1)
        .fromTo(
          '[data-pull-line]',
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.32 },
          0.12,
        )
        .fromTo(
          '[data-pull-kicker]',
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.09 },
          0.08,
        )
        .fromTo(
          '[data-pull-main]',
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.12 },
          0.16,
        )
        .fromTo(
          '[data-pull-support]',
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.11 },
          0.3,
        )
        .to('[data-pull-content]', { autoAlpha: 0, y: -24, duration: 0.13 }, 0.62)
        .to('[data-pull-horizon]', { autoAlpha: 0, duration: 0.1 }, 0.64)

      if (globeRoot) tl.to(globeRoot, { autoAlpha: 0, duration: 0.3 }, 0.68)
    },
    {
      onProgress: (p) => useSceneStore.setState({ pullProgress: p }),
    },
  )

  return (
    <SceneLayout ref={ref} id="pull" heightVh={230}>
      {/* a quiet horizon between the memories above and the road below */}
      <svg
        data-pull-horizon
        className="invisible absolute inset-x-0 top-[48%] h-16 w-full"
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="pull-horizon-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#E6B66A" stopOpacity="0" />
            <stop offset="0.5" stopColor="#EFC881" stopOpacity="0.4" />
            <stop offset="1" stopColor="#E6B66A" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="pull-horizon-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#E6B66A" stopOpacity="0.16" />
            <stop offset="1" stopColor="#E6B66A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="500" cy="50" rx="330" ry="42" fill="url(#pull-horizon-glow)" />
        <path
          data-pull-line
          d="M 140 50 L 860 50"
          stroke="url(#pull-horizon-grad)"
          strokeWidth="1"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset="1"
        />
      </svg>

      <div className="relative flex h-full items-end px-7 pb-[max(4.5rem,env(safe-area-inset-bottom))] md:items-center md:justify-center md:px-6 md:pb-0">
        <div data-pull-content className="w-full max-w-[22rem] md:max-w-xl md:text-center">
          <p data-pull-kicker className="kicker invisible">
            What comes next
          </p>
          <p
            data-pull-main
            className="invisible mt-4 text-[24px] font-light leading-snug text-ivory-50/95 md:text-3xl"
          >
            The next chapter is waiting on the West Coast.
          </p>
          <p
            data-pull-support
            className="invisible mt-3 text-[15px] font-light leading-relaxed text-mist-400 md:text-lg"
          >
            A road by the ocean. Bigger skies. Desert light. A journey we will remember for years.
          </p>
        </div>
      </div>
    </SceneLayout>
  )
}
