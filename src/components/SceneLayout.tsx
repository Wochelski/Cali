import { forwardRef, type ReactNode } from 'react'
import clsx from 'clsx'

interface SceneLayoutProps {
  id: string
  /** section height in vh — the scroll distance the scene breathes over */
  heightVh: number
  children: ReactNode
  className?: string
}

/**
 * A scene = a tall section (scroll distance) + a sticky full-screen
 * interior. CSS sticky does the pinning and ScrollTrigger only drives
 * the timeline — no pin spacers, no layout jumps.
 */
export const SceneLayout = forwardRef<HTMLElement, SceneLayoutProps>(
  ({ id, heightVh, children, className }, ref) => (
    <section ref={ref} id={id} className="relative" style={{ height: `${heightVh}vh` }}>
      <div className={clsx('scene-viewport sticky top-0 overflow-hidden', className)}>{children}</div>
    </section>
  ),
)
SceneLayout.displayName = 'SceneLayout'
