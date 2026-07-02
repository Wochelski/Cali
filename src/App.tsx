import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLenis } from './hooks/useLenis'
import { GlobeScene } from './components/GlobeScene'
import { IntroScene } from './components/scenes/IntroScene'
import { RevealScene } from './components/scenes/RevealScene'
import { TransitionScene } from './components/scenes/TransitionScene'
import { ChaptersScene } from './components/scenes/ChaptersScene'
import { FinalScene } from './components/scenes/FinalScene'
import { Progress } from './components/Progress'
import { MusicControl } from './components/MusicControl'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * One continuous story: a persistent globe canvas behind five pinned
 * scenes — the letter, the reveal, a breath, nine chapters of the road,
 * and the closing frame that unlocks the confirmation.
 */
export default function App() {
  useLenis()

  return (
    <>
      <div className="dusk" aria-hidden="true" />
      <GlobeScene />

      <main className="relative z-10">
        <IntroScene />
        <RevealScene />
        <TransitionScene />
        <ChaptersScene />
        <FinalScene />
      </main>

      <Progress />
      <MusicControl />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
