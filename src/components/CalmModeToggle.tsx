import { useEffect } from 'react'
import clsx from 'clsx'
import { useSceneStore } from '../store'

/**
 * "Tryb spokojny": mniej cząsteczek, bez bloom, łagodniejszy scroll.
 * Domyślnie włączony przy prefers-reduced-motion. Celowo mały i cichy —
 * to narzędzie dostępności, nie element interfejsu.
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
      aria-label="Tryb spokojny"
      onClick={() => setCalm(!calm)}
      className="fixed right-3 z-40 flex items-center gap-1.5 rounded-full px-2 py-1.5 opacity-55 transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100"
      style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <span className="text-[10px] font-medium text-warm-50/70">Tryb spokojny</span>
      <span
        className={clsx(
          'relative h-3 w-6 rounded-full transition-colors duration-300',
          calm ? 'bg-copper-400/70' : 'bg-warm-50/15',
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 h-2 w-2 rounded-full bg-warm-50 transition-transform duration-300',
            calm ? 'translate-x-3.5' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  )
}
