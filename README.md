# A Little Story

A private, mobile-first, cinematic birthday website. The story:
a birthday opening over a photo of us → our map of memories (ten places,
in the order they happened: Spain, Germany, Egypt, Thailand, Croatia,
Hong Kong, China, Greece, New York, Boston) → what stays with us →
a new line drawing itself from Warsaw across the Atlantic → the reveal of
**California & The American West Road Trip 2026** → the road, chapter by
chapter, on a hand-drawn atlas of the West → the real plan, day by day →
and the reason all of it matters.

## Stack

- React 19 + Vite + TypeScript + Tailwind CSS
- GSAP ScrollTrigger — all scroll choreography (sticky scenes + scrubbed timelines, soft snap)
- Lenis — smooth inertial scroll on the GSAP ticker
- React Three Fiber + drei + three.js — the memory globe (dotted continents, route arcs)
- zustand — bridge between ScrollTriggers (DOM) and `useFrame` (canvas)

No map APIs, no keys, no backend — a fully static build.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc --noEmit + vite build → dist/
npm run preview
```

## Photos

- `public/photos/couple/` — hero + portrait photos of us (placed by composition)
- `public/photos/past/<place>/` — one photo per remembered place
  (the `new york` folder name contains a space; the manifest URL-encodes it)
- `public/photos/california/<stop>/` — destination photos for the West
  (sourced from Wikimedia Commons — see `ATTRIBUTIONS.md` in that folder)
- `public/audio/soundtrack.mp3` — the soundtrack (starts from the
  "Begin the journey" button; tiny floating mute control; hidden if missing)

`scripts/generate-photo-manifest.mjs` scans `public/photos` and writes
`src/data/photo-manifest.json` (jpg/jpeg/png/webp, with dimensions). Run it
after adding or replacing photos. Missing photos never break the page —
cards fall back to quiet procedural postcards.

`scripts/fetch-west-photos.mjs` is the one-off Wikimedia Commons downloader.

## Structure

```
src/
  main.tsx, App.tsx          # nine scenes + GSAP plugin registration
  store.ts                   # zustand: scene progress, Lenis
  styles/globals.css         # palette as CSS variables, grain, light leaks
  data/trips.ts              # past trips, chapters, plan, all copy blocks
  data/photo-manifest.json   # generated photo index
  data/land-dots.json        # dotted continents (Natural Earth, generated)
  hooks/useLenis.ts          # Lenis ⇆ ScrollTrigger
  hooks/useGSAPScroll.ts     # per-scene scrubbed timeline + soft snap
  utils/photos.ts            # manifest access + graceful fallbacks
  utils/audio.ts             # gesture-started soundtrack with fades
  components/
    GlobeScene.tsx           # memory globe: pins, arcs, the new line west
    WestMap.tsx              # hand-drawn American West atlas + route camera
    PlanPanel.tsx            # the 13-day plan
    PhotoCard.tsx            # photos as memories (frame, tilt, fallback)
    SceneLayout.tsx, Progress.tsx, MusicControl.tsx
    scenes/                  # Intro, MemoryIntro, MemoryGlobe, Outro,
                             # Buildup, Reveal, Final
  utils/geo.ts, utils/animation.ts
scripts/                     # manifest + photo + land-dot generators
```

Deploy: static `dist/` works on Vercel (`vercel.json`), Netlify
(`netlify.toml`) and GitHub Pages (`base: './'`).
