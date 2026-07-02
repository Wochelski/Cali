import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSceneStore } from '../store'

gsap.registerPlugin(ScrollTrigger)

/**
 * Smooth inertial scroll (Lenis) wired into GSAP ScrollTrigger:
 * Lenis rides the GSAP ticker, every scroll updates ScrollTrigger.
 * Deliberately slow and calm by default — there is no speed UI.
 */
export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: useSceneStore.getState().reducedMotion ? 0.8 : 1.55,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.25,
    })
    useSceneStore.setState({ lenis })

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // fonts settling can shift layout — recalc trigger positions
    const refresh = () => ScrollTrigger.refresh()
    if (document.fonts?.ready) document.fonts.ready.then(refresh)
    window.addEventListener('load', refresh)

    return () => {
      window.removeEventListener('load', refresh)
      gsap.ticker.remove(raf)
      lenis.destroy()
      useSceneStore.setState({ lenis: null })
    }
  }, [])
}
