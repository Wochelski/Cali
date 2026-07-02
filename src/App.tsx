import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLenis } from './hooks/useLenis'
import { GlobeScene } from './components/GlobeScene'
import { OpeningScene } from './components/scenes/OpeningScene'
import { MemoryIntroScene } from './components/scenes/MemoryIntroScene'
import { MemoryGlobeScene } from './components/scenes/MemoryGlobeScene'
import { PullScene } from './components/scenes/PullScene'
import { WestCoastMap } from './components/WestCoastMap'
import { RevealScene } from './components/scenes/RevealScene'
import { FinalScene } from './components/scenes/FinalScene'
import { Progress } from './components/Progress'
import { MusicControl } from './components/MusicControl'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * The surprise arc, in order:
 * a quiet birthday opening (no destination named) → the places we
 * already carry with us, on the globe → an inward pull west → a
 * close-up West Coast sketch map following the route → the earned
 * reveal with flights → the closing frame and the download.
 */
export default function App() {
  useLenis()

  return (
    <>
      <div className="dusk" aria-hidden="true" />
      <GlobeScene />

      <main className="relative z-10">
        <OpeningScene />
        <MemoryIntroScene />
        <MemoryGlobeScene />
        <PullScene />
        <WestCoastMap />
        <RevealScene />
        <FinalScene />
      </main>

      <Progress />
      <MusicControl />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
