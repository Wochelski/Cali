import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSceneStore } from '../store'

gsap.registerPlugin(ScrollTrigger)

/**
 * Płynny scroll (Lenis) spięty z GSAP ScrollTriggerem:
 * Lenis jeździ na tickerze GSAP, a każdy scroll odświeża ScrollTrigger.
 */
export function useLenis() {
  const calm = useSceneStore((s) => s.calm)

  useEffect(() => {
    const lenis = new Lenis({
      // w trybie spokojnym scroll jest bliżej natywnego
      duration: calm ? 0.7 : 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    })
    useSceneStore.setState({ lenis })

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // po dociągnięciu fontów układ może drgnąć — przelicz pozycje triggerów
    const refresh = () => ScrollTrigger.refresh()
    if (document.fonts?.ready) document.fonts.ready.then(refresh)
    window.addEventListener('load', refresh)

    return () => {
      window.removeEventListener('load', refresh)
      gsap.ticker.remove(raf)
      lenis.destroy()
      useSceneStore.setState({ lenis: null })
    }
  }, [calm])
}
