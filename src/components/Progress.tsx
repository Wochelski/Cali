import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { SCENES } from '../data/trips'

gsap.registerPlugin(ScrollTrigger)

/** Dyskretna pionowa oś postępu + numer aktualnej sceny. */
export function Progress() {
  const fillRef = useRef<HTMLDivElement>(null)
  const [scene, setScene] = useState(0)

  useGSAP(() => {
    const setScaleY = gsap.quickSetter(fillRef.current, 'scaleY')

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => setScaleY(self.progress),
    })

    SCENES.forEach(({ id }, i) => {
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive) setScene(i)
        },
      })
    })
  })

  return (
    <div
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 md:flex"
      aria-hidden="true"
    >
      <span className="text-[10px] font-medium tabular-nums text-warm-50/50">
        {String(scene + 1).padStart(2, '0')}
      </span>
      <div className="relative h-36 w-px overflow-hidden bg-warm-50/10">
        <div ref={fillRef} className="absolute inset-0 origin-top scale-y-0 bg-copper-400/80" />
      </div>
      <span className="text-[10px] font-medium tabular-nums text-warm-50/30">
        {String(SCENES.length).padStart(2, '0')}
      </span>
    </div>
  )
}
