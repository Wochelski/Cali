import { forwardRef, type ReactNode } from 'react'
import clsx from 'clsx'

interface SceneLayoutProps {
  id: string
  /** wysokość sekcji w vh — dystans scrolla, jakim "oddycha" scena */
  heightVh: number
  children: ReactNode
  className?: string
}

/**
 * Scena = wysoka sekcja (dystans scrolla) + sticky pełnoekranowe wnętrze.
 * Pin robi CSS sticky, a ScrollTrigger sekcji steruje tylko timeline'em —
 * zero pin-spacerów, zero skoków layoutu.
 */
export const SceneLayout = forwardRef<HTMLElement, SceneLayoutProps>(
  ({ id, heightVh, children, className }, ref) => (
    <section ref={ref} id={id} className="relative" style={{ height: `${heightVh}vh` }}>
      <div className={clsx('scene-viewport sticky top-0 overflow-hidden', className)}>{children}</div>
    </section>
  ),
)
SceneLayout.displayName = 'SceneLayout'
