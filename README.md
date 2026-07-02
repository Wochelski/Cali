# For you, Klusia · California Road Trip 2026

A private, mobile-first, cinematic one-page reveal: a birthday letter, a globe
emerging from the dark, nine chapters of a West Coast road trip
(Los Angeles → … → Las Vegas → New York → Boston), and a closing frame that
unlocks the flight confirmation.

## Stack

- React 19 + Vite + TypeScript + Tailwind CSS
- GSAP ScrollTrigger — all scroll choreography (sticky scenes + scrubbed timelines, soft snap)
- Lenis — smooth inertial scroll on the GSAP ticker
- React Three Fiber + drei + three.js — the globe (dotted continents, route arcs, atmosphere)
- @react-three/postprocessing — subtle bloom (desktop only)
- zustand — bridge between ScrollTriggers (DOM) and `useFrame` (canvas)
- maath — damped camera / rotation easing

No map APIs, no keys, no backend — a fully static build.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc --noEmit + vite build → dist/
npm run preview
```

## Assets

- `public/audio/soundtrack.mp3` — background music (autoplay attempt with
  first-interaction fallback; the control hides itself if the file is missing)
- `public/files/potwierdzenie-lotu.pdf` — the downloadable flight confirmation

## Structure

```
src/
  main.tsx, App.tsx          # scene composition + GSAP plugin registration
  store.ts                   # zustand: scene progress, unlock state, Lenis
  styles/globals.css         # palette as CSS variables, film grain, dusk glow
  data/trips.ts              # the nine chapters, flights, scene list
  data/land-dots.json        # dotted continents (Natural Earth, generated)
  hooks/useLenis.ts          # Lenis ⇆ ScrollTrigger
  hooks/useGSAPScroll.ts     # per-scene scrubbed timeline + soft snap
  components/
    GlobeScene.tsx           # persistent R3F canvas: globe, arcs, pins, camera
    SceneLayout.tsx          # tall section + sticky full-screen interior
    DownloadButton.tsx       # locked → unlocked confirmation CTA
    MusicControl.tsx         # autoplay + fallback, tiny pause/resume
    Progress.tsx             # discreet journey rail (desktop)
    scenes/                  # Intro, Reveal, Transition, Chapters, Final
  utils/geo.ts               # lat/lon → sphere, rotations, graticule, arcs
  utils/animation.ts         # scroll progress → chapter slice
scripts/generate-land-dots.mjs  # one-off continents generator
```

Deploy: static `dist/` works on Vercel (`vercel.json`), Netlify (`netlify.toml`)
and GitHub Pages (`base: './'`).
