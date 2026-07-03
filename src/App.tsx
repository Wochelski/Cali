import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLenis } from './hooks/useLenis'
import { GlobeScene } from './components/GlobeScene'
import { IntroScene } from './components/scenes/IntroScene'
import { MemoryIntroScene } from './components/scenes/MemoryIntroScene'
import { MemoryGlobeScene } from './components/scenes/MemoryGlobeScene'
import { OutroScene } from './components/scenes/OutroScene'
import { BuildupScene } from './components/scenes/BuildupScene'
import { RevealScene } from './components/scenes/RevealScene'
import { WestMap } from './components/WestMap'
import { PlanPanel } from './components/PlanPanel'
import { FinalScene } from './components/scenes/FinalScene'
import { Progress } from './components/Progress'
import { MusicControl } from './components/MusicControl'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * A private travel film in nine scenes:
 * the birthday opening → our map of memories (ten places, in order) →
 * what stays with us → a new line on the map → the reveal →
 * the American West, chapter by chapter → the real plan →
 * and the reason all of it matters.
 */
export default function App() {
  useLenis()

  return (
    <>
      <div className="dusk" aria-hidden="true" />
      <GlobeScene />

      <main className="relative z-10">
        <IntroScene />
        <MemoryIntroScene />
        <MemoryGlobeScene />
        <OutroScene />
        <BuildupScene />
        <RevealScene />
        <WestMap />
        <PlanPanel />
        <FinalScene />
      </main>

      <Progress />
      <MusicControl />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
