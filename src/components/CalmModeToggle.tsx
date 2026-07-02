import { useEffect } from 'react'
import clsx from 'clsx'
import { useSceneStore } from '../store'

/**
 * "Tryb spokojny": mniej cząsteczek, bez bloom, łagodniejszy scroll.
 * Domyślnie włączony, gdy system zgłasza prefers-reduced-motion.
 */
export function CalmModeToggle() {
  const calm = useSceneStore((s) => s.calm)
  const setCalm = useSceneStore((s) => s.setCalm)

  useEffect(() => {
    document.documentElement.classList.toggle('calm', calm)
  }, [calm])

  return (
    <button
      type="button"
      role="switch"
      aria-checked={calm}
      onClick={() => setCalm(!calm)}
      className="fixed right-5 top-5 z-40 flex items-center gap-2.5 rounded-full border border-warm-50/10 bg-night-900/60 px-3.5 py-2 backdrop-blur-sm transition-colors duration-300 hover:border-warm-50/25"
    >
      <span className="text-[11px] font-medium text-warm-50/70">Tryb spokojny</span>
      <span
        className={clsx(
          'relative h-3.5 w-7 rounded-full transition-colors duration-300',
          calm ? 'bg-copper-400/80' : 'bg-warm-50/15',
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 h-2.5 w-2.5 rounded-full bg-warm-50 transition-transform duration-300',
            calm ? 'translate-x-3.5' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  )
}
