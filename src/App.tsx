import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLenis } from './hooks/useLenis'
import { GlobeScene } from './components/GlobeScene'
import { IntroScene } from './components/scenes/IntroScene'
import { MemoryScene } from './components/scenes/MemoryScene'
import { CaliforniaReveal } from './components/scenes/CaliforniaReveal'
import { CaliforniaMap } from './components/CaliforniaMap'
import { FinalScene } from './components/scenes/FinalScene'
import { Progress } from './components/Progress'
import { CalmModeToggle } from './components/CalmModeToggle'
import { MusicToggle } from './components/MusicToggle'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * Jedna ciągła opowieść:
 * stały canvas z globusem w tle (sceny 1–3), nad nim sekcje-sceny,
 * każda ze sticky wnętrzem i timeline'em sterowanym scrollem.
 */
export default function App() {
  useLenis()

  return (
    <>
      <div className="dusk" aria-hidden="true" />
      <GlobeScene />

      <main className="relative z-10">
        <IntroScene />
        <MemoryScene />
        <CaliforniaReveal />
        <CaliforniaMap />
        <FinalScene />
      </main>

      <Progress />
      <CalmModeToggle />
      <MusicToggle />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
