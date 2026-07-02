import { useRef } from 'react'
import { SceneLayout } from '../SceneLayout'
import { useSceneTimeline } from '../../hooks/useGSAPScroll'
import { useSceneStore } from '../../store'

/**
 * The textless hinge of the story: the globe swings west and the camera
 * dives inward until the world dissolves — the close-up map takes over.
 * All the visual work happens on the canvas (it reads pullProgress);
 * this scene provides the scroll distance and the final fade.
 */
export function PullScene() {
  const ref = useRef<HTMLElement>(null)

  useSceneTimeline(
    ref,
    (tl) => {
      const globeRoot = document.getElementById('globe-root')
      if (globeRoot) tl.to(globeRoot, { autoAlpha: 0, duration: 0.3 }, 0.68)
    },
    {
      onProgress: (p) => useSceneStore.setState({ pullProgress: p }),
    },
  )

  return (
    <SceneLayout ref={ref} id="pull" heightVh={200}>
      <div className="h-full" />
    </SceneLayout>
  )
}
